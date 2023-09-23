const csv = require('csv-parser');
const moment = require('moment');
const Statement = require('../model/statement');
const { Readable } = require('stream');

let previousMonthdata;
const statHash = new Map();

const previousMonth = async (date1, bankName, accountNumber) => {
  const date = moment(date1);
  const firstDayOfPreviousMonth = date.clone().subtract(1, 'months').startOf('month').unix();
  const lastDayOfPreviousMonth = date.clone().subtract(1, 'months').endOf('month').unix();
  previousMonthdata = await Statement.find({
    date: {
      $gte: firstDayOfPreviousMonth * 1000,
      $lte: lastDayOfPreviousMonth * 1000,
    },
    bank_name: bankName,
    account_number: accountNumber,
  });

  if (previousMonthdata) {
    previousMonthdata.forEach((item) => {
      statHash.set(item.description, item);
    });
  }
};

const processCSVFile = async (fileBuffer, bankName, accountNumber) => {
  const results = await new Promise((resolve, reject) => {
    const rows = [];
    const stream = Readable.from(fileBuffer); // Convert Buffer to Readable stream
    stream
      .on('error', (error) => {
        console.error(error);
        reject(error);
      })
      .pipe(csv())
      .on('data', (row) => {
        if (row['Date']) {
          const dateObject = moment(row['Date'], 'DD-MM-YYYY');
          if (dateObject.isValid()) {
            const timestamp = dateObject.unix();
            const timestampmiliseconds = timestamp * 1000;
            row.date = timestampmiliseconds;
          }
        } else if (row['Value Date']) {
          let dateObject = moment(row['Value Date'], 'MM-DD-YYYY');
          if (!dateObject.isValid()) {
            const reformattedDate = moment(row['Date'], 'MM-DD-YYYY').format('DD-MM-YYYY');
            dateObject = moment(reformattedDate, 'DD-MM-YYYY');
          }
          if (dateObject.isValid()) {
            const timestamp = dateObject.unix();
            const timestampmiliseconds = timestamp * 1000;
            row.date = timestampmiliseconds;
          }
        }
        rows.push(row);
      })
      .on('end', async () => {
        resolve(rows);
      });
  });
  await previousMonth(results[0].date, bankName, accountNumber);
  return results;
};

const uploadStatement = async (req, res) => {
  try {
    const bankName = req.body.bankName;
    const accountNumber = req.body.AccountNumber;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    try {
      const CSVDATA = await processCSVFile(file.buffer, bankName, accountNumber);
      const finalData = CSVDATA.map((data) => {
        const result = {};
        if (req.body.bankName == 'HDFC') {
          const debitAmount = parseFloat(data['Debit Amount'] || data['DebitAmount']);
          const creditAmount = parseFloat(data['Credit Amount'] || data['CreditAmount']);
          const type = debitAmount !== 0 ? 'DR' : creditAmount !== 0 ? 'CR' : '';
          const transaction_amount = type === 'DR' ? debitAmount : creditAmount;
          const dateObject = moment(data['Date'], 'DD-MM-YYYY');
          const timestamp = dateObject.unix();
          const timestampmiliseconds = timestamp * 1000;
          result.date = timestampmiliseconds;
          result.description = data['Narration'];
          result.type = type;
          result.transaction_amount = transaction_amount;
          result.cheque_no = parseFloat(data['Chq/Ref Number']) || parseFloat(data['ChqNumber']);
          result.total_balance = data['Closing Balance'] || data['ClosingBalance'];
          result.transaction_id = null;
          result.txn_posted_date = null;
          result.tag_name = statHash.get(result.description)?.tag_name || null;
        }
        if (req.body.bankName == 'ICICI') {
          const dateObject = moment(data['Value Date'], 'MM-DD-YYYY');
          const timestamp = dateObject.unix();
          const timestampmiliseconds = timestamp * 1000;
          result.date = timestampmiliseconds;
          result.description = data['Description'];
          result.type = data['Cr/Dr'];
          result.transaction_amount = data['Transaction Amount(INR)'];
          result.cheque_no = parseFloat(data['ChequeNo.']);
          result.total_balance = data['Available Balance(INR)'];
          result.transaction_id = data['Transaction ID'];
          result.txn_posted_date = data['Txn Posted Date'];
          result.tag_name = statHash.get(result.description)?.tag_name || null;
        }
        result.bank_name = bankName;
        result.account_number = accountNumber;
        return result;
      });
      await Statement.insertMany(finalData);
      previousMonthdata = {};
      statHash.clear();
      res.status(200).json({ message: 'CSV file uploaded and data saved.' });
    } catch (error) {
      console.error('Error processing CSV file:', error);
      res.status(500).json({
        message: 'Error processing CSV file.',
        error: error.message,
      });
    }
  } catch (connectionError) {
    console.error('Error connecting to MongoDB:', connectionError);
    res.status(400).json({
      message: 'Error uploading CSV file.',
      error: connectionError.message,
    });
  }
};

