//set up the canvas and context
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");
hasInput = false;
currentTextBox = null;
//var toolSelect = document.getElementById("toolSelect");
var mouseDown = false;
ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.getAttribute("height"), canvas.getAttribute("width"));
tool = "Pen"
var x = 0;
var y = 0;

const websocket = new WebSocket("ws://127.0.0.1:6789/");

//report the mouse position on click
canvas.addEventListener("mousemove", function (evt) {
    var mousePos = getMousePos(canvas, evt);
    x.innerHTML = mousePos.x;
    y.innerHTML = mousePos.y;
    //if mouse down and moving - draw
    if(mouseDown === true){
      draw(mousePos.x, mousePos.y, x,y);
      x = mousePos.x;
      y = mousePos.y;
    }  
    else{
      x=mousePos.x;
      y=mousePos.y;
    }
}, false);

function draw(oldX, oldY, x,y){
  switch(tool){
    case "1"://pen
      drawLine(x,y,oldX,oldY,1,"black");
      break;
    case "2"://eraser
      drawLine(x,y,oldX,oldY,20,"white");
      break;
  } 
}

function drawLine(x1,y1,x2,y2,width, color){
  ctx.strokeStyle = color; 
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  pingServer("draw",x1,y1,x2,y2);
  ctx.fillStyle = "white";
}

function addTextbox(x,y){
  textBox = document.createElement('input');
  textBox.type = 'text';
  textBox.style.position = 'fixed';
  textBox.style.left = (x) + 'px';
  textBox.style.top = (y) + 'px';
  textBox.onkeydown = makeTextbox;
  document.body.appendChild(textBox);
  textBox.focus();
  hasInput = true;
  ctx.fillStyle = "white";
  currentTextBox = textBox;    
}

function drawText(txt, x, y) {
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.font = '14px sans-serif';
  ctx.fillStyle = "black";
  ctx.fillText(txt, x - 4, y - 4);
  pingServerText("text", x,y,txt);
}

function makeTextbox(e){
  var keyCode = e.keyCode;
  if (keyCode === 13) {
      drawText(this.value, parseInt(this.style.left, 10), parseInt(this.style.top, 10));
      document.body.removeChild(this);
      hasInput = false;
  }
}

//Get Mouse Position
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

canvas.onmousedown = function(e){
    mouseDown = true;
    var mousePos = getMousePos(canvas, e);
    tool = document.getElementById("toolSelect").value;
    if(hasInput){
      document.body.removeChild(currentTextBox);
      hasInput = false;
    }
    if(tool == "3"){
      x = mousePos.x; 
      y = mousePos.y;
      if(!hasInput){
        addTextbox(x,y);
      }
      else{
        document.body.removeChild(currentTextBox);
        addTextbox(x,y);
      }
    }
}
canvas.onmouseup = function(e){
    mouseDown = false;
}

function clearFunction(){
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.getAttribute("height"), canvas.getAttribute("width"));
}

window.addEventListener("DOMContentLoaded", () => {  
  websocket.onmessage = ({ data }) => {
    const event = JSON.parse(data);
    switch (event.type) {
      case "users":
        const users = `${event.count} user${event.count == 1 ? "" : "s"}`;
        document.querySelector(".users").textContent = users;
        break;
      case "draw":
          drawLine(event["x_1"],event["y_1"],event["x_2"],event["y_2"])
      default:
        console.error("unsupported event", event);
    }
  };
});

async function pingServer(action_type,x1,y1,x2,y2){
  console.log("ping");
  responseVal = JSON.stringify({ action: action_type, x_1:x1, y_1:y1, x_2:x2, y_2:y2});
  console.log(responseVal);
  websocket.send(responseVal);
}

async function pingServerText(action_type, x, y, text_val){
  responseVal = JSON.stringify({ action: action_type, x_1:x, y_1:y, text:text_val});
  console.log(responseVal);
  websocket.send(responseVal);
}


