const mongoose = require('mongoose');

const AccountSchemas = new mongoose.Schema({
  accountno: {
    type: String,
    required: true,
    unique: true,
  },
  bankName: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Bank',
  },
});

const Account = mongoose.model('account', AccountSchemas);
module.exports = Account;