const getStatement = async (req, res) => {
  try {
    const page = req.query.page;
    const limit = req.query.limit;
    if (!page || !limit) {
      return res.status(400).json({
        message: 'Page and Limit are required',
      });
    }
    const offSet = (page - 1) * limit;
    const accountno = req.params.accountno;
    const count = await Statement.count({ account_number: accountno }).lean().exec();
    const totalPages = Math.ceil(count / limit);
    const getStatement = await Statement.find({ account_number: accountno })
      .populate('tag_name')
      .skip(offSet)
      .limit(limit)
      .exec();
    if (!getStatement) {
      return res.status(404).json({
        message: 'Not found',
      });
    }

    res.status(200).json({
      count: count,
      totalPages: totalPages,
      hasNextPage: page < totalPages,
      data: getStatement,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

const searchdate = async (req, res) => {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  const result = await Statement.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  });
  if (result) {
    res.status(200).json({ message: 'filter date applied', result });
    return;
  }
  res.status(400).json({ message: 'No data found' });
};

const updateStatementfortag = async (req, res) => {
  try {
    const updatedBody = req.body;
    const date = moment(updatedBody.date);
    const account_number = updatedBody.account_number;
    const formattedDate = date.format('DD-MM-YYYY');
    const datemil = moment(formattedDate, 'DD-MM-YYYY');
    const firstDayTimestamp = datemil.clone().startOf('month').valueOf();
    const lastDayTimestamp = datemil.clone().endOf('month').valueOf();

    console.info(formattedDate, firstDayTimestamp, lastDayTimestamp, 'formattedDate');
    const returndata = await Statement.updateMany(
      {
        description: updatedBody.description,
        date: { $gte: firstDayTimestamp, $lte: lastDayTimestamp },
        account_number: account_number,
      },
      { $set: { tag_name: updatedBody.tag_name } },
      { upsert: true },
      { multi: true },
    );
    if (returndata.acknowledged == true) {
      res.status(200).json({ message: 'data updated ' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getAllStatements = async (req, res) => {
  try {
    const page = req.query.page;
    const limit = req.query.limit;
    const offSet = (page - 1) * limit;

    let query = {};

    if (req.query.selectedMonth) {
      const selectedMonth = req.query.selectedMonth;
      query.date = {
        $gte: moment(selectedMonth, 'MM').startOf('month').valueOf(),
        $lte: moment(selectedMonth, 'MM').endOf('month').valueOf(),
      };
    }

    if (req.query.accountNumber) {
      const accountNumber = req.query.accountNumber;
      query.account_number = accountNumber;
    }

    const count = await Statement.count(query).lean().exec()

    const totalPages = Math.ceil(count / limit);

    const getData = await Statement.find(query)
      .populate('tag_name')
      .skip(offSet)
      .limit(limit)
      .exec();

    if (!getData || getData.length === 0) {
      return res.status(404).json({ message: 'No Data found' });
    }

    res.status(200).json({
      count: count,
      totalPages: totalPages,
      hasNextPage: page < totalPages,
      data: getData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json('Internal server error');
  }
};

const statementByMonth = async (req, res) => {
  try {
    const { date, accountNumber, bankName } = req.body;
    const page = req.query.page || 1;
    const limit = req.query.limit || 100;
    const offSet = (page - 1) * limit;
    const actualDate = moment(date);
    const formattedDate = actualDate.format('DD-MM-YYYY');
    const datemil = moment(formattedDate, 'DD-MM-YYYY');
    const firstDayTimestamp = datemil.clone().startOf('month').valueOf();
    const lastDayTimestamp = datemil.clone().endOf('month').valueOf();

    const count = await Statement.count({  date: {
      $gte: firstDayTimestamp,
      $lte: lastDayTimestamp,
    },
    account_number: accountNumber,
    bank_name: bankName}).lean().exec();
    const totalPages = Math.ceil(count / limit);
    const getStatement = await Statement.aggregate([
      {
        $match: {
          date: {
            $gte: firstDayTimestamp,
            $lte: lastDayTimestamp,
          },
          account_number: accountNumber,
          bank_name: bankName,
        },
      },
      { $skip: offSet },
      { $limit: limit },
    ]);
    if (getStatement.length > 0) {
      res.status(200).json({
        hasNextPage: page < totalPages,
        totalCount:count,
        totalPage:totalPages,
        statement: getStatement,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  uploadStatement,
  getStatement,
  searchdate,
  updateStatementfortag,
  getAllStatements,
  statementByMonth,
};
