const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
const canvasWidth = 300;
const canvasHeight = 510;
const width = canvas.width;
const height = canvas.height;
const boxSize = canvasWidth/10;
const projectiles = []; 
let didPlayersPick = false;
const player1Boats = [];
const player2Boats = [];


class Boat{
    constructor(size, boxX, boxY, direction) {
        this.size = size;
        this.boxX = boxX;
        this.boxY = boxY;
        this.direction = direction;
        this.draw();
    } 
    draw() {
        var direction = this.direction;
        var size = this.size;
        var boxX = this.boxX;
        var boxY = this.boxY;
        c.fillStyle = "rgb(155, 103, 60)";
        if(direction.toLowerCase() == "h") {
            for(let i = 0; i < size; i++) {
                c.fillRect(boxX*boxSize+(boxSize*i), boxY*boxSize, boxSize, boxSize);
                console.log("h");
            }
        } else if(direction.toLowerCase() == "v") {
            for(let i = 0; i < size; i++) {
                c.fillRect(boxX*boxSize, boxY*boxSize+(boxSize*i), boxSize, boxSize);
                console.log("v");
            }
        }
    }
}


function dToR(degrees) {
    var pi = Math.PI;
    return degrees * (pi/180);
}


function renderBackground() {
    c.fillStyle = "blue";
    c.fillRect(0, 0, canvasWidth, canvasHeight);
    c.strokeStyle = "black";
    for(let x = 0; x < canvasWidth/boxSize; x++) {
        for(let y = 0; y < canvasHeight/boxSize; y++) {
            c.strokeRect(boxSize*x, boxSize*y, boxSize, boxSize);
        }
    }
    c.fillStyle = "gray";
    c.fillRect(canvasWidth/2-boxSize, canvasHeight-boxSize, boxSize*2, boxSize);
    c.fillRect(canvasWidth/2-boxSize, 0, boxSize*2, boxSize);
    for(let i = 0; i < boats.length; i++) {
        boats[i].draw();
    }
}

class Projectile{
    constructor() {
        this.x = canvasWidth/2
        this.y = 0
        this.ogx = canvasWidth/2
        this.ogy = 0
        this.visible = true;
        c.fillStyle = "red";
        c.fillRect(this.x, this.y, 5, 5)
        this.displacement = 0;
        this.power = 40;
        this.windSpeed = (Math.random()*1)
        this.windDirection = (Math.random()*360);
        c.clearRect(canvasWidth+1, 0, canvasWidth*2, canvasHeight);
        this.writeWindSpeed();
        draw_arrow(c, 360, canvasHeight/2, 60, this.windDirection);
    }
    update(degrees, v=5) {
        if(this.visible) {
            vx = 0;
            degrees *= 2
            if(degrees > 90) {
                degrees = 180 - degrees
                var vx = v*Math.cos(dToR(degrees))*(-1); 
            } else{
                var vx = v*Math.cos(dToR(degrees));
            }
            var vy = v*Math.sin(dToR(degrees));
            this.y = this.y + vy + windReturn("y", this.windSpeed, this.windDirection);
            this.x = this.x + vx + windReturn("x", this.windSpeed, this.windDirection);
            this.displacement = ((this.x-this.ogx)**2 + (this.y-this.ogy)**2)**(1/2);
            if(this.displacement > this.power*3+200) {
                this.remove();
            } else if(-5 >= this.x || this.x >= canvasWidth-5 || -5 > this.y || this.y > canvasHeight-5) {
                this.remove();
            } else {
                renderBackground();
                c.fillStyle = "red";
                c.fillRect(this.x, this.y, 5, 5);
            }
        }
    }
    remove() {
        this.visible = false;
        renderBackground();
    }
    writeWindSpeed() {
        c.font = "48px serif";
        c.fillText(Math.floor(this.windDirection) + " degrees", 300, canvasHeight/2-100);
    }
}

function windReturn(direction, windSpeed, windDirection) {
    
    if(direction == "x") {
        return windSpeed*Math.cos(dToR(windDirection-90));
    } else if(direction == "y") {
        return windSpeed*Math.sin(dToR(windDirection-90));
    }
}

function lineToAngle(c, x1, y1, length, angle) {
    angle = (angle - 90) * Math.PI / 180;
    const x2 = x1 + length * Math.cos(angle),
        y2 = y1 + length * Math.sin(angle);
  
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();
    c.fill();
  
    return {
        x: x2,
        y: y2
    };
  }
  
function draw_arrow(c, x1, y1, length, angle) {
    const pos = lineToAngle(c, x1, y1, length, angle);
    lineToAngle(c, pos.x, pos.y, 10, angle - 135);
    lineToAngle(c, pos.x, pos.y, 10, angle + 135);
}

function updateProjectiles() {
    for(let i = 0; i < projectiles.length; i++) {
        projectiles[i].update(45);
    }
}

function askForSize(boxX, boxY) {
    c.font = "20px serif";
    c.fillText("Type the number for the", 300, canvasHeight/2-200);
    c.fillText("Size of the boat(2-5)", 300, canvasHeight/2-175);
    c.fillText("Press enter to submit", 300, canvasHeight/2-150);
    c.fillText("Press backspace to cancel", 300, canvasHeight/2-125);
    c.fillText("Press escape to exit", 300, canvasHeight/2-100);
    c.fillText("Size: ", 300, canvasHeight/2-75);
    c.fillText("Direction: ", 300, canvasHeight/2-50);

    let size = 0;
    let direction = "h";
    let sizeInput = false;
    let directionInput = false;
    document.addEventListener("keydown", function(event) {
        if(event.key == "Enter") {
            if(sizeInput && directionInput) {
                c.clearRect(300, canvasHeight/2-500, canvasWidth, canvasHeight);
                document.removeEventListener("keydown", arguments.callee);
                return(new Boat(size, boxX, boxY, direction));
            }
        } else if(event.key == "Backspace") {
            return;
        } else if(event.key == "Escape") {
            return;
        } else if(event.key == "h" || event.key == "v") {
            direction = event.key;
            directionInput = true;
            c.fillText("Direction: " + direction, 300, canvasHeight/2-50);
        } else if(event.key == "2" || event.key == "3" || event.key == "4" || event.key == "5") {
            size = event.key;
            c.fillText("Size: " + size, 300, canvasHeight/2-75);
            sizeInput = true;
        }
    });
}

function playersPicking() {
    c.font = "20px serif";
    if(player1Boats.length <= 5){
        c.fillText("Player 1, Pick a Boat", 300, canvasHeight/2-225);
        document.addEventListener("click", function(event) {
            if(event.button == 0) {
                if(Math.floor(event.clientX/boxSize) < canvasWidth/boxSize && Math.floor(event.clientY/boxSize) < canvasHeight/boxSize) {
                    player1Boats.push(askForSize(Math.floor(event.clientX/boxSize), Math.floor(event.clientY/boxSize)));
                    
                }
            }   
        });
    }

}
    


document.addEventListener("keydown", function(event) {
    if(event.key == " ") {
        projectiles.push(new Projectile());
    } 
});


renderBackground();
setInterval(updateProjectiles, 100);