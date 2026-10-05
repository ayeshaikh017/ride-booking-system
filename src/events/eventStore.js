const Event = require("../models/Event");

const publishRideEvent = async (rideId, status) => {
  const event = await Event.create({
    type: "RIDE_STATUS_CHANGED",
    rideId,
    status,
  });

  console.log(
    `Event published: ride ${rideId} -> ${status}`
  );

  return event;
};

module.exports = {
  publishRideEvent,
};