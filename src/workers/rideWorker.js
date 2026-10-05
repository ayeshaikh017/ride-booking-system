const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Ride = require("../models/Ride");
const { getNextRide } = require("../queue/rideQueue");
const { publishRideEvent } = require("../events/eventStore");

dotenv.config();

const drivers = [
  "Driver 1",
  "Driver 2",
  "Driver 3",
  "Driver 4",
  "Driver 5",
  "Driver 6",
  "Driver 7",
  "Driver 8",
  "Driver 9",
  "Driver 10",
];

const processRide = async (ride) => {
  console.log(`Processing ride ${ride._id}`);

  let rejectionCount = 0;

  for (const driver of drivers) {
    const accepted = Math.random() < 0.5;

    if (accepted) {
      // Safety check: never assign an already assigned ride
      if (ride.status !== "REQUESTED") {
        console.log(
          `Ride ${ride._id} was already completed`
        );
        return;
      }

      ride.status = "ASSIGNED";
      ride.assignedDriver = driver;

      // Record every assignment
      ride.assignmentHistory.push(driver);

      ride.processing = false;

      await ride.save();

      await publishRideEvent(
        ride._id.toString(),
        "ASSIGNED"
      );

      console.log(
        `Ride ${ride._id} assigned to ${driver}`
      );

      return;
    }

    rejectionCount++;

    ride.rejectedDrivers.push(driver);

    await ride.save();

    console.log(
      `Driver ${driver} rejected ride ${ride._id}`
    );

    if (rejectionCount === 3) {
      ride.status = "NO_DRIVER_FOUND";
      ride.processing = false;

      await ride.save();

      await publishRideEvent(
        ride._id.toString(),
        "NO_DRIVER_FOUND"
      );

      console.log(
        `No driver found for ride ${ride._id}`
      );

      return;
    }
  }
};

const startWorker = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Worker connected to MongoDB");
    console.log("Ride worker started");

    while (true) {
      try {
        const ride = await getNextRide();

        if (ride) {
          await processRide(ride);
        } else {
          await new Promise((resolve) =>
            setTimeout(resolve, 500)
          );
        }
      } catch (error) {
        console.error(
          "Worker error:",
          error.message
        );
      }
    }
  } catch (error) {
    console.error(
      "Worker MongoDB connection failed:",
      error.message
    );

    process.exit(1);
  }
};

startWorker();