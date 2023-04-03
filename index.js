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
const player1BoatsSizes = [2, 3, 3, 4, 5];
const player2BoatsSizes = [2, 3, 3, 4, 5];
const mapLayout = [];
mapLayout[0] = [0, 0, 0, 0, 1, 1, 0, 0, 0, 0];
for (let i = 1; i <= 15; i++) {
    mapLayout[i] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
}
mapLayout[16] = [0, 0, 0, 0, 1, 1, 0, 0, 0, 0];
let turn = 1;
let globalText = "";
let globalX = 0;
let globalY = 0;
let fps = 1000/60;
let angle = 0;


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
        const boatImage = new Image();
        boatImage.addEventListener("load",() => {
            if(direction == "h") {
                c.drawImage(boatImage,boxX*boxSize, boxY*boxSize, boxSize*size, boxSize);
            } else {
                c.drawImage(boatImage,boxX*boxSize, boxY*boxSize, boxSize, boxSize*size);
            }
        },false);
        boatImage.src = "Assets/Ships/TSA.pixel." + size + direction + ".png";
    }
}


function dToR(degrees) {
    var pi = Math.PI;
    return degrees * (pi/180);
}

function drawBoat(follow, size, direction, event = null) {
    const boatImage = new Image();
    c.clearRect(0, 0, canvas.width, canvas.height);
    boatImage.addEventListener("load",() => {
        if(!follow) {
            if(direction == "h") {
                c.drawImage(boatImage,canvasWidth, 100, boxSize*size, boxSize);
            } else {
                c.drawImage(boatImage,canvasWidth, 100+boxSize, boxSize, boxSize*size);
            }
        } else {
            
            const mousePos = getMousePos(canvas, event);
            if(direction == "h") {
                c.drawImage(boatImage, mousePos.x - boxSize*size/2, mousePos.y - boxSize/2, boxSize*size, boxSize);
            } else {
                c.drawImage(boatImage, mousePos.x - boxSize/2, mousePos.y - boxSize*size/2, boxSize, boxSize*size);
            }
        }
    },false);

    boatImage.src = "Assets/Ships/TSA.pixel." + size + direction + ".png";
}

function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function loadShooter(){
    const shooterImage = new Image();
    shooterImage.addEventListener("load",() => {
        if(turn == 1) {
            c.drawImage(shooterImage,canvasWidth/2-shooterImage.width/2, canvasHeight-shooterImage.height);
        } else {
            c.drawImage(shooterImage,canvasWidth/2-shooterImage.width/2, 0);
        }
    },false);
    shooterImage.src = "Assets/Background/thumbnail_pixel.shooter.tsa" + angle + ".png";
    angle += 1;
    if(angle > 30){
        angle = -30;
    }
}


function drawText(text="", x=0, y=0){
    globalText = text;
    globalX = x;
    globalY = y;
}

