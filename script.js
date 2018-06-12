window.addEventListener("keydown", keyInputHandler, false);
window.addEventListener('mousemove', mouseInputHandler, false);
window.addEventListener('click', mouseInputHandler, false);

const ctx = document.getElementById("canvas").getContext("2d");
const tank = document.getElementById("tank");

const gameConstants = {
    fps: 120,
    gameWidth: 800,
    gameHeight: 600,
    playerOneTurretPos: 45,
    playerTwoTurretPos: 755,
    turretHeight: 570,
    projectileVelocity: 90,
    projectileRadius: 4,
    gravity: 9.8,
    tankLength: 35,
    tankHeight: 25,
    playerOneTankPos: 10,
    playerTwoTankPos: 755,
    playerOneTankColour: "green",
    playerTwoTankColour: "purple",
    projectileColour: "black"
}

const terrain = {
    vertexA: [100, 600],
    vertexB: [400, 300],
    vertexC: [700, 600]
}

// development variables
const playArea = gameConstants.gameHeight - gameConstants.tankHeight;
let playerOneTurn;
let playerOneScore = 0;
let playerTwoScore = 0;
let angle;
let fC = 0;
let tX, tY;
var animater;
var turret;

initializeGame();

if (localStorage === null || localStorage.length === 0) {
    localStorage.setItem("turn", true);
    localStorage.setItem("turns", 10);
    localStorage.setItem("player1", 0);
    localStorage.setItem("player2", 0);
}

function initializeGame() {
    document.getElementById("pO").innerHTML = `Player One Score: <b>${localStorage.getItem("player1")}</b>`
    document.getElementById("pT").innerHTML = `Player Two Score: <b>${localStorage.getItem("player2")}</b>`
    document.getElementById("turns").innerHTML = `Turns remaining: <b>${localStorage.getItem("turns")}</b>`
    spawnTanks();
    spawnTerrain();
}

function spawnTanks() {
    ctx.fillStyle = gameConstants.playerOneTankColour;
    ctx.fillRect(gameConstants.playerOneTankPos, playArea, gameConstants.tankLength, gameConstants.tankHeight);
    ctx.fillStyle = gameConstants.playerTwoTankColour;
    ctx.fillRect(gameConstants.playerTwoTankPos, playArea, gameConstants.tankLength, gameConstants.tankHeight);
}

function spawnTerrain() {
    ctx.beginPath();
    ctx.moveTo(...terrain.vertexA);
    ctx.lineTo(...terrain.vertexB);
    ctx.lineTo(...terrain.vertexC);
    ctx.closePath();
    ctx.stroke();    
}

function hardReset() {
    localStorage.clear();
    initializeGame();
    window.location.reload();
}

function drawProjectile() {
    ctx.beginPath();
    ctx.arc(tX, tY, gameConstants.projectileRadius, 0, Math.PI * 2);
    ctx.fillStyle = gameConstants.projectileColour;

    if (tY <= gameConstants.turretHeight) {
        ctx.fill();
        ctx.closePath();
    }
}

function renderGame() {
    playerOneTurn = localStorage.getItem("turn");
    animater = undefined;

    if (localStorage.getItem("turns") === "0") {
        if (parseInt(localStorage.getItem("player1") > parseInt(localStorage.getItem("player2")))) {
            alert("Game Over!\n\nPlayer 1 Wins!");
        } else {
            alert("Game Over!\n\nPlayer 2 Wins!");
        }
    }

    let terrainCollison = pointInTriangle([tX, tY], [terrain.vertexA, terrain.vertexB, terrain.vertexC]);

    if (terrainCollison) {
        switch (playerOneTurn) {
            case "true":
                localStorage.setItem("turn", false);
                deductTurn();
                alert("Player Two's Turn");
                break;
            case "false":
                localStorage.setItem("turn", true);
                alert("Player One's Turn");
                break;
        }
        reset();
        return;
    }

    if (tY > gameConstants.gameHeight || tY < 0 || tX > gameConstants.gameWidth || tX < 0) {
        switch (playerOneTurn) {
            case "true":
                localStorage.setItem("turn", false);
                deductTurn();
                alert("Player Two's Turn");
                break;
            case "false":
            alert("Player One's Turn");
                break;
        }
        reset();
        return;
    }

    if (tY > (gameConstants.gameHeight - gameConstants.tankHeight) && tX > gameConstants.playerOneTankPos && tX < (gameConstants.playerOneTankPos + gameConstants.tankLength)) {
        addScore(2);
        localStorage.setItem("turn", true);
        alert("Hit!\n\nPlayer Ones's Turn");
        deductTurn();
        reset();
        return;
    }

    if (tY > (gameConstants.gameHeight - gameConstants.tankHeight) && tX > gameConstants.playerTwoTankPos && tX < (gameConstants.playerTwoTankPos + gameConstants.tankLength)) {
        addScore(1);
        localStorage.setItem("turn", false);
        alert("Hit!\n\nPlayer Two's Turn");
        reset();
        return;
    }

    animater = requestAnimationFrame(renderGame);


    let xVel = gameConstants.projectileVelocity * Math.cos(angle * Math.PI / 180);
    let yVel = gameConstants.projectileVelocity * Math.sin(angle * Math.PI / 180);
    
    ctx.clearRect(0, 0, 800, 575);
    spawnTerrain();
    tY = gameConstants.turretHeight - (yVel * fC - (0.5 * gameConstants.gravity * Math.pow(fC, 2)));
    

    if (playerOneTurn === "true") {
        turret = gameConstants.playerOneTurretPos;

        tX = turret + xVel * fC;
    } else {
        turret = gameConstants.playerTwoTurretPos;
        tX = turret + -xVel * fC;
    }

    
    fC += 0.1;
    drawProjectile();
}

