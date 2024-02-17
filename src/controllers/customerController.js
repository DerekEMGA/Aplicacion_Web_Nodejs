const controller={};

controller.list=(req,res)=>{
req.getConnection((err,conn)=>{
    conn.query('SELECT * FROM personaladministrativo',(err,personaladministrativo)=>{
        if(err){
            res.json(err);
        }
        console.log(personaladministrativo);
      //  res.render('personaladministrativoLogin',{
        //    data:personaladministrativo
        //});
        res.json({
            text:"hola mundo"
        })

    })
})
};
controller.prueba=(req,res)=>{
   // console.log(req.body)
   const {nombre,posicion}=req.body
    
}



module.exports=controller;
