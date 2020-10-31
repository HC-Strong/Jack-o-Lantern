// When true, moving the mouse draws on the canvas
let isDrawing = false;
let x = 0;
let y = 0;
let cutStartX = 0;
let cutStartY = 0;

let fallTime = 1;
let fallSpeed = 4;
let groundY = 420;
let scatterRange = 120;

let glowPercent = 1;

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const doneBtn = document.getElementById('doneCarving');
const body = document.body;
const header = document.getElementById('header');

let curCarveLine = [];
let ptArr = [];
let shapeArr = [];
let fallingShapeArr = [];
let fallenShapeArr = [];

let isAnimating = false;
let isNight = false;

// Jack o' Lantern variables
let dayJack = {
  skin : "#ff7300",
  stem : "#9e753c",
  inside : "#e6a102",
  carveLine : "#ffd630",
  blur : 0
};
let nightJack = {
  skin : "#7a3801",
  stem : "#4f3420",
  inside : "#fff700",
  carveLine : "#4f3420",
  blur : 75
};

let jackOLantern = {
  colors : dayJack,
  lineWidth : 2,
  positionX : 400,
  positionY : 300,
  height : 400,
  width : 500
};


let shapeType = {
  cutout: jackOLantern.colors.inside,
  chunk: jackOLantern.colors.skin,
  line: 'rgba(0,0,0,0)' };

function setColors(timeOfDay){
  console.log("time of day is " + timeOfDay);
  if(timeOfDay === "day") {
    console.log("it's day");
    jackOLantern.colors = dayJack;
  } else {
    console.log("it's night");
    jackOLantern.colors = nightJack;
  }
  shapeType.cutout = jackOLantern.colors.inside;
  shapeType.chunk = jackOLantern.colors.skin;
  console.log(jackOLantern);
}


function initFallAnim() {
  window.requestAnimationFrame(animateChunk);
}
function initGlowAnim() {
  if(isNight) {
    window.requestAnimationFrame(animateGlow);
  }
}


// Add the drawing event listeners for mousedown, mousemove, and mouseup
function addCarvingListeners() {
  canvas.addEventListener('mousedown', startCarve);

  canvas.addEventListener('mousemove', carveOn);

  window.addEventListener('mouseup', endCarve);
}

function startCarve(e) {
  x = e.offsetX;
  y = e.offsetY;
  isDrawing = true;
  cutStartX = x;
  cutStartY = y;
  let pt1 = {x : x, y : y};
  let pt2 = {x : cutStartX, y : cutStartY};
  ptArr = [pt1, pt2];
}

function carveOn(e){
  if (isDrawing === true) {
    drawLine(context, x, y, e.offsetX, e.offsetY);
    ptArr.push({x:x, y:y});
    x = e.offsetX;
    y = e.offsetY;
    ptArr.push({x:x, y:y});
  }
}

function endCarve(e){
  if (isDrawing === true) {
    //Only draw the line here if the animation isn't active. If it is, the line must be drawn in the animation itself
    if (!isAnimating) {
      drawLine(context, x, y, e.offsetX, e.offsetY);
    }

    ptArr.push({x:x, y:y});
    x = 0;
    y = 0;
    isDrawing = false;
    // I'm having it draw a line from the end of the line the user drew to the staring point
    // Probably should check if it's within a radius of any point of the line and complete the cut or something
    drawLine(context, e.offsetX, e.offsetY, cutStartX, cutStartY);
    ptArr.push({x:cutStartX, y:cutStartY});

    shapeFromPoints(context, ptArr, shapeType.cutout, true);
    initFallAnim();
  }
}

function removeCarvingListeners() {
  canvas.removeEventListener('mousedown', startCarve);

  canvas.removeEventListener('mousemove', carveOn);

  window.removeEventListener('mouseup', endCarve);
}


function animateChunk() {
  isAnimating = true;
  context.globalCompositeOperation = 'source-over';
  context.clearRect(0, 0, 800, 600); // clear canvas - must match canvas dimensions

  drawPumpkin(context, jackOLantern);
  console.log("Static Shapes: " + shapeArr.length);

  //Draw pre-existing shapes
  for (let i=0; i<shapeArr.length; i++){
    shapeFromPoints(context, shapeArr[i], shapeType.cutout, false);
  }

  // Draw active carve line
  shapeFromPoints(context, ptArr, shapeType.line, false);

  // Draw fallen pieces
  for (let k = 0; k<fallenShapeArr.length; k++){
    let y = fallenShapeArr[k].offsetY;
    context.translate(0, y);
    shapeFromPoints(context, fallenShapeArr[k].shape, shapeType.chunk, false);
    context.translate(0, -y);
  }

  //Animate current pieces falling
  let lastOffset = 0;
  let newOffset = 0;
  let curShape;
  for (let j=fallingShapeArr.length-1; j>=0; j--) {
    curShape = fallingShapeArr[j];
    newOffset = fallSpeed*curShape.fallCounter
    context.translate(0, newOffset-lastOffset);
    shapeFromPoints(context, curShape.shape, shapeType.chunk, false);
    curShape.fallCounter++;
    lastOffset = newOffset;

    //Remove shape from falling shapes array if its fall has completed
    let yPos = curShape.fallCounter*fallSpeed + curShape.shapeTop;
    if( yPos >= groundY + curShape.randOffset) {
      fallenShapeArr.push({shape : curShape.shape, offsetY : newOffset});
      fallingShapeArr.splice(j, 1);
    }
  }
  context.translate(0, -lastOffset);

  context.restore();

  if(fallingShapeArr.length>0){
    window.requestAnimationFrame(animateChunk);
  } else {
    console.log("No falling chunks");
    isAnimating = false;
  }
  addCarvingListeners();
}

