const Account = require('../model/account');

const postaccount = async (req, res) => {
  try {
    const { accountno, bankName } = req.body;
    const data = await Account.create({
      accountno: accountno,
      bankName: bankName,
    });
    if (!data) {
      return res.status(500).json({
        code: 'Internal-Server-Error',
        error: 'Something went wrong while registering Bank detail',
      });
    }
    return res.status(200).json({
      message: 'Accounr details Registered Successfully !!',
      Bank: data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 'Internal-Server-Error',
      error: 'Something went wrong while processing your request.',
    });
  }
};

const getallaccount = async (req, res) => {
  try {
    const getaccount = await Account.find().populate('bankName');
    res.status(200).json({ getaccount });
  } catch (error) {
    console.error(error);
  }
};

const getsingleaccount = async (req, res) => {
  try {
    const bankId = req.params.bankId;
    const singleaccount = await Account.find({ bankName: bankId }).select('accountno');
    if (!singleaccount) {
      return res.status(404).json({
        message: 'Not found',
      });
    }
    res.status(201).json({
      data: singleaccount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal sever error',
      error: error.message,
    });
  }
};

module.exports = { getallaccount, getsingleaccount, postaccount };
