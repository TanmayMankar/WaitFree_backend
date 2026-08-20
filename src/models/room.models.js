const mongoose = require("mongoose");

// Make sure this file name matches your actual file name in src/models/
const patientRecordsModel = require("./patientRecords.models"); 

const roomSchema = new mongoose.Schema({
  room_name: {
    type: String,
    required: true,
  },
  patient_limit: {
    type: Number,
    required: true,
  },
  expires_at: {
    type: Date,
  },
  created_by: {
    type: String,
  },
});

roomSchema.pre("findOneAndDelete", async function (next) {
  try {
    const roomId = this.getQuery()._id;
    await patientRecordsModel.deleteMany({ roomId: roomId }); 
  } catch (error) {
    console.error("Error deleting patient records for room:", error);
  }
});

const room = mongoose.model("room", roomSchema);

module.exports = room;