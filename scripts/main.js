



// Essentials
let canvas = document.getElementById("game");
let c = canvas.getContext('2d');

let canvas_width = 625;
let canvas_height = 500;

canvas.width = canvas_width;
canvas.height = canvas_height;





// Global Vars
let enemies = {obj: []};
let gameStart = false;





// Classes
class Player {
    constructor(position, size, color, sprite=null) {
        this.position = position;
        this.size = size;
        this.color = color;
        this.sprite = sprite;
        
        this.velocity = {
            x: 0,
            y: 0
        }
        this.desiredRotation = 0;
        this.isDestroyed = false;
        
        // Score
        this.score = 0;
    }
    
    draw() {
    	if (this.sprite != null) {
    		c.save();
	        c.translate(this.position.x, this.position.y);
	        c.rotate(this.position.rotation*Math.PI/180);
	        c.drawImage(this.sprite, 0, 0, 2447, 598, -this.size.width*0.5, -this.size.height*0.5, this.size.width, this.size.height)
	        c.restore();
	        return;
    	}
        c.save();
        c.fillStyle = this.color;
        c.translate(this.position.x, this.position.y);
        c.rotate(this.position.rotation*Math.PI/180);
        c.fillRect(-this.size.width*0.5, -this.size.height*0.5, this.size.width, this.size.height)
        c.restore();
    }
    
    vectors() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        
        if (this.velocity.y < 20) {
            this.velocity.y += 0.6;
        }
        
        
        if (this.desiredRotation) {
            if (this.desiredRotation >= this.position.rotation) {
                this.desiredRotation = 0;
                return;
            }
            this.position.rotation -= 5;
        }
        else if (this.position.rotation < 45) {
            this.position.rotation += 1;
        }
    }
    
    collision() {
        for (let i in enemies.obj) {
        if (rectangularCollision(this, enemies.obj[i])) {
            //enemies.obj[i].color = "red";
            this.velocity.x = -5;
        }
        else ;//enemies.obj[i].color = "green";
        }
    }
    
    checkDeath() {
        if ( this.position.x+this.size.width*0.5 < 0 || this.position.y+this.size.height*0.5 < 0 || this.position.y-this.size.height*0.5 > canvas_height ) {
            this.isDestroyed = true;
            document.getElementById("lose").style.display = "block";

            // Audio
            let defeat = new Audio('audio/explosion.mp3');
            defeat.play();
        }
    }
    
    jump() {
        this.velocity.y = -9;
        this.desiredRotation = -20;
    }
    
    update() {
        if (this.isDestroyed) {
            loseScreen();
            return;
        }
        this.vectors();
        this.draw();
        this.collision();
        this.checkDeath();
    }
}











class Enemy {
    constructor(position, color, sprite=null, spriteWidth=null, spriteHeight=null) {
        this.position = position;
        this.size = {
            width: 120,
            height: 500
        };
        this.color = color;
        this.sprite = sprite;
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
        
        this.velocity = {
            x: 0,
            y: 0
        }
        this.isActive = true;
        this.isDestroyed = false;
        
        enemies.obj.push(this);
    }
    
    draw() {
    	if (this.sprite != null) {
    		c.save();
	        c.translate(this.position.x, this.position.y);
	        c.rotate(this.position.rotation*Math.PI/180);
	        c.drawImage(this.sprite, 0, 0, this.spriteWidth, this.spriteHeight, -this.size.width*0.5, -this.size.height*0.5, this.size.width, this.size.height)
	        c.restore();
	        return;
    	}
        c.save();
        c.fillStyle = this.color;
        c.translate(this.position.x, this.position.y);
        c.rotate(this.position.rotation*Math.PI/180);
        c.fillRect(-this.size.width*0.5, -this.size.height*0.5, this.size.width, this.size.height)
        c.restore();
    }
    
    vectors() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
    
    checkDeath() {
        if (this.position.x < -this.size.width) {
            for (let i in enemies.obj) if (enemies.obj[i] == this){
                enemies.obj.splice(i, 1);
                this.isDestroyed = true;
            }
        }
    }
    
    giveScore() {
        if (this.isActive && this.position.x+this.size.width*0.5 < player.position.x-player.size.width*0.5) {
            this.isActive = false;
            if (!player.isDestroyed) player.score++;
        }
    }
    
    update() {
    	if (this.isDestroyed) return
        this.vectors();
        this.draw();
        this.checkDeath();
        this.giveScore();
    }
}




















// Objects
const ogPlayer = {
    position: {
        x: 120,
        y: 200,
        rotation: 0
    },
    size: {
        width: 100,
        height: 30
    },
    color: "red",
    sprite: new Image()
}
ogPlayer.sprite.src = "images/player.png";
let player;


