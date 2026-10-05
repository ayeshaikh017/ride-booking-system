const Ride = require("../models/Ride");
const { addRideToQueue } = require("../queue/rideQueue");
const { publishRideEvent } = require("../events/eventStore");

const createRide = async (req, res) => {
  try {
    const {
      riderName,
      pickup,
      destination,
    } = req.body;

    if (!riderName || !pickup || !destination) {
      return res.status(400).json({
        success: false,
        message:
          "riderName, pickup and destination are required",
      });
    }

    const ride = await Ride.create({
      riderName,
      pickup,
      destination,
      status: "REQUESTED",
    });

    // Publish REQUESTED event
    await publishRideEvent(
      ride._id.toString(),
      "REQUESTED"
    );

    // Add to queue
    await addRideToQueue(
      ride._id.toString()
    );

    // Do NOT wait for driver assignment
    return res.status(201).json({
      success: true,
      message: "Ride booked successfully",
      data: {
        rideId: ride._id,
        status: ride.status,
      },
    });
  } catch (error) {
    console.error(
      "Create ride error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create ride",
    });
  }
};
const getRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    return res.json({
      success: true,
      message: "Ride fetched successfully",
      data: ride,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch ride",
    });
  }
};

module.exports = {
  createRide,
  getRide,
};