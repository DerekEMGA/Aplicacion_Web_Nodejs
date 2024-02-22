const express=require('express');
const router=express.Router();
const docenteControllers=require('../controllers/docenteControllers')

router.get('/',docenteControllers.mostrarDocente)

module.exports=router