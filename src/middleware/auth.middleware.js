const userModel = require("../models/user.models")
const jwt = require("jsonwebtoken")




async function verifyToken(req,res,next) {

    try {
        const token = req.cookies.token

        if(!token) {
            return res.status(401).json({
                message: "Unauthorized check"
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)


        req.user = decoded


        next()
    }
    catch(error){
        res.status(401).json({
            message: "token not verified",
            error
        })
    }
}


module.exports = {
    verifyToken
}