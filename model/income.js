const mongoose = require('mongoose');

const IncomeSchema = new mongoose.Schema({
  income_name: {
    type: String,
  },
});

const Income = mongoose.model('income', IncomeSchema);
module.exports = Income;