const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Event = require("../models/Event");

dotenv.config();

const startBilling = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  console.log("Billing consumer started");

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

      // Billing happens only when ride is assigned
      if (event.status === "ASSIGNED") {
        console.log(
          `Billing: charging rider for ride ${event.rideId}`
        );
      }
    }

    await new Promise((resolve) =>
      setTimeout(resolve, 1000)
    );
  }
};

startBilling();