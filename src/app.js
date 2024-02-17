const express = require('express');
const path=require('path');
const morgan= require('morgan');

const app=express();

const db = require('./db');
const auth = require('./auth');
//importing routes
const customerRoutes=require('./routes/customer');
const loginController=require('../src/controllers/loginController')
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


//Static files
app.use(express.static(path.join(__dirname,'public')));


app.listen(app.get('port'), () => {
console.log('server on port 3000');
});

// Ruta para manejar la solicitud POST de autenticación
app.post('/login', async (req, res) => {
  try {
    const { usuario, contrasena, tipoUsuario } = req.body;
    console.log('Datos recibidos en el servidor:', { usuario, contrasena, tipoUsuario });

    // Llama a la función de autenticación del módulo 'auth'
    const autenticado = await auth.autenticarUsuario(usuario, contrasena, tipoUsuario);
    if (autenticado) {
      console.log('Autenticación exitosa para', tipoUsuario);
      // Si la autenticación es exitosa, redirige a la pantalla correspondiente
      switch (tipoUsuario) {
        case 'Alumno':
          res.json({ autenticado: true, urlRedireccion: '/pantalla_estudiante' });
          break;
        case 'Profesor':
          res.json({ autenticado: true, urlRedireccion: '/pantalla_docente' });
          break;
        case 'Personal':
          res.json({ autenticado: true, urlRedireccion: 'views/personal/inicioPersonal.ejs' });
          break;
        default:
          console.error('Tipo de usuario no reconocido:', tipoUsuario);
          res.json({ autenticado: false });
      }
    } else {
      console.log('Autenticación fallida para', tipoUsuario);
      res.json({ autenticado: false });
    }
  } catch (error) {
    console.error('Error en la autenticación:', error);
    res.json({ autenticado: false });
  }
});
