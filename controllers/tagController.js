const Tag = require("../model/tags");

// const createtag = async (req, res) => {
//   const { tag_name } = req.body;

//   const tag = await Tag.create({
//     tag_name: tag_name,
//   });

//   if (!tag) {
//     return res.status(500).json({
//       code: "Internal-Server-Error",
//       error: "Something went wrong while creating tag",
//     });
//   }
//   return res.status(200).json({
//     message: "Tag created Successfully !!",
//     Bank: savedBank,
//   });
// };

// const getTag = async (req, res) => {
//   try {
//     const tags = await Tag.find({});
//     if (!tags) {
//       res.status(404).json({
//         message: "no tag found",
//       });
//     }
//     res.status(200).json({
//       data: tags,
//     });
//   } catch (error) {}
// };

const createTag = async (req, res) => {
  try {
    const { tag_name } = req.body;
    const savedTag = await Tag.create({
      tag_name: tag_name,
    });
    if (!savedTag)
      return res.status(500).json({ message: "Internal server error" });
    res.status(200).json({ message: "Tag created successfully", savedTag });
  } catch (err) {
    console.error("Error creating tag:", err);
    res.status(400).json({ success: false }, err.message);
  }
};

const getAllTags = async (req, res) => {
  try {
    const tags = await Tag.find();
    if (!tags)
      return res.status(500).json({ message: "Internal server error" });
    res.status(200).json({ message: "tags data retrive successfully", tags });
  } catch (err) {
    console.error("Error creating tag:", err);
    res.status(400).json({ success: false }, err.message);
  }
};

const updateTag = async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  // const { tag_name } = req.body;
  // console.log(_id, tag_name);
  try {
    const updatedTag = await Tag.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!updatedTag)
      return res.status(500).json({ message: "Internal server error" });
    res.status(200).json({ message: "tags updated successfully", updatedTag });
  } catch (err) {
    console.error("Error creating tag:", err);
    res.status(400).json({ success: false }, err.message);
  }
};

const deleteTag = async (req, res) => {
  const { tagId } = req.body;
  try {
    const deletedTag = await Tag.findByIdAndDelete(tagId);
    console.log("Tag deleted:", deletedTag);
    if (!deletedTag)
      return res.status(500).json({ message: "Internal server error" });
    res.status(200).json({ message: "tags deleted successfully", deletedTag });
  } catch (err) {
    console.error("Error creating tag:", err);
    res.status(400).json({ success: false }, err.message);
  }
};

module.exports = { createTag, getAllTags, updateTag, deleteTag };
