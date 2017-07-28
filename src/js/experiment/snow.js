import experiment from './base'
import lcg from '../math/lcg'
import perlin from '../math/perlin'
import {Cubic, TweenMax} from 'gsap'
import {dragstart,drag,dragend} from '../signal/signals'

let inst = experiment('snow',{
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
  ,w,h
  //
  ,target
  ,canvas
  ,context
  ,canvasBg = document.createElement('canvas')
  ,contextBg = canvasBg.getContext('2d')
  ,canvasFlake = document.createElement('canvas')
  ,contextFlake = canvasFlake.getContext('2d')
  ,flakeSize = 3
  ,flakeMax = 8*flakeSize
  //
  ,gridSize = 30
  ,gridRadius = 100
  ,noiseScale = 0.3
  ,noiseSpeed = 1E-7
  ,gridX,gridY
  //
  ,sineList = []
  ,sineListSize = PI2*gridRadius<<0
  //
  ,offsetX = 1E-7
  ,offsetY = 1E-7
  ,counter = 1E6
  ,millisLast = millis()
  //
  ,isMouseDown = false
  ,lastX
  ,lastY

function init(_target){
  target = _target
  canvas = zuper.init(_target)
  context = inst.context
  //
  handleResize()
  //
  canvasFlake.width = canvasFlake.height = flakeSize
  contextFlake.fillStyle = '#ffffff'
  contextFlake.fillRect(1,1,1,1)
  //
  sineList = []
  for (let i=0;i<sineListSize;i++) {
    sineList.push(Math.sin(i/sineListSize*PI2))
  }
  //
  dragstart.add(handleDragStart)
  drag.add(handleDrag)
  dragend.add(handleDragEnd)
  //
  return canvas
}

function exit(){
  dragstart.remove(handleDragStart)
  drag.remove(handleDrag)
  dragend.remove(handleDragEnd)
  zuper.exit()
}

function handleDragStart(){
  isMouseDown = true
}

function handleDrag(touchList){
  let touch
  touchList.forEach(_touch=>_touch.pos&&(touch=_touch))
  /*loop(touchList,function(id,_touch){
    if(_touch.pos) touch = _touch
  })*/
  if (touch) {
    let x = touch.pos.getX()
      ,y = touch.pos.getY()
    if (lastX!==undefined) {
      offsetX += x-lastX
    }
    lastX = x
    lastY = y
  }
}

function handleDragEnd(){
  isMouseDown = false
  lastX = undefined
}

// protected methods

function handleAnimate(deltaT,millis){
  counter += (isMouseDown?1:-1)*(millis-millisLast)
  millisLast = millis
  offsetY = 0.0200001*counter
  //
  context.globalAlpha = 1
  context.drawImage(canvasBg,0,0)
  //
  for (let i = 0; i < gridX; i++) {
    for (let k = 0; k < gridY; k++) {
      let x = i - ceil(offsetX/gridSize)
        ,y = k - ceil(offsetY/gridSize)
        ,seed = 131071*x*x + 8191*y*y
        ,randomFloat = random(seed)
        ,noise1 = 3075 + noiseScale*x
        ,noise2 = 4571 + noiseScale*y
        ,noiseMillis = noise(noise1,noise2,noiseSpeed*counter)
        ,radians = 5E3*noiseMillis
        ,size = flakeSize+(8191*randomFloat%flakeMax)

      context.globalAlpha = 1E3*randomFloat%1
      //
      context.drawImage(
        canvasFlake
        ,0,0,flakeSize,flakeSize
        ,i*gridSize + gridRadius*sin(radians) - gridRadius + offsetX%gridSize
        ,k*gridSize + gridRadius*cos(radians) - gridRadius + offsetY%gridSize
        ,size,size
      )
    }
  }
  }

function handleResize(){
  w = target.clientWidth
  h = target.clientHeight
  let gridAdd = ceilGrid(gridRadius)
  gridX = ceilGrid(w) + 2*gridAdd
  gridY = ceilGrid(h) + 2*gridAdd
  canvas.width = w
  canvas.height = h
  canvasBg.width = w
  canvasBg.height = h
  //
  let oGradient = contextBg.createLinearGradient(0,0,0,h)
  oGradient.addColorStop(1,'#004')
  oGradient.addColorStop(0,'#448')
  contextBg.fillStyle = oGradient
  contextBg.fillRect(0,0,w,h)
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