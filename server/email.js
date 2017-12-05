var sendgrid = require("sendgrid")("tu-usuario","tu-clave");

var url="https://tu-url/";

module.exports.enviarEmail=function(direccion,key,msg){
	var email = new sendgrid.Email();
	email.addTo(direccion);
	email.setFrom('tu-cuenta-de-email');
	email.setSubject('confirmar cuenta');
	email.setHtml('<a href="'+url+'confirmarUsuario/'+direccion+'/'+key+'">'+msg+'</a>');

	sendgrid.send(email);	
}

module.exports.enviarEmailResetPassword=function(direccion,key,msg){
	var email = new sendgrid.Email();
	email.addTo(direccion);
	email.setFrom('tu-cuenta-de-email');
	email.setSubject('Reiniciar clave');
	email.setHtml('<a href="'+url+'cambiarClave/'+direccion+'/'+key+'">'+msg+'</a>');

	sendgrid.send(email);	
}