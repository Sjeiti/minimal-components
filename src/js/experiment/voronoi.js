import experiment from './base'
import perlin from '../math/perlin'
import color from '../math/color'
import lcg from '../math/lcg'
import pool from '../pattern/pool'
import {dragstart,drag,dragend} from '../signal/signals'
import Voronoi from 'voronoi'

let inst = experiment('voronoi',{
    init
    ,exit
    ,handleAnimate
    ,handleResize
  })
  ,zuper = inst.zuper
  //
  // private variables
  ,millis = Date.now
  ,random = lcg.random
  ,noise = perlin.noise
  ,PI = Math.PI
  ,PI2 = 2*PI
  ,PIH = PI/2
  ,ceil = Math.ceil
  ,iW,iH
  //
  ,oVoronoi = new Voronoi()
  ,aSites = []
  ,oBox
  //
  ,mTarget
  ,mCanvas
  ,oContext
  ,oGradient
  //
  ,iGridSize = 80
  ,iGridRadius = 2.1*iGridSize<<0
  ,iGridX,iGridY
  //
  ,aSine = []
  ,iSine = PI2*iGridRadius<<0
  //
  ,fOffsetX = 1E3
  ,fOffsetY = 1E3
  ,iCounter = 1E6
  ,iMillisLast = millis()
  //
  ,bMouseDown = false
  //
  ,getSite = pool(function(x,y,r){
    let oReturn = {x:x,y:y,r:r,reset:reset};
    function reset(x,y,r) {
      oReturn.x = x;
      oReturn.y = y;
      oReturn.r = r;
    }
    return oReturn;
  })
  //
  ,oColor = color().randomize()
  ,sLight = oColor.multiply(1.5).toString()
  ,sDark = oColor.multiply(0.25).toString()
  //
  ,iLastX,iLastY
;

  function init(_target){
  mTarget = _target;
  mCanvas = zuper.init(_target);
  oContext = inst.context;
  //
  oContext.fillStyle = '#ffffff';
  for (let i=0;i<iSine;i++) {
    aSine.push(Math.sin(i/iSine*PI2));
  }
  //
  handleResize();
  //
  dragstart.add(handleDragStart);
  drag.add(handleDrag);
  dragend.add(handleDragEnd);
  //
  return mCanvas;
  }

