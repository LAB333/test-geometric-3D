var scene1 = (function (){
  console.log("scene 1 loaded");

  var vs= null;
  var fs= null;
  var shaderProgram = null;

  function init(callback){

    var init2 = function(){
      shaderProgram  = initShaders(vs,fs);
      console.log(shaderProgram);
      useProgram(shaderProgram);
      initAttributesAndUniforms(shaderProgram, ["VertexPosition","VertexColor"], ["PMatrix","MVMatrix"]);
      initBuffers();
      callback();
    }

    //load requiered stuff
    loadShader("scene1.vs", function(shader){   vs = shader ; 
                                                if(vs && fs){ 
                                                  init2();
                                              }
                                            });
    loadShader("scene1.fs", function(shader){   fs = shader ; 
                                                if(vs && fs){ 
                                                  init2();
                                              }
                                            });

  }



  var worldVertexPositionBuffer;
  var worldVertexColorBuffer;
  var worldVertexIndexBuffer;

  var mvMatrix = mat4.create();
  var mvMatrixStack = [];
  var pMatrix = mat4.create();

  function mvPushMatrix() {
      var copy = mat4.create();
      mat4.set(mvMatrix, copy);
      mvMatrixStack.push(copy);
  }

  function mvPopMatrix() {
      if (mvMatrixStack.length == 0) {
          throw "Invalid popMatrix!";
      }
      mvMatrix = mvMatrixStack.pop();
  }

  function initBuffers() {
    
    worldVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexPositionBuffer);
    vertices = [
        /*//first square
        0.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 1.0, 0.0,
        0.0, 1.0, 0.0*/
    ];
    for(var i =0;i < 10; i++){
      vertices.push(i);
      vertices.push(0.);
      vertices.push(0.);
      vertices.push(i);
      vertices.push(1.);
      vertices.push(0.);
    }

    console.log(vertices);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    worldVertexPositionBuffer.itemSize = 3;
    worldVertexPositionBuffer.numItems = 20;

    worldVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexColorBuffer);
    colors = [
        [1.0, 0.0, 0.0, 1.0]/*, // Front face
        [1.0, 1.0, 0.0, 1.0], // Back face
        [0.0, 1.0, 0.0, 1.0], // Top face
        [1.0, 0.5, 0.5, 1.0], // Bottom face
        [1.0, 0.0, 1.0, 1.0], // Right face
        [0.0, 0.0, 1.0, 1.0]  // Left face*/
    ];
    var unpackedColors = [];
    /*for (var i in colors) {
        var color = colors[i];
        for (var j=0; j < 4; j++) {
            unpackedColors = unpackedColors.concat(color);
        }
    }*/
    for(var i = 0; i< 20; i++)
      unpackedColors = unpackedColors.concat([1.0, 1.0, 1.0, 1.0]);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColors), gl.STATIC_DRAW);
    worldVertexColorBuffer.itemSize = 4;
    worldVertexColorBuffer.numItems = 20;

    worldVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, worldVertexIndexBuffer);
    var worldVertexIndices = [
        /*0, 1, 2,      0, 2, 3/*,    // Front face
        4, 5, 6,      4, 6, 7,    // Back face
        8, 9, 10,     8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15, // Bottom face
        16, 17, 18,   16, 18, 19, // Right face
        20, 21, 22,   20, 22, 23  // Left face*/
    ];

    for(var i = 0;i < 18; i+=2){
      worldVertexIndices.push(i);
      worldVertexIndices.push(i+1.);
      worldVertexIndices.push(i+2.);
      worldVertexIndices.push(i+2.);
      worldVertexIndices.push(i+1.);
      worldVertexIndices.push(i+3.);
    }

    console.log(worldVertexIndices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(worldVertexIndices), gl.STATIC_DRAW);
    worldVertexIndexBuffer.itemSize = 1;
    worldVertexIndexBuffer.numItems = 54;
  }


  var rCube = 0;

  function drawScene() {

    if(!shaderProgram){
      console.log("not ready yet");
      return; //do not do anything yet. Program is not loaded !
    } 


    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

    mat4.identity(mvMatrix);

    mat4.translate(mvMatrix, [0.0, 0.0, -8.0]);

    mvPushMatrix();
    //mat4.rotate(mvMatrix, degToRad(rPyramid), [0, 1, 0]);

    mat4.rotate(mvMatrix, degToRad(rCube), [1, 1, 1]);

    gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.VertexPositionAttribute, worldVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.VertexColorAttribute, worldVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, worldVertexIndexBuffer);
    setMatrixUniforms(shaderProgram, pMatrix, mvMatrix);
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