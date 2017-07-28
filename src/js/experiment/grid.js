import experiment from './base'
import perlin from '../math/perlin'
import color from '../math/color'

let inst = experiment('grid',{
		init
		,handleAnimate
		,handleResize
	})
	,zuper = inst.zuper
	//
  ,noise = perlin.noise
  ,w,h,wHalf,hHalf
  //
  ,target
  //
  ,colorBack
  ,colorFront = '#f04'
  ,colorBackFade
  //
  ,canvas
  ,context
  //
  ,patternCanvas
  ,patternContext
  ,patternSize = 2
  ,patternFront

function init(_target) {
  target = _target
  canvas = zuper.init(_target)
  context = inst.context
  //
  handleResize()
  //
  colorBack = color('#599cee').multiply(0.2).toString()
  colorBackFade = color(colorBack).rgba(0.4).toString()
  //
  patternCanvas = document.createElement('canvas')
  patternContext = patternCanvas.getContext('2d')
  //
  patternFront = getPattern(patternSize * 4,patternSize * 4,function () {
    patternContext.fillStyle = colorFront
    patternContext.fillRect(patternSize,patternSize,patternSize * 2,patternSize * 2)
  })
  //
  return canvas
}

// protected methods

function handleAnimate(deltaT,millis) {
  canvas.width = canvas.width
  let speed = 0.0001 * millis
			,scale = 1 + 8 * noise(213 - speed)
			,offset1 = noise(78657 - speed) - 0.5
			,offset2 = noise(25973 + speed) - 0.5
			,offsetX
			,offsetY
  for (let i = 0; i<6; i++) {
    scale *= 0.1 * i + 1
    let isFirst = i===0,offset = scale * i * 50
    offsetX = offset * offset1
    offsetY = offset * offset2
    //
    context.globalCompositeOperation = 'source-over'
    //
    context.fillStyle = isFirst?colorBack:colorBackFade
    context.fillRect(0,0,w,h)
    //
    context.globalCompositeOperation = 'lighter'
    //
    context.fillStyle = patternFront
    context.save()
    context.rect(0,0,w,h)
    context.translate(wHalf + offsetX,hHalf + offsetY)
    context.scale(scale,scale)
    context.rotate(((2 + 3 * noise(73237.14 + speed + 0.03 * i,8376.12)) % 2) * Math.PI)
    context.fill()
    context.restore()
  }
}

function handleResize(){
  zuper.handleResize()
  w = inst.w
  h = inst.h
  wHalf = w/2
  hHalf = h/2
}

// private methods

function getPattern(w,h,fn){
  patternCanvas.width = w
  patternCanvas.height = h
  fn(context)
  return context.createPattern(patternCanvas,'repeat')
}

export default inst.expose