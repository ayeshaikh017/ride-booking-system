const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const rideRoutes = require("./routes/rideRoutes");

dotenv.config();

const app = express();

app.use(express.json());
app.use("/rides", rideRoutes);

app.get("/", (req, res) => {
  res.send("Ride Booking API is running");
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });