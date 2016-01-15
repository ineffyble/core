var express = require('express');
var router = express.Router();
var membersController = require('../controllers/membersController');
var invoicesController = require('../controllers/invoicesController');
var stripeController = require('../controllers/stripeController');

router.get('/', function(req, res, next) {
    res.header('Stripe-Public-Key', stripeController.getPublicKey()).render('index', { title: 'Express' });
});

router.get('/members/new', function(req, res, next) {
    res.render('members/new', { title: 'New Member' });
});

router.post("/members", membersController.newMemberHandler);
router.post("/invoices", invoicesController.newInvoiceHandler);

module.exports = router;
