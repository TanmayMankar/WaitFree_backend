const mongoose = require("mongoose");

const patientRecordsSchema = new mongoose.Schema({
  walk_in_name: {
    type: String,
    required: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "room",
    required: true,
  },
  token_number: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["waiting", "completed"],
    default: "waiting",
  },
});

const patientRecordsModel = mongoose.model(
  "patientRecords",
  patientRecordsSchema,
);

module.exports = patientRecordsModel;