function renderBackground() {
    const backgroundImage = new Image();
    backgroundImage.addEventListener("load",() => {
        c.drawImage(backgroundImage,0,0, canvasWidth, canvasHeight);
        c.globalAlpha = 0.3;
        c.strokeStyle = "black";
        for(let x = 0; x < canvasWidth/boxSize; x++) {
            for(let y = 0; y < canvasHeight/boxSize; y++) {
                c.strokeRect(boxSize*x, boxSize*y, boxSize, boxSize);
            }
        }
        c.globalAlpha = 1;
        for(let boat of player1Boats) {
            boat.draw();
        }
        for(let boat of player2Boats) {
            boat.draw();
        }
        c.fillStyle = "black";
        c.fillText(globalText, globalX, globalY);
    },false);     
    backgroundImage.src = "Assets/Background/pixil-frame-0.png";   
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
                c.fillStyle = "red";
                c.fillRect(this.x, this.y, 5, 5);
            }
        }
    }
    remove() {
        this.visible = false;
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

function size(player) {
    if(player == 1) {
        return player1BoatsSizes[player1Boats.length];
    } else if(player == 2) {
        return player2BoatsSizes[player2Boats.length];
    }
}

function placeBoats(player) {
    const boatSize = size(player);
    console.log(player);
    for(let i = 0; i < 2; i++) {
        if(i == 0) {
            drawBoat(false, boatSize, "h");
        } else if(i == 1) {
            drawBoat(false, boatSize, "v");
        }
    }
    if(!selected) {
        document.addEventListener("mousedown", function boatInput(event) {
            drawText();
            c.clearRect(0, 0, canvasWidth, canvasHeight);
            if(event.clientX > canvasWidth && event.clientX < canvasWidth+boatSize*boxSize && event.clientY > 100 && event.clientY < 100+boxSize) {
                var direction = "h";
                document.removeEventListener("mousedown", arguments.callee);
                selected = true;
            } else if(event.clientX > canvasWidth && event.clientX < canvasWidth+boxSize && event.clientY > 100+boxSize && event.clientY < 100+boatSize*boxSize) {
                var direction = "v";
                document.removeEventListener("mousedown", arguments.callee);
                selected = true;
            }
            if(selected) {
                document.addEventListener("mousedown", function boatInput(event) {
                    const boatSize = size(player);
                    if(direction == "h") {
                        boxX = Math.floor(event.clientX/boxSize) - Math.round(boatSize/2);
                        boxY = Math.floor(event.clientY/boxSize);
                    } else if(direction == "v") {
                        boxX = Math.floor(event.clientX/boxSize);
                        boxY = Math.floor(event.clientY/boxSize) - Math.round(boatSize/2);
                    }
                    if(checkIfSizeFits(boatSize, boxX, boxY, direction) && !isAnythingThere(boxX, boxY, boatSize, direction) && inPlayerArea(player, boxY) && boxX >= 0) {
                        c.clearRect(300, canvasHeight/2-250, canvasWidth, canvasHeight);
                        document.removeEventListener("mousedown", arguments.callee);
                        selected = false;
                        const boat = new Boat(boatSize, boxX, boxY, direction);
                        if(player == 1) {
                            player1Boats.push(boat);
                        } else{
                            player2Boats.push(boat);
                        }
                        for (let i = 0; i < boatSize; i++) {
                            if(direction == "h") {
                                mapLayout[boxY][boxX+i] = 1;
                            } else if(direction == "v") {
                                mapLayout[boxY+i][boxX] = 1;
                            }
                        }
                        document.removeEventListener("mousemove", arguments.callee);
                        game();
                    }
                    
                });
            
                document.addEventListener("mousemove", function func(event) {
                    if(!selected){
                        document.removeEventListener("mousemove", arguments.callee);
                    } else {
                        drawBoat(true, boatSize, direction, event);
                    }
            });
        } else {
            selected = false;
        }
        
        });
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


function isAnythingThere(x, y, size, direction){
    if(direction == "h"){
        for(let i = 0; i < size; i++){
            if(mapLayout[y][x+i] == 1){
                return true;
            }
        }
    } else if(direction == "v"){
        for(let i = 0; i < size; i++){
            if(mapLayout[y+i][x] == 1){
                return true;
            }
        }
    }
    return false;
}

function inPlayerArea(player, boxY){
    if(player == 2){
        if(boxY >= 0 && boxY < 7){
            return true;
        } else {
            return false;
        }
    } else if(player == 1){
        if(boxY > 8 && boxY <= 15){
            return true;
        } else {
            return false;
        }
    }
}

function game() {
    c.font = "20px serif";
    if(player1Boats.length < 5){
        drawText("Player 1, Place a Boat", canvasWidth/2-c.measureText("Player 1, Place a Boat").width/2, 140);
        placeBoats(1);
    } else if(player2Boats.length < 5) {
        document.removeEventListener("mousedown", arguments.callee);
        document.removeEventListener("mousemove", arguments.callee);
        drawText("Player 2, Place a Boat", canvasWidth/2-c.measureText("Player 2, Place a Boat").width/2, canvasHeight-140);
        placeBoats(2);  
    } else{
        loadShooter();
        c.fillText("Player 1, Shoot", canvasWidth/2, 25);
        document.addEventListener("click", function(event) {
            console.log("clicked");   
        });
    }

}




document.addEventListener("keydown", function(event) {
    if(event.key == " ") {
        projectiles.push(new Projectile());
    } 
});


setInterval(updateProjectiles, 100);
setInterval(renderBackground, fps);
// setInterval(loadShooter, fps);
game();
