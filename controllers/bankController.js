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
        code: 'Internal-Server-Error',
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

module.exports = {
  postbank,
  getBank,
};
