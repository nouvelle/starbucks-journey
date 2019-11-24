const express = require("express");
const path = require("path");
const app = express();

// Serve static assets
app.use(express.static(path.resolve(__dirname, "..", "build")));
app.get("/api", async (req, res) => {
  try {
    res.send("Hello Coffee! - /api");
  } catch (err) {
    console.error("Error loading locations!", err);
    res.sendStatus(500);
  }
});
// app.get("/api", async (req, res) => {
//   try {
//     res.send("Hello Coffee! - /api");
//   } catch (err) {
//     console.error("Error loading locations!", err);
//     res.sendStatus(500);
//   }
// });

// Always return the main index.html, since we are developing a single page application
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "build", "index.html"));
});

module.exports = app;
