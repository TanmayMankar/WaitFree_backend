const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const recordsController = require("../controllers/records.controllers");

const router = express.Router();

router.post(
  "/join/:roomId",
  authMiddleware.verifyToken,
  recordsController.createPatientRecord,
);

router.get("/getAllPatients/:roomId", authMiddleware.verifyToken, recordsController.getAllPatients);

module.exports = router;
