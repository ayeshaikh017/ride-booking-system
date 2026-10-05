const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Event = require("../models/Event");

dotenv.config();

const startOps = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  console.log("Ops consumer started");

  let processedEvents = new Set();

  while (true) {
    const events = await Event.find()
      .sort({ createdAt: 1 });

    for (const event of events) {
      const eventId = event._id.toString();

      if (processedEvents.has(eventId)) {
        continue;
      }

      processedEvents.add(eventId);

      console.log(
        `Ops: ride ${event.rideId} is now in status ${event.status}`
      );
    }

    await new Promise((resolve) =>
      setTimeout(resolve, 1000)
    );
  }
};

startOps();