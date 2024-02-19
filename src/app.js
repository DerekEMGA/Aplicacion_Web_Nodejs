const express = require('express');
const path=require('path');
const morgan= require('morgan');
const app=express();
const db = require('./db');
const bodyParser = require('body-parser');  
const loginQuery = require('./queries/loginQuery');  // Asegúrate de que la ruta sea correcta

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


//POST DE /, PARA LOGIN
app.post('/login', (req, res) => {
  const matricula = req.body.matricula; // Esto depende de cómo se llame el campo en tu formulario HTML
  const contrasena = req.body.contrasena;
  const tipo = req.body.tipo;

  console.log('Matricula:', matricula);
  console.log('Contraseña:', contrasena);
  console.log('Tipo:', tipo);
  
  loginQuery(matricula, contrasena,tipo, (error, result) => {
    if (error) {
      console.error('Error en la consulta:', error);
      res.status(500).send('Error en la consulta');
    } else {
      if (result.length > 0) {
        const tipo = result[0].tipo;
        const baseUrl = req.protocol + ':/' + req.get('host'); // Obtener la URL base
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
          case 'SuperAdmin':
            res.redirect('/administrador');
            break;
          default:
            res.send('Tipo de usuario no válido');
        }
      } else {
        res.send('Credenciales incorrectas');
      }
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
