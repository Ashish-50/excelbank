const csv = require("csv-parser");
const fs = require("fs");
const moment = require('moment')
const mongoose = require('mongoose')

const Statement = require("../model/statement");


let previousMonthdata;
let statHash = new Map();

const previousMonth = async (date1) => {
  const date = moment(date1);
  const previousMonthDate = date.subtract(1, 'months');
    const formattedDate = previousMonthDate.format('DD-MM-YYYY');
    console.log('Formatted Date:', formattedDate);
    const datemil = moment(formattedDate, 'DD-MM-YYYY');
    const firstDayTimestamp = datemil.clone().startOf('month').valueOf();
    const lastDayTimestamp = datemil.clone().endOf('month').valueOf();
  console.log( formattedDate, lastDayTimestamp, firstDayTimestamp, date, formattedDate)
  
   previousMonthdata = await Statement.find({
    date: {
      $gte: firstDayTimestamp,
      $lte: lastDayTimestamp,
    },
  })

if(previousMonthdata){
  previousMonthdata.forEach((item)=>{
    statHash.set(item.description,item)
  })
}
}

const processCSVFile = async (filePath) => {
  const results = await new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .on("error", (error) => {
        console.log(error);
        reject(error);
      })
      .pipe(csv())
      .on("data", (row) => {
        if (row["Date"] || row["Value Date"]) {
          var dateObject = moment(row['Date'] || row["Value Date"], 'DD-MM-YYYY');
            var timestamp = dateObject.unix();
            var timestampmiliseconds = timestamp*1000;
          row.date = timestampmiliseconds
        }
        rows.push(row);
      })
      .on("end", async()  => {
        resolve(rows);
      });
    });
    await previousMonth(results[0].date);
  return results
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
     let CSVDATA = await processCSVFile(file.path, bankName, accountNumber);
      let finalData = CSVDATA.map((data)=>{
        let result={}
        if(req.body.bankName == 'HDFC'){
          const debitAmount = parseFloat(data["Debit Amount"] || data['DebitAmount'] );
          const creditAmount = parseFloat(data["Credit Amount"] || data['CreditAmount']);
          const type =
            debitAmount !== 0 ? "DR" : creditAmount !== 0 ? "CR" : "";
          const transaction_amount =
            type === "DR" ? debitAmount : creditAmount;
          var dateObject = moment(data['Date'], 'DD-MM-YYYY');
          var timestamp = dateObject.unix();
          var timestampmiliseconds = timestamp*1000;
          result.date = timestampmiliseconds;
          result.description = data["Narration"];
          result.type = type;
          result.transaction_amount = transaction_amount;
          result.cheque_no = data["Chq/Ref Number"] || data['ChqNumber'];
          result.total_balance = data["Closing Balance"] || data['ClosingBalance'];
          result.transaction_id = null;
          result.txn_posted_date = null;
          result.tag_name = statHash.get(result.description)?.tag_name || null;
        }
        if(req.body.bankName == 'ICICI'){
          var dateObject = moment(data["Value Date"], 'MM-DD-YYYY');
          var timestamp = dateObject.unix();
          var timestampmiliseconds = timestamp*1000;
          result.date = timestampmiliseconds;
          result.description = data["Description"];
          result.type = data["Cr/Dr"];
          result.transaction_amount = data["Transaction Amount(INR)"];
          result.cheque_no = data["ChequeNo."];
          result.total_balance = data["Available Balance(INR)"];
          result.transaction_id = data["Transaction ID"];
          result.txn_posted_date = data["Txn Posted Date"];
          result.tag_name = statHash.get(result.description)?.tag_name || null;
        }
        result.bank_name = bankName;
        result.account_number = accountNumber;
        return result;
      })

      let CSVInserted = await Statement.insertMany(finalData)
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

// const processCSVFile = async (filePath, bankName, accountNumber) => {
//   const results = [];
//   const currentDate = moment(); // Get the current date
//   const previousMonth = currentDate.subtract(1, 'months'); // Subtract 1 month to get the previous month

//   const startTimestamp = previousMonth.startOf('month').unix()*1000; // Start of the previous month as a timestamp
//   const endTimestamp = previousMonth.endOf('month').unix()*1000;
//   const previousMonthdata = await Statement.find({
//     date: {
//       $gte: startTimestamp,
//       $lte: endTimestamp,
//     },
//   })

//   let stateHash  = {};
//   previousMonthdata.forEach((item) => {
//     stateHash[item.description] = item
//   })
//   return new Promise((resolve, reject) => {
//     const fileStream = fs.createReadStream(filePath)
//       .on('error', (error) => {
//         reject(error); // Handle file read errors
//       })
//       .pipe(csv())
//       .on('data',async  (data) => {

