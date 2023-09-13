const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
  tag_name: {
    type: String,
  },
});

const Tag = mongoose.model('tag', TagSchema);
module.exports = Tag;
