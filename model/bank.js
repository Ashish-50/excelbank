const mongoose = require('mongoose');

const BankSchemas = new mongoose.Schema({
  bankName: {
    type: String,
    required: true,
  },
  IFSCCode: {
    type: String,
    required: true,
    unique: true,
  },
  bankAddress: {
    type: String,
    required: true,
  },
});

const Bank = mongoose.model('Bank', BankSchemas);
module.exports = Bank;
