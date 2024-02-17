const express = require('express');
const router = express.Router();
const customerController= require('../controllers/customerController');
const loginController= require('../controllers/loginController');


router.get('/lista',customerController.list);
router.post("/prueba",customerController.prueba);
router.get('/',loginController.login);

module.exports=router; 
