var sendgrid = require("sendgrid")("usr","key");

var url="https://spacechallenge.herokuapp.com/";
//var url="http://localhost:5000/";

module.exports.enviarEmail=function(direccion,key,msg){
	var email = new sendgrid.Email();
	email.addTo(direccion);
	email.setFrom('tu-email');
	email.setSubject('confirmar cuenta');
	email.setHtml('<a href="'+url+'confirmarUsuario/'+direccion+'/'+key+'">'+msg+'</a>');

	sendgrid.send(email);	
}

module.exports.enviarEmailResetPassword=function(direccion,key,msg){
	var email = new sendgrid.Email();
	email.addTo(direccion);
	email.setFrom('tu-email');
	email.setSubject('Reiniciar clave');
	email.setHtml('<a href="'+url+'cambiarClave/'+direccion+'/'+key+'">'+msg+'</a>');

	sendgrid.send(email);	
}