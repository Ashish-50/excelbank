const express = require("express");
const cors = require("cors");
const uploadRoutes = require("./routes/uploadRoutes");
const connection = require("./config/db");
require('dotenv').config()

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

app.use("/uploads", express.static(__dirname + "/public/uploads"));


app.use("/api", uploadRoutes);

const PORT = 3003;

app.listen(PORT, () => {
  connection();
  console.log("App is running on port " + PORT);
});
