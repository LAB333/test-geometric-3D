console.log("geometry generator loaded")

var GeometryGenerator = (function(){

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


  return {
    extrudePath
  }


})();