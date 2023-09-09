const mongoose = require("mongoose");

const StatementSchemas = new mongoose.Schema({
  date: {
    type: Number,
  },
  description: {
    type: String,
  },
  type: {
    type: String,
  },
  transaction_amount: {
    type: String,
  },
  cheque_no: {
    type: String,
  },
  total_balance: {
    type: String,
  },
  transaction_id: {
    type: String,
  },
  txn_posted_date: {
    type: String,
  },
  bank_name: {
    type: String,
  },
  account_number: {
    type: String,
  },
  tag_name:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'tag',
  },
  is_confirm: {
    type: String,
    default: false,
  },
});

const Statement = mongoose.model("statement", StatementSchemas);
module.exports = Statement;
