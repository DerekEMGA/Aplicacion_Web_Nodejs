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

const mostrarAgregarAlumnos=(req,res)=>
{
    res.render("personal/agregarAlumnos.ejs")
}

module.exports={
    mostrarPersonal,
    mostrarAgregarDocente,
    mostrarAgregarMateria,
    mostrarAgregarAlumnos
}

