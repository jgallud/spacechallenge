var fs=require("fs");
var bodyParser=require("body-parser");
var express = require('express');
var app = express();

var server = require('http').Server(app);
var io = require('socket.io').listen(server);

var modelo=require('./server/modelo.js');
var comSrv=require('./server/comSrv.js');
var com=new comSrv.ComSrv();
var juego=new modelo.Juego(com);
juego.conectar(function(mens){
    console.log(mens);
});

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.get('/', function(request, response) {
 	var contenido=fs.readFileSync("./cliente/views/index.html");    
	response.setHeader("Content-type","text/html");
	response.send(contenido);  
});

app.get('/obtenerPartidas', function(request, response) {
    juego.obtenerPartidas(function(lista){
        response.send(lista);        
    });
});

app.post("/login",function(request,response){
    var email=request.body.email;
    var pass=request.body.password;    
    if (!pass){
        pass="";
    }
    juego.iniciarSesion(email,pass,function(usr){
        response.send(usr);
    });        
});

app.post("/registro",function(request,response){
    var email=request.body.email;
    var pass=request.body.password; 
    console.log("registro: "+email+" "+pass);   
    if (!pass){
        pass="";
    }
    juego.registrarUsuario(email,pass,function(usr){
        response.send(usr);
    });
});

app.get("/confirmarUsuario/:email/:key",function(request,response){
    var key=request.params.key;
    var email=request.params.email;
    var usuario;

    juego.confirmarUsuario(email,key,function(usr){
        if (!usr){
            console.log("El usuario no existe o la cuenta ya está activada");
            response.send("<h1>La cuenta ya esta activada</h1>");
        }
        else{
            response.redirect("/");
        }
    });
});

app.get("/comprobarUsuario/:id",function(request,response){
    var id=request.params.id;
    var json={'email':''};
    var usr=juego.obtenerUsuario(id);
    if (usr){
        response.send(usr);
    }
    else{
        response.send(json);
    }
});

app.get("/obtenerKeyUsuario/:email/:adminKey",function(request,response){
    var adminKey=request.params.adminKey;
    var email=request.params.email;

    juego.obtenerKeyUsuario(email,adminKey,function(result){
        response.send(result)
    });
});

app.delete("/eliminarUsuario/:uid",function(request,response){
    var uid=request.params.uid;
    juego.eliminarUsuario(uid,function(result){
        response.send(result);
    });
});

app.put("/actualizarUsuario",function(request,response){
    juego.actualizarUsuario(request.body,function(result){
            response.send(result);
        });
});

app.get('/obtenerResultados', function(request, response) {
    juego.obtenerResultados(function(lista){
        response.send(lista);        
    });
});

server.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

com.lanzarSocketSrv(io,juego);