// When true, moving the mouse draws on the canvas
let isDrawing = false;
let x = 0;
let y = 0;
let cutStartX = 0;
let cutStartY = 0;

let fallTime = 1;
let fallSpeed = 10;

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

let ptArr = [];
let shapeArr = [];
let fallingShapeArr = [];
let curCarveLine = [];

// Jack o' Lantern variables
let jackOLantern = {
  dayColor : "#ff7300",
  nightColor : "#7a3801",
  stemColor : "#6e5430",
  insideColor : "#ffd630",
  positionX : 300,
  positionY : 250,
  height : 240,
  width : 300
};

function initAnim() {
  window.requestAnimationFrame(animateChunk);
}


// Add the drawing event listeners for mousedown, mousemove, and mouseup
function addAllListeners() {
  canvas.addEventListener('mousedown', e => {
    x = e.offsetX;
    y = e.offsetY;
    isDrawing = true;
    cutStartX = x;
    cutStartY = y;
    let pt1 = {x : x, y : y};
    let pt2 = {x : cutStartX, y : cutStartY};
    ptArr = [pt1, pt2];
  });

  canvas.addEventListener('mousemove', e => {
    if (isDrawing === true) {
      drawLine(context, x, y, e.offsetX, e.offsetY);
      ptArr.push({x:x, y:y});
      x = e.offsetX;
      y = e.offsetY;
      ptArr.push({x:x, y:y});
    }
  });

  window.addEventListener('mouseup', e => {
  if (isDrawing === true) {
    drawLine(context, x, y, e.offsetX, e.offsetY);
    ptArr.push({x:x, y:y});
    x = 0;
    y = 0;
    isDrawing = false;
    // I'm having it draw a line from the end of the line the user drew to the staring point
    // Probably should check if it's within a radius of any point of the line and complete the cut or something
    drawLine(context, e.offsetX, e.offsetY, cutStartX, cutStartY);
    ptArr.push({x:cutStartX, y:cutStartY});

    let newShape = true;
    let filled = true;
    shapeFromPoints(context, ptArr, filled, newShape);
    initAnim();
  }
});
}

function animateChunk() {
  //context.globalCompositeOperation = 'destination-over';
  context.globalCompositeOperation = 'source-over';
  context.clearRect(0, 0, 600, 500); // clear canvas - must match canvas dimensions

// compositing info: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Compositing
  drawPumpkin(context, jackOLantern);
  console.log("Length of Shapes Array: " + shapeArr.length);
  for (let i=0; i<shapeArr.length; i++){
    console.log(i);
    let newShape = false;
    let filled = true;
    shapeFromPoints(context, shapeArr[i], filled, newShape);
  }

  context.translate(0, fallSpeed*fallTime);
  let newShape = false;
  let filled = true;
  shapeFromPoints(context, shapeArr[shapeArr.length-1], false, true);
  context.translate(0, -fallSpeed*fallTime);
  fallTime++;

  context.restore();
  filled = false;
  shapeFromPoints(context, ptArr, false, false);

  if(fallTime<100){
    window.requestAnimationFrame(animateChunk);
  } else {
    fallTime = 0;
    console.log("chunk finished falling");
  }
  addAllListeners();
  //drawPumpkin(context, jackOLantern);

}

// Takes canvas context and array of objects containing x and y properties as point coordinates
// If optional 3rd parm (filled) is true, shape will be filled
// If optional 4th parm (newShape) is true, the shape will be saved to the shapeArr so it will be redrawn during animation
function shapeFromPoints(context, ptArr, filled, newShape) {
  context.beginPath();
  context.moveTo(ptArr[0].x, ptArr[0].y);

  for (i=0; i<ptArr.length; i++){
    //console.log(ptArr[i]);
    context.lineTo(ptArr[i].x, ptArr[i].y);
  }

  //context.closePath();

  if(filled){
    context.fillStyle = jackOLantern.insideColor;
    context.fill();
  } else {
    context.strokeStyle = "blue";//jackOLantern.insideColor;
    context.lineWidth = 1;
    context.stroke();
  }

  if (newShape) { // If it's a new shape, add it to the array of shapes already drawn so they can be redrawn when canvas is cleared for animation
    shapeArr.push(ptArr);
  }
}


function drawLine(context, x1, y1, x2, y2) {
  context.beginPath();
  context.strokeStyle = "red";//jackOLantern.insideColor;
  context.lineWidth = 1;
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.closePath();
}

// Draws Pumpkin based on data in object passed as second parameter
function drawPumpkin(context, jack) {
  // Pumpkin base
  context.beginPath();
  context.ellipse(
    jack.positionX-jack.width/3.5, jack.positionY,
    jack.width/3, jack.height/2, -0.35 , 0, Math.PI*2);
    context.ellipse(
      jack.positionX, jack.positionY,
      jack.width/2, jack.height/2, 0 , 0, Math.PI*2);
    context.ellipse(
      jack.positionX+jack.width/3.5, jack.positionY,
      jack.width/3, jack.height/2, 0.35, 0, Math.PI*2);
  context.fillStyle = jack.dayColor;
  context.fill();

// Pumpkin stem
  context.beginPath();
  context.strokeStyle = jackOLantern.stemColor;
  context.lineWidth = 1;
  context.moveTo(jack.positionX, jack.positionY-jack.height/2);
  context.lineTo(jack.positionX+50, jack.positionY-jack.height/2-50);
  context.lineTo(jack.positionX+50+10, jack.positionY-jack.height/2-50+10);
  context.lineTo(jack.positionX+20, jack.positionY-jack.height/2+1);
  context.stroke();
  context.closePath();
  context.fillStyle = jack.stemColor;
  context.fill();
}

drawPumpkin(context, jackOLantern);
addAllListeners();
