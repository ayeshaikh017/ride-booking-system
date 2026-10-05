const rideQueue = [];
let workerRunning = false;

const addRideToQueue = (rideId) => {
  rideQueue.push(rideId);
  processQueue();
};

const processQueue = async () => {
  if (workerRunning) return;

  workerRunning = true;

  while (rideQueue.length > 0) {
    const rideId = rideQueue.shift();

    try {
      const { processRide } = require("../workers/rideWorker");
      await processRide(rideId);
    } catch (error) {
      console.error("Queue processing error:", error.message);
    }
  }

  workerRunning = false;
};

module.exports = {
  addRideToQueue,
};