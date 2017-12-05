var persistencia=require("./persistencia.js");
var cf=require("./cifrado.js");
var moduloEmail=require("./email.js");
var _ = require("underscore");
var ObjectID=require("mongodb").ObjectID;

function Juego(){
	this.partidas={};
	this.usuarios={};
	this.persistencia=new persistencia.Persistencia();
	this.obtenerUsuario=function(id){
		return _.find(this.usuarios,function(usu){
			return usu._id==id
		});
	}
	this.iniciarSesion=function(email,pass,callback){
		var ju=this;
		var passCifrada=cf.encrypt(pass);
	    this.persistencia.encontrarUsuarioCriterio({email:email,pass:passCifrada,confirmada:true},function(usr){
		    if (!usr){
	            callback({'email':''});
	        }
	        else{
	        	ju.usuarios[usr._id]=usr;	        	
	            callback(usr);
	        }
	    });
	}
	this.registrarUsuario=function(email,pass,callback){
		var ju=this;
		var passCifrada=cf.encrypt(pass);
		var key=(new Date().valueOf()).toString();
		this.persistencia.encontrarUsuarioCriterio({email:email},function(usr){
			if(!usr){
				ju.persistencia.insertarUsuario({email:email,pass:passCifrada,key:key,confirmada:false},function(usu){
	                callback({email:'ok'});
	                moduloEmail.enviarEmail(usu.email,usu.key,"Confirme su correo en este enlace: ");
	            });
	        }
	        else{
	        	callback({email:undefined});
	        }
    	});
	}
	this.confirmarUsuario=function(email,key,callback){
		var pers=this.persistencia;
		this.persistencia.confirmarCuenta(email,key,function(usr){
        if (!usr){
            //console.log("El usuario no existe");
            //response.send("<h1>La cuenta ya esta activada</h1>");
            callback(undefined);
        }
        else{
        	usr.confirmada=true;
        	pers.modificarColeccionUsuarios(usr,function(result){
        		callback(usr);
        	});
        }
    	});
	}
	this.obtenerKeyUsuario=function(email,adminKey,callback){
		if (adminKey=="tu-clave-admin")
	    {
	        this.persistencia.encontrarUsuarioCriterio({email:email},function(usr){
	            if (!usr){
	                callback({key:""});
	            }
	            else{
	                callback({key:usr.key});
	            }
	        });
	    }
	    else
	    {
	        callback({key:""});
	    }
	}
	this.eliminarUsuario=function(uid,callback){
		var json={'resultados':-1};
		if (ObjectID.isValid(uid)){
			this.persistencia.eliminarUsuario(uid,function(result){
	            if (result.result.n==0){
	                console.log("No se pudo eliminar de usuarios");
	            }
	            else{
	                json={"resultados":1};
	                console.log("Usuario eliminado de usuarios");
	                callback(json);
	            }
	        }); 
		}
	    else{
	    	callback(json);
	    }
	}
	this.nuevaPartida=function(id,nombre,num,socket){
		if (this.usuarios[id]!=null){
			if (this.partidas[nombre]==null){
				this.partidas[nombre]=new Partida(nombre,num);
			}
			socket.join(nombre);
		}
	}
	this.unirme=function(nombre,socket){
		socket.join(nombre);
	}
	this.obtenerPartidas=function(callback){
		var lista=[];
		for (var key in this.partidas) {
		    if (this.partidas[key].estado.esInicial()){
		    	lista.push(key);
		    }
		}
		callback(lista);
	}
	this.persistencia.conectar(function(db){
		console.log("conectado a la base de datos");
	});
}

