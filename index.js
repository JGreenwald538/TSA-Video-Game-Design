const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
const canvasWidth = 300;
const canvasHeight = 510;
const width = canvas.width;
const height = canvas.height;
const boxSize = canvasWidth / 10;
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
let fps = 1000 / 60;
let angle = 0;

const boatImagesH = [new Image(), new Image(), new Image(), new Image()];
const boatImagesV = [new Image(), new Image(), new Image(), new Image()];
for (let i = 0; i <= 3; i++) {
    boatImagesH[i].src = "Assets/Ships/TSA.pixel." + (i+2) + "h.png";
    boatImagesV[i].src = "Assets/Ships/TSA.pixel." + (i+2) + "v.png";
}
let drawBoatList = [];
let backwards = true;
let projectileInMotion = false;
// Fill the player boats arrays with boat objects


class Boat {
    constructor(size, boxX, boxY, direction) {
        this.size = size;
        this.boxX = boxX;
        this.boxY = boxY;
        this.direction = direction;
        this.draw();
        this.mapLayout = [];
        for(let i = 0; i < size; i++){
            if(direction == "h"){
                this.mapLayout.push([boxY, boxX + i]);
            } else {
                this.mapLayout.push([boxY + i, boxX]);
            }
        }
        this.hits = size;
    }
    draw() {
        var direction = this.direction;
        var size = this.size;
        var boxX = this.boxX;
        var boxY = this.boxY;
        if (direction == "h") {
            c.drawImage(boatImagesH[size-2], boxX * boxSize, boxY * boxSize, boxSize * size, boxSize);
        } else {
            c.drawImage(boatImagesV[size-2], boxX * boxSize, boxY * boxSize, boxSize, boxSize * size);
        }
    }
    hit() {
        this.hits--;
        if(this.hits == 0){
            if(player1Boats.findIndex(this) != -1){
                player1Boats.splice(player1Boats.findIndex(this), 1);
            } else {
                player2Boats.splice(player2Boats.findIndex(this), 1);
            }
        }
    }
}


function dToR(degrees) {
    var pi = Math.PI;
    return degrees * (pi / 180);
}

function drawBoat(follow, size, direction, event = null) {
    if (!follow) {
        if (direction == "h") {
            c.drawImage(boatImagesH[size-2], canvasWidth, 100, boxSize * size, boxSize);
        } else {
            c.drawImage(boatImagesV[size-2], canvasWidth, 100 + boxSize, boxSize, boxSize * size);
        }
    } else {

        const mousePos = getMousePos(canvas, event);
        if (direction == "h") {
            c.drawImage(boatImagesH[size-2], mousePos.x - boxSize * size / 2, mousePos.y - boxSize / 2, boxSize * size, boxSize);
        } else {
            c.drawImage(boatImagesV[size-2], mousePos.x - boxSize / 2, mousePos.y - boxSize * size / 2, boxSize, boxSize * size);
        }
    }
}

function activateDrawBoat(follow=false, size=0, direction="", event=null) {
    if(size != 0){
        drawBoatList.push([follow, size, direction, event]);
    } else {
        drawBoatList = [];
    }
}

function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}
const shooterImage = new Image();
shooterImage.src = "Assets/Background/thumbnail_pixel.shooter.tsa.png";

function loadShooter() {
    if (turn == 1) {
        c.save();
        c.translate(canvasWidth / 2, canvasHeight);
        c.rotate(dToR(angle));
        c.translate(-canvasWidth / 2, -(canvasHeight));
        c.drawImage(shooterImage, canvasWidth / 2 - shooterImage.width / 2, canvasHeight - shooterImage.height + 150);
        c.restore();
    } else {
        c.save();
        c.translate(canvasWidth / 2, 0);
        c.rotate(dToR(angle+180));
        c.translate(-canvasWidth / 2, 0);
        c.drawImage(shooterImage, canvasWidth / 2 - shooterImage.width / 2, -210);
        c.restore();
    }
    if (backwards) {
        angle += 0.1;
    } else {
        angle -= 0.1;
    }
    if (angle > 30) {
        backwards = false;
    } else if(angle < -30) {
        backwards = true;
    }
}

function drawText(text = "", x = 0, y = 0) {
    globalText = text;
    globalX = x;
    globalY = y;
}

const backgroundImage = new Image();
backgroundImage.src = "Assets/Background/pixil-frame-0.png"; 

function renderBackground() {
    c.save();
    c.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);
    c.globalAlpha = 0.3;
    c.strokeStyle = "black";
    for (let x = 0; x < canvasWidth / boxSize; x++) {
        for (let y = 0; y < canvasHeight / boxSize; y++) {
            c.strokeRect(boxSize * x, boxSize * y, boxSize, boxSize);
        }
    }
    c.globalAlpha = 1;
    for (let boat of player1Boats) {
        boat.draw();
    }
    for (let boat of player2Boats) {
        boat.draw();
    }
    c.fillStyle = "rgb(0, 33, 115)";
    c.fillText(globalText, globalX, globalY);
    for(let boat of drawBoatList){
        drawBoat(...boat);
    }
    updateProjectiles();
    c.restore();
}