const background = {
	position: {
		x: canvas_height * 429/320,
		y: canvas_height * 0.5
	},
	size: {
		width: canvas_height * 429/160,
		height: canvas_height
	},
	sprite: new Image()
}
background.sprite.src = "images/background2.png";



	// Audio
const bgm = new Audio('audio/bgm.mp3');







// Animation
function animate() {
    c.clearRect(0, 0, canvas_width, canvas_height)
    requestAnimationFrame(animate);
    
    // Background
    c.save();
    c.translate(background.position.x, background.position.y);
    c.drawImage(background.sprite, 0, 0, 429, 160, -background.size.width*0.5, -background.size.height*0.5, background.size.width, background.size.height);
    c.restore();

    // Enemies
    for (let i in enemies.obj) {
        enemies.obj[i].update()
    }
    
    // Game
    if (gameStart) {
        player.update();
        summonEnemy();
        score();

        // Background Move
    	background.position.x -= 0.15;
    }
    
}
reset();
animate();






// Functions
function rectangularCollision(object1, object2) {
    let obj1 = {
        x: object1.position.x,
        y: object1.position.y,
    }
    
    let obj2 = {
        x: object2.position.x,
        y: object2.position.y,
    }
    
    let width1 = object1.size.width*0.5;
    let height1 = object1.size.height*0.5;
    
    let width2 = object2.size.width*0.5;
    let height2 = object2.size.height*0.5;
    
    
    
    
    return !(
        (obj1.y+height1 < obj2.y-height2) ||
        (obj2.y+height2 < obj1.y-height1) ||
        (obj1.x+width1 < obj2.x-width2) ||
        (obj2.x+width2 < obj1.x-width1)
    )
}

function summonEnemy() {
    for (let i in enemies.obj) if (enemies.obj[i].isActive) return;
    
    let rand = Math.floor(Math.random()*230) + 30 - 290;
    
    let pos1 = {
        x: canvas_width + 50,
        y: rand,
        rotation: 0
    }
    
    let pos2 = {
        x: canvas_width + 50,
        y: rand + 800,
        rotation: 0
    }

    let img1 = new Image();
    img1.src = "images/enemy1.png";
    
    let e1 = new Enemy(pos1, "green", img1, 125, 138);
    e1.velocity.x = -10;
    e1.position.rotation += 180;
    let e2 = new Enemy(pos2, "green", img1, 125, 138);
    e2.velocity.x = -10;
    e2.isActive = false;
    
    // Random
    if (Math.floor(Math.random()*2)) {
        let pos3 = {
            x: canvas_width + 100,
            y: 0
        }
        if (player.position.y < canvas_height*0.5) {
            pos3.y = Math.floor(Math.random()*100) + 50 - 250
        }
        else {
            pos3.y = Math.floor(Math.random()*100) + 50 + 500
        }

        let img2 = new Image();
    	img2.src = "images/enemy2.png";
        
        let e3 = new Enemy(pos3, "blue", img2, 103, 196);
        e3.velocity.x = -Math.floor(Math.random()*10 + 5);
        e3.isActive = false;
    }
    
}

function score() {
	let len = player.score.toString().length;
	console.log(len)

    c.save();
    c.beginPath();
    c.fillStyle = "white";
    c.strokeStyle = "black";
    c.lineWidth = 4;
    c.font = "bold 80px Helvetica";
    c.textAlign = "center"
    c.strokeText(player.score, 35 + len*15, canvas_height*0.5);
    c.fillText(player.score, 35 + len*15, canvas_height*0.5);
    c.closePath();
    c.restore();
}

function loseScreen() {
    c.save();
    c.strokeStyle = "red";
    c.fillStyle = "white";
    c.lineWidth = 8;
    c.font = "bold 50px Helvetica";
    c.textAlign = "center"
    c.strokeText("You Died!", canvas_width*0.5, canvas_height*0.5);
    c.fillText("You Died!", canvas_width*0.5, canvas_height*0.5);
    c.restore();
}

function reset() {
    enemies.obj = [];
    bgm.currentTime = 0;
    bgm.play();
    background.position.x = canvas_height * 429/320;
    
    
    let pos = {
        x: ogPlayer.position.x,
        y: ogPlayer.position.y,
        rotation: ogPlayer.position.rotation,
    }
    let s = {
        width: ogPlayer.size.width,
        height: ogPlayer.size.height
    }
    
    player = new Player(pos, s, ogPlayer.color, ogPlayer.sprite);

    // Hide Button
    document.getElementById("lose").style.display = "none";
}

function start() {
    gameStart = true;
    reset();
    
    document.getElementById("menu").style.display = "none";
}













// Input-Handling
document.addEventListener('click', e => {
    player.jump()
})

document.addEventListener('keydown', e => {
    if (e.code = "Space") player.jump()
})


bgm.addEventListener('ended', e => {
	bgm.currentTime = 0;
	bgm.play();
})