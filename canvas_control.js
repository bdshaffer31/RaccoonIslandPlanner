var res = 8; // should be 8 for images to look right
var brushColor = "#20b2aa";
var brushSize = 2;
var selectedImage = "Cherry_Aerial";
var imgDict = {};
var outlineGrey = "#ebebeb"
var GRIDCOLUMNS = 112;
var GRIDROWS = 96;
var gridOn = true;
var pixelArray = [];
var spriteArray = new Array(10752)
var activeTool = "paint"
var mapWidth = res * GRIDCOLUMNS;
var mapHeight = res * GRIDROWS;


// old greens "#1dff05","#14b204", "#2a4a27",
var colorBar =  ["#90ff84", "#2fe276", "#129a48",
                 "#6df6ee", "#4bdcd4", "#20b2aa",
                 "#FFFFFF", "#808080", "#303030",
                 "#ff8d61", "#a27a3f", "#d2b48c"];

function relativePos(event) {
  var rect = event.target.getBoundingClientRect();
  return {x: Math.floor(event.clientX - rect.left),
          y: Math.floor(event.clientY - rect.top)};
}

function relativeGridPos(event) {
  var rect = event.target.getBoundingClientRect();
  return {x: Math.floor((event.clientX - rect.left) / res),
          y: Math.floor((event.clientY - rect.top) / res)};
}

function draw() {
  var canvas = document.getElementById('map_frame');
  setupListeners(canvas);
  setupSpriteListeners();
  populateImgDict();
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
    drawIsland();
    
    drawPixelArray(pixelArray);
    drawBigGrid()
    //drawTestImages(ctx)
    drawColorBar();
  }
}

function showCoords(event) {
  var vals = relativePos(event)
  var coords = "X: " + vals["x"] + ", Y: " + vals["y"];
  document.getElementById("coords").innerHTML = coords;

  var gridVals = relativeGridPos(event)
  var coords = "X: " + gridVals["x"] + ", Y: " + gridVals["y"];
  document.getElementById("grid_num").innerHTML = coords;
}

function drawPixelArray(pixelArray){
  for (var j = 0; j < GRIDROWS; j++){
    for(var i = 0; i < GRIDCOLUMNS; i++){
      drawColor(i, j, pixelArray[j * GRIDCOLUMNS + i]);
    }
  }
  if (gridOn == true){
    drawBigGrid();
  }
}

function drawSpriteArray(spriteArray){
  for (var y = 0; y < GRIDROWS; y++){
    for(var x = 0; x < GRIDCOLUMNS; x++){
      index = y * GRIDCOLUMNS + x
      if (spriteArray[index] === undefined){
      } else{
        console.log(spriteArray[index])
        drawImage(x, y, spriteArray[index])
      }
    }
  }
}

function paintColor(xPos, yPos, color){
  for (var i = 0; i < brushSize; i++){
    for (var j = 0; j < brushSize; j++){
        drawColor(xPos + i, yPos + j, color)
        pixelArray[(xPos + j) + ((yPos + i) * GRIDCOLUMNS)] = color
    }
  }
}

function drawColor(xPos, yPos, color) {
  var canvas = document.getElementById('map_frame');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
    ctx.lineWidth = 1;
    ctx.fillStyle = color;
    ctx.beginPath();
    var xPos = res * xPos;
    var yPos = res * yPos;
    ctx.fillRect(xPos, yPos, res, res);
    // draw the grid squares if the grid is on
    if (gridOn){
      ctx.beginPath();
      ctx.strokeStyle = outlineGrey;
      ctx.rect(xPos, yPos, res, res);
      ctx.stroke();
    }
  }
}

function placeImage (xPos, yPos, url) {
  spriteArray[xPos + yPos * GRIDCOLUMNS] = url
  drawImage(xPos, yPos, url)
}


function drawImage (xPos, yPos, url) {
  var canvas = document.getElementById('map_frame');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var img = new Image();
    img.src = url
    img.onload = function () { 
      ctx.drawImage(img, xPos * res, yPos * res);
    }
  }
}

function setupListeners(canvas){
  canvas.addEventListener("mousedown", function(event){
    if (activeTool == 'paint') {
      var gridVals = relativeGridPos(event)
      paintColor(gridVals["x"], gridVals["y"], brushColor)
      this.addEventListener("mousemove", mouseMoveFunction);
    } else if (activeTool == 'place'){
      var gridVals = relativeGridPos(event)
      //var img = document.getElementById(selectedImage);
      //ctx.drawImage(img, gridVals["x"] * res, gridVals["y"] * res);
      placeImage(gridVals["x"], gridVals["y"], imgDict[selectedImage]);
    } else if (activeTool == "remove"){
      var gridVals = relativeGridPos(event)
      index = gridVals["x"] + gridVals["y"] * GRIDCOLUMNS
      if (spriteArray[index] === undefined){
      } else {
        spriteArray[index] = undefined
        redraw()
      }
    }

  });
  
  canvas.addEventListener("mouseup", function(event){
    this.removeEventListener("mousemove", mouseMoveFunction);
  });
}

