
function ComSrv(){    
    this.enviarRemitente=function(socket,mens,datos){
        socket.emit(mens,datos);
    }
    this.enviarATodos=function(io,nombre,mens,datos){
        io.sockets.in(nombre).emit(mens,datos);
    }
    this.enviarATodosMenosRemitente=function(socket,nombre,mens,data){
        socket.broadcast.to(nombre).emit(mens,data)
    };
    this.lanzarSocketSrv=function(io,juego){
        var com=this;
        io.on('connection',function(socket){
        socket.on('room', function(id,room,num) {
            console.log('nuevo cliente: ',id,room,num);
            juego.nuevaPartida(id,room,num,function(nombre){
                socket.join(nombre);
            });
        });
        socket.on('unirme',function(room){
            juego.unirme(room,function(nombre){
                socket.join(nombre);
            });
        })
        socket.on('configuracion',function(room){
            if (juego.partidas[room]){
                juego.partidas[room].iniciar(function(mens,datos){
                    com.enviarRemitente(socket,mens,datos);
                });
            }
        })
        socket.on('nuevoJugador',function(data){        
            if (juego.partidas[data.room]){
                juego.partidas[data.room].agregarJugador(data.id,function(mens,datos){
                    com.enviarATodos(io,data.room,mens,datos);
                });
            }
        });
        socket.on('posicion',function(room,data){
            if (juego.partidas[room]){
                juego.partidas[room].movimiento(data,function(mens,data){
                    if (mens!='final'){
                        com.enviarATodosMenosRemitente(socket,room,mens,data);
                    }
                    else{
                        com.enviarATodos(io,room,mens,data);
                    }
                });                    
            }
        });
        socket.on('volverAJugar',function(room){
            if (juego.partidas[room]){
                juego.partidas[room].volverAJugar(function(mens,data){
                    com.enviarATodos(io,room,mens,data);
                });
            }
        });
    });
    }
}

module.exports.ComSrv=ComSrv;