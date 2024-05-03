const mostrarAlumno=(req,res)=>
{
    res.render("alumno/inicioAlumno.ejs")
}

const mostrarHorario=(req,res)=>
{
    res.render("alumno/horario.ejs")
}

module.exports={
    mostrarAlumno,
    mostrarHorario
}