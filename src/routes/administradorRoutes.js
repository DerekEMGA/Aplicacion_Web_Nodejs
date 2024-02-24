const express=require('express');
const router=express.Router();
const administradorControllers=require('../controllers/administradorControllers.js')

router.get('/',administradorControllers.mostrarAdminstrador)
router.get('/agregarPersonal',administradorControllers.mostrarAgregarPersonal)
router.get('/prueba',administradorControllers.mostrarprueba)

module.exports=router