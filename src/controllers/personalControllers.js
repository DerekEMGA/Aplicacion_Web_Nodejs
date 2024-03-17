const mostrarPersonal=(req,res)=>{
    res.render("personal/inicioPersonal.ejs")
}

const mostrarAgregarDocente=(req,res)=>
{
    res.render("personal/agregarDocente.ejs")
}


module.exports={
    mostrarPersonal,
    mostrarAgregarDocente
}

