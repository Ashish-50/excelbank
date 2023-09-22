const express = require('express');
const router = express.Router();
const statementController = require('../controllers/statementController');
const bankController = require('../controllers/bankController');
const accountController = require('../controllers/accountController');
const userController = require('../controllers/userController');
const tagController = require('../controllers/tagController');
const typeController = require('../controllers/typeController');

const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

router.route('/uploadcsv').post(upload.single('file'), statementController.uploadStatement);

// login Routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// statement Routes
router.get('/statement/:accountno', statementController.getStatement);
router.post('/search', statementController.searchdate);
router.patch('/statement/:statementId', statementController.updateStatementfortag);
router.get('/getAllStatments', statementController.getAllStatements);
router.post('/statementByMonth', statementController.statementByMonth);

// bank Routes
router.post('/postbank', bankController.postbank);
router.get('/getbank', bankController.getBank);

// account Routes
router.post('/postaccount', accountController.postaccount);
router.get('/getaccount/:bankId', accountController.getsingleaccount);
router.get('/getallaccount', accountController.getallaccount);

// tag Routes
router.post('/create-tag', tagController.createTag);
router.get('/get-tag', tagController.getAllTags);
router.patch('/update-tag/:id', tagController.updateTag);
router.delete('/delete-tag/:id', tagController.deleteTag);

// type Routes
router.post('/create-type', typeController.createType);
router.get('/get-type', typeController.getAllType);
router.patch('/update-type/:id', typeController.updateType);
router.delete('/delete-type/:id', typeController.deleteType);

module.exports = router;
