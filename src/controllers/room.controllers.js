const jwt = require("jsonwebtoken");
const roomModel = require("../models/room.models");
const userModel = require("../models/user.models");
const patientRecordsModel = require("../models/patientRecords.models");

async function createRoom(req, res) {
  const { room_name, patient_limit } = req.body;

  const room = await roomModel.create({
    room_name: room_name,
    patient_limit: patient_limit,
    created_by: req.user.userId,
  });

  res.status(200).json({
    message: "Room created successfully",
    room: room,
  });
}

async function addPatientToRoom(req, res) {
  if (req.user.role !== "admin") {
    return res.status(401).json({
      message: "Only admin can add patients to room",
    });
  }

  const roomId = req.params.roomId;

  const room = await roomModel.findById(roomId);

  if (!room) {
    return res.status(404).json({
      message: "Room not found",
    });
  }

  const token_number =
    (await patientRecordsModel.countDocuments({ roomId })) + 1;

  if (token_number > room.patient_limit) {
    return res.status(400).json({
      message: "Room is full",
    });
  }

  const walk_in_name = req.body.walk_in_name;

  try {
    const newPatientRecord = await patientRecordsModel.create({
      walk_in_name: walk_in_name,
      token_number: token_number,
      roomId: roomId,
    });

    res.status(201).json({
      message: "Patient added to room successfully",
      patientRecord: newPatientRecord,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error creating patient record",
      error: error,
    });
  }
}

async function adminNextPatient(req, res) {
  try {
    const roomId  = req.params.roomId;

    // 1. Find the WAITING record with the LOWEST token number and set status to COMPLETED
    const currentPatient = await patientRecordsModel.findOneAndUpdate(
      {
        roomId: roomId,
        status: "waiting",
      },
      {
        $set: { status: "completed" },
      }
    );

    // 2. If no matching document is found, it means the waiting line is completely empty
    if (!currentPatient) {
      return res
        .status(404)
        .json({
          message: "The queue is empty! No patients are currently waiting.",
        });
    }

    // 3. Return the patient details so the admin knows who to call into the room next
    return res.status(200).json({
      message: "Queue moved forward successfully.",
      calledPatient: {
        name: currentPatient.walkInName || "Online App User",
        tokenNumber: currentPatient.tokenNumber,
        status: currentPatient.status,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function getAllRooms(req, res) {
  if (req.user.role !== "user") {
    return res.status(401).json({
      message: "only users can fetch rooms",
    });
  }

  try {

    const id = req.query.id;
    const rooms = await roomModel.findById(id);
    res.status(200).json({
      message: "rooms fetched successfully",
      rooms: rooms,
    });
  } catch (error) {
    res.status(500).json({
      message: "error fetching rooms",
      error: error,
    });
  }
}

async function getAdminRoom(req, res) {
  if (req.user.role !== "admin") {
    return res.status(401).json({
      message: "only admins can fetch their rooms",
    });
  }

  try {
    const rooms = await roomModel.find({ created_by: req.user.userId });

    res.status(200).json({
      message: "rooms fetch successfully",
      rooms,
    });
  } catch (error) {
    res.status(500).json({
      message: "error fetching rooms",
    });
  }
}

async function deleteRoom(req, res) {
  if (req.user.role !== "admin") {
    return res.status(401).json({
      message: "only admins can delete rooms",
    });
  }

  const roomId = req.params.roomId;

  // This single line now handles BOTH deleting all matching patient records
  // AND deleting the room document itself!
  const room = await roomModel.findByIdAndDelete(roomId);

  if (!room) {
    return res.status(404).json({
      message: "Room not found",
    });
  }

  // 2. Notify all active participants inside this room
    req.io.to(roomId).emit("roomClosed", {
      message: "This room has been deleted by the admin.",
      roomId,
    });

    // 3. Eject all sockets from the room channel on the server
    req.io.in(roomId).socketsLeave(roomId);


  res.status(200).json({
    message: "Room and all associated patient records deleted successfully",
    room: room,
  });
}

module.exports = {
  createRoom,
  addPatientToRoom,
  adminNextPatient,
  getAllRooms,
  getAdminRoom,
  deleteRoom,
};
