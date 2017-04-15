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

function loader(){
  var overlay = document.createElement('div');
  overlay.id = 'overlay';
  document.querySelector('body').appendChild(overlay);
  var checkLoadState = setInterval(loadingState,100);
  function loadingState(){
    var LS = getLoadingState;
    console.log(LS);
    if(LS <= 1){
      clearInterval(checkLoadState);
      document.querySelector('canvas').style.display = "block";
      start();
    }
  }
}

loader();

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
  return shaderProgram;
}

function useProgram(shaderProgram){
  gl.useProgram(shaderProgram);
}

function initAttributesAndUniforms(shaderProgram, attributesNames, uniformsNames){
  for(i = 0, k = attributesNames.length ; i < k ; i++){
    shaderProgram[attributesNames[i]+'Attribute'] = gl.getAttribLocation(shaderProgram, "a"+attributesNames[i]);
    gl.enableVertexAttribArray(shaderProgram[attributesNames[i]+'Attribute']);
  }
  for(i = 0, k = uniformsNames.length ; i < k ; i++){
    shaderProgram[uniformsNames[i]+'Uniform'] = gl.getUniformLocation(shaderProgram, "u"+uniformsNames[i]);
  }
}

function setMatrixUniforms(shaderProgram, pMatrix, mvMatrix) {
  gl.uniformMatrix4fv(shaderProgram.PMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.MVMatrixUniform, false, mvMatrix);
}


function degToRad(degrees) {
  return degrees * Math.PI / 180;
}


var currentScene = 0;
var scenes = [
  {
    duration : 10000,
    state : "notLoaded",
    sceneName : "scene1",
    sceneObj : null
  }
];

function collectSecenes(){
  scenes.map(function(elem){
    var o = eval(elem.sceneName);
    if(o){
      elem.sceneObj = o;
      o.init(function(){elem.state = "ready"});
      o.state="loaded";
    } 
  });
  
  if(scenes.filter(function(elem){elem.state == "notLoaded"}).length != 0){
    setTimeout(collectSecenes, 100);
  }
} 

function getLoadingState(){
  return scenes.filter(function(elem){elem.state == "ready"}).length / scenes.length;
}

  
var lastTime = 0;

function animate() {
  var timeNow = new Date().getTime();
  if (lastTime != 0) {
    var elapsed = timeNow - lastTime;
    scenes[currentScene].sceneObj.animate(elapsed);
  }
  lastTime = timeNow;
}


function tick() {
  requestAnimFrame(tick);
  scenes[currentScene].sceneObj.drawScene();
  animate();
}

function start(){
  //TODO stuff to manage time here ! 
  tick();
}


function webGLStart() {
  
  var canvas = document.querySelector('canvas');
  initGL(canvas);
  collectSecenes();

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
}