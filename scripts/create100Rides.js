const mongoose = require("mongoose");
const Ride = require("../src/models/Ride");
const { processRide } = require("../src/workers/rideWorker");

require("dotenv").config();

const create100Rides = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Creating 100 rides...\n");

    // Create 100 rides at once
    const rideData = Array.from({ length: 100 }, (_, index) => ({
      riderName: `Rider ${index + 1}`,
      pickup: `Pickup ${index + 1}`,
      destination: `Destination ${index + 1}`,
      status: "REQUESTED",
    }));

    const rides = await Ride.insertMany(rideData);

    // Process all rides
    await Promise.all(
      rides.map((ride) => processRide(ride._id.toString()))
    );

    // Get final state from database
    const processedRides = await Ride.find({
      _id: { $in: rides.map((ride) => ride._id) },
    });

    const assigned = processedRides.filter(
      (ride) => ride.status === "ASSIGNED"
    ).length;

    const noDriverFound = processedRides.filter(
      (ride) => ride.status === "NO_DRIVER_FOUND"
    ).length;

    const stuck = processedRides.filter(
      (ride) =>
        ride.status !== "ASSIGNED" &&
        ride.status !== "NO_DRIVER_FOUND"
    ).length;

    // Check if any ride has more than one assigned driver
    const assignedMoreThanOnce = processedRides.filter(
      (ride) => ride.assignedDriver !== null
    ).length;

    console.log("\n====================================");
    console.log("       RIDE BOOKING TEST");
    console.log("====================================");
    console.log(`Total rides created:       ${rides.length}`);
    console.log(`ASSIGNED:                  ${assigned}`);
    console.log(`NO_DRIVER_FOUND:           ${noDriverFound}`);
    console.log(
      `Final rides:               ${assigned + noDriverFound}`
    );
    console.log(`Stuck rides:               ${stuck}`);
    console.log("====================================");

    if (
      rides.length === 100 &&
      assigned + noDriverFound === 100 &&
      stuck === 0
    ) {
      console.log("PASS: All 100 rides completed successfully.");
    } else {
      console.log("FAIL: Some rides were not completed correctly.");
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("Test failed:", error.message);
    process.exit(1);
  }
};

create100Rides();