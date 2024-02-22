const express=require('express');
const router=express.Router();
const personalControllers=require('../controllers/personalControllers.js')

router.get('/',personalControllers.mostrarPersonal)

module.exports=router