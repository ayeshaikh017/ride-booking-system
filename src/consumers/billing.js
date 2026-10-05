const { readEvents } = require("../events/eventStore");

const events = readEvents();

for (const event of events) {
  if (
    event.type === "RIDE_STATUS_CHANGED" &&
    event.status === "ASSIGNED"
  ) {
    console.log(
      `Billing: charging rider for ride ${event.rideId}`
    );
  }
}