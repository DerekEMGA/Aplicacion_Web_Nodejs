const mostrarPersonal=(req,res)=>{
    res.render("personal/inicioPersonal.ejs")
}

const mostrarAgregarDocente=(req,res)=>
{
    res.render("personal/agregarDocente.ejs")
}

const mostrarAgregarMateria=(req,res)=>
{
    res.render("personal/agregarMateria.ejs")
}

module.exports={
    mostrarPersonal,
    mostrarAgregarDocente,
    mostrarAgregarMateria
}

