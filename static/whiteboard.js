//set up the canvas and context
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");
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
    
    if(mouseDown === true){
      //console.log(tool)
      if(tool == "1"){//pen
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
      }
      else{//eraser
        //console.log("eraser");
        ctx.strokeStyle = 'white'; 
        ctx.lineWidth = 20;
      }
      
            
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(mousePos.x, mousePos.y);
      ctx.stroke();
      
      pingServer(x,y,mousePos.x,mousePos.y);

      x = mousePos.x;
      y = mousePos.y;
      ctx.fillStyle = "white";
    }  
    else{
      x=mousePos.x;
      y=mousePos.y;
    }
  
}, false);

//Get Mouse Position
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

canvas.onmousedown = function(e){
    mousedown.innerHTML = "down";
    mouseDown = true;
    var mousePos = getMousePos(canvas, e);
  
    tool = document.getElementById("toolSelect").value;
}
canvas.onmouseup = function(e){
    mousedown.innerHTML = "up";
    mouseDown = false;
}

function clearFunction(){
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.getAttribute("height"), canvas.getAttribute("width"));
}

function drawLine(x1,y1,x2,y2){
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
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

  async function pingServer(x1,y1,x2,y2){
      console.log("ping")
    responseVal = JSON.stringify({ action: "draw", x_1:x1, y_1:y1, x_2:x2, y_2:y2});
    console.log(responseVal);
    websocket.send(responseVal);
  }

