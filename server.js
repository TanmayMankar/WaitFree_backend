const server = require("./src/app") // 1. Change variable name to 'server' to match what app.js exports
const connectDB = require("./src/db/db")

connectDB()

// 2. Call listen on 'server' instead of 'app'
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});