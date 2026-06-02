const express = require("express");
const cors = require("cors");

const app = express();

const simulationRoutes = require("./routes/simulations");
const geminiRoutes = require('./routes/gemini.route');

app.use(cors());
app.use(express.json());

app.use("/api/simulations", simulationRoutes);
app.use('/api/gemini', geminiRoutes);

app.listen(5000, () => {
  console.log("Express server running on port 5000");
});