var gl;

function initGL(canvas) {
  try {
    gl = canvas.getContext("experimental-webgl");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
  } catch (e) {
  }
  if (!gl) {
    alert("Could not initialise WebGL, sorry :-(");
  }
}

function loadShader(url, callback){
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if(xhr.readyState == XMLHttpRequest.DONE) {
      var response = xhr.responseText;
      callback(response);
    }
  };
  xhr.open("GET", url, true);
  xhr.responseType = "text";
  xhr.send();
}

function initShaders(vertexSource, fragmentSource){
  var vertexShader, fragmentShader;
  vertexShader = gl.createShader(gl.VERTEX_SHADER);
  fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  gl.shaderSource(vertexShader, vertexSource);
  gl.shaderSource(fragmentShader, fragmentSource);

  gl.compileShader(vertexShader);
  gl.compileShader(fragmentShader);

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
    var info = gl.getShaderInfoLog(vertexShader);
    throw 'Could not compile WebGL program. \n\n' + info;
  }
  if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
    var info = gl.getShaderInfoLog(fragmentShader);
    throw 'Could not compile WebGL program. \n\n' + info;
  }
 
}

function useProgram( shaderProgram ){
  gl.useProgram(shaderProgram);
}

function initAttributesAndUniforms(attributesNames, uniformsNames){
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}

function setMatrixUniforms(pMatrix, mvMatrix) {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}


function degToRad(degrees) {
  return degrees * Math.PI / 180;
}


var scenes = [];
var currentScene = 0;
function collectSecenes(){
  scenes.push(scene1);
  scene1.init();
}

var lastTime = 0;

function animate() {
  var timeNow = new Date().getTime();
  if (lastTime != 0) {
    var elapsed = timeNow - lastTime;
    scenes[currentScene].animate(elapsed);
  }
  lastTime = timeNow;
}


function tick() {
  requestAnimFrame(tick);
  scenes[currentScene].drawScene();
  animate();
}



function webGLStart() {
  collectSecenes();
  var canvas = document.querySelector('canvas');

  initGL(canvas);
  scenes[currentScene].initBuffers(); //TODO this should be called once per scene

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  tick();
}