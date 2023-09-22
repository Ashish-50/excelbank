const mongoose = require('mongoose');

const TypeSchema = new mongoose.Schema({
  type_name: {
    type: String,
  },
});

const Type = mongoose.model('type', TypeSchema);
module.exports = Type;