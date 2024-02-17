const controller={};


const auth = require('../auth');

controller.login= (req, res) => {
  const { usuario, contrasena, tipoUsuario } = req.body;

  auth.autenticarUsuario(usuario, contrasena, tipoUsuario, (err, results) => {
    if (err) {
      console.error('Error en la consulta:', err);
      res.json({ autenticado: false });
    } else {
      if (results.length > 0) {
        console.log('Autenticación exitosa para', tipoUsuario);
        res.json({ autenticado: true, urlRedireccion: `/dashboard/${tipoUsuario}` });
      } else {
        console.log('Autenticación fallida para', tipoUsuario);
        res.json({ autenticado: false });
      }
    }
  });
};


module.exports=controller;
