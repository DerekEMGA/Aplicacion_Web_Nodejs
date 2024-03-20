const express=require('express');
const router=express.Router();
const alumnoControllers=require('../controllers/alumnoControllers.js')

router.get('/',alumnoControllers.mostrarAlumno)

module.exports=router