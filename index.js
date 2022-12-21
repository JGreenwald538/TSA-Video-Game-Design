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
let selected = false;
const player1BoatsSizes = [5, 4, 3, 3, 2];
const player2BoatsSizes = [5, 4, 3, 3, 2];


class Boat{
    constructor(size, boxX, boxY, direction) {
        renderBackground();
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
            }
        } else if(direction.toLowerCase() == "v") {
            for(let i = 0; i < size; i++) {
                c.fillRect(boxX*boxSize, boxY*boxSize+(boxSize*i), boxSize, boxSize);
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
    for(let i = 0; i < player1Boats.length; i++) {
        player1Boats[i].draw();
    }
    for(let i = 0; i < player2Boats.length; i++) {
        player2Boats[i].draw();
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

function askForSize(boxX, boxY, player) {
    c.font = "20px serif";
    c.fillText("Type the number for the", 300, canvasHeight/2-200);
    c.fillText("Size of the boat(2-5)", 300, canvasHeight/2-175);
    c.fillText("Press enter to submit", 300, canvasHeight/2-150);
    c.fillText("Press escape to reset", 300, canvasHeight/2-125);
    c.fillText("Size: ", 300, canvasHeight/2-100);
    c.fillText("Direction: ", 300, canvasHeight/2-75);

    let size = 0;
    let direction = "h";
    let sizeInput = false;
    let directionInput = false;
    selected = true;
    document.addEventListener("keydown", function(event) {
        switch (event.key) {
            case "Enter":
                if(sizeInput && directionInput && checkIfSizeFits(size, boxX, boxY, direction)){
                    c.clearRect(300, canvasHeight/2-250, canvasWidth, canvasHeight);
                    document.removeEventListener("keydown", arguments.callee);
                    selected = false;
                    const boat = new Boat(size, boxX, boxY, direction);
                    if(player == 1) {
                        player1Boats.push(boat);
                        player1BoatsSizes.splice(player1BoatsSizes.indexOf(size), 1);
                    } else if(player == 2) {
                        player2Boats.push(boat);
                        player2BoatsSizes.splice(player2BoatsSizes.indexOf(size), 1);
                    }
                }
                playersPicking();
                break;
            case "Escape":
                c.clearRect(300, canvasHeight/2-220, canvasWidth, canvasHeight);
                document.removeEventListener("keydown", arguments.callee);
                selected = false;
                renderBackground();
                playersPicking();
                return;
            case "h":
            case "v":
                if(!directionInput) {
                    direction = event.key;
                    directionInput = true;
                    c.fillText("Direction: " + direction, 300, canvasHeight/2-75);
                }
                break;
            case "2":
            case "3":
            case "4":
            case "5":
                console.log(player2Boats)
                if(!sizeInput && checkIfCanUseSize(parseInt(event.key), player)) {
                    size = parseInt(event.key);
                    sizeInput = true;
                    c.fillText("Size: " + size, 300, canvasHeight/2-100);
                }
        }
    });
}

function checkIfCanUseSize(size, player){
    if(player == 1){
        found = player1BoatsSizes.findIndex(element => element === size);
        if(found === -1){
            return false;
        } else {
            return true;
        }
    } else if(player == 2){
        found = player2BoatsSizes.findIndex(element => element === size);
        if(found === -1){
            return false;
        } else {
            return true;
        }
    }
}

function checkIfSizeFits(size, x, y, direction){
    if(direction == "h"){
        if(x+size <= canvasWidth/boxSize){
            return true;
        } else {
            return false;
        }
    } else if(direction == "v"){
        if(y+size <= canvasHeight/boxSize){
            return true;
        } else {
            return false;
        }
    }
}

function playersPicking() {
    c.font = "20px serif";
    if(player1Boats.length < 5){
        c.fillText("Player 1, Pick a Boat", 300, canvasHeight/2-225);
        document.addEventListener("click", function(event) {
            console.log(selected);
            if(event.button == 0 && !selected && Math.floor(event.clientY/boxSize) >= 9) {
                console.log("test");
                if(Math.floor(event.clientX/boxSize) < canvasWidth/boxSize && Math.floor(event.clientY/boxSize) < canvasHeight/boxSize) {
                    askForSize(Math.floor(event.clientX/boxSize), Math.floor(event.clientY/boxSize), 1);
                    document.removeEventListener("click", arguments.callee);
                    c.strokeStyle = "yellow";
                    c.strokeRect(Math.floor(event.clientX/boxSize)*boxSize, Math.floor(event.clientY/boxSize)*boxSize, boxSize, boxSize);
                }
            }   
        });
    } else if(player2Boats.length < 5) {
        c.fillText("Player 2, Pick a Boat", 300, canvasHeight/2-225);
        document.addEventListener("click", function(event) {
            if(event.button == 0 && !selected && Math.floor(event.clientY/boxSize) <= 7) {
                if(Math.floor(event.clientX/boxSize) < canvasWidth/boxSize && Math.floor(event.clientY/boxSize) < canvasHeight/boxSize) {
                    askForSize(Math.floor(event.clientX/boxSize), Math.floor(event.clientY/boxSize), 2);
                    document.removeEventListener("click", arguments.callee);
                    c.strokeStyle = "yellow";
                    c.strokeRect(Math.floor(event.clientX/boxSize)*boxSize, Math.floor(event.clientY/boxSize)*boxSize, boxSize, boxSize);
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
playersPicking();