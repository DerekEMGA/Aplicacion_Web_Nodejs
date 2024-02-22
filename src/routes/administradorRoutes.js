const express=require('express');
const router=express.Router();
const administradorControllers=require('../controllers/administradorControllers.js')

router.get('/',administradorControllers.mostrarAdminstrador)

module.exports=router