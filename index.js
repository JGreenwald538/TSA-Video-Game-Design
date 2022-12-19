const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
const width = 300;
const height = 510;
const boxSize = width/10;
vx = 0;
vy = 0;

function boat(size, boxX, boxY, direction){
    c.fillStyle = "rgb(155, 103, 60)";
    if(direction.toLowerCase() == "h") {
        for(i = 0; i < size; i++){
            c.fillRect(boxX*boxSize+(boxSize*i), boxY*boxSize, boxSize, boxSize);
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
}

class Projectile{
    constructor(){
        this.x = width/2
        this.y = 0
        this.visible = true;
        c.fillStyle = "red";
        c.fillRect(this.x, this.y, 5, 5)
    }
    update(degrees, v=5){
        if(this.visible){
            vx = 0;
            degrees *= 2
            if(degrees > 90) {
                degrees = 180 - degrees
                vx = v*Math.cos(dToR(degrees)) * -1; 
            } else{
                vx = v*Math.cos(dToR(degrees));
            }
            console.log(dToR(degrees))
            vy = v*Math.sin(dToR(degrees));
            this.y = this.y + vy
            this.x = this.x + vx
            if(0 > this.x > width || 0 > this.y > height){
                this.visible = false;
            }
            renderBackground();
            c.fillStyle = "red";
            c.fillRect(this.x, this.y, 5, 5);
        }
    }
}

function updateProjectile(){
    projectile1.update(30, 100);
}

renderBackground();
boat(2, 1, 0, "h");
projectile1 = new Projectile();
setInterval(updateProjectile, 1000);