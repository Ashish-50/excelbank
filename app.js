const express = require("express");
const cors = require("cors");
const uploadRoutes = require("./routes/uploadRoutes");
const connection = require("./config/db");
const dotenv = require('dotenv')

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else if (process.env.NODE_ENV === 'staging') {
  dotenv.config({ path: '.env.staging' });
} else {
  dotenv.config({ path: '.env.development' });
}

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

app.use("/uploads", express.static(__dirname + "/public/uploads"));


app.use("/api", uploadRoutes);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  connection();
  console.log("App is running on port " + PORT);
});