redBall = new Image();
redBall.src = "Assets/Balls/balloon.red.png";
blueBall = new Image();
blueBall.src = "Assets/Balls/balloon.blue.png";


class Projectile {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.ogx = x;
        this.ogy = y;
        this.visible = true;
        this.degrees = 90 + angle;
        if (this.ogy > canvasHeight / 2) {
            this.degrees += 180;
            this.degrees = 300 - this.degrees;
            this.degrees += 240;
        }
        this.displacement = 0;
        this.power = Math.floor(Math.random() * (80 + 1)); // Max: 80 Min: 0
        projectileInMotion = true;
        drawText();
    }
    update(v = 1) {
        if (this.visible) {
            vx = 0;
            if (this.ogy < canvasHeight / 2) {
                var vx = v * Math.cos(dToR(this.degrees));
            } else {
                var vx = v * Math.cos(dToR(this.degrees)) * (-1);
            }
            var vy = v * Math.sin(dToR(this.degrees));
            this.y = this.y + vy;
            this.x = this.x + vx;
            this.displacement = ((this.x - this.ogx) ** 2 + (this.y - this.ogy) ** 2) ** (1 / 2);
            if (this.displacement > this.power * 3 + 200) {
                this.remove(true);
            } else if (-5 >= this.x || this.x >= canvasWidth - 5 || -5 > this.y || this.y > canvasHeight - 5) {
                this.remove();
            } else {
                c.drawImage(redBall, this.x-5, this.y-5, 10, 10);
            }
        }
    }
    remove(power = false) {
        this.visible = false;
        projectileInMotion = false;
        if(turn == 2){
            for(let boat of player2Boats){
                for(let i = 0; i < boat.mapLayout.length; i++){
                    if(boat.mapLayout[i][0] == Math.floor(this.x/boxSize) && boat.mapLayout[i][1] == Math.floor(this.y/boxSize)){
                        console.log("hit1");
                        boat.hit();
                    }
                }
            }
        } else {
            for(let boat of player1Boats){
                console.log(boat.mapLayout);
                for(let i = 0; i < boat.mapLayout.length; i++){
                    if(boat.mapLayout[i][0] == Math.floor(this.x/boxSize) && boat.mapLayout[i][1] == Math.floor(this.y/boxSize)){
                        console.log("hit");
                        boat.hit();
                    }
                }
            }
        }
        if(power){
            console.log("power");
        }
        game();
    }
    writeWindSpeed() {
        c.font = "48px serif";
        c.fillText(Math.floor(this.windDirection) + " degrees", 300, canvasHeight / 2 - 100);
    }
}

