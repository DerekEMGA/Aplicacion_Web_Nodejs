const express = require('express');
const path=require('path');
const morgan= require('morgan');
const app=express();
const db = require('./db');
const bodyParser = require('body-parser');  
const loginQuery = require('./queries/loginQuery');  // Asegúrate de que la ruta sea correcta
const loginQueryAdministrador=require('./queries/loginQueryAdministrador')

//importing routes
//const customerRoutes=require('./routes/customer');
//const loginController=require('../src/controllers/loginController')

app.use(express.json());

//settings
app.set('port',process.env.PORT || 3000);
app.set('view engine','ejs');
app.set('views', path.join(__dirname,'views'));

//middlewares
app.use(morgan('dev'));

//conexion sql 
app.use(morgan('dev'));

//routes
app.get('/', (req, res) => {
  res.render(path.join(__dirname, 'views/login.ejs'));
});



//Static files
app.use(express.static(path.join(__dirname,'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.listen(app.get('port'), () => {
console.log('server on port 3000');
});


//POST DE /, PARA LOGIN PARA LA COMPROBACION DE CREDENCIALES
app.post('/login', (req, res) => {
  const matricula = req.body.matricula;
  const contrasena = req.body.contrasena;
  const tipo = req.body.tipo;

  console.log('Matricula:', matricula);
  console.log('Contraseña:', contrasena);
  console.log('Tipo:', tipo);

  // Verifica si es un "Administrador"
  loginQueryAdministrador(matricula, contrasena, (error, results) => {
    if (error) {
      console.error('Error en la consulta de Administrador:', error);
      res.status(500).send('Error en la consulta');
      return;
    }

    if (results.length > 0) {
      const tipoQuery = results[0].tipo;

      console.log('Tipo:', tipo);
      console.log('Tipo Query:', tipoQuery);
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
});


app.get('/administrador', (req, res) => {
  res.render(path.join(__dirname, 'views/superAdministrador/inicioSuperAdministrador.ejs'));
});

app.get('/personal', (req, res) => {
  res.render(path.join(__dirname, 'views/personal/inicioPersonal.ejs'));
});

app.get('/docente', (req, res) => {
  res.render(path.join(__dirname, 'views/docente/inicioDocente.ejs'));
});

app.get('/alumno', (req, res) => {
  res.render(path.join(__dirname, 'views/alumno/inicioAlumno.ejs'));
});

app.get('/alumno/boleta', (req, res) => {
  res.render(path.join(__dirname, 'views/alumno/boletas.ejs'));
});

app.get('/docente/boleta', (req, res) => {
  res.render(path.join(__dirname, 'views/docente/boletas.ejs'));
});
