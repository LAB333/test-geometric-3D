var scene2 = (function (){
  console.log("scene 2 loaded");

  var vs= null;
  var fs= null;
  var shaderProgram = null;

  function init(callback){

    var init2 = function(){
      shaderProgram  = initShaders(vs,fs);
      console.log(shaderProgram);
      useProgram(shaderProgram);
      initAttributesAndUniforms(shaderProgram, ["aVertexPosition","aVertexColor"], ["uPMatrix","uMVMatrix"]);
      initBuffers();
      setTimeout(callback,500 + Math.random()*500);
    }

    //load requiered stuff
    loadShader("scene2.vs", function(shader){   vs = shader ; 
                                                if(vs && fs){ 
                                                  init2();
                                              }
                                            });
    loadShader("scene2.fs", function(shader){   fs = shader ; 
                                                if(vs && fs){ 
                                                  init2();
                                              }
                                            });

  }


  var pyramidVertexPositionBuffer;
  var pyramidVertexColorBuffer;
  var cubeVertexPositionBuffer;
  var cubeVertexColorBuffer;
  var cubeVertexIndexBuffer;

  var uMVMatrix = mat4.create();
  var uMVMatrixStack = [];
  var uPMatrix = mat4.create();

  function mvPushMatrix() {
      var copy = mat4.create();
      mat4.set(uMVMatrix, copy);
      uMVMatrixStack.push(copy);
  }

  function mvPopMatrix() {
      if (uMVMatrixStack.length == 0) {
          throw "Invalid popMatrix!";
      }
      uMVMatrix = uMVMatrixStack.pop();
  }

  function initBuffers() {
    pyramidVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
    var vertices = [
        // Front face
         0.0,  1.0,  0.0,
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,

        // Right face
         0.0,  1.0,  0.0,
         1.0, -1.0,  1.0,
         1.0, -1.0, -1.0,

        // Back face
         0.0,  1.0,  0.0,
         1.0, -1.0, -1.0,
        -1.0, -1.0, -1.0,

        // Left face
         0.0,  1.0,  0.0,
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    pyramidVertexPositionBuffer.itemSize = 3;
    pyramidVertexPositionBuffer.numItems = 12;

    pyramidVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
    var colors = [
        // Front face
        1.0, 0.0, 1.0, 1.0,
        0.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 1.0, 1.0,

        // Right face
        1.0, 1.0, 1.0, 1.0,
        0.2, 0.2, 0.8, 1.0,
        0.2, 0.2, 0.8, 1.0,

        // Back face
        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,
        1.0, 1.0, 1.0, 1.0,

        // Left face
        1.0, 0.5, 0.5, 1.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, 1.0, 0.5, 1.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    pyramidVertexColorBuffer.itemSize = 4;
    pyramidVertexColorBuffer.numItems = 12;


    cubeVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    vertices = [
        // Front face
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,

        // Back face
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0, -1.0, -1.0,

        // Top face
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
         1.0,  1.0,  1.0,
         1.0,  1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,

        // Right face
         1.0, -1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0,  1.0,  1.0,
         1.0, -1.0,  1.0,

        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    cubeVertexPositionBuffer.itemSize = 3;
    cubeVertexPositionBuffer.numItems = 24;

    cubeVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
    colors = [
        [1.0, 1.0, 1.0, 1.0], // Front face
        [0.0, 0.0, 0.0, 1.0], // Back face
        [0.5, 0.0, 0.5, 1.0], // Top face
        [0.5, 0.1, 0.5, 1.0], // Bottom face
        [0.8, 0.2, 1.0, 1.0], // Right face
        [0.7, 0.0, 1.0, 1.0]  // Left face
    ];
    var unpackedColors = [];
    for (var i in colors) {
        var color = colors[i];
        for (var j=0; j < 4; j++) {
            unpackedColors = unpackedColors.concat(color);
        }
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColors), gl.STATIC_DRAW);
    cubeVertexColorBuffer.itemSize = 4;
    cubeVertexColorBuffer.numItems = 24;

    cubeVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    var cubeVertexIndices = [
        0, 1, 2,      0, 2, 3,    // Front face
        4, 5, 6,      4, 6, 7,    // Back face
        8, 9, 10,     8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15, // Bottom face
        16, 17, 18,   16, 18, 19, // Right face
        20, 21, 22,   20, 22, 23  // Left face
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
    cubeVertexIndexBuffer.itemSize = 1;
    cubeVertexIndexBuffer.numItems = 36;
  }


  var rPyramid = 0;
  var rCube = 0;

  function drawScene() {

    if(!shaderProgram){
      console.log("not ready yet");
      return; //do not do anything yet. Program is not loaded !
    } 


    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, uPMatrix);

    mat4.identity(uMVMatrix);

    mat4.translate(uMVMatrix, [-1.5, 0.0, -8.0]);

    mvPushMatrix();
    mat4.rotate(uMVMatrix, degToRad(rPyramid), [0, 1, 0]);

    gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.aVertexPosition, pyramidVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.aVertexColor, pyramidVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    setMatrixUniforms(shaderProgram, uPMatrix, uMVMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, pyramidVertexPositionBuffer.numItems);

    mvPopMatrix();


    mat4.translate(uMVMatrix, [3.0, 0.0, 0.0]);

    mvPushMatrix();
    mat4.rotate(uMVMatrix, degToRad(rCube), [1, 1, 1]);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.aVertexPosition, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.aVertexColor, cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    setMatrixUniforms(shaderProgram, uPMatrix, uMVMatrix);
    gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    mvPopMatrix();

  } 


  function animate(elapsed){
    rPyramid += (90 * elapsed) / 1000.0;
    rCube -= (75 * elapsed) / 1000.0;
  }

  function start(){
    useProgram(shaderProgram);
  }



  return {
    init,
    initBuffers,
    drawScene,
    animate,
    start
  }

})();