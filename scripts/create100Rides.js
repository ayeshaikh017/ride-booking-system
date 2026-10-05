const http = require("http");

const TOTAL_RIDES = 100;

const createRide = (index) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      riderName: `Rider ${index}`,
      pickup: `Pickup ${index}`,
      destination: `Destination ${index}`,
    });

    const request = http.request(
      {
        hostname: "localhost",
        port: 5000,
        path: "/rides",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (response) => {
        let body = "";

        response.on("data", (chunk) => {
          body += chunk;
        });

        response.on("end", () => {
          try {
            const result = JSON.parse(body);

            if (!result.success) {
              reject(
                new Error(
                  result.message || "Ride creation failed"
                )
              );
              return;
            }

            resolve(result.data.rideId);
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    request.on("error", reject);

    request.write(data);
    request.end();
  });
};

const getRide = (rideId) => {
  return new Promise((resolve, reject) => {
    const request = http.get(
      `http://localhost:5000/rides/${rideId}`,
      (response) => {
        let body = "";

        response.on("data", (chunk) => {
          body += chunk;
        });

        response.on("end", () => {
          try {
            const result = JSON.parse(body);

            if (!result.success) {
              reject(
                new Error(result.message)
              );
              return;
            }

            resolve(result.data);
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    request.on("error", reject);
  });
};

const sleep = (ms) =>
  new Promise((resolve) =>
    setTimeout(resolve, ms)
  );

const runTest = async () => {
  console.log("Creating 100 rides...\n");

  // Book 100 rides simultaneously
  const rideIds = await Promise.all(
    Array.from(
      { length: TOTAL_RIDES },
      (_, index) => createRide(index + 1)
    )
  );

  console.log(
    `Total rides created: ${rideIds.length}`
  );

  let rides = [];

  // Wait for worker to finish
  for (let attempt = 0; attempt < 60; attempt++) {
    rides = await Promise.all(
      rideIds.map((rideId) => getRide(rideId))
    );

    const finalRides = rides.filter(
      (ride) =>
        ride.status === "ASSIGNED" ||
        ride.status === "NO_DRIVER_FOUND"
    );

    if (finalRides.length === TOTAL_RIDES) {
      break;
    }

    await sleep(1000);
  }

  const assigned = rides.filter(
    (ride) => ride.status === "ASSIGNED"
  );

  const noDriverFound = rides.filter(
    (ride) => ride.status === "NO_DRIVER_FOUND"
  );

  const stuck = rides.filter(
    (ride) =>
      ride.status !== "ASSIGNED" &&
      ride.status !== "NO_DRIVER_FOUND"
  );

  // A ride is double-assigned if assignment history
  // contains more than one driver.
  const doubleAssigned = rides.filter(
    (ride) =>
      ride.assignmentHistory &&
      ride.assignmentHistory.length > 1
  );

  console.log("\n====================================");
  console.log("       RIDE BOOKING TEST");
  console.log("====================================");

  console.log(
    `Total rides created:       ${rideIds.length}`
  );

  console.log(
    `ASSIGNED:                  ${assigned.length}`
  );

  console.log(
    `NO_DRIVER_FOUND:           ${noDriverFound.length}`
  );

  console.log(
    `Final rides:               ${
      assigned.length + noDriverFound.length
    }`
  );

  console.log(
    `Double assigned rides:     ${doubleAssigned.length}`
  );

  console.log(
    `Stuck rides:               ${stuck.length}`
  );

  console.log("====================================");

  if (
    rideIds.length === 100 &&
    assigned.length + noDriverFound.length === 100 &&
    doubleAssigned.length === 0 &&
    stuck.length === 0
  ) {
    console.log(
      "PASS: All 100 rides completed successfully."
    );
  } else {
    console.log(
      "FAIL: Some requirements were not satisfied."
    );
  }
};

runTest().catch((error) => {
  console.error(
    "Test failed:",
    error.message
  );

  process.exit(1);
});