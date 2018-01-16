var persistencia=require("./persistencia.js");
var cf=require("./cifrado.js");
var moduloEmail=require("./email.js");
var _ = require("underscore");
var ObjectID=require("mongodb").ObjectID;

function Juego(com){
	this.partidas={};
	this.usuarios={};
	this.persistencia=new persistencia.Persistencia();
	this.com=com;
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
		ju.persistencia.encontrarUsuarioCriterio({email:email},function(usr){
			if(!usr){
				ju.persistencia.insertarUsuario({email:email,pass:passCifrada,key:key,confirmada:false},function(usu){	                
	                moduloEmail.enviarEmail(usu.email,usu.key,"Confirme su correo en este enlace: ");
	                callback({email:'ok'});
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
	this.actualizarUsuario=function(nuevo,callback){
		//this.comprobarCambios(nuevo);
		//var usu=this;
		var oldC=cf.encrypt(nuevo.oldpass);
		var newC=cf.encrypt(nuevo.newpass);
		var pers=this.persistencia;
		this.persistencia.encontrarUsuarioCriterio({email:nuevo.email,pass:oldC},function(usr){
			if(usr){
				usr.pass=newC;
		        pers.modificarColeccionUsuarios(usr,function(nusu){
		               console.log("Usuario modificado");
		               callback(usr);
		        });
		    }
		    else{
		    	callback({email:undefined});	
		    }
		});
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
	this.nuevaPartida=function(id,nombre,num,callback){
		if (this.usuarios[id]!=null){
			if (this.partidas[nombre]==null){
				this.partidas[nombre]=new Partida(nombre,num,this);
			}
			callback(nombre);
			//socket.join(nombre);
		}
	}
	this.unirme=function(nombre,callback){
		callback(nombre);
		//socket.join(nombre);
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
	this.agregarResultado=function(data){
		//buscar el email de data.id
		this.persistencia.insertarResultado(data,function(res){
			console.log("Resultado insertado");
		});
	}
	this.obtenerResultados=function(callback){
		this.persistencia.encontrarTodosResultados(function(res){
			callback(res);
		});
	}
	this.conectar=function(callback){
		this.persistencia.conectar(function(){
			callback("conectado a la base de datos");
		});
	}
	this.cerrar=function(){
		this.persistencia.cerrar();
	}
	// this.conectar(function(mens){
	// 	console.log(mens);
	// });
}

function Partida(nombre,num,juego){
	this.juego=juego;
	this.jugadores={};
	this.nombre=nombre;
	this.estado=new Inicial();
	this.veg;//randomInt(0,35);
	this.numJugadores=num;
	this.ship='ship';
	this.x=200;
	this.numeroFrutas=5;
	this.socket;
	this.callback;
	this.io;
	this.coord=[];
	this.iniciar=function(callback){
		//this.socket=socket;
		//this.io=io;
		//this.socket.emit('coord',this.coord);
		callback('coord',this.coord);
	}
	this.agregarJugador=function(id,callback){
		//this.socket=socket;
		this.callback=callback;
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
		this.callback('faltaUno',null);
	}
	this.enviarAJugar=function(){
		this.callback('aJugar',this.jugadores);
	}
	this.enviarFinal=function(idGanador){
		this.callback('final',idGanador);
	}
	this.movimiento=function(data,callback){
		this.callback=callback;
		this.estado.movimiento(data,this);
	}
	this.puedeMover=function(data){
		if (data.puntos>=this.numeroFrutas){
			this.estado=new Final();
			this.enviarFinal(data.id);
			this.juego.agregarResultado({"usuario":data.id,"nivel":this.numeroFrutas,"tiempo":data.tiempo});
		}
		else{
			this.callback('movimiento',data);
		}
	}
	this.volverAJugar=function(callback){
		this.callback=callback;
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
		this.callback('reset',this.coord);
	}
	this.ini=function(){
		this.veg=randomInt(0,36); //24
		var otra=this.veg+1;
		for(var i=0;i<this.numeroFrutas;i++){
			this.coord.push({'veg':this.veg,'x':randomInt(10,720),'y':randomInt(25,520)});
		}
		for(var i=0;i<this.numeroFrutas;i++){
			this.coord.push({'veg':otra,'x':randomInt(10,720),'y':randomInt(25,520)});
		}
		var alea;
		for(var i=0;i<50;i++){
			do {
				alea=randomInt(0,37);
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
	this.esJugar=function(){
		return true;
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