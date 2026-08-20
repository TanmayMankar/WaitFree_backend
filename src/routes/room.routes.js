const express = require('express')
const roomController = require('../controllers/room.controllers')
const authMiddleware = require('../middleware/auth.middleware')

const router = express.Router()




router.post("/create-room", authMiddleware.verifyToken,roomController.createRoom)
router.post("/add-patient/:roomId", authMiddleware.verifyToken, roomController.addPatientToRoom)
router.post("/admin-next-patient/:roomId", authMiddleware.verifyToken, roomController.adminNextPatient)
router.get("/allrooms", authMiddleware.verifyToken, roomController.getAllRooms)
router.get("/allAdminRooms",authMiddleware.verifyToken,roomController.getAdminRoom)
router.delete("/delete-room/:roomId", authMiddleware.verifyToken, roomController.deleteRoom)
module.exports = router