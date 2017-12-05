function Com(){
	this.obtenerPartidas=function(){
	  $.getJSON("/obtenerPartidas",function(data){          
	        listaPartidas(data);
	  });
	}
	this.loginUsuario=function(email,clave){
	  $.ajax({
	    type:'POST',
	    url:'/login/',
	    data:JSON.stringify({email:email,password:clave}),
	    success:function(data){
	      if (data.email==""){
	        //mostrarRegistro();
	        mostrarLogin();
	        mostrarAviso("Usuario o clave incorrectos");
	      }
	      else{
	        console.log('el usuario ha iniciado la sesión');
	        mostrarIniciarPartida(data);
	        $.cookie("usr",JSON.stringify(data));
	       }
	      },
	    contentType:'application/json',
	    dataType:'json'
	  });
	}
	this.registroUsuario=function(nombre,clave){
	  $.ajax({
	    type:'POST',
	    url:'/registro/',
	    data:JSON.stringify({email:nombre,password:clave}),
	    success:function(data){
	      if (data.email==undefined){
	        mostrarRegistro();
	        mostrarAviso("Dirección de email inventada o el usuario ya existe");
	        //mostrarSolicitarReenvioMail();
	      }
	      else{        
	         //mostrarLogin();
	         mostrarAviso("Te hemos enviado un email para confirmar tu cuenta");
	      }
	      },
	    contentType:'application/json',
	    dataType:'json'
	  });
	}

	this.comprobarUsuario=function(){
	  if ($.cookie("usr")!=undefined){
	    var usr=JSON.parse($.cookie("usr"));
	    var id=usr._id;
	    $.getJSON("/comprobarUsuario/"+id,function(usr){ 
	      if (usr.email==''){
	        mostrarLogin();
	        borrarCookie();
	      }
	      else{
	        mostrarIniciarPartida(usr);
	      }
	    });
	  }
	  else{
	    mostrarLogin();
	  }
	}
}