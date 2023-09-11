const express = require("express");
const router = express.Router();
const statementController = require("../controllers/statementController");
const bankController = require("../controllers/bankController");
const accountController = require("../controllers/accountController");
const userController = require("../controllers/userController");
const tagController = require("../controllers/tagController");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, uniqueSuffix + extension);
  },
});

const upload = multer({ storage: storage });

router.route('/uploadcsv').post(
  upload.single("file"),
  statementController.uploadStatement
);

// login Routes
router.post("/register",userController.register)
router.post("/login", userController.login);

// statement Routes
router.get("/statement/:accountno", statementController.getStatement);
router.post("/search", statementController.searchdate);
router.patch('/statement/:statementId',statementController.updateStatementfortag);
router.get('/getAllStatments',statementController.getAllStatements)
// router.get("/getall", statementController.getAll);

// bank Routes
router.post("/postbank", bankController.postbank);
router.get("/getbank", bankController.getBank);

// account Routes
router.post("/postaccount", accountController.postaccount);
router.get("/getaccount/:bankId", accountController.getsingleaccount);
router.get("/getallaccount", accountController.getallaccount);

// tag Routes
router.post("/create-tag", tagController.createTag);
router.get("/get-tag", tagController.getAllTags);
router.post("/update-tag/:id", tagController.updateTag);
router.post("/delete-tag", tagController.deleteTag);

module.exports = router;