function addScore(player) {
    const stringCount = localStorage.getItem(`player${player}`);
    let count = parseInt(stringCount);
    count++;
    localStorage.setItem(`player${player}`, count);
    
}

function deductTurn() {
    const stringCount = localStorage.getItem("turns");
    let count = parseInt(stringCount);
    count--;
    localStorage.setItem(`turns`, count);
}

function keyInputHandler(input) {
    if (input.keyCode === 32) {
        if (!animater) {
            animater = requestAnimationFrame(renderGame);
        }
    }
    if (input.keyCode === 82) {
        reset();
    }    
}

function mouseInputHandler(input) {
    const canvasElement = document.getElementById("canvas");
    const area = canvasElement.getBoundingClientRect();
    const position = {
        xPos: (input.clientX - area.left) / (area.right - area.left) * gameConstants.gameWidth,
        yPos: (input.clientY - area.top) / (area.bottom - area.top) * gameConstants.gameHeight
    };


    ctx.clearRect(0, 0, 800, 600);

    ctx.beginPath()
    ctx.arc(position.xPos, position.yPos, 5, 0, Math.PI * 2, true);
    ctx.fillStyle = "orange";
    ctx.fill()

    initializeGame();


    if (input.type === "click") {
        const dY = position.yPos - (gameConstants.gameHeight - gameConstants.tankHeight);
        
        if (playerOneTurn === "true") {
            dX = position.xPos - gameConstants.playerOneTurretPos;
        } else {
            dX = position.xPos - gameConstants.playerTwoTurretPos;
        }


        const turretAngle =  Math.atan2(dY, dX) * 180 / Math.PI;

        if (-turretAngle > 90) {
            angle = 180 - (-turretAngle);
        } else {
            angle = -turretAngle
        }

        document.getElementById("pos").innerHTML = `Angle: <b>${angle.toFixed(0)}°</b>`
    }  
    
    document.getElementById("cord").innerHTML = `x: <b>${position.xPos.toFixed(0)}</b> y: <b>${position.yPos.toFixed(0)}</b>`
}

//https://github.com/mattdesl/point-in-triangle
//http://www.blackpawn.com/texts/pointinpoly/
function pointInTriangle(point, triangle) {
    //compute vectors & dot products
    var cx = point[0], cy = point[1],
        t0 = triangle[0], t1 = triangle[1], t2 = triangle[2],
        v0x = t2[0]-t0[0], v0y = t2[1]-t0[1],
        v1x = t1[0]-t0[0], v1y = t1[1]-t0[1],
        v2x = cx-t0[0], v2y = cy-t0[1],
        dot00 = v0x*v0x + v0y*v0y,
        dot01 = v0x*v1x + v0y*v1y,
        dot02 = v0x*v2x + v0y*v2y,
        dot11 = v1x*v1x + v1y*v1y,
        dot12 = v1x*v2x + v1y*v2y
    // Compute barycentric coordinates
    var b = (dot00 * dot11 - dot01 * dot01),
        inv = b === 0 ? 0 : (1 / b),
        u = (dot11*dot02 - dot01*dot12) * inv,
        v = (dot00*dot12 - dot01*dot02) * inv
    return u>=0 && v>=0 && (u+v < 1)
}

function reset() {
    if (animater) {
        window.cancelAnimationFrame(animater);
        animater = undefined;
    }
    window.location.reload();
}