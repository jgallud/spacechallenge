var game;
var juego;
var finJuego;

// var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'espacio');

// var juego=new Juego();
// var finJuego=new FinJuego();

// game.state.add('Game',juego);
// game.state.add("FinJuego",finJuego);
//game.state.start('Game');

var cliente;//=new Cliente();

function borrar(){
	$("#cnt1").remove();
	$("#cnt2").remove();
	$("#cab").remove();
	$('#sel1').remove();
	$('#formSel').remove();
	$('#lbl').remove();
	$('#cab').remove();
  	$('#par').remove();
	$('#nombre').remove();
	$('#nombreBtn').remove(); 
}

function listaPartidas(lista){
	var cadena;

	cadena="<form class='form-inline'><select class='form-control' id='sel1'>"

	for(var i=0;i<lista.length;i++){
		cadena=cadena+"<option>"+lista[i]+"</option>"
	}
	cadena=cadena+"</select> ";
	cadena=cadena+"<button type='button' class='btn btn-primary' id='unirmeBtn'>Unirme a partida</button></form>";
	//cadena=cadena+"</form>";
	$('#partida').append(cadena);
	$('#unirmeBtn').on('click',function(){
	  var nombre=$('#sel1').val();
	  if (nombre!=""){
		  borrar();
		  //cliente=new Cliente(nombre,-1);	  
		  //cliente.room=nombre;
		  cliente.ini(nombre,-1);
		  cliente.unirmeAPartida();
		  //enviarUnirmeAPartida(nombre);
		  mostrarCanvas();
	}
	});
}

function nombrePartida(){
	limpiar();
	var cadena="<h1>SpaceChallenge</h1>"
	cadena=cadena+"<img src='cliente/recursos/logo.png' class='img-circle' alt='logo'>";
	$('#cabecera').append(cadena);

	var cadena="<form class='form-inline'><div class='form-group'><label id='lbl'>Partida:</label> "
	cadena=cadena+'<input id="nombre" class="form-control" type="text" placeholder="un nombre cualquiera"></div> ';
	cadena=cadena+'<label>Jugadores:</label> <select class="form-control" id="sel2"> <option>1</option><option>2</option></select> ';
	cadena=cadena+'<button type="button" class="btn btn-primary" id="nombreBtn">Nueva partida</button></form>';

	$('#partida').append(cadena);
	$('#nombreBtn').on('click',function(){
	  var nombre=$('#nombre').val();
	  var num=$('#sel2').val();
	  if (nombre!=""){
		  borrar();   
		  //cliente=new Cliente(nombre,num);
		  //cliente.room=nombre;
		  //cliente.num=num;
		  cliente.ini(nombre,num)
		  //cliente.room=nombre;
		  //cliente.lanzarSocketSrv();	  
		  mostrarCanvas();
	}
	});
}

function mostrarCanvas(){
	game = new Phaser.Game(800, 600, Phaser.CANVAS, 'espacio');

	juego=new Juego();
	finJuego=new FinJuego();

	game.state.add('Game',juego);
	game.state.add("FinJuego",finJuego);
}

function mostrarIniciarPartida(usr){
	cliente=new Cliente(usr._id,usr.email);
    nombrePartida();
    obtenerPartidas();
}

function obtenerPartidas(){
  $.getJSON("/obtenerPartidas",function(data){    
        //console.log(data);       
        listaPartidas(data);
  });
}


