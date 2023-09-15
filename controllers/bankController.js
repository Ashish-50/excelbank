const Bank = require('../model/bank');

const postbank = async (req, res) => {
  try {
    const { bankName, IFSCCode, bankAddress } = req.body;
    const savedBank = await Bank.create({
      bankName: bankName,
      IFSCCode: IFSCCode,
      bankAddress: bankAddress,
    });
    if (!savedBank) {
      return res.status(500).json({
        error: 'Something went wrong while registering Bank detail',
      });
    }
    return res.status(200).json({
      message: 'Bank detail Registered Successfully !!',
      Bank: savedBank,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 'Internal-Server-Error',
      error: 'Something went wrong while processing your request.',
    });
  }
};

const getBank = async (req, res) => {
  try {
    const banks = await Bank.find({});
    if (!banks) {
      res.status(404).json({
        message: 'no bank found',
      });
    }
    res.status(200).json({
      data: banks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};

const updateBank = async(req,res) =>{
  const id = req.params.id;
  const data = req.body;
  try {
    const updateBank = await Bank.findByIdAndUpdate(id,data,{
      new:true
    });
    if (!updateBank)
      return res.status(500).json({ message: "Bank not found" });
    res.status(200).json({ message: "Bank updated successfully", updateBank });
  } catch (error) {
    console.error("Error in updating bank",error);
    res.status(400).json({ success: false }, error.message);
  }
};

const deleteBank = async (req, res) => {
  const { bankId } = req.params.id;
  try {
    const deletedBank = await Bank.findByIdAndDelete(bankId);
    if (!deletedBank)
      return res.status(404).json({ message: "Bank not found or something went wrong" });
    res.status(200).json({ message: "Bank deleted successfully" });
  } catch (err) {
    console.error("Error Deleting bank:", err);
    res.status(400).json({ success: false }, err.message);
  }
};



module.exports = {
  postbank,
  getBank,
  updateBank,
  deleteBank
};
