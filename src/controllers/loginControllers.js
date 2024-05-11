const { default: swal } = require('sweetalert');
const loginQuery = require('../queries/loginQuery');  
const loginQueryAdministrador=require('../queries/loginQueryAdministrador')

const mostrarLogin=(req,res)=>
{
    res.render("login.ejs")
}

const login= (req, res) => {
  const matricula = req.body.matricula
  const contrasena = req.body.contrasena;
  const tipo = req.body.tipo;

  console.log('Datos del cuerpo:', req.body);

    // Verifica si es un "Administrador"
    loginQueryAdministrador(matricula, contrasena, (error, results) => {
      if (error) {
        res.status(500).json({ error: 'Error en el servidor' });
        return;
      }
  
      if (results.length > 0) {
        const tipoQuery = results[0].tipo;
          if(tipo==='Personal')
          {
        if (tipoQuery === 'SuperAdmin') 
        {
          res.status(200).send('/administrador'); // Enviar solo la ruta
          console.log('AQUI ENTRO')
        }
        else
        { 
          loginQuery(matricula, contrasena, tipo,(error, result) => 
          {
          if (error) {
            res.status(500).json({ error: 'Error en el servidor' });
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
                res.status(500).json({ error: 'Error en el servidor' });
              }
          } else {
            res.status(500).json({ error: 'Error en el servidor' });
          }
        });}
      }
       else {
          // Si no es "SuperAdmin", verifica con loginQuery
          loginQuery(matricula, contrasena, tipo,(error, result) => {
            if (error) {
              console.error('Error en la consulta LOGINQUERY 2:', error);
              res.status(500).json({ error: 'Error en el servidor' });
              return;
            }
            if (result.length > 0) {
              // Lógica para otros tipos de usuario
              switch (tipo) {
                case 'Alumno':
                  res.redirect('/alumno');
                  break;
                case 'Profesor':
                  res.status(200).send('/docente'); // Enviar solo la ruta
                  break;
                case 'Personal':
                  res.status(200).send('/personal'); // Enviar solo la ruta
                  break;
                default:
                  res.status(500).json({ error: 'Error en el servidor' });
                }
            } else {
              res.status(500).json({ error: 'Error en el servidor' });
            }
          });
        }
      } else {
        console.error('Error en el servidor:', error);
        res.status(500).json({ error: 'Error en el servidor' });
      }
    })
    }
  

module.exports={
    mostrarLogin,
    login
}



