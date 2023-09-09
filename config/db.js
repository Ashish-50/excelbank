const mongoose = require("mongoose");

let connection = async () => {
  mongoose
    .connect(
      "mongodb+srv://excellence-pardeep:excellence-pardeep@cluster0.mfk2efk.mongodb.net/excelBank"
    )
    .then(() => {
      console.log("connected");
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = connection;
