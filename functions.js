var gl;

function initGL(canvas) {
  try {
    gl = canvas.getContext("experimental-webgl");
    computeViewport(gl, canvas);
  } catch (e) {
  }
  if (!gl) {
    alert("Could not initialise WebGL, sorry :-(");
  }
}

function computeViewport(gl, canvas){
  canvas.style.width = document.querySelector('body').clientWidth+'px';
  canvas.width = document.querySelector('body').clientWidth;
  gl.viewportWidth = document.querySelector('body').clientWidth;
  canvas.style.height = document.querySelector('body').clientHeight+'px';
  canvas.height = document.querySelector('body').clientHeight;
  gl.viewportHeight = document.querySelector('body').clientHeight;
}

function loader(){
  var overlay = document.createElement('div');
  overlay.id = 'overlay';
  var loader = document.createElement('div');
  loader.id = "loader";
  overlay.appendChild(loader);
  document.querySelector('body').appendChild(overlay);
  var checkLoadState = setInterval(loadingState,16);
  function loadingState(){
    var LS = getLoadingState();
    document.getElementById('loader').style.background = "linear-gradient(to right, white "+(LS*100)+"%, black "+(LS*100)+"%)";
    if(LS >= 1){
      clearInterval(checkLoadState);
      setTimeout(function(){
        document.querySelector('canvas').style.display = "block";
        overlay.parentNode.removeChild(overlay);
        start();
      }, 500);
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

var scenes = [
  {
    duration : 10000,
    state : "notLoaded",
    sceneName : "scene1",
    sceneObj : null
  },
  {
    duration : 10000,
    state : "notLoaded",
    sceneName : "scene2",
    sceneObj : null
  }
];

function collectSecenes(){
  scenes.map(function(elem){
    var o = eval(elem.sceneName);
    if(o){
      elem.sceneObj = o;
      elem.state="loading";
      elem.sceneObj.init(function(){elem.state = "ready"});
    } 
  });
  
  if(scenes.filter(function(elem){elem.state == "notLoaded"}).length != 0){
    setTimeout(collectSecenes, 100);
  }
} 

function getLoadingState(){
  var progress = (scenes.filter(function(elem){return elem.state == "ready"}).length / scenes.length) 
       + (scenes.filter(function(elem){return elem.state == "loading"}).length / scenes.length) * 0.5;
       //console.log("progress",progress);
  return  progress;
}

var lastTime = 0;
var timeNow = 0;
var startSceneTime = null;
var currentScene = null;

function startNextScene(){
  startSceneTime = new Date().getTime();    
  currentScene = currentScene != null ? currentScene + 1 : 0;
  console.log("currentScene", currentScene);
  console.log(scenes[currentScene]);
  if(currentScene >= scenes.length){
    //TODO stop gracefully the demo
  }else{
    scenes[currentScene].sceneObj.start();
    tick();
  }
}

function animate() {
  var elapsed = timeNow - lastTime;
  var elapsedInScene = timeNow - startSceneTime;
  scenes[currentScene].sceneObj.drawScene();
  scenes[currentScene].sceneObj.animate(elapsed, elapsedInScene);
}

function tick() {
  timeNow = new Date().getTime();
  if(scenes[currentScene]){
    if(lastTime - startSceneTime > scenes[currentScene].duration){
      startNextScene();
    }else{
      requestAnimFrame(tick);
      animate();
    } 
  }
  
  lastTime = timeNow;
}

function start(){
  lastTime = new Date().getTime();
  startNextScene();
  tick();
}

function webGLStart() {
  var canvas = document.querySelector('canvas');
  initGL(canvas);
  collectSecenes();

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
}