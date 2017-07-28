import experiment from './base'
import lcg from '../math/lcg'
import color from '../math/color'
import vector from '../math/vector'
import perlin from '../math/perlin'
import {createGradient,drawCircle} from '../utils/canvasrenderingcontext2d'

let inst = experiment('boids',{
    init
    ,handleAnimate
    ,handleResize
  })
  ,zuper = inst.zuper
  //
  ,rnd = lcg.random
  ,noise = perlin.noise
  ,random = function(f){return (f||1)*(Math.random()-0.5);}
  ,push = Array.prototype.push
  //
  ,mTarget
  ,iW,iH
  ,iSurface
  //
  ,aCanvas
  //
  ,mCanvas
  ,oContext
  //
  ,mCvLeaf
  ,oCtxLeaf
  //
  ,mCvTree
  ,oCtxTree
  //
  ,mCvTest
  ,oCtxTest
  //
  ,mCnvSea
  ,oCtxSea
  //
  ,aNoiseField
  ,iNoiseGridSize = 16
  ,iNoiseGridW
  ,iNoiseGridLength
  //
  ,iSeed = Math.random()*1E9<<0
  //
  ,iLeafSize = 16
  //
  ,iFishSize = 11
  ,mCvFish
  ,oCtxFish
  ,iFishTypes = 8
  ,aFishTypes = []
  //
  ,iBoids = 66
  ,aBoids = []
  ,aObstacles = []
  ,aGrid = []
  ,iGridSize = 20
  ,iGridW
  ,iGridH
  ,iGridLength
  //
  ,aNb = []


