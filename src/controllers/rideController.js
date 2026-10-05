const Ride = require("../models/Ride");
const { addRideToQueue } = require("../queue/rideQueue");
const { publishRideEvent } = require("../events/eventStore");

const createRide = async (req, res) => {
  try {
    const { riderName, pickup, destination } = req.body;

    if (!riderName || !pickup || !destination) {
      return res.status(400).json({
        success: false,
        message: "riderName, pickup and destination are required",
      });
    }

    // Create ride in MongoDB
    const ride = await Ride.create({
      riderName,
      pickup,
      destination,
      status: "REQUESTED",
    });

    // Publish REQUESTED event
    publishRideEvent(ride._id.toString(), "REQUESTED");

    // Add ride to background queue
    addRideToQueue(ride._id.toString());

    // Return immediately
    return res.status(201).json({
      success: true,
      message: "Ride booked successfully",
      data: {
        rideId: ride._id,
        status: ride.status,
      },
    });
  } catch (error) {
    console.error("Create ride error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create ride",
    });
  }
};

module.exports = {
  createRide,
};