function exit(){
  zuper.exit();
  dragstart.remove(handleDragStart);
  drag.remove(handleDrag);
  dragend.remove(handleDragEnd);
}
function handleDragStart(){
  bMouseDown = true;
}
function handleDrag(touchList){
  let oTouch;
  touchList.forEach(touch=>touch.pos&&(oTouch = touch))
  if (oTouch) {
    let x = oTouch.pos.getX()
      ,y = oTouch.pos.getY();
    if (iLastX!==undefined) {
      fOffsetX += x-iLastX;
      fOffsetY += y-iLastY;
    }
    iLastX = x;
    iLastY = y;
  }
}
function handleDragEnd(){
  bMouseDown = false;
  iLastX = undefined;
}
function handleResize(){
  iW = mTarget.clientWidth;
  iH = mTarget.clientHeight;
  let iGridAdd = ceilGrid(iGridRadius);
  iGridX = ceilGrid(iW) + 2*iGridAdd;
  iGridY = ceilGrid(iH) + 2*iGridAdd;
  mCanvas.width = iW;
  mCanvas.height = iH;
  oBox = {xl:0,xr:iW,yt:0,yb:iH};
  setContextStyle();
}
function handleAnimate(deltaT,millis) {
  //
  //
  //
  let fT = 0.00001*millis
    ,iRds = 5E3
    ,fX = fOffsetX + iRds*noise(8372+fT,1234)
    ,fY = fOffsetY + iRds*noise(7403+fT,8248)
  ;
  //
  //
  //
  iCounter += millis-iMillisLast;//(bMouseDown?1:-1)*(millis-iMillisLast);
  iMillisLast = millis;
  //
  aSites.length = 0;
  let oDiagram,aCells,iCells,i;
  // 127 8191 131071 524287
  for (i = 0; i < iGridX; i++) {
    for (let k = 0; k < iGridY; k++) {
      let iX = i - ceil(fX/iGridSize)
        ,iY = k - ceil(fY/iGridSize)
        ,iSeed = 131071*iX*iX + 8191*iY*iY
        ,fRandom = random(iSeed)
        /*,fNoise1 = 3075 + fNoiseScale*iX
        ,fNoise2 = 4571 + fNoiseScale*iY
        ,fRandom = noise(fNoise1,fNoise2)*/
        ,bRandom = fRandom>0.5
        ,fSpd = fRandom*67%1
        ,fRadians = fRandom*2*PI + 2E2*PI + (bRandom?1:-1)*iCounter*5E-5*fSpd
        ,fRndRadius = iGridRadius//*(127*fRandom%1)
        ,x = i*iGridSize + fRndRadius*sin(fRadians) - iGridRadius + fX%iGridSize
        ,y = k*iGridSize + fRndRadius*cos(fRadians) - iGridRadius + fY%iGridSize
      ;
      //aSites.push({x:x,y:y,r:fRandom}); // todo: pool?
      aSites.push(getSite(x,y,fRandom));
    }
  }
  oDiagram = oVoronoi.compute(aSites,oBox);
  // cells
  aCells = oDiagram.cells;
  iCells = aCells.length;
//		console.log('iCells',iCells); // log
  while (iCells--) {
    let oCell = aCells[iCells]
      ,site = oCell.site
      ,halfedges = oCell.halfedges
      ,iHalfedges = halfedges.length
    ;
    i = iHalfedges;
    if (iHalfedges>0) {
      oContext.beginPath();
      let iYMin = 1E9//Number.MAX_VALUE
        ,iYMax = -1E9//Number.MIN_VALUE
        ,iYSize
        ,iXMin = 1E9//Number.MAX_VALUE
        ,iXMax = -1E9//Number.MIN_VALUE
        ,iXSize;
      while (i--){
        let oHalfedge = halfedges[i]
          ,p2 = oHalfedge.getEndpoint();
        if (i===iHalfedges-1)	oContext.moveTo(p2.x,p2.y);
        else					oContext.lineTo(p2.x,p2.y);
        if (p2.y<iYMin) iYMin = p2.y;
        if (p2.y>iYMax) iYMax = p2.y;
        if (p2.x<iXMin) iXMin = p2.x;
        if (p2.x>iXMax) iXMax = p2.x;
      }
      iYSize = iYMax-iYMin;
      iXSize = iXMax-iXMin;
      //
      let fRotRad = site.r*2*PI
        ,fScale = 1 + (13*site.r%1)
        ,fOff = (fScale-1)*((23*site.r%1)-0.5);
      oContext.save();
      oContext.translate(site.x,site.y);
      oContext.scale(fScale*iXSize,fScale*iYSize);
      oContext.rotate(fRotRad);
      oContext.translate(fOff,fOff);
      oContext.translate(-0.5,-0.5);
      oContext.fill();
      oContext.restore();
      //oContext.stroke();
      //
      oContext.closePath();
    }
    site.drop();
  }
  // edges
  oContext.beginPath();
  let edges = oDiagram.edges
    ,iEdge = edges.length;
  while (iEdge--) {
    let edge = edges[iEdge]
      ,va = edge.va
      ,vb = edge.vb;
    if (
      !(va.y===0&&vb.y===0)
      &&!(va.y===iH&&vb.y===iH)
      &&!(va.x===0&&vb.x===0)
      &&!(va.x===iW&&vb.x===iW)
    ) {
      oContext.moveTo(va.x,va.y);
      oContext.lineTo(vb.x,vb.y);
    }
  }
  oContext.stroke();
  oContext.closePath();
}
function setContextStyle(){
  oGradient = oContext.createLinearGradient(0,0,1,1);
  oGradient.addColorStop(0,sLight);
  oGradient.addColorStop(1,sDark);
  oContext.fillStyle = oGradient;
  oContext.lineWidth = 1;
  oContext.strokeStyle = 'rgba(0,0,0,0.4)';
}
function ceilGrid(i) {
  return ceil((i+1E-6)/iGridSize);
}
function sin(f) {
  return aSine[((f/PI2)*iSine%iSine)<<0];
}
function cos(f) {
  return sin(f+PIH);
}

export default inst.expose;