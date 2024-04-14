const express=require('express');
const router=express.Router();
const personalControllers=require('../controllers/personalControllers.js')

router.get('/',personalControllers.mostrarPersonal)
router.get('/agregarDocente',personalControllers.mostrarAgregarDocente)
router.get('/agregarMateria',personalControllers.mostrarAgregarMateria)
router.get('/agregarAlumnos',personalControllers.mostrarAgregarAlumnos)
router.get('/crearHorario',personalControllers.mostrarCrearHorario)

module.exports=router