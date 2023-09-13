const mongoose = require("mongoose");

let connection = async () => {
  mongoose
    .connect(
      process.env.MONGODB_URI,{ useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() => {
      console.log("connected");
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = connection;
