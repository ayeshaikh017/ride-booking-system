const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    riderName: {
      type: String,
      required: true,
      trim: true,
    },

    pickup: {
      type: String,
      required: true,
      trim: true,
    },

    destination: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["REQUESTED", "ASSIGNED", "NO_DRIVER_FOUND"],
      default: "REQUESTED",
    },

    assignedDriver: {
      type: String,
      default: null,
    },

    rejectedDrivers: {
      type: [String],
      default: [],
    },

    assignmentHistory: {
      type: [String],
      default: [],
    },

    processing: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Ride", rideSchema);