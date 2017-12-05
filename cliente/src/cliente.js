function Cliente(id,email){
	this.socket;
	this.id=id;
	this.veg;
	this.num;
	this.email=email;
	//this.coord;
	this.nombre;
	this.cargarConfiguracion=function(){
		this.socket.emit('configuracion',this.nombre);
	}
	this.unirmeAPartida = function(){		
    	this.socket.emit('unirme',this.nombre);
	};
	this.askNewPlayer = function(){		
    	this.socket.emit('nuevoJugador',{room:this.nombre,id:this.id});
	};
	this.ini=function(nombre,num){
		this.socket=io.connect();
		this.nombre=nombre;
		this.num=num;
		//this.id=randomInt(1,10000);		
		this.lanzarSocketSrv();
	}
	this.reset=function(){
		this.id=randomInt(1,10000);
	};
	this.enviarPosicion=function(x,y,ang,puntos){
		this.socket.emit('posicion',this.nombre,{"id":this.id,"x":x,"y":y,"ang":ang,"puntos":puntos})
	}
	this.sendClick = function(x,y){
  		this.socket.emit('click',{x:x,y:y});
	};
	this.volverAJugar=function(){
		this.socket.emit('volverAJugar',this.nombre);	
	}
	this.lanzarSocketSrv=function(){
		var cli=this;
		this.socket.on('connect', function() {   			
   			cli.socket.emit('room', cli.id,cli.nombre,cli.num);
   			console.log("envio room");
   			cli.cargarConfiguracion();
		});
		this.socket.on('coord',function(data){
			//this.coord=data;			
			game.state.start('Game',true,false,data);
		});
		this.socket.on('faltaUno',function(data){
			console.log('falta uno');
			juego.faltaUno();
		})
		this.socket.on('aJugar',function(data){		    
		    //for(var i = 0; i < Object.keys(data).length; i++){
		    	//client.id=data[i].id;
		    for(var jug in data){
		    	console.log('aJugar: ',data[jug]);
		        juego.agregarJugador(data[jug]);
		    };
		});
		this.socket.on('final',function(data){		    
			juego.finJuego(data);
		});
		this.socket.on('reset',function(data){		    
			juego.volverAJugar(data);
		});
		this.socket.on('todos',function(data){
		    console.log('todos: ',data);
		    for(var i = 0; i < data.length; i++){
		    	//client.id=data[i].id;
		        juego.agregarJugador(data[i].id,data[i].x,data[i].y,data[i].veg);
		    }
		});
		this.socket.on('movimiento',function(data){	
		    juego.moverNave(data);        
		});
		this.socket.on('ganador',function(data){	
			juego.finJuego(data.id);
		    //juego.moverNave(data.id,data.x,data.y,data.ang);        
		});
	}
	//this.ini();
}




function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
