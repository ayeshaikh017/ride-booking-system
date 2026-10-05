const Ride = require("../models/Ride");

const addRideToQueue = async (rideId) => {
  console.log(`Ride ${rideId} added to queue`);
};

const getNextRide = async () => {
  return Ride.findOneAndUpdate(
    {
      status: "REQUESTED",
    },
    {
      $set: {
        processing: true,
      },
    },
    {
      new: true,
    }
  );
};

module.exports = {
  addRideToQueue,
  getNextRide,
};