console.log("geometry generator loaded")

GeometryGenerator = (function(){

  function extrudePath(path, positionCalculator, attributeCalculator){
    console.log(path);

    //for each point of the vertices
    //duplicate it 
    //prepare indexBuffer
    var newPath = [];
    path.forEach(function(vertex, index){
      newPath.push(positionCalculator(vertex, index));
    });

    console.log(newPath);

    return newPath;

  }

  function generateVerticeAndIndiceBuffer(pathsList, shouldMakeLinks = true){

    console.log("pathsList",pathsList);

    var res = {  
      vertices: [],
      indices: []
    }

    for(var i = 0 ; i < pathsList.length; i++){
      var startIndex = res.vertices.length;
      //concat the current path to the list of vertices
      res.vertices = res.vertices.concat(pathsList[i]);

      //if should make links, Map the path to the previsously srored one, uneless first
      if(i != 0){
        console.log("making links, length of a path = ", pathsList[i].length);
        for(var j = 0;j < (pathsList[i].length/3)-1; j++){
          res.indices.push(startIndex/3 + j + 0);
          res.indices.push(startIndex/3 + j + 1 );
          res.indices.push(startIndex/3 + j + 0 -pathsList[i].length/3);
          res.indices.push(startIndex/3 + j + 1 );
          res.indices.push(startIndex/3 + j + 0 -pathsList[i].length/3);
          res.indices.push(startIndex/3 + j + 1 -pathsList[i].length/3);
        }
      }
    }
    return res;

  }


  return {
    extrudePath,
    generateVerticeAndIndiceBuffer
  }


})();