function mouseMoveFunction(event){
  if (event.which == 1) {
    console.log(event.which)
    var vals = relativeGridPos(event);
    var coords = "X: " + vals["x"] + ", Y: " + vals["y"];
    //document.getElementById("mouse_pos").innerHTML = coords;
    paintColor(vals["x"], vals["y"], brushColor)
  }
}

function drawColorBar(){
  var canvas = document.getElementById('color_bar');
  var ctx = canvas.getContext('2d');
  //ctx.lineWidth = 1;
  // always 3 wide
  for (var i = 0; i < (colorBar.length / 3); i++){ 
    for (var j = 0; j < 3; j++){
      ctx.beginPath();
      var xPos = 24 * j;
      var yPos = 24 * i;
      ctx.fillStyle = colorBar[i * 3 + j];
      ctx.fillRect(xPos, yPos, 24, 24);
    }
  }
}

function selectColor(event){
  var rect = event.target.getBoundingClientRect();
  x = Math.floor((event.clientX - rect.left) / 24)
  y = Math.floor((event.clientY - rect.top) / 24)
  colorNum = x + 3 *y
  brushColor = colorBar[colorNum]
  document.getElementById("sel_color").style.backgroundColor = colorBar[colorNum];
  selectTool("paint")
}

function brushSizeUp(event){
  brushSize = brushSize + 1
  document.getElementById("brush_disp").innerHTML = brushSize;
}

function brushSizeDown(event){
  if (brushSize > 1){
    brushSize = brushSize - 1
  }
  document.getElementById("brush_disp").innerHTML = brushSize;
}

function zoomIn(event){
  var canvas = document.getElementById('map_frame');
  res = res + 2
  mapWidth = res * GRIDCOLUMNS
  mapHeight = res * GRIDROWS
  canvas.width = mapWidth;
  canvas.height = mapHeight;
  
  redraw()
}

function zoomOut(event){
  var canvas = document.getElementById('map_frame');
  if (res > 2){
    res = res - 2
    mapWidth = res * GRIDCOLUMNS
    mapHeight = res * GRIDROWS
    canvas.width = mapWidth;
    canvas.height = mapHeight;
    redraw()
  }
}

function setSelectedImage(event, name){
  var id = event.target.id;
  selectedImage = id;
  document.getElementById("sel_img").innerHTML = id;
  // put the tool to place
  selectTool("place")
}

function setupSpriteListeners(){
  var sprite = document.getElementsByClassName("sprite")
  for (var i = 0; i < sprite.length; i++){
    sprite[i].addEventListener("click", setSelectedImage);
  }
}

function selectTool(toolName){
  activeTool = toolName
  document.getElementById("tool-display").innerHTML = toolName;
}

function download(){
  var download = document.getElementById("download");
  var image = document.getElementById("map_frame").toDataURL("image/png")
              .replace("image/png", "image/octet-stream");
  download.setAttribute("href", image);
}

function toggleGrid(){
  gridOn = !gridOn
  redraw()
}

function redraw(){
  drawPixelArray(pixelArray)
  drawSpriteArray(spriteArray)
}

function resetMap(){
  // set pixel array to default island shape and draw
  drawIsland()
  drawPixelArray(pixelArray)
  // clear sprite array
  spriteArray = new Array(10752)
}

function drawIsland(){
  for (var i = 0; i < GRIDROWS * GRIDCOLUMNS; i++){
    pixelArray[i] = "#20b2aa";
  }
  for (var y = 0; y < GRIDROWS; y++){
    for(var x = 0; x < GRIDCOLUMNS; x++){
      if ((y < GRIDROWS - 8) && (y > 8) && (x < GRIDCOLUMNS - 8) && (x > 8)){
        pixelArray[y * GRIDCOLUMNS + x] = "#d2b48c";
      }
    }
  }
  for (var y = 0; y < GRIDROWS; y++){
    for(var x = 0; x < GRIDCOLUMNS; x++){
      if ((y < GRIDROWS - 12) && (y > 12) && (x < GRIDCOLUMNS - 12) && (x > 12)){
        pixelArray[y * GRIDCOLUMNS + x] = "#129a48";
      }
    }
  }
  for (var y = 0; y < GRIDROWS; y++){
    for(var x = 0; x < GRIDCOLUMNS; x++){
      if ((y < 12) && (y > 8) && (x < GRIDCOLUMNS - 10) && (x > 10)){
        pixelArray[y * GRIDCOLUMNS + x] = "#808080";
      }
    }
  }
}

