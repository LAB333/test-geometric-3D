var tube = (function (){
  console.log("scene 1 loaded");

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
    loadShader("tube.vs", function(shader){   vs = shader ; 
                                                if(vs && fs){ 
                                                  init2();
                                            }
                                            });
    loadShader("tube.fs", function(shader){   fs = shader ; 
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
    
    
    path = [
      0., 0., 0.,
      1., 0., 0.,
      1., -1., 0.,
      -1., -1., 0.,
    ];

    var res = GeometryGenerator.initVerticeAndIndiceBuffer();

    GeometryGenerator.pushToVerticeAndIndiceBuffer(res, path, false);

    console.log("original path", path);

    for(var z = 0 ; z < 9 ; z++){
      path = GeometryGenerator.extrudePath(path,function(elem, index){ return index % 3 == 2 ? elem + 1 : elem  }, function(){});
      console.log("EXTRUDATE", path);
      GeometryGenerator.pushToVerticeAndIndiceBuffer(res, path);
    }

    worldVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(res.vertices), gl.STATIC_DRAW);
    console.log("res.vertices", res.vertices);
    worldVertexPositionBuffer.itemSize = 3;
    worldVertexPositionBuffer.numItems = res.vertices / 3;

    worldVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexColorBuffer);
    colors = [
        [1.0, 0.0, 0.0, 1.0]
    ];
    var unpackedColors = [];
    for(var i = 0; i< 80; i++){
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
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColors), gl.STATIC_DRAW);
    worldVertexColorBuffer.itemSize = 4;
    worldVertexColorBuffer.numItems = 80;

    

    worldVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, worldVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(res.indices), gl.STATIC_DRAW);
    worldVertexIndexBuffer.itemSize = 1;
    worldVertexIndexBuffer.numItems = res.vertices / 3;
    console.log("res.indices",res.indices);
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

    mat4.rotate(uMVMatrix, degToRad(rCube), [0, 0, 1]);

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