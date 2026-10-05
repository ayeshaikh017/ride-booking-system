const fs = require("fs");
const path = require("path");

const eventsDir = path.join(__dirname, "../../data");
const eventsFile = path.join(eventsDir, "events.jsonl");

if (!fs.existsSync(eventsDir)) {
  fs.mkdirSync(eventsDir, { recursive: true });
}

const publishRideEvent = (rideId, status) => {
  const event = {
    type: "RIDE_STATUS_CHANGED",
    rideId,
    status,
    timestamp: new Date().toISOString(),
  };

  fs.appendFileSync(eventsFile, JSON.stringify(event) + "\n");

  console.log("Event published:", event);
};

const readEvents = () => {
  if (!fs.existsSync(eventsFile)) {
    return [];
  }

  const content = fs.readFileSync(eventsFile, "utf8").trim();

  if (!content) {
    return [];
  }

  return content
    .split("\n")
    .map((line) => JSON.parse(line));
};

module.exports = {
  publishRideEvent,
  readEvents,
};