const loginQuery = require('../queries/loginQuery');  
const loginQueryAdministrador=require('../queries/loginQueryAdministrador')

const mostrarLogin=(req,res)=>
{
    res.render("login.ejs")
}

const login= (req, res) => {
    const matricula = req.body.matricula;
    const contrasena = req.body.contrasena;
    const tipo = req.body.tipo;
  
    // Verifica si es un "Administrador"
    loginQueryAdministrador(matricula, contrasena, (error, results) => {
      if (error) {
        console.error('Error en la consulta de Administrador:', error);
        res.status(500).send('Error en la consulta');
        return;
      }
  
      if (results.length > 0) {
        const tipoQuery = results[0].tipo;
          if(tipo==='Personal')
          {
        if (tipoQuery === 'SuperAdmin') 
        {
          res.redirect('/administrador');
        }else{ loginQuery(matricula, contrasena, tipo,(error, result) => {
          if (error) {
            console.error('Error en la consulta:', error);
            res.status(500).send('Error en la consulta');
            return;
          }
  
          if (result.length > 0) {
  
            // Lógica para otros tipos de usuario
            switch (tipo) {
              case 'Alumno':
                res.redirect('/alumno');
                break;
              case 'Profesor':
                res.redirect('/docente');
                break;
              case 'Personal':
                res.redirect('/personal');
                break;
              default:
                res.send('Tipo de usuario no válido');
            }
          } else {
            res.send('Credenciales incorrectas');
          }
        });}
      }
       else {
          // Si no es "SuperAdmin", verifica con loginQuery
          loginQuery(matricula, contrasena, tipo,(error, result) => {
            if (error) {
              console.error('Error en la consulta:', error);
              res.status(500).send('Error en la consulta');
              return;
            }
  
            if (result.length > 0) {
  
              // Lógica para otros tipos de usuario
              switch (tipo) {
                case 'Alumno':
                  res.redirect('/alumno');
                  break;
                case 'Profesor':
                  res.redirect('/docente');
                  break;
                case 'Personal':
                  res.redirect('/personal');
                  break;
                default:
                  res.send('Tipo de usuario no válido');
              }
            } else {
              res.send('Credenciales incorrectas');
            }
          });
        }
      } else {
        console.error('Error en la consulta de Administrador:', error);
        res.status(500).send('Error en la consulta');
      }
    });
  }

module.exports={
    mostrarLogin,
    login
}