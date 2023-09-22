const express = require('express');
const router = express.Router();
const statementController = require('../controllers/statementController');
const bankController = require('../controllers/bankController');
const accountController = require('../controllers/accountController');
const userController = require('../controllers/userController');
const tagController = require('../controllers/tagController');
const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

router.route('/uploadcsv').post(upload.single('file'), statementController.uploadStatement); //ok

// login Routes
router.post('/register', userController.register); //ok
router.post('/login', userController.login); //ok

// statement Routes
router.get('/statement/:accountno', statementController.getStatement); //ok
router.post('/search', statementController.searchdate); //ok
router.patch('/statement/:statementId', statementController.updateStatementfortag); //ok
router.get('/getAllStatments', statementController.getAllStatements); //ok
router.post('/statementByMonth', statementController.statementByMonth); //not ok

// bank Routes
router.post('/postbank', bankController.postbank); //ok
router.get('/getbank', bankController.getBank); //ok

// account Routes
router.post('/postaccount', accountController.postaccount); //not ok
router.get('/getaccount/:bankId', accountController.getsingleaccount); //not ok
router.get('/getallaccount', accountController.getallaccount); //not ok

// tag Routes
router.post('/create-tag', tagController.createTag); //ok
router.get('/get-tag', tagController.getAllTags); //ok
router.patch('/update-tag/:id', tagController.updateTag); //ok
router.delete('/delete-tag/:id', tagController.deleteTag); //ok

module.exports = router;