function drawBigGrid() {
  var canvas = document.getElementById('map_frame');
  var ctx = canvas.getContext('2d');
  ctx.lineWidth = 2;
  ctx.strokeStyle = outlineGrey//"#808080";
  for (var i = 0; i < 7; i++){
    for (var j = 0; j < 6; j++){
      ctx.beginPath();
      var xPos = res * 16 * i;
      var yPos = res * 16 * j;
      ctx.rect(xPos, yPos, res * 16, res * 16);
      ctx.stroke();
      //ctx.drawImage(img, xPos * res, yPos * res);
    }
  }
  drawGridLabels()
}

function drawGridLabels() {
  var canvas = document.getElementById('map_frame');
  var ctx = canvas.getContext('2d');
  letterLabels  = ["A", "B", "C", "D", "E", "F"];
  ctx.fillStyle = "#808080";
  ctx.font = "30px Arial";
  for (var i = 0; i < 7; i ++) {
    ctx.fillText(i+1, i * (res * 16) + (res * 8), 30);
  }
  for (var j = 0; j < 6; j++) {
    ctx.fillText(letterLabels[j], 10, j * (res * 16) + (res * 8) );
  }
}

function populateImgDict(){
  //imgDict[""] = ""

  // Buildings
  imgDict["Villager_House_Final"] = "images/buildings/Villager_House_Final.png"
  imgDict["Museum"] = "images/buildings/Museum.png"
  imgDict["Campsite"] = "images/buildings/Campsite.png"
  imgDict["Store"] = "images/buildings/Store.png"
  imgDict["airport"] = "images/buildings/airport.png"
  imgDict["ResidentServ"] = "images/buildings/ResidentServ.png"
  imgDict["Tailor"] = "images/buildings/Tailor.png"

  // Fences
  imgDict["Fence_BambooLattice"] = "images/fences/Fence_BambooLattice.png"
  imgDict["Fence_BarbedWire"] = "images/fences/Fence_BarbedWire.png"
  imgDict["Fence_Brick"] = "images/fences/Fence_Brick.png"
  imgDict["Fence_corral"] = "images/fences/Fence_corral.png"
  imgDict["Fence_Country"] = "images/fences/Fence_Country.png"
  imgDict["Fence_Imperial"] = "images/fences/Fence_Imperial.png"
  imgDict["Fence_Iron"] = "images/fences/Fence_Iron.png"
  imgDict["Fence_IronandStone"] = "images/fences/Fence_IronandStone.png"
  imgDict["Fence_Lattice"] = "images/fences/Fence_Lattice.png"
  imgDict["Fence_Rope"] = "images/fences/Fence_Rope.png"
  imgDict["Fence_SimpleWooden"] = "images/fences/Fence_SimpleWooden.png"
  imgDict["Fence_Spiky"] = "images/fences/Fence_Spiky.png"
  imgDict["Fence_Stone"] = "images/fences/Fence_Stone.png"
  imgDict["Fence_Straw"] = "images/fences/Fence_Straw.png"
  imgDict["Fence_Vertical Board"] = "images/fences/Fence_Vertical Board.png"
  imgDict["Fence_Zen"] = "images/fences/Fence_Zen.png"

  // Bridges
  imgDict["Bridge_Stone"] = "images/bridges/Bridge_Stone.png"

  // Flowers
  imgDict["Flower_Red"] = "images/flowers/Flower_Red.png"
  imgDict["Flower_Purple"] = "images/flowers/Flower_Purple.png"
  imgDict["Flower_Yellow"] = "images/flowers/Flower_Yellow.png"
  imgDict["Flower_Pink"] = "images/flowers/Flower_Pink.png"

  // Inclines
  imgDict["incline_generic"] = "images/inclines/incline_generic.png"
  
  // Outdoors
  imgDict["Rock"] = "images/outdoors/Rock.png"
  imgDict["PicnicTable"] = "images/outdoors/PicnicTable.png"
  imgDict["Bench"] = "images/outdoors/Bench.png"
  imgDict["stonearch"] = "images/outdoors/stonearch.png"

  // Trees
  imgDict["Cherry_Aerial"] = "images/trees/Cherry_Aerial.png"
  imgDict["Apple_Aerial"] = "images/trees/Apple_Aerial.png"
  // testing
  //imgDict["Apple_Aerial"] = "images/trees/apple_brightened.png"
  //imgDict["Apple_Aerial"] = "images/trees/apple_test_3.png"
  imgDict["Coconut_Aerial"] = "images/trees/Coconut_Aerial.png"
  imgDict["Orange_Aerial"] = "images/trees/Orange_Aerial.png"
  imgDict["Peach_Aerial"] = "images/trees/Peach_Aerial.png"
  imgDict["Pear_Aerial"] = "images/trees/Pear_Aerial.png"
  imgDict["Hardwood_Aerial"] = "images/trees/Hardwood_Aerial.png"
  imgDict["Spruce_Aerial"] = "images/trees/Spruce_Aerial.png"
  imgDict["Spruce_Aerial_Pattern"] = "images/trees/Spruce_Aerial_Pattern.png"
}