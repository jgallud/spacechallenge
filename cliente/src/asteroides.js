
function Juego(){
    this.naves={};
    this.cursors;
    this.veggies;
    this.naveLocal;
    this.fin=false;
    this.marcador;
    this.rival;
    this.text;
    this.coord;
    this.contadorTxt;
    this.contador=0;
    this.preload=function() {
       game.load.image('space', 'cliente/recursos/deep-space.jpg');
       game.load.image('bullet', 'cliente/recursos/bullets.png');
       game.load.image('ship', 'cliente/recursos/ship.png');
       game.load.image('ship2', 'cliente/recursos/ship2.png');
       game.load.spritesheet('veggies', 'cliente/recursos/fruitnveg32wh37.png', 32, 32);
       //game.load.spritesheet('veggies', 'cliente/recursos/pokemon.png', 96, 96);
       game.load.bitmapFont('carrier_command', 'cliente/recursos/carrier_command.png', 'cliente/recursos/carrier_command.xml');
       game.load.image("play","cliente/recursos/reset.png");
    }
    this.init=function(data){
        game.stage.disableVisibilityChange = true;
        this.coord=data;
    }

    this.create=function() {

        //  This will run in Canvas mode, so let's gain a little speed and display
        game.renderer.clearBeforeRender = false;
        game.renderer.roundPixels = true;

        //  We need arcade physics
        game.physics.startSystem(Phaser.Physics.ARCADE);

        
        game.add.tileSprite(0, 0, game.width, game.height, 'space');
        
        this.marcador = game.add.text(25, 25, "Partida: "+cliente.nombre, {
                font: "20px Arial",
                fill: "#FDFEFE",
                align: "left"
            });
        //this.marcador.anchor.setTo(0.5, 0.5);      

        this.text = game.add.text(game.world.centerX, 300, "SpaceChallenge", {
                font: "90px Arial Black",
                fill: "#FDFEFE",
                align: "center"
            });
        
        this.text.anchor.x = 0.5;
        this.text.anchor.y = 0.5;  

        game.input.onDown.addOnce(this.eliminarText, this);    

        this.contadorTxt = game.add.text(game.width-70, 30, 'Tiempo: 0', { font: "20px Arial", fill: "#ffffff", align: "right" });
        this.contadorTxt.anchor.setTo(0.5, 0.5);    
                

        this.veggies = game.add.physicsGroup();        

        for(var i=0;i<this.coord.length;i++){
            var c = this.veggies.create(this.coord[i].x, this.coord[i].y, 'veggies', this.coord[i].veg);
        }

        //  Game input
        this.cursors = game.input.keyboard.createCursorKeys();
        game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);
        //game.input.addPointer();
        game.world.bringToTop(this.text);
        cliente.askNewPlayer();
    }
    this.mostrarObjetivo=function(veg){
        var objetivo=this.veggies.create(19,40,'veggies',veg);
    }
    this.actualizarContador=function(){
        this.contador++;

        this.contadorTxt.setText('Tiempo: ' + this.contador);
    }
    this.eliminarText=function(){
        this.text.destroy();
    }
    this.actualizarMarcador=function(){
        //this.marcador.setText("Partida: "+cliente.room+" | Yo:" +this.naveLocal.puntos + "- Rival:"+this.rival.puntos);
        var cadena="";
        //var ju=this;
        for(var jug in this.naves){
                cadena=cadena+this.naves[jug].email+": "+this.naves[jug].puntos+" ";
            };
        this.marcador.setText(cadena);
        game.world.bringToTop(this.marcador);
    }
    this.collisionHandler=function(bullet, veg) {
        //bullet.kill();
        if (veg.frame==this.naves[cliente.id].veg){
                console.log("colision");
                veg.kill();
                this.naves[cliente.id].puntos++;                
                //return true;
        }        
        this.actualizarMarcador();
    }
   this.rivalHandler=function(bullet, veg) {      
        if (veg.frame==this.rival.veg){
            console.log("colision rival");
            veg.kill(); 
        }  
        //this.actualizarMarcador();
    }
    this.processHandler=function(player, veg) {        
        return true;
    }
    this.finJuego=function(id){
        this.fin=true;
        console.log(id);
        game.state.start("FinJuego",true,false,id,cliente.id);
    }

    this.faltaUno=function(){
        this.marcador.setText("Esperando rival...");
        //this.marcador.anchor.setTo(0.5, 0);
        game.world.bringToTop(this.marcador);
    }
    this.update=function() {

        // var id=$.cookie("usr");
        //var nave;
        // nave=this.naves[id];   
        if (!this.fin)
        {  
            var nave=this.naveLocal;
            if (nave){
                if (game.physics.arcade.collide(nave.sprite, this.veggies, this.collisionHandler,this.processHandler, this))
                {
                    console.log('boom');                    
                }
                if (cliente.num>1){
                    if (game.physics.arcade.collide(this.rival.sprite, this.veggies, this.collisionHandler,this.rivalHandler, this))
                    {
                        console.log('boom');                    
                    }
                }

                //game.physics.arcade.overlap(nave, this.veggies, this.collisionHandler, null, this);
                if (game.input.activePointer.isDown){
                    var targetAngle = game.math.angleBetween(nave.sprite.x, nave.sprite.y,game.input.activePointer.x, game.input.activePointer.y);  
                    nave.sprite.rotation = targetAngle;
                    nave.mover(game.input.activePointer.x,game.input.activePointer.y,targetAngle);//nave.sprite.body.angularVelocity);            
                }                
                

                if (this.cursors.left.isDown)
                {
                    nave.sprite.body.angularVelocity = -300;
                }
                else if (this.cursors.right.isDown)
                {
                    nave.sprite.body.angularVelocity = 300;
                }
                else
                {
                    nave.sprite.body.angularVelocity = 0;
                }

                if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
                {
                    nave.disparar();
                }

                this.screenWrap(nave.sprite);
                
                //nave.bullets.forEachExists(this.screenWrap, this);    
            }
            else
                this.faltaUno();
        }
    }
    this.agregarJugador = function(data){
        //console.log("nuevo usuario");
        if (this.naves[data.id]==null){
            var nave=new Nave(data);
            this.naves[data.id]=nave;
            if (data.id==cliente.id){
                this.naveLocal=this.naves[cliente.id];
                this.naveLocal.email=cliente.email.substr(0,cliente.email.indexOf('@'));
                this.mostrarObjetivo(data.veg);
            }
            else{
                this.rival=nave;
            }
        }
        game.time.events.loop(Phaser.Timer.SECOND, this.actualizarContador, this);
    }
    this.moverNave=function(data){        
        var nave=this.naves[data.id];
        nave.puntos=data.puntos;
        nave.mover(data.x,data.y,data.ang,true);        
        this.rival=nave;
        this.actualizarMarcador();
    }
    this.volverAJugar=function(data){
        //cliente.reset();
        this.fin=false;
        this.naves={};
        this.naveLocal=null;
        this.coord=[];
        this.contador=0;
        game.state.start("Game",true,false,data);
    }

    this.screenWrap=function(sprite) {
       
        if (sprite.x < 0)
        {
            sprite.x =game.width;
        }
        else if (sprite.x >game.width)
        {
            sprite.x = 0;
        }

        if (sprite.y < 0)
        {
            sprite.y =game.height;
        }
        else if (sprite.y >game.height)
        {
            sprite.y = 0;
        }

    }

    this.render=function() {
        // if (this.fin){
        //     game.state.start("FinJuego",true,false,cliente.id);
        // }
    }
}


