const patientRecordsModel = require("../models/patientRecords.models");
const roomModel = require("../models/room.models");
const userModel = require("../models/user.models");

async function createPatientRecord(req, res) {
  if (req.user.role !== "user") {
    return res
      .status(403)
      .json({ message: "only user can create patient records" });
  }

  const roomId = req.params.roomId;
  const room = await roomModel.findById(roomId);
  if (!room) {
    return res.status(404).json({ message: "Room not found" });
  }

  const token_number =
    (await patientRecordsModel.countDocuments({ roomId })) + 1;

  // if(token_number <= 10) {
  //     return res.status(400).json({
  //         message: 'Token number must be greater than 10 to create a patient record'
  //     })
  // }

  if (token_number >= room.patient_limit) {
    return res.status(400).json({
      message: "Room is full",
    });
  }

  const user = await userModel.findById(req.user.userId);

  try {
    const newPatientRecord = await patientRecordsModel.create({
      patientId: user._id,
      walk_in_name: user.name,
      token_number: token_number,
      roomId: roomId,
    });
    res.status(201).json(newPatientRecord);
  } catch (error) {
    res.status(500).json({ message: "Error creating patient record", error });
  }
}

async function getAllPatients(req, res) {
    try {
        const roomId = req.params.roomId;

        const nextPatient = await patientRecordsModel
            .findOne({ 
                roomId: roomId, 
                status: "waiting" 
            })
            .sort({ 
                token_number: 1 // Grabs the smallest token number first
            });

        // 1. Safe Socket Emit (prevents crash if nextPatient is null)
        if (nextPatient) {
            req.io.to(roomId).emit('nextPatient', nextPatient.token_number);
        }

        // 2. Return Admin Response
        if (req.user.role === "admin") {
            return res.status(200).json({
                message: "patient fetched successfully",
                nextPatient
            });
        }
        
        // 3. Return User Response
        if (req.user.role === "user") {
            return res.status(200).json({
                message: "patient fetched successfully",
                token_number: nextPatient ? nextPatient.token_number : null
            });
        }

        // 4. Catch Unhandled Roles
        return res.status(403).json({
            message: "Unauthorized role"
        });

    } catch (error) {
        // 5. Catch Block with Return
        return res.status(500).json({
            message: "error while fetching patients",
            error: error.message || error
        });
    }
}

module.exports = {
  createPatientRecord,getAllPatients
};
