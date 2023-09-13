const Tag = require('../model/tags');
const Statement = require('../model/statement');

const createTag = async (req, res) => {
  try {
    const { tag_name } = req.body;
    const savedTag = await Tag.create({
      tag_name: tag_name,
    });
    if (!savedTag) return res.status(500).json({ message: 'Something Went Wrong while Saving' });
    res.status(200).json({ message: 'Tag created successfully', savedTag });
  } catch (err) {
    console.error('Internal Server error:', err);
    res.status(400).json({ success: false }, err.message);
  }
};

const getAllTags = async (req, res) => {
  try {
    const tags = await Tag.find();
    if (!tags) return res.status(500).json({ message: 'No Data Found' });
    res.status(200).json({ message: 'tags data retrive successfully', tags });
  } catch (err) {
    console.error('Error creating tag:', err);
    res.status(500).json({ success: false }, err.message);
  }
};

const updateTag = async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  try {
    if (!id) {
      return res.status(404).json({ message: 'Tag ID is required' });
    }
    const updatedTag = await Tag.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!updatedTag) return res.status(500).json({ message: 'Something Went Wrong' });
    res.status(200).json({ message: 'tags updated successfully', updatedTag });
  } catch (err) {
    console.error('Error creating tag:', err);
    res.status(500).json({ success: false }, err.message);
  }
};

const deleteTag = async (req, res) => {
  const { tagId } = req.params.id;
  try {
    if (!tagId) {
      return res.status(404).json({ message: 'Tag ID is required' });
    }
    await Statement.updateMany({ tag_name: tagId }, { $set: { tag_name: null } });
    const deletedTag = await Tag.findByIdAndDelete(tagId);
    if (!deletedTag)
      return res.status(500).json({ message: 'Tag deletion failed or tag not found' });
    res.status(200).json({ message: 'tags deleted successfully', deletedTag });
  } catch (err) {
    console.error('Error creating tag:', err);
    res.status(500).json({ success: false }, err.message);
  }
};

module.exports = { createTag, getAllTags, updateTag, deleteTag };
