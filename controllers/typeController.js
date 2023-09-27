const Type = require('../model/types');
const Statement = require('../model/statement');
const moment = require('moment');

const createType = async (req, res) => {
  try {
    const { type_name } = req.body;
    const savedTag = await Type.create({
      type_name: type_name,
    });
    if (!savedTag) return res.status(500).json({ message: 'Something Went Wrong while Saving' });
    res.status(200).json({ message: 'Type created successfully', savedTag });
  } catch (err) {
    console.error('Internal Server error:', err);
    res.status(400).json({ success: false }, err.message);
  }
};

const getAllType = async (req, res) => {
  try {
    const type = await Type.find();
    if (!type) return res.status(500).json({ message: 'No Data Found' });
    res.status(200).json({ message: 'Type data retrive successfully', type });
  } catch (err) {
    console.error('Error creating type:', err);
    res.status(500).json({ success: false }, err.message);
  }
};

const updateType = async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  try {
    if (!id) {
      return res.status(404).json({ message: 'Type ID is required' });
    }
    const updatedType = await Type.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!updatedType) return res.status(500).json({ message: 'Something Went Wrong' });
    res.status(200).json({ message: 'Type updated successfully', updatedType });
  } catch (err) {
    console.error('Error creating type:', err);
    res.status(500).json({ success: false }, err.message);
  }
};

const deleteType = async (req, res) => {
  const typeId = req.params.id;
  try {
    if (!typeId) {
      return res.status(404).json({ message: 'Type ID is required' });
    }
    await Statement.updateMany({ type_name: typeId }, { $set: { type_name: null } });
    const deletedType = await Type.findByIdAndDelete(typeId);
    if (!deletedType)
      return res.status(500).json({ message: 'Type deletion failed or tag not found' });
    res.status(200).json({ message: 'Type deleted successfully', deletedType });
  } catch (err) {
    console.error('Error creating type:', err);
    res.status(500).json({ success: false }, err.message);
  }
};

async function updateforincome(updatedBody) {
  
    // const updatedBody = updatedBody;
    const date = moment(updatedBody.date);
    const account_number = updatedBody.account_number;
    const formattedDate = date.format('DD-MM-YYYY');
    const datemil = moment(formattedDate, 'DD-MM-YYYY');
    const firstDayTimestamp = datemil.clone().startOf('month').valueOf();
    const lastDayTimestamp = datemil.clone().endOf('month').valueOf();
    try {
    // console.info(formattedDate, firstDayTimestamp, lastDayTimestamp, 'formattedDate');
    const returndata = await Statement.updateMany(
      {
        description: updatedBody.description,
        date: { $gte: firstDayTimestamp, $lte: lastDayTimestamp },
        account_number: account_number,
      },
      { $set: { income_name: updatedBody.income_name } },
      { upsert: true },
      { multi: true },
    );
    if (returndata.acknowledged == true) {
      return "Data Updated"
    }
  } catch (error) {
    console.info("error", error)
    return error

  }
}; 

const updateStatementforincome = async (req, res) => {
  try {
    const updatedBody = req.body;
    const UpdatedBody = await updateforincome(updatedBody)
    console.log(UpdatedBody)
    res.status(200).json({"message":UpdatedBody})
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createType, getAllType, updateType, deleteType, updateStatementforincome };
