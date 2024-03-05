const express=require('express');
const router=express.Router();
const loginController=require('../controllers/loginControllers.js')

router.get('/',loginController.mostrarLogin)
router.post('/',loginController.login)

module.exports=router