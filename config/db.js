const mongoose = require('mongoose');

const connection = async () => {
  mongoose
    .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.info('Database Connection Established');
    })
    .catch((err) => {
      console.error(err);
    });
};

module.exports = connection;
