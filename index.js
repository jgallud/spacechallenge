var fs=require("fs");
var bodyParser=require("body-parser");
var express = require('express');
var app = express();

var server = require('http').Server(app);
var io = require('socket.io').listen(server);

var modelo=require('./server/modelo.js');
var juego=new modelo.Juego();

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

server.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

io.on('connection',function(socket){
    socket.on('room', function(id,room,num) {
        console.log('nuevo cliente: ',id,room,num);
        juego.nuevaPartida(id,room,num,socket);
    });
    socket.on('unirme',function(room){
        //console.log(juego.partidas);
        juego.unirme(room,socket);
    })
    socket.on('configuracion',function(room){
        //console.log(juego.partidas);
        if (juego.partidas[room]){
            juego.partidas[room].iniciar(socket,io);
        }
    })
    socket.on('nuevoJugador',function(data){        
        juego.partidas[data.room].agregarJugador(data.id,socket);
    });
    socket.on('posicion',function(room,data){
       juego.partidas[room].movimiento(data,socket);
    });
    socket.on('volverAJugar',function(room){
        //juego=new modelo.Juego();
        juego.partidas[room].volverAJugar(socket);
    });

});
