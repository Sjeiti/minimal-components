import experiment from './base'
import perlin from '../math/perlin'
import color from '../math/color'

let inst = experiment('glass',{
		init
		,exit
		,handleAnimate
		,handleResize
	})
	,zuper = inst.zuper
  //
  ,noise = perlin.noise
  ,PI = Math.PI
  ,w,h,wHalf,hHalf
  //
  ,target
  ,canvas
  ,context
  //
  ,numbers = [0,0,0,0]
  ,gradient
  ,pattern

function init(_target) {
  target = _target
  canvas = zuper.init(_target)
  canvas.addEventListener('click',handleCanvasClick)
  context = inst.context
  handleResize()
  handleCanvasClick()
  return canvas
}

function exit(){
  zuper.exit()
  canvas.removeEventListener('click', handleCanvasClick)
}

// protected methods

function handleAnimate(deltaT,millis){
  let speed = 0.000002*millis
    ,scale = 1+(noise(numbers[0]-10*speed)-0.5)
    ,rotation = ((2.3+3*noise(numbers[1]+speed))%2)*PI
    ,offset1 = noise(numbers[2]-speed)-0.5
    ,offset2 = noise(numbers[3]+speed)-0.5
    ,offset = scale*2347
    ,offsetX = offset*offset1
    ,offsetY = offset*offset2

  //
  context.beginPath()
  //
  context.globalAlpha = 0.1
  context.fillStyle = gradient
  context.fillRect(0,0,w,h)
  //
  context.globalAlpha = 1
  pattern = context.createPattern(canvas,'repeat')
  context.fillStyle = pattern
  context.save()
  context.rect(0,0,w,h)
  context.translate(wHalf+offsetX,hHalf+offsetY)
  context.scale(scale,scale)
  context.rotate(rotation)
  context.fill()
  context.restore()
  //
  context.closePath()
  //
  pattern = null
}

function handleResize(){
  zuper.handleResize()
  w = inst.w
  h = inst.h
  wHalf = w/2
  hHalf = h/2
}

// private methods

function handleCanvasClick() {
  let gradientColor = color(0).randomize().lightness(0.1).toString()
  gradient = context.createLinearGradient(0,0,0,h)
  gradient.addColorStop(0,gradientColor)
  gradient.addColorStop(1,gradientColor)
  for (let i = 0,l=1+(5*Math.random()<<0); i < l; i++) {
    let fStop = (1+i)*(1/(l+1))
    gradient.addColorStop(fStop,color(0).randomize().saturation(1).toString())
  }
  context.fillStyle = gradient
  context.fillRect(0,0,w,h)
  //
  numbers.forEach(function(o,i) {
    numbers[i] = Math.random()*1E9<<0
  })
}

export default inst.expose