function init(_target){
  mTarget = _target
  mCanvas = zuper.init(_target)
  oContext = inst.context
  //
  perlin.setRng(lcg)
  //mTarget = target
  //mCanvas = document.createElement('canvas')
  //oContext = mCanvas.getContext('2d')
  mCnvSea = document.createElement('canvas')
  oCtxSea = mCnvSea.getContext('2d')
  mCvTree = document.createElement('canvas')
  oCtxTree = mCvTree.getContext('2d')
  mCvTest = document.createElement('canvas')
  oCtxTest = mCvTest.getContext('2d')
  aCanvas = [mCanvas,mCnvSea,mCvTree,mCvTest]
  //document.body.appendChild(mCvTree)
  //
  drawLeafAsset()
  drawFishAsset()
  //
  handleResize()
  //
  mCanvas.addEventListener('mousedown',handleClickCanvas)
  mCanvas.addEventListener('touchstart',handleClickCanvas)
  //mCanvas.addEventListener('click',handleClickCanvas)
  mTarget.appendChild(mCanvas)
  //
  aBoids.length = 0
  for (let i=0;i<iBoids;i++) {
    aBoids.push(boid())
  }
  //
  return mCanvas
}
function handleResize(){//ow,oh,w,h
  iW = mTarget.clientWidth
  iH = mTarget.clientHeight
  iSurface = iW*iH
  // todo: add pool to add/remove boids
  //if (mTarget.clientHeight<150) iBoids = .0007*iSurface<<0
//		console.log('.0007*iSurface<<0',.0007*iSurface<<0); // log
  iBoids = Math.min(0.0007*iSurface<<0,300); // todo: uncomment
  aCanvas.forEach(function(canvas){
    canvas.width = iW
    canvas.height = iH
  })
  iGridW = Math.ceil(iW/iGridSize)
  iGridH = Math.ceil(iH/iGridSize)
  iGridLength = iGridW*iGridH
  while (aGrid.length<iGridLength) aGrid.push(getGridCell())
  while (aGrid.length>iGridLength) aGrid.pop()
  //
  createObstacles()
  //
  drawTreeAsset()
  drawSeaAsset()
  //testPolygon()
}
function handleAnimate(deltaT) { // ,millis
  oContext.drawImage(mCnvSea,0,0,iW,iH)
  // grid
  setGrid()
  // move
  let i = iBoids
  while (i--){
    let oBoid = aBoids[i]
      ,bSpeedUp = oBoid.speed>oBoid.lastSpeed
    //oContext.fillStyle = oBoid.alone?'#f00':'#fff'
    oBoid.step(getNeighbours(oBoid),deltaT)
    let mFish = aFishTypes[oBoid.id%iFishTypes]
    oContext.save()
    oContext.translate(oBoid.x,oBoid.y)
    oContext.rotate(oBoid.dir.radians()*Math.PI+(bSpeedUp?random(0.5*oBoid.dir.size()):0))
    oContext.translate(-iFishSize/2,-iFishSize/2)
    oContext.drawImage(mFish,0,0,iFishSize,iFishSize)
    oContext.restore()
    //oContext.fillRect(oBoid.x,oBoid.y,1,1)
  }
  //oContext.drawImage(mCvTest,0,0)
}
function handleClickCanvas(e){
  let bTouch = !!e.changedTouches
    ,o = bTouch?e.changedTouches[0]:e
    ,x = o.pageX
    ,y = o.pageY
    ,vClick = vector(x,y)
    ,iCell = getGridPos(x,y)
    ,aFish = []
    ,iAround = 3
    ,iArndSize = 2*iAround+1
    ,aArnd = []
  for (let i=0;i<iArndSize;i++) {
    for (let j=0;j<iArndSize;j++) {
      aArnd.push(-iGridW*iAround-iAround+i*iGridW+j)
    }
  }
  aArnd.forEach(function(add){
    push.apply(aFish,gridIndex(iCell+add))
  })
  aFish.forEach(function(boid) {
    let vDist = vClick.clone().subtractVector(boid.pos)
      ,fDst = vDist.size()
      ,f1Dst = 1/fDst

    boid.dir.addVector(vDist.multiplyNumber(-50*f1Dst*f1Dst).drop())
  })
  vClick.drop()
}
function createObstacles(){
  aObstacles.length = 0
  let i = 0
  while (i--){
    let iSize = 5+rnd()*20
    aObstacles.push({
      pos:vector(rnd()*iW,iSize+(rnd()*(iH-3*iSize)))
      ,size:iSize
    })
  }
}
function drawSeaAsset(){
  //console.log('drawSeaAsset'); // log
  oCtxSea.drawImage(mCvTree,0,0,iW,iH)
  oCtxSea.globalCompositeOperation = 'xor'
  oCtxSea.fillRect(0,0,iW,iH)
  //
  let fDarken = 0.85
    ,cHigh = color('#47a').multiply(0.8)
    ,cLow = color('#124')
    ,iHw = iW/2<<0
    ,iHh = iH/2<<0
    //,oLight = oCtxSea.createGradient(false,iHw,0,cHigh,1,cLow)
    //,oDark = oCtxSea.createGradient(false,iHh,0,cHigh.multiply(fDarken),1,cLow.multiply(fDarken))
    ,oLight = oCtxSea.createRadialGradient(iHw,iHh,0,iHw,iHh,iHw)
    ,oDark = oCtxSea.createRadialGradient(iHw,iHh,0,iHw,iHh,iHw)

  //console.log('cHigh',cHigh); // log
  oLight.addColorStop(0,cHigh)
  oLight.addColorStop(1,cLow)
  oDark.addColorStop(0,cHigh.multiply(fDarken))
  oDark.addColorStop(1,cLow.multiply(fDarken))
  for (let i=0;i<2;i++) {
    let bFirst = i===0
    oCtxSea.globalCompositeOperation = bFirst?'source-in':'destination-over'
    oCtxSea.fillStyle = bFirst?oLight:oDark
    oCtxSea.fillRect(0,0,iW,iH)
    //if (bFirst) {
      oCtxSea.globalCompositeOperation = 'source-atop'
      let j = 0.125*iSurface<<0
      while (j--){
        oCtxSea.fillStyle = 'rgba(255,255,255,'+0.1*Math.random()+')'
        oCtxSea.fillRect(Math.random()*iW<<0,Math.random()*iH<<0,1,1)
      }
    //}
  }
  // draw obstacles
  oCtxSea.globalCompositeOperation = 'source-over'
  oCtxSea.fillStyle = createGradient.call(oCtxSea,false,50,0,'#777',1,'#333')
  aObstacles.forEach(function(obstacle){
    drawCircle.call(oCtxSea,obstacle.pos.getX(),obstacle.pos.getY(),obstacle.size,true)
  })
}
function drawLeafAsset(){
  mCvLeaf = document.createElement('canvas')
  mCvLeaf.width = mCvLeaf.height = iLeafSize
  //document.body.appendChild(mCvLeaf);mCvLeaf.style.zoom = 6
  oCtxLeaf = mCvLeaf.getContext('2d')
  oCtxLeaf.fillStyle = '#064'
  oCtxLeaf.scale(0.5,1)
  oCtxLeaf.translate(0.25*iLeafSize,0)
  oCtxLeaf.arc(iLeafSize/2,iLeafSize/2,iLeafSize/2,0,2*Math.PI)
  oCtxLeaf.fill()
}
function drawTreeAsset(){
  let fNoiseScale = 0.007
  //
  // test noise /////////
  iNoiseGridW = iW/iNoiseGridSize<<0
  let iNoiseGridH = iH/iNoiseGridSize<<0
  iNoiseGridLength = iNoiseGridW*iNoiseGridH
  let i = 0
  aNoiseField = []
  while (i<iNoiseGridLength) {
    let x = iNoiseGridSize*(i%iNoiseGridW)
      ,y = iNoiseGridSize*Math.floor(i/iNoiseGridW)
      ,fPerlin = noise(123+fNoiseScale*x,657+fNoiseScale*y+iSeed)
      ,fSine = Math.sin((x/iW)*Math.PI)
      ,fVal = fPerlin*fPerlin*(1-fSine*fSine)
    aNoiseField.push(fVal)
    oCtxTest.save()
    oCtxTest.translate(x,y)
    oCtxTest.fillStyle = 'rgba(255,255,255,'+(0.5*fVal)+')';//(0x808080*rnd()<<0).toString(16)
    oCtxTest.fillRect(0,0,iNoiseGridSize,iNoiseGridSize)
    oCtxTest.restore()
    i += 1;//iNoiseGridSize
  }
  //console.log('iNoiseGridLength',iNoiseGridLength); // log
  //console.log('aNoiseField.length',aNoiseField.length); // log
  //////////////////////
  //
  i = 0.05*iSurface<<0
  let cnt = 0
  while (i--){
    let xx = rnd()*iW-iLeafSize/2
      ,yy = rnd()*iH
//				,fPerlin = Perlin.noise(123+fNoiseScale*x,657+fNoiseScale*y)
//				,fSine = Math.sin((x/iW)*Math.PI)
      ,iGridX = xx/iNoiseGridSize<<0
      ,iGridY = yy/iNoiseGridSize<<0
      ,iGridPos = iGridY*iNoiseGridW + iGridX
      ,fNoise = aNoiseField[iGridPos]

    if (rnd()*fNoise>0.1) {
//			if (rnd()*(1-fSine*fSine)*fPerlin*fPerlin>0.1) {
      let iScale = 0.5+rnd()
      oCtxTree.save()
      oCtxTree.translate(xx,yy)
      oCtxTree.scale(iScale,iScale)
      oCtxTree.rotate(rnd()*2*Math.PI)
      oCtxTree.drawImage(mCvLeaf,0,0,iLeafSize,iLeafSize)
      oCtxTree.restore()
      cnt++
    }
  }
}
function drawFishAsset(){
  mCvFish = document.createElement('canvas')
  mCvFish.width = mCvFish.height = iFishSize
  //document.body.appendChild(mCvFish);mCvFish.style.zoom = 6
  oCtxFish = mCvFish.getContext('2d')
  //oCtxFish.fillStyle = '#f60'
  oCtxFish.fillStyle = createGradient.call(oCtxFish,false,iFishSize/2,0,'#f84',1,'#f60')
  //
  let aFish = [
      [0.5,0.1]
      ,[0.6,0.3]
      ,[0.55,0.5]
      ,[0.53,0.6]
      ,[0.51,0.7]
      ,[0.65,0.9]
      ,[0.5,0.85]
    ]
    ,iFishPoints = aFish.length
  //
  oCtxFish.save()
  oCtxFish.beginPath()
  for (let j=0;j<2*iFishPoints-1;j++) {
    let bReverse = j>=iFishPoints
      ,iIndex = bReverse?iFishPoints-1-(j-iFishPoints):j
      ,oPoint = aFish[iIndex]
      ,fX = (bReverse?0.5-(oPoint[0]-0.5):oPoint[0])*iFishSize
      ,fY = oPoint[1]*iFishSize

    if (i===0)	oCtxFish.moveTo(fX,fY)
    else		oCtxFish.lineTo(fX,fY)
  }
  oCtxFish.fill()
  oCtxFish.closePath()
  oCtxFish.restore()
  //
  //oCtxFish.globalCompositeOperation = 'source-in'
  //this.arc(0,0,radius,0,2*Math.PI)
  let i = iFishTypes
  aFishTypes.push(mCvFish)
  while (i--){
    let mCvRiba = document.createElement('canvas')
    mCvRiba.width = mCvRiba.height = iFishSize
    //document.body.appendChild(mCvFish);mCvFish.style.zoom = 6
    let oCtxRiba = mCvRiba.getContext('2d')
    oCtxRiba.drawImage(mCvFish,0,0,iFishSize,iFishSize)
    oCtxRiba.globalCompositeOperation = 'source-atop'
    oCtxRiba.globalAlpha = 0.2
    oCtxRiba.fillStyle = (0x808080*rnd()<<0).toString(16)
    oCtxRiba.fillRect(0,0,iFishSize,iFishSize)
    aFishTypes.push(mCvRiba)
  }
}
/*
let aPoly = []
function testPolygon(){
  aPoly.length = 0
  let fRds = 35*(1+rnd())
    ,fCx = rnd()*iW
    ,fCy = fRds+rnd()*(iH-3*fRds)
    ,iVtcs = 7
  for (let i=0;i<iVtcs;i++) {
    let fRdns = i/iVtcs*2*Math.PI
      ,fRndRds = .5*(fRds+rnd()*fRds)
    aPoly.push(vector(
      fCx+fRndRds*Math.sin(fRdns)
      ,fCy+fRndRds*Math.cos(fRdns)
    ))
  }
  // find grid
  let aPolyGrid = []
  for (let i=0,l=aPoly.length;i<l;i++) {
    let vVtx1 = aPoly[(i-1+l)%l]
      ,vVtx2 = aPoly[i]
    bline(
      vVtx1.getX()/iGridSize<<0
      ,vVtx1.getY()/iGridSize<<0
      ,vVtx2.getX()/iGridSize<<0
      ,vVtx2.getY()/iGridSize<<0
    ).forEach(function(cell){
      for (let x=-1;x<=1;x++) {
        for (let y=-1;y<=1;y++) {
          let iCellAround = cell+x+y*iGridW
            ,iCell = (iCellAround+iGridLength)%iGridLength
          if (aPolyGrid.indexOf(iCell)===-1) {
            aPolyGrid.push(iCell)
          }
        }
      }
    })
  }
  oCtxSea.fillStyle = 'rgba(0,255,0,.2)'
  aPolyGrid.forEach(function(cell) {
    oCtxSea.fillRect(
      (cell%iGridW)*iGridSize
      ,(cell/iGridW<<0)*iGridSize
      ,iGridSize
      ,iGridSize)
  })
  // draw polygon test
  oCtxSea.fillStyle = 'rgba(255,0,0,.3)'
  oCtxSea.beginPath()
  for (let i=0,l=aPoly.length;i<l;i++) {
    let vVtx = aPoly[i]
    if (i===0)	oCtxSea.lineTo(vVtx.getX(),vVtx.getY())
    else		oCtxSea.lineTo(vVtx.getX(),vVtx.getY())
  }
  oCtxSea.fill()
  oCtxSea.closePath()
}
function bline(x0, y0, x1, y1) {
  let dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1
  let dy = Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1
  let err = (dx>dy ? dx : -dy)/2
  let a = []
  while (true) {
    //a.push(vector(x0,y0))
    a.push(x0+iGridW*y0)
    if (x0 === x1 && y0 === y1) break
    let e2 = err
    if (e2 > -dx) { err -= dy; x0 += sx; }
    if (e2 < dy) { err += dx; y0 += sy; }
  }
  return a
}
*/
function getGridCell() {
  let a = []
  a.around = []
  return a
}
function boid() {
  let x,y
    ,vPos = vector(iW*Math.random(),iH*Math.random())
    ,vDir = vector(random(),random())
    ,fSpdMx = 2
    ,fDstAv = 16
    ,oBoid = {
      id:boid.id?boid.id++:boid.id=1
      ,x:vPos.getX()
      ,y:vPos.getY()
      ,pos:vPos
      ,dir:vDir
      ,step:step
      ,alone:true
      ,speed:0
      ,lastSpeed:0
    }

  function step(neighbours,deltaT) {
    deltaT = 1
    // find neighbours
    let iNumNeighbours = neighbours.length
      ,iNumRealNeighbours = 0
      ,i = iNumNeighbours
    while (i--){
      let oOther = neighbours[i]
        // todo: cache mutual distance
        ,vDist = vPos.clone().subtractVector(oOther.pos)
        ,fDist = vDist.size()

      if (fDist<iGridSize) {
        iNumRealNeighbours++
        let fDistP = fDist/iGridSize
          ,fTsid = 1-fDistP
          //,fDistTo = .5*fDist
          //,fNSnd = 1/fDistTo
          ,fDestDist = fDstAv-fDist

        //
        vDir.average(oOther.dir,0.1*fTsid)
        vDir.addVector(vDist.normalize().multiplyNumber(0.07*fDestDist))
        //
        /*let bCloseIn = (fDist<fDstMn&&fDist>fDstMx)||(Math.random()<.5)
        if (bCloseIn) {
          vDir.average(oOther.dir,.1*fTsid)
          vDir.addVector(vDist.normalize().multiplyNumber(.05*(fDstAv-fDist)))
        }*/
        //
        //vPos.addVector(vDist.multiplyNumber(.1*fTsid))
        //vPos.addVector(vDist.normalize().multiplyNumber(.0001*iGridSize))
        //vPos.addVector(vDist.multiplyNumber(.1*fNSnd*fNSnd))
        //vPos.addVector(vDist.normalize().multiplyNumber(.07*(fDstMn-fDist)))
      }
      vDist.drop()
    }
    oBoid.alone = iNumRealNeighbours===0
    // random velocity depending on group size
    let iNeighbMx = 6
      ,iNeighb = iNumRealNeighbours>iNeighbMx?iNeighbMx:iNumRealNeighbours
      ,fNeighb = iNeighb/iNeighbMx
      ,fNNeighb = 1-fNeighb
      ,fRnd = 0.3*fNNeighb*fNNeighb
    vDir.addNumber(random(fRnd),random(fRnd))
      .multiplyNumber(1-0.1*fNeighb*fNeighb)
    //
    // noise grid
    let  iGridX = (vPos.getX()/iNoiseGridSize)<<0
      ,iGridY = (vPos.getY()/iNoiseGridSize)<<0
      ,iGridPos = iGridY*iNoiseGridW + iGridX
      ,fNoise = aNoiseField[iGridPos%iNoiseGridLength]
      ,fNoiseX = fNoise-aNoiseField[(iGridPos+1)%iNoiseGridLength]
      ,fNoiseY = fNoise-aNoiseField[(iGridPos+iNoiseGridW)%iNoiseGridLength]

    vDir.addVector(vector(fNoiseX,fNoiseY).multiplyNumber(-0.2))
    //
    // min and max velocity
    if (vDir.size()>fSpdMx) {
      vDir.multiplyNumber(0.95)
    }/* else if (vDir.size()<fSpdMn) {
      vDir.multiplyNumber(1/.95)
    }*/
    oBoid.lastSpeed = oBoid.speed
    oBoid.speed = vDir.size()
    //
    // obstacles
    aObstacles.forEach(function(obstacle){
      let vObstacle = obstacle.pos
        ,iObstacle = obstacle.size
        ,vDist = vPos.clone().subtractVector(vObstacle)
        ,iDist = vDist.size()-iObstacle
        ,i1Dist = 1/iDist

      if (iDist<iGridSize) {
        vDir.addVector(vDist.normalize().multiplyNumber(1*i1Dist))
        if (iDist<0) {
          vPos.setVector(vObstacle)
            .addVector(vDist.normalize().multiplyNumber(iObstacle+1.1))
        }
      }
      vDist.drop()
    })
    // sides
    //let iSideDstL = vPos.getX()-iGridSize
    if (vPos.getX()<iGridSize&&vDir.getX()<0) {
      let fDstL = vPos.getX()
        ,f1DstL = 1/fDstL
      vDir.addVector(vector(f1DstL,0).drop())
      //vDir.rotate(.01*(vDir.getY()>0?-1:1))
    } else if (vPos.getX()>(iW-iGridSize)&&vDir.getX()>0) {
      let fDstR = iW-vPos.getX()
        ,f1DstR = 1/fDstR
      vDir.addVector(vector(-f1DstR,0).drop())
    }
    // move
    vPos.addVector(vDir.clone().multiplyNumber(deltaT).drop())
    x = vPos.getX()
    y = vPos.getY()
    // wrap edges
    if (x<0||x>iW) {
      x = (x+iW)%iW
      vPos.setX(x)
    }
    if (y<0||y>iH) {
      y = (y+iH)%iH
      vPos.setY(y)
    }
    // done
    oBoid.x = x
    oBoid.y = y
  }
  return oBoid
}
function getBoidGridPos(boid) {
  return getGridPos(boid.x,boid.y)
}
function getGridPos(x,y) {
  //return (y/iGridSize<<0)*iGridW + (x/iGridSize<<0)
  return (((y/iGridSize<<0)+iGridH)%iGridH)*iGridW + ((x/iGridSize<<0)+iGridW)%iGridW
}
function setGrid() {
  let i = iGridLength
  while (i--) {
    aGrid[i].length = 0
  }
  //
  i = iBoids
  while (i--) {
    if (aBoids[i]===undefined) {
      //console.log('aBoids',i,aBoids); // log
      aBoids[i] = boid()
    }
    let oBoid = aBoids[i]
      ,iGridPos = getBoidGridPos(oBoid)
    if (iGridPos<iGridLength) aGrid[iGridPos].push(oBoid)
  }
  //
  i = iGridLength
  while (i--) {
    let aCell = aGrid[i]
      ,aAround = aCell.around
    aAround.length = 0
    push.apply(aAround,gridIndex(i-1))
    push.apply(aAround,gridIndex(i+1))
    push.apply(aAround,gridIndex(i-iGridW))
    push.apply(aAround,gridIndex(i+iGridW))
    push.apply(aAround,gridIndex(i-iGridW-1))
    push.apply(aAround,gridIndex(i-iGridW+1))
    push.apply(aAround,gridIndex(i+iGridW-1))
    push.apply(aAround,gridIndex(i+iGridW+1))
  }
}
function gridIndex(i) {
  return aGrid[(i+iGridLength)%iGridLength]
}
function getNeighbours(boid) {
  let iGridPos = getBoidGridPos(boid)
    ,aCell = aGrid[iGridPos]
  aNb.length = 0
  push.apply(aNb,aCell)
  aNb.splice(aNb.indexOf(boid),1)
  push.apply(aNb,aCell.around)
  return aNb
}

export default inst.expose