var modelo=require("../server/modelo.js");

xdescribe("El juego SpaceChallenge...",function(){	
	var juego=new modelo.Juego();	
	

	it("tiene una coleccion de partidas y de usuarios (vacía)",function(){	
		expect(juego.partidas).toEqual({});
		expect(juego.usuarios).toEqual({});
		expect(juego.persistencia).not.toBeNull();		
	});

	it("Registrar al usuario pepe@pepe.es con clave pepe",function(done){		
		var key;
		var email='pepe@pepe.es';
		var pass='pepe';
		juego.conectar(function(mens){
			juego.registrarUsuario(email,pass,function(usr){	        									
				done();
		   	});
		});
	});

	it("Confirmar cuenta",function(done){
        juego.obtenerKeyUsuario('pepe@pepe.es',"tu-clave-admin",function(data){	        		
        	juego.confirmarUsuario('pepe@pepe.es',data.key,function(usr){			        	
        		expect(usr.confirmada).toBe(true);
        		juego.cerrar();
        		done();
        	});
	    });
	});		
});

describe("El juego SpaceChallenge...",function(){	
	var juego=new modelo.Juego();	
	//juego.conectar(function(mens){
	//});	
	var id;
	var room;
	var coord;
	var obj;

	beforeEach(function(){					
	});

	it("No puede registrar un usuario pepe@pepe.es ya registrado",function(done){		
		var key;
		var email='pepe@pepe.es';
		var pass='pepe';		
		juego.conectar(function(mens){
			juego.registrarUsuario(email,pass,function(usr){	        					
	    		expect(usr.email).toBe(undefined);
	    		done();
		    });
		});
	});

	it("tiene una coleccion de partidas y de usuarios (vacía)",function(){	
		expect(juego.partidas).toEqual({});
		expect(juego.usuarios).toEqual({});
		expect(juego.persistencia).not.toBeNull();		
	});

	it("El usuario pepe@pepe.es inicia sesión",function(done){
		//juego.conectar(function(mens){
			juego.iniciarSesion('pepe@pepe.es','pepe',function(usr){
				expect(usr.email).toEqual('pepe@pepe.es');
				id=usr._id;
				done();
			});			
		//});
	});

	it("El usuario crea una partida llamda test",function(done){		
		juego.nuevaPartida(id,'test',1,function(nombre){
                room=nombre;
                expect(room).toEqual('test');
                expect(juego.partidas[room]).toBeDefined();
                done();
            });
	});

	it("El estado de la partida es Inicial",function(){
		expect(juego.partidas[room].estado.esInicial()).toEqual(true);
	});

	it("El usuario crea una partida",function(done){
 		juego.partidas[room].iniciar(function(mens,datos){
        	expect(mens).toEqual('coord');
        	expect(datos).toBeDefined();
        	coord=datos;
        	done();            
        });
 	});

 	it("El usuario pepe@pepe.es se apunta a la partida test",function(done){
	 	juego.partidas[room].agregarJugador(id,function(mens,datos){
                expect(mens).toEqual('aJugar');
                expect(datos[id].id).toEqual(id);
                obj=datos[id].veg;
                done();            
        });
 	});

 	it("El estado de la partida ya no es Inicial",function(){
		expect(juego.partidas[room].estado.esInicial()).toEqual(false);
		expect(juego.partidas[room].estado.esJugar()).toEqual(true);
	});

 	for(var i=0;i<10;i++){
	 	it("El usuario pepe@pepe.es comienza ajugar",function(done){
	 		var data;
			var puntos=0;
			//el objetivo ocupa las n primeras posiciones		
			x=coord[i].x;
			y=coord[i].y;
			data={"id":id,"x":x,"y":y,"ang":0,"puntos":puntos,"tiempo":0};
			juego.partidas[room].movimiento(data,function(mens,datos){
	            if (mens!='final'){
	                //mover
	                expect(mens).toEqual('movimiento');
	            }
	            else{
	                expect(mens).toEqual('final');
	            }
	            puntos++;
	            done();
	        });   		
		});
	 }

	xit("Eliminar usuario pepe@pepe.es",function(done){
		juego.eliminarUsuario(id,function(resultado){
			expect(resultado.resultados).toEqual(1);
			done();
		});
	});

	it("Eliminar juego",function(done){
		juego.cerrar();
		done();
	});
	
})