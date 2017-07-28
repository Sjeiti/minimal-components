import experiment from './base'
import lcg from '../math/lcg'
import color from '../math/color'
import perlin from '../math/perlin'

let inst = experiment('hypno',{
    init
    ,exit
    ,handleAnimate
    ,handleResize
  })
  ,zuper = inst.zuper
  //
  ,random = lcg.random
  ,noise = perlin.noise
  ,PI = Math.PI
  ,PI2 = 2*PI
  ,PIH = PI/2
  ,ceil = Math.ceil
  ,w,h
  //
  ,target
  ,canvas
  ,context
  ,bgCanvas = document.createElement('canvas')
  ,bgContext = bgCanvas.getContext('2d')
  ,flakeCanvas = document.createElement('canvas')
  ,flakeContext = flakeCanvas.getContext('2d')
  ,flakeSize = 64*2
  ,flakeMax = flakeSize
  ,flakeGradient
  ,flakeHalf = flakeSize/2
  ,ringNum = 8
  ,flakeLine = flakeHalf/ringNum
  ,flakeWidth = flakeHalf*(1/ringNum*(ringNum-1))
  //
  ,gridSize = 64
  ,gridRadius = 100
  ,noiseScale = 0.3
  ,noiseSpeed = 2E-7
  ,gridX,gridY
  //
  ,sineList = []
  ,sineListSize = PI2*gridRadius<<0
  //
  ,offsetX = 1E-7
  ,offsetY = 1E-7
  ,counter = 1E6
  ,millisLast = Date.now()

function init(_target){
  target = _target
  canvas = zuper.init(_target)
  context = inst.context
  //
  handleResize()
  //
  drawFlake(1)
  const oColor = color().randomize()
  flakeGradient = flakeContext.createRadialGradient(flakeHalf,flakeHalf,flakeWidth,flakeHalf,flakeHalf,0)
  flakeGradient.addColorStop(1,oColor.clone().divide(3))
  flakeGradient.addColorStop(0,oColor.rgba(0))
  //
  if (sineList.length===0) {
    for (let i=0;i<sineListSize;i++) {
      sineList.push(Math.sin(i/sineListSize*PI2))
    }
  }
  //
  return canvas
}

function exit(){
  zuper.exit()
}

function handleAnimate(deltaT,millis){
  let i
  counter += (inst.isMouseDown?1:-1)*(millis-millisLast)
  millisLast = millis
  drawFlake(millis)
  //
  context.globalAlpha = 1
  context.globalCompositeOperation = 'source-over'
  context.drawImage(bgCanvas,0,0)
  //
  const aIndexed = []
  for (i = 0; i < gridX; i++) {
    for (let k = 0; k < gridY; k++) {
      const iX = i - ceil(offsetX/gridSize)
        ,iY = k - ceil(offsetY/gridSize)
        ,iSeed = 131071*iX*iX + 8191*iY*iY
        ,fRandom = random(iSeed)
        ,fNoise1 = 3075 + noiseScale*iX
        ,fNoise2 = 4571 + noiseScale*iY
        ,fNoiseMillis = noise(fNoise1,fNoise2,noiseSpeed*counter)
        ,fRadians = 5E3*fNoiseMillis
        ,iSize = flakeSize+(8191*fRandom%flakeMax)

      aIndexed.push({
        x: i*gridSize + gridRadius*sin(fRadians) - gridRadius + offsetX%gridSize - iSize/2
        ,y: k*gridSize + gridRadius*cos(fRadians) - gridRadius + offsetY%gridSize - iSize/2
        ,z: random(iSeed)
        ,size: iSize
      })
    }
  }
  aIndexed.sort(function(a,b){return a.z>b.z?1:-1;})
  let l = aIndexed.length
  for (i = 0; i < l; i++) {
    let oFlake = aIndexed[i]
    context.drawImage(
      flakeCanvas
      ,0,0,flakeSize,flakeSize
      ,oFlake.x
      ,oFlake.y
      ,oFlake.size,oFlake.size
    )
  }
  }

function handleResize(){
  zuper.handleResize()
  w = inst.w
  h = inst.h
  //
  let gridAdd = ceilGrid(gridRadius)
  gridX = ceilGrid(w) + 2*gridAdd
  gridY = ceilGrid(h) + 2*gridAdd
  bgCanvas.width = w
  bgCanvas.height = h
  //
  console.log('bgContext',bgContext,w,h,diagonal); // todo: remove log
  let gradientColor = color().randomize()
    ,diagonal = Math.sqrt(w*w+h*h)
    ,gradient = bgContext.createRadialGradient(w/2,h/2,0,w/2,h/2,diagonal)

  gradient.addColorStop(0,gradientColor)
  gradient.addColorStop(1,gradientColor.divide(3))
  bgContext.fillStyle = gradient
  bgContext.fillRect(0,0,w,h)
}

function drawFlake(t) {
  flakeCanvas.width = flakeCanvas.height = flakeSize
  flakeContext.lineWidth = flakeHalf/ringNum/2
  flakeContext.fillStyle = flakeGradient
  flakeCanvas.globalCompositeOperation = 'source-over'
  flakeContext.arc(flakeHalf,flakeHalf,flakeWidth,0,Math.PI*2)
  flakeContext.fill()
  flakeContext.globalCompositeOperation = 'destination-out'
  for (let i=0,l=ringNum;i<l;i++) {
    const iPrt = flakeHalf - (i/l)*flakeHalf - (flakeLine - ((0.01*t)%flakeLine))
    flakeContext.beginPath()
    flakeContext.arc(flakeHalf,flakeHalf,Math.max(0,iPrt),0,Math.PI*2)
    flakeContext.stroke()
  }
}

function ceilGrid(i) {
  return ceil((i+1E-6)/gridSize)
}

function sin(f) {
  return sineList[((f/PI2)*sineListSize%sineListSize)<<0]
}

function cos(f) {
  return sin(f+PIH)
}

export default inst.expose