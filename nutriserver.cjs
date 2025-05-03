const express = require("express");
const path = require("path");
const app = express();

const cors = require('cors');
app.use(cors());
app.use(express.json());

const mongodbRoutes = require("./nutridb.cjs");

// Serve static files
app.use(express.static(path.join(__dirname, "client/build"))); 

//API routes
app.use("/api", mongodbRoutes);

// frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

// Start the web server
const PORT = process.env.PORT || 8080;
app.listen(PORT, function () {
    console.log(`Listening on port ${PORT}...`);
});