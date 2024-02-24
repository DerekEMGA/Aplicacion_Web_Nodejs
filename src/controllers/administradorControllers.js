const mostrarAdminstrador=(req,res)=>{
    res.render("superAdministrador/inicioSuperAdministrador.ejs")
}

const mostrarAgregarPersonal=(req,res)=>{
    res.render("superAdministrador/agregarPersonal.ejs")
}

const mostrarprueba=(req,res)=>
{
    res.render("prueba.ejs")
}

module.exports={
    mostrarAdminstrador,
    mostrarAgregarPersonal,
    mostrarprueba
}