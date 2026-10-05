const express = require("express");
const { createRide } = require("../controllers/rideController");

const router = express.Router();

router.post("/", createRide);

module.exports = router;