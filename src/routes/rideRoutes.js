const express = require("express");

const {
  createRide,
  getRide,
} = require("../controllers/rideController");

const router = express.Router();

router.post("/", createRide);

router.get("/:rideId", getRide);

module.exports = router;