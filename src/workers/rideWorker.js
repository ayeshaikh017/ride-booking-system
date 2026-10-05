const Ride = require("../models/Ride");
const { publishRideEvent } = require("../events/eventStore");

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

const processRide = async (rideId) => {
  const ride = await Ride.findById(rideId);

  if (!ride) {
    console.log("Ride not found:", rideId);
    return;
  }

  console.log(`Processing ride ${rideId}`);

  let rejectionCount = 0;

  for (const driver of drivers) {
    // Randomly accept or reject
    // Approximately 50% chance of acceptance
    const accepted = Math.random() < 0.5;

    if (accepted) {
      ride.status = "ASSIGNED";
      ride.assignedDriver = driver;

      await ride.save();

      // Publish ASSIGNED event
      publishRideEvent(ride._id.toString(), "ASSIGNED");

      console.log(`Ride ${rideId} assigned to ${driver}`);

      return;
    }

    rejectionCount++;

    ride.rejectedDrivers.push(driver);

    await ride.save();

    console.log(`Driver ${driver} rejected ride ${rideId}`);

    // Stop after 3 rejections
    if (rejectionCount === 3) {
      ride.status = "NO_DRIVER_FOUND";

      await ride.save();

      // Publish NO_DRIVER_FOUND event
      publishRideEvent(
        ride._id.toString(),
        "NO_DRIVER_FOUND"
      );

      console.log(`No driver found for ride ${rideId}`);

      return;
    }
  }
};

module.exports = {
  processRide,
};