function Partida(nombre,num){
	this.jugadores={};
	this.nombre=nombre;
	this.estado=new Inicial();
	this.veg;//randomInt(0,35);
	this.numJugadores=num;
	this.ship='ship';
	this.x=200;
	this.socket;
	this.io;
	this.coord=[];
	this.iniciar=function(socket,io){
		this.socket=socket;
		this.io=io;
		this.socket.emit('coord',this.coord);
	}
	this.agregarJugador=function(id,socket){
		this.socket=socket;
		this.estado.agregarJugador(id,this);
	}
	this.puedeAgregarJugador=function(id){		
		var y=20;
		if (this.jugadores[id]==null){
			this.jugadores[id]=new Jugador(id,this.x,y,this.veg,this.ship);
			this.veg++;
			this.ship='ship2';
			this.x=600;
		}
		console.log(this.jugadores);
		if (Object.keys(this.jugadores).length>=this.numJugadores){
			this.estado=new Jugar();
			this.enviarAJugar();
		}
		else
			this.enviarFaltaUno();
	}
	this.enviarFaltaUno=function(){
		//this.socket.emit('faltaUno');
		this.io.sockets.in(this.nombre).emit('faltaUno');
	}
	this.enviarAJugar=function(){
		//this.socket.broadcast.emit('aJugar',this.jugadores);
		//this.socket.emit('aJugar',this.jugadores);
		this.io.sockets.in(this.nombre).emit('aJugar',this.jugadores);
		//this.socket.broadcast.to(this.nombre).emit('aJugar',this.jugadores)
	}
	this.enviarFinal=function(idGanador){
		//this.socket.broadcast.emit('final',idGanador);
		//this.socket.emit('final',idGanador);
		this.io.sockets.in(this.nombre).emit('final',idGanador);
		this.socket.broadcast.to(this.nombre).emit('final',idGanador)	
	}
	this.movimiento=function(data,socket){
		this.socket=socket;
		this.estado.movimiento(data,this);
	}
	this.puedeMover=function(data){
		if (data.puntos>=10){
			this.estado=new Final();
			this.enviarFinal(data.id);
		}
		else{
			//this.socket.broadcast.emit('movimiento',data);
			this.socket.broadcast.to(this.nombre).emit('movimiento',data)
		}
	}
	this.volverAJugar=function(socket){
		this.socket=socket;
		this.estado.volverAJugar(this);
	}
	this.reset=function(){
		this.estado.reset(this);
	}
	this.reiniciar=function(){
		this.jugadores={};
		this.coord=[];
		this.x=200;
		this.ship="ship";
		this.ini();
		this.estado=new Inicial();
		this.io.sockets.in(this.nombre).emit('reset',this.coord);
		this.socket.broadcast.to(this.nombre).emit('reset',this.coord)
		//this.socket.broadcast.emit('reset',this.coord);
        //this.socket.emit('reset',this.coord);
	
	}
	this.ini=function(){
		this.veg=randomInt(0,24);
		var otra=this.veg+1;

		//console.log(this.veg,"--",otra);
		for(var i=0;i<10;i++){
			this.coord.push({'veg':this.veg,'x':randomInt(10,720),'y':randomInt(25,520)});
		}
		for(var i=0;i<10;i++){
			this.coord.push({'veg':otra,'x':randomInt(10,720),'y':randomInt(25,520)});
		}
		var alea;
		for(var i=0;i<30;i++){
			do {
				alea=randomInt(0,25);
			}while(alea==this.veg || alea==otra)
			this.coord.push({'veg':alea,'x':randomInt(10,720),'y':randomInt(25,520)});
		}
	}
	this.ini();
}

function Inicial(){
	this.esInicial=function(){
		return true;
	}
	this.agregarJugador=function(id,juego){
		juego.puedeAgregarJugador(id);
	}
	this.movimiento=function(data,juego){
		console.log('No se admiten movimientos')
	}
	this.reset=function(){
		console.log('Reset en estaod Inicial');
	}
	this.volverAJugar=function(juego){
		juego.reiniciar();
	}
}

function Jugar(){
	this.esInicial=function(){
		return false;
	}
	this.agregarJugador=function(id,juego){
		console.log('No se puede agregar nuevo jugador');
	}
	this.movimiento=function(data,juego){
		juego.puedeMover(data);
	}
	this.reset=function(juego){
		juego.reiniciar();
	}
	this.volverAJugar=function(juego){
		juego.reiniciar();
	}
}

function Final(){
	this.esInicial=function(){
		return false;
	}
	this.agregarJugador=function(juego){
		console.log('No se puede agregar nuevo jugador');
	}	
	this.movimiento=function(data,juego){
		console.log('No se admiten movimientos')
	}
	this.volverAJugar=function(juego){
		juego.reiniciar();
	}
}

function Jugador(id,x,y,veg,ship){
	this.id=id;
    this.x=x;//randomInt(100,400),
	this.y=y;//randomInt(100,400),
    this.veg=veg;
    this.ship=ship;
    this.email;
}


function randomInt(low, high){
   	return Math.floor(Math.random() * (high - low) + low);
}

module.exports.Juego=Juego;
module.exports.Partida=Partida;