function FinJuego(){
    this.ganador;
    this.idLocal;
    this.init =function(id,idLocal) {    
        //alert("Ganador: "+score)
        this.ganador=id;
        this.idLocal=idLocal;
    };
    this.create= function(){
        //var gameOverTitle = game.add.sprite(160,160,"gameover");
        //gameOverTitle.anchor.setTo(0.5,0.5);
        game.add.tileSprite(0, 0, game.width, game.height, 'space');
        var cadena="";
        
        if (this.ganador==this.idLocal){
            cadena="Enhorabuena, ¡ERES EL GANADOR!";
        }
        else{
            cadena="Lo siento, tu rival te ha vencido"
        }

        var text2 = game.add.text(game.world.centerX, 180, cadena, {
                font: "25px Arial",
                fill: "#FDFEFE",
                align: "center"
            });
        text2.anchor.setTo(0.5, 0.5); 

       var text1 = game.add.text(game.world.centerX, 220, "Gracias por usar SpaceChallenge", {
                font: "25px Arial",
                fill: "#FDFEFE",
                align: "center"
            });
        text1.anchor.setTo(0.5, 0.5);    

        var text = game.add.bitmapText(400, 300, 'carrier_command', 'FIN JUEGO', 64);
        text.anchor.x = 0.5;
        text.anchor.y = 0.5;

        var playButton = game.add.button(400,420,"play",this.volverAJugar,this);
        playButton.anchor.setTo(0.5,0.5);
    };
    this.volverAJugar= function(){
        cliente.volverAJugar();
    }
}

function Nave(data){
    this.id=data.id;
    this.x=data.x;
    this.y=data.y;
    this.destX;
    this.destY;
    this.veg=data.veg;
    this.ship=data.ship;
    this.email;
    this.puntos=0;
    this.sprite;
    this.bullets;
    this.bullet;
    this.bulletTime = 0;
    this.mover=function(x,y,ang,socket){       
        this.sprite.rotation=ang; 
        this.sprite.body.velocity=10;     
        //var targetAngle = game.math.angleBetween(this.sprite.x, this.sprite.y,x,y);  this.sprite.rotation = targetAngle;
        this.destX=x;
        this.destY=y;
        //game.physics.arcade.accelerationFromRotation(this.sprite.rotation, 100, this.sprite.body.acceleration);

        var distance=Phaser.Math.distance(this.sprite.x, this.sprite.y, x, y);
        var duration = distance*3;
        var tween = game.add.tween(this.sprite);        
        tween.to({x:x,y:y}, duration);
        tween.start();
        if (!socket)
            tween.onComplete.add(this.onComplete, this);

    }
    this.onComplete=function(){
        cliente.enviarPosicion(this.sprite.x,this.sprite.y,this.sprite.rotation, this.puntos,juego.contador);
    }
    this.disparar=function() {

        if (game.time.now > this.bulletTime)
        {
            this.bullet = this.bullets.getFirstExists(false);

            if (this.bullet)
            {
               this.bullet.reset(this.sprite.body.x + 16, this.sprite.body.y + 16);
               this.bullet.lifespan = 1000;
               this.bullet.rotation = this.sprite.rotation;
               game.physics.arcade.velocityFromRotation(this.sprite.rotation, 400, this.bullet.body.velocity);
               this.bulletTime =game.time.now + 50;
            }
        }
    }
    this.ini=function(){
        this.bullets= game.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;

        //  All 40 of them
        this.bullets.createMultiple(40, 'bullet');
        this.bullets.setAll('anchor.x', 0.5);
        this.bullets.setAll('anchor.y', 0.5);

        //  Our player ship
        this.sprite = game.add.sprite(this.x, this.y, this.ship);
        this.sprite.anchor.set(0.5);

        //  and its physics settings
        game.physics.arcade.enable(this.sprite);//, Phaser.Physics.ARCADE);

        this.sprite.body.drag.set(50);
        this.sprite.body.maxVelocity.set(200);    

    }
    this.ini();
}