var tube2 = (function (){
  console.log("tube2 loaded");

  var vs = null;
  var fs = null;
  var shaderProgram = null;

  function init(callback){

    var init2 = function(){
      shaderProgram  = initShaders(vs,fs);
      console.log(shaderProgram);
      useProgram(shaderProgram);
      initAttributesAndUniforms(shaderProgram, ["aVertexPosition","aVertexColor"], ["uPMatrix","uMVMatrix"]);
      initBuffers();
      setTimeout(callback, 2000 + Math.random()*3000);
    }

    //load required stuff
    loadShader("tube2.vs", function(shader){   vs = shader ; 
                                                if(vs && fs){ 
                                                  init2();
                                            }
                                            });
    loadShader("tube2.fs", function(shader){   fs = shader ; 
                                                if(vs && fs){ 
                                                  init2();
                                              }
                                            });

  }



  var worldVertexPositionBuffer;
  var worldVertexColorBuffer;
  var worldVertexIndexBuffer;

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
    
    worldVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexPositionBuffer);
    vertices = [];
    for(var iZ = 0 ; iZ < 2 ; iZ++){
      for(var iX = 0 ; iX < 10 ; iX++){
        for(var iY = 0 ; iY < 2 ; iY++){
          vertices.push(iX);
          vertices.push(iY);
          vertices.push(iZ);
        }
      }
    }

    for(var iY = 0 ; iY < 2 ; iY++){
      for(var iX = 0 ; iX < 10 ; iX++){
        for(var iZ = 0 ; iZ < 2 ; iZ++){
          vertices.push(iX);
          vertices.push(iY);
          vertices.push(iZ);
        }
      }
    }

    console.log(vertices);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    worldVertexPositionBuffer.itemSize = 3;
    worldVertexPositionBuffer.numItems = 40;

    worldVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexColorBuffer);
    colors = [
        [1.0, 0.0, 0.0, 1.0]
    ];
    var unpackedColors = [];
    for(var i = 0; i < 80; i++){
      switch(i%4){
        case 0:
          unpackedColors = unpackedColors.concat([1.0, 0.0, 0.0, 1.0]);
          break;
        case 1:
          unpackedColors = unpackedColors.concat([0.0, 1.0, 0.0, 1.0]);
          break;
        case 2:
          unpackedColors = unpackedColors.concat([0.0, 0.0, 1.0, 1.0]);
          break;
        case 3:
          unpackedColors = unpackedColors.concat([1.0, 1.0, 1.0, 1.0]);
          break;
      }
      /*if(i<20){unpackedColors = unpackedColors.concat([1.0, 0.0, 0.0, 1.0]);}
      if(20<=i && i<40){unpackedColors = unpackedColors.concat([0.0, 1.0, 0.0, 1.0]);}
      if(40<=i && i<60){unpackedColors = unpackedColors.concat([0.0, 0.0, 1.0, 1.0]);}
      if(60<=i && i<80){unpackedColors = unpackedColors.concat([1.0, 1.0, 1.0, 1.0]);}*/
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColors), gl.STATIC_DRAW);
    worldVertexColorBuffer.itemSize = 4;
    worldVertexColorBuffer.numItems = 80;

    worldVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, worldVertexIndexBuffer);
    var worldVertexIndices = [];
    var i = 0;
    for(var j = 0 ; j < 4 ; j++){
      for(var l = 0 ; l < 18 ; i+=2, l+=2){
        worldVertexIndices.push(i);
        worldVertexIndices.push(i+1.);
        worldVertexIndices.push(i+2.);
        worldVertexIndices.push(i+2.);
        worldVertexIndices.push(i+1.);
        worldVertexIndices.push(i+3.);
      }
    }

    console.log(worldVertexIndices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(worldVertexIndices), gl.STATIC_DRAW);
    worldVertexIndexBuffer.itemSize = 1;
    worldVertexIndexBuffer.numItems = 216;
  }


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

    mat4.translate(uMVMatrix, [0.0, 0.0, -8.0]);

    mvPushMatrix();
    //mat4.rotate(uMVMatrix, degToRad(rPyramid), [0, 1, 0]);

    mat4.rotate(uMVMatrix, degToRad(rCube), [1, 1, 1]);

    gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.aVertexPosition, worldVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.aVertexColor, worldVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, worldVertexIndexBuffer);
    setMatrixUniforms(shaderProgram, uPMatrix, uMVMatrix);
    gl.drawElements(gl.TRIANGLES, worldVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    mvPopMatrix();

  } 


  function animate(elapsed){
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