function animateGlow(){
  glowPercent = (7*glowPercent + 0.5 + Math.random())/8;
  animateChunk();
  if(isNight){
    window.requestAnimationFrame(animateGlow);
  } else {
    glowPercent = 1;
  }

}

// Takes canvas context and array of objects containing x and y properties as point coordinates
// shape parm sets fill color. Use shapeType object properties
// If optional 4th parm (newShape) is true, the shape will be saved to the shapeArr so it will be redrawn during animation
function shapeFromPoints(context, ptArr, shape, newShape) {
  context.beginPath();
  context.moveTo(ptArr[0].x, ptArr[0].y);

  for (i=0; i<ptArr.length; i++){
    //console.log(ptArr[i]);
    context.lineTo(ptArr[i].x, ptArr[i].y);
    context.strokeStyle = jackOLantern.colors.inside;
    context.stroke();
  }
  context.fillStyle = shape;
  if(shape === shapeType.cutout) {
    context.shadowColor = jackOLantern.colors.inside;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.shadowBlur = jackOLantern.colors.blur/3 * glowPercent;
    context.fill();
    context.fill();
    context.shadowBlur = jackOLantern.colors.blur * glowPercent;
    context.fill();
    context.fill();
    context.fill();
    context.shadowColor = "red";

  }
  context.fill();
  context.shadowBlur = 0;
  if(shape === shapeType.chunk){
    context.strokeStyle = jackOLantern.colors.carveLine;
    context.lineWidth = 1;
    context.stroke();
  }

// If it's a new shape, add it to the array of shapes already drawn so they can be redrawn when canvas is cleared for animation
// Also add object literal of ptArr and fallCounter int to fallingShapeArr so the chunk can be animated falling down
  if (newShape) {
    shapeArr.push(ptArr);
    let shapeTop = Math.min.apply(Math, ptArr.map(function(o) { return o.y; })); // TO DO: revisit this and figure out why it works... lol
    console.log("shapeTop is " + shapeTop);
    fallingShapeArr.push({shape : ptArr, fallCounter : 0, shapeTop : shapeTop, randOffset : Math.floor(Math.random()*scatterRange) });
  }
}


function drawLine(context, x1, y1, x2, y2) {
  context.beginPath();
  context.strokeStyle = jackOLantern.colors.inside;
  context.lineWidth = jackOLantern.lineWidth;
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.closePath();
}

// Draws Pumpkin
function drawPumpkin(context) {
  // Pumpkin base
  context.beginPath();
  context.ellipse(
    jackOLantern.positionX-jackOLantern.width/3.5, jackOLantern.positionY,
    jackOLantern.width/3, jackOLantern.height/2, -0.35 , 0, Math.PI*2);
    context.ellipse(
      jackOLantern.positionX, jackOLantern.positionY,
      jackOLantern.width/2, jackOLantern.height/2, 0 , 0, Math.PI*2);
    context.ellipse(
      jackOLantern.positionX+jackOLantern.width/3.5, jackOLantern.positionY,
      jackOLantern.width/3, jackOLantern.height/2, 0.35, 0, Math.PI*2);
  context.fillStyle = jackOLantern.colors.skin;
  context.fill();
// Pumpkin stem
  context.beginPath();
  context.strokeStyle = jackOLantern.colors.stem;
  context.lineWidth = jackOLantern.lineWidth;
  context.moveTo(jackOLantern.positionX, jackOLantern.positionY-jackOLantern.height/2);
  context.lineTo(jackOLantern.positionX+50, jackOLantern.positionY-jackOLantern.height/2-50);
  context.lineTo(jackOLantern.positionX+50+10, jackOLantern.positionY-jackOLantern.height/2-50+10);
  context.lineTo(jackOLantern.positionX+20, jackOLantern.positionY-jackOLantern.height/2+1);
  context.stroke();
  context.closePath();
  context.fillStyle = jackOLantern.colors.stem;
  context.fill();
}

drawPumpkin(context, jackOLantern);
addCarvingListeners();



doneBtn.addEventListener('click', e => {
  if(shapeArr.length===0){
    alert("No you're not! That pumpkin doesn't look carved to me! 🎃");
    return;
  }
  let timeOfDay = body.className;
  if(timeOfDay === "day") {
    setColors("night");
    body.className = "night";
    header.textContent = "Happy Halloween!";
    doneBtn.textContent = "Keep Carving";
    fallenShapeArr = [];
    animateChunk();
    removeCarvingListeners();
    isNight = true;
    initGlowAnim();
  } else {
    setColors("day");
    body.className = "day";
    header.textContent = "Carve Your Jack o' Lantern!";
    doneBtn.textContent = "Done Carving";
    animateChunk();
    addCarvingListeners();
  }
});
