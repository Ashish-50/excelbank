const Income = require('../model/income');
const Statement = require('../model/statement');

const createIncome = async (req, res) => {
  try {
    const { income_name } = req.body;
    const savedIncome = await Income.create({
        income_name: income_name,
    });
    if (!savedIncome) return res.status(500).json({ message: 'Something Went Wrong while Saving' });
    res.status(200).json({ message: 'Income created successfully', savedIncome });
  } catch (err) {
    console.error('Internal Server error:', err);
    res.status(400).json({ success: false }, err.message);
  }
};

const getAllIncome = async (req, res) => {
  try {
    const incomeData = await Income.find();
    if (!incomeData) return res.status(500).json({ message: 'No Data Found' });
    res.status(200).json({ message: 'Income data retrive successfully', incomeData });
  } catch (err) {
    console.error('Error creating Income:', err);
    res.status(500).json({ success: false }, err.message);
  }
};

const updateIncome = async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  try {
    if (!id) {
      return res.status(404).json({ message: 'Income ID is required' });
    }
    const updatedIncome = await Income.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!updatedIncome) return res.status(500).json({ message: 'Something Went Wrong' });
    res.status(200).json({ message: 'Income updated successfully', updatedIncome });
  } catch (err) {
    console.error('Error creating Income:', err);
    res.status(500).json({ success: false }, err.message);
  }
};

const deleteIncome = async (req, res) => {
  const incomeId = req.params.id;
  try {
    if (!incomeId) {
      return res.status(404).json({ message: 'Income ID is required' });
    }
    await Statement.updateMany({ income_name: incomeId }, { $set: { income_name: null } });
    const deletedIncome = await Income.findByIdAndDelete(incomeId);
    if (!deletedIncome)
      return res.status(500).json({ message: 'Income deletion failed or income not found' });
    res.status(200).json({ message: 'Income deleted successfully', deletedIncome });
  } catch (err) {
    console.error('Error creating Income:', err);
    res.status(500).json({ success: false }, err.message);
  }
};

module.exports = { createIncome, getAllIncome, updateIncome, deleteIncome };