//         const result = {};
//           if (bankName === 'HDFC') {
//             const debitAmount = parseFloat(data["Debit Amount"] || data['DebitAmount'] );
//             const creditAmount = parseFloat(data["Credit Amount"] || data['CreditAmount']);
//             const type =
//               debitAmount !== 0 ? "DR" : creditAmount !== 0 ? "CR" : "";
//             const transaction_amount =
//               type === "DR" ? debitAmount : creditAmount;
//             var dateObject = moment(data['Date'], 'DD-MM-YYYY');
//             var timestamp = dateObject.unix();
//             var timestampmiliseconds = timestamp*1000;
//             result.date = timestampmiliseconds;
//             result.description = data["Narration"];
//             result.type = type;
//             result.transaction_amount = transaction_amount;
//             result.cheque_no = data["Chq/Ref Number"] || data['ChqNumber'];
//             result.total_balance = data["Closing Balance"] || data['ClosingBalance'];
//             result.transaction_id = null;
//             result.txn_posted_date = null;
//             result.tag_name = stateHash[result.description]?.tag_name || null;
//             // if(previousMonthdata.length>0){
//             //   let test1 = previousMonthdata.find((stat) => stat.description === result.description)
//             //   if(test1){
//             //     result.tag_name = test1.tag_name
//             //   }else{
//             //     result.tag_name = null
//             //   }
//             // }    
//           } else if (bankName === 'ICICI') {
//             var dateObject = moment(data["Value Date"], 'MM-DD-YYYY');
//             var timestamp = dateObject.unix();
//             var timestampmiliseconds = timestamp*1000;
//             result.date = timestampmiliseconds;
//             result.description = data["Description"];
//             result.type = data["Cr/Dr"];
//             result.transaction_amount = data["Transaction Amount(INR)"];
//             result.cheque_no = data["ChequeNo."];
//             result.total_balance = data["Available Balance(INR)"];
//             result.transaction_id = data["Transaction ID"];
//             result.txn_posted_date = data["Txn Posted Date"];
//             result.tag_name = stateHash[result.description]?.tag_name || null;
//           //   if(previousMonthdata.length>0){
//           //     let test1 = previousMonthdata.find((stat) => stat.description === result.description)
//           //     if(test1){
//           //       result.tag_name = test1.tag_name
//           //     }else{
//           //       result.tag_name = null
//           //     }
//           //   }
//           }
//           result.bank_name = bankName;
//           result.account_number = accountNumber;
//           results.push(result);

//       })
//       .on('end', async () => {
//         try {
//           await Statement.insertMany(results); // Insert data into MongoDB
//           fs.unlinkSync(filePath); // Delete the uploaded file
//           resolve();
//         } catch (insertError) {
//           reject(insertError); // Handle MongoDB insert errors
//         }
//       });
//   });
// };

// const uploadStatement = async (req, res) => {
//   try {
//     const bankName = req.body.bankName;
//     const accountNumber = req.body.AccountNumber;
//     const file = req.file; // Use req.file for a single file upload

//     if (!file) {
//       return res.status(400).json({ message: 'No file uploaded.' });
//     }
//     try {
//       await processCSVFile(file.path, bankName, accountNumber);
//       res.status(200).json({ message: 'CSV file uploaded and data saved.' });
//     } catch (error) {
//       console.error('Error processing CSV file:', error);
//       res.status(500).json({
//         message: 'Error processing CSV file.',
//         error: error.message,
//       });
//     }
//   } catch (connectionError) {
//     console.error('Error connecting to MongoDB:', connectionError);
//     res.status(400).json({
//       message: 'Error uploading CSV file.',
//       error: connectionError.message,
//     });
//   }
// };


const getStatement = async (req, res) => {
  try {
    const { page } = req.query || 1;
    const { limit } = req.query || 10;
    const accountno = req.params.accountno;

    const offSet = (page - 1) * limit;
    const getStatement = await Statement.find({ account_number: accountno }).populate('tag_name')
    .skip(offSet)
    .limit(limit).exec()
    if (!getStatement) {
      return res.status(404).json({
        message: "Not found",
      });
    }
    res.status(200).json({
      data: getStatement,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
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
    res.status(200).json({ message: "filter date applied", result });
    return;
  }
  res.status(400).json({ message: "No data found" });
};

const updateStatementfortag = async (req,res) => {
  try {
    const updatedBody = req.body;
    const statementId  = req.params.statementId;
    const date = moment(updatedBody.date);
    const formattedDate = date.format('DD-MM-YYYY');

    console.log('Formatted Date:', formattedDate);
    const datemil = moment(formattedDate, 'DD-MM-YYYY');

    const firstDayTimestamp = datemil.clone().startOf('month').valueOf();

    const lastDayTimestamp = datemil.clone().endOf('month').valueOf();

    const returndata = await Statement.updateMany({
      $and:[{description:updatedBody.description},{date:{$gte:firstDayTimestamp,$lte:lastDayTimestamp},account_number:updatedBody.account_number}]
    },{$set:{tag_name:updatedBody.tag_name}},{upsert:true})
    if(returndata.acknowledged == true){
      res.status(200).json({"message":"data updated "});
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({error:error.message})
  }
}



const getAllStatements = async (req,res) => {
  try {
    const page = req.query.page;
    const limit = req.query.limit;
    const offSet =(page -1 ) * limit;
    const getData =  await Statement.find({}).skip(offSet).limit(limit).exec();
    if(!getData) return res.status(404).json({message:"No Data found"});
    res.status(200).json({
      data:getData
    })
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal server error")
  }
};

module.exports = { uploadStatement, getStatement, searchdate,updateStatementfortag,getAllStatements };