function windReturn(direction, windSpeed, windDirection) {

    if (direction == "x") {
        return windSpeed * Math.cos(dToR(windDirection - 90));
    } else if (direction == "y") {
        return windSpeed * Math.sin(dToR(windDirection - 90));
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
    for (let i = 0; i < projectiles.length; i++) {
        projectiles[i].update();
    }
}

function size(player) {
    if (player == 1) {
        return player1BoatsSizes[player1Boats.length];
    } else if (player == 2) {
        return player2BoatsSizes[player2Boats.length];
    }
}

function placeBoats(player) {
    const boatSize = size(player);
    for (let i = 0; i < 2; i++) {
        if (i == 0) {
            activateDrawBoat(false, boatSize, "h");
        } else if (i == 1) {
            activateDrawBoat(false, boatSize, "v");
        }
    }
    if (!selected) {
        document.addEventListener("mousedown", function boatInput(event) {
            drawText();
            if (event.clientX > canvasWidth && event.clientX < canvasWidth + boatSize * boxSize && event.clientY > 100 && event.clientY < 100 + boxSize) {
                var direction = "h";
                document.removeEventListener("mousedown", arguments.callee);
                selected = true;
            } else if (event.clientX > canvasWidth && event.clientX < canvasWidth + boxSize && event.clientY > 100 + boxSize && event.clientY < 100 + boatSize * boxSize) {
                var direction = "v";
                document.removeEventListener("mousedown", arguments.callee);
                selected = true;
            }
            if (selected) {
                document.addEventListener("mousedown", function boatInput(event) {
                    const boatSize = size(player);
                    if (direction == "h") {
                        boxX = Math.floor(event.clientX / boxSize) - Math.round(boatSize / 2);
                        boxY = Math.floor(event.clientY / boxSize);
                    } else if (direction == "v") {
                        boxX = Math.floor(event.clientX / boxSize);
                        boxY = Math.floor(event.clientY / boxSize) - Math.round(boatSize / 2);
                    }
                    if (checkIfSizeFits(boatSize, boxX, boxY, direction) && !isAnythingThere(boxX, boxY, boatSize, direction) && inPlayerArea(player, boxY) && boxX >= 0 && boxX < 10) {
                        activateDrawBoat();
                        c.clearRect(300, canvasHeight / 2 - 250, canvasWidth, canvasHeight);
                        document.removeEventListener("mousedown", arguments.callee);
                        selected = false;
                        const boat = new Boat(boatSize, boxX, boxY, direction);
                        if (player == 1) {
                            player1Boats.push(boat);
                        } else {
                            player2Boats.push(boat);
                        }
                        for (let i = 0; i < boatSize; i++) {
                            if (direction == "h") {
                                mapLayout[boxY][boxX + i] = 1;
                            } else if (direction == "v") {
                                mapLayout[boxY + i][boxX] = 1;
                            }
                        }
                        document.removeEventListener("mousemove", arguments.callee);
                        game();
                    }

                });

                document.addEventListener("mousemove", function func(event) {
                    if (!selected) {
                        document.removeEventListener("mousemove", arguments.callee);
                    } else {
                        activateDrawBoat();
                        activateDrawBoat(true, boatSize, direction, event);
                    }
                });
            } else {
                selected = false;
            }

        });
    }


}


function checkIfSizeFits(size, x, y, direction) {
    if (direction == "h") {
        if (x + size <= canvasWidth / boxSize) {
            return true;
        } else {
            return false;
        }
    } else if (direction == "v") {
        if (y + size <= canvasHeight / boxSize) {
            return true;
        } else {
            return false;
        }
    }
}


function isAnythingThere(x, y, size, direction) {
    if (direction == "h") {
        for (let i = 0; i < size; i++) {
            if (mapLayout[y][x + i] == 1) {
                return true;
            }
        }
    } else if (direction == "v") {
        for (let i = 0; i < size; i++) {
            if (mapLayout[y + i][x] == 1) {
                return true;
            }
        }
    }
    return false;
}

function inPlayerArea(player, boxY) {
    if (player == 2) {
        if (boxY >= 0 && boxY < 7) {
            return true;
        } else {
            return false;
        }
    } else if (player == 1) {
        if (boxY > 8 && boxY <= 15) {
            return true;
        } else {
            return false;
        }
    }
}

function game() {
    c.font = "20px serif";
    if (player1Boats.length < 5) {
        drawText("Player 1, Place a Boat", canvasWidth / 2 - c.measureText("Player 1, Place a Boat").width / 2, 140);
        placeBoats(1);
    } else if (player2Boats.length < 5) {
        document.removeEventListener("mousedown", arguments.callee);
        document.removeEventListener("mousemove", arguments.callee);
        drawText("Player 2, Place a Boat", canvasWidth / 2 - c.measureText("Player 2, Place a Boat").width / 2, canvasHeight - 140);
        placeBoats(2);
    } else {
        if(turn == 1 && !projectileInMotion){
            c.font = "20px serif";
            drawText("Player 1, Shoot!", canvasWidth / 2 - c.measureText("Player 1, Shoot!").width / 2, 140);
        } else if(turn == 2 && !projectileInMotion){
            c.font = "20px serif";
            drawText("Player 2, Shoot!", canvasWidth / 2 - c.measureText("Player 2, Shoot!").width / 2, canvasHeight - 140);
        }
        document.addEventListener("click", function (event) {
            if(turn == 2){
                document.removeEventListener("click", arguments.callee);
                projectiles.push(new Projectile(canvasWidth / 2 - (shooterImage.width - 300)*Math.sin(dToR(angle)), Math.abs((shooterImage.height - 300)*Math.cos(dToR(angle))), angle));
                turn = 1;
                angle = 0;
            } else{
                document.removeEventListener("click", arguments.callee);
                projectiles.push(new Projectile(canvasWidth / 2 + (shooterImage.width - 300)*Math.sin(dToR(angle)), canvasHeight - Math.abs((shooterImage.height - 300)*Math.cos(dToR(angle))), angle));
                turn = 2;
                angle = 0;
            }
        });
    }
}

// for (let i = 0; i < player1BoatsSizes.length; i++) {
//     player1Boats.push(new Boat(player1BoatsSizes[i], 0, 0, "h"));
// }
// for (let i = 0; i < player2BoatsSizes.length; i++) {
//     player2Boats.push(new Boat(player2BoatsSizes[i], 0, 0, "h"));
// }

backgroundImage.addEventListener("load", () => {
    game();
    const loop = () => {
        c.save();
        c.fillStyle = "white";
        c.fillRect(0, 0, canvas.width, canvas.height);
        c.restore();
        renderBackground();

        if(player1Boats.length == 5 && player2Boats.length == 5 && !projectileInMotion){
            loadShooter();
        }
        requestAnimationFrame(loop);
    }
    loop();
});
