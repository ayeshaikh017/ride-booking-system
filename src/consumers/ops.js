const { readEvents } = require("../events/eventStore");

const events = readEvents();

for (const event of events) {
  if (event.type === "RIDE_STATUS_CHANGED") {
    console.log(
      `Ops: ride ${event.rideId} is now in status ${event.status}`
    );
  }
}