const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
const width = 300;
const height = 510;
const boxSize = width/10;
arrowImage = new Image();
arrowImage.src = './arrow.png';

class Boat{
    constructor(size, boxX, boxY, direction){
        this.size = size;
        this.boxX = boxX;
        this.boxY = boxY;
        this.direction = direction;
        this.draw();
    } 
    draw(){
        var direction = this.direction;
        var size = this.size;
        var boxX = this.boxX;
        var boxY = this.boxY;
        c.fillStyle = "rgb(155, 103, 60)";
        if(direction.toLowerCase() == "h") {
            for(let i = 0; i < size; i++){
                c.fillRect(boxX*boxSize+(boxSize*i), boxY*boxSize, boxSize, boxSize);
            }
        } else if(direction.toLowerCase() == "v") {
            for(let i = 0; i < size; i++){
                c.fillRect(boxX*boxSize, boxY*boxSize+(boxSize*i), boxSize, boxSize);
            }
        }
    }
}

function dToR(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
}

function renderBackground(){
    c.fillStyle = "blue";
    c.fillRect(0, 0, width, height);
    c.strokeStyle = "black";
    for(let x = 0; x < width/boxSize; x++){
        for(let y = 0; y < height/boxSize; y++){
            c.strokeRect(boxSize*x, boxSize*y, boxSize, boxSize);
        }
    }
    c.fillStyle = "gray";
    c.fillRect(width/2-boxSize, height-boxSize, boxSize*2, boxSize);
    c.fillRect(width/2-boxSize, 0, boxSize*2, boxSize);
    for(let i = 0; i < boats.length; i++){
        boats[i].draw();
    }
}

class Projectile{
    constructor(){
        this.x = width/2
        this.y = 0
        this.ogx = width/2
        this.ogy = 0
        this.visible = true;
        c.fillStyle = "red";
        c.fillRect(this.x, this.y, 5, 5)
        this.displacement = 0;
        this.power = 40;
        this.windSpeed = (Math.random()*2)
        this.windDirection = (Math.random()*360);
        c.clearRect(width+1, 0, width*2, height);
        this.writeWindSpeed();
        draw_arrow(c, 360, height/2, 60, this.windDirection);
    }
    update(degrees, v=5){
        if(this.visible){
            vx = 0;
            degrees *= 2
            if(degrees > 90) {
                degrees = 180 - degrees
                var vx = v*Math.cos(dToR(degrees)) * -1; 
            } else{
                var vx = v*Math.cos(dToR(degrees));
            }
            var vy = v*Math.sin(dToR(degrees));
            this.y = this.y + vy + windReturn("y", this.windSpeed, this.windDirection);
            this.x = this.x + vx + windReturn("x", this.windSpeed, this.windDirection);
            this.displacement = ((this.x-this.ogx)**2 + (this.y-this.ogy)**2)**(1/2);
            if(this.displacement > this.power*3+200) {
                this.remove();
            } else if(-5 >= this.x || this.x >= width-5 || -5 > this.y || this.y > height-5){
                this.remove();
            } else {
                renderBackground();
                c.fillStyle = "red";
                c.fillRect(this.x, this.y, 5, 5);
            }
        }
    }
    remove(){
        this.visible = false;
        renderBackground();
    }
    writeWindSpeed(){
        c.font = "48px serif";
        c.fillText(Math.floor(this.windDirection) + " degrees", 300, height/2-100);
    }
}

function windReturn(direction, windSpeed, windDirection){
    
    if(direction == "x"){
        return windSpeed*Math.cos(dToR(windDirection-90));
    } else if(direction == "y"){
        return windSpeed*Math.sin(dToR(windDirection-90));
    }
}

function lineToAngle(ctx, x1, y1, length, angle) {
    angle = (angle - 90) * Math.PI / 180;
    var x2 = x1 + length * Math.cos(angle),
        y2 = y1 + length * Math.sin(angle);
  
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.fill();
  
    return {
      x: x2,
      y: y2
    };
  }
  
  function draw_arrow(ctx, x1, y1, length, angle) {
    var pos = lineToAngle(ctx, x1, y1, length, angle);
    lineToAngle(ctx, pos.x, pos.y, 10, angle - 135);
    lineToAngle(ctx, pos.x, pos.y, 10, angle + 135);
  }

function updateProjectiles(){
    for(let i = 0; i < projectiles.length; i++){
        projectiles[i].update(45);
    }
}

var projectiles = [];
document.addEventListener("keydown", function(event) {
    if(event.key == " ") {
        console.log("space");
        projectiles.push(new Projectile());
    }
});

const boats = [new Boat(2, 3, 5, "h"), new Boat(3, 6, 5, "v")];
renderBackground();
var projectile1 = new Projectile();
setInterval(updateProjectiles, 100);
