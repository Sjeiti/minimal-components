/**
 * A zooming canvas
 * @module experiment/starzoom
 * @see module:experiment/base
 */
import experiment from './base'

let inst = experiment('starzoom',{
    init
    ,handleAnimate
    ,handleResize
  })
  ,zuper = inst.zuper
  //
  ,target
  ,w
  ,h
  //
  ,canvas,context
  ,imgData,pixels
  //
  ,tempCanvas,tempContext
  //
  ,particles = 11
  ,zoom = 1.3
  ,zw,zh,zx,zy

function init(_target){
  target = _target
  canvas = zuper.init(_target)
  context = inst.context
  //
  tempCanvas = document.createElement('canvas')
  tempContext = tempCanvas.getContext('2d')
  //
  handleResize()
  //
  return canvas
}

function handleAnimate(){ // deltaT,millis
  context.drawImage(canvas,zx,zy,zw,zh)
  imgData = context.getImageData(0,0,w,h)
  pixels = imgData.data
  let x, y, n, i = particles
  while (i--) {
    x = (w/2 + 10*(Math.random()-    0.5))<<0
    y = (h/2 + 10*(Math.random()-0.5))<<0
    n = 4*(y*w+x)
    pixels[n]   = 128+128*Math.random()<<0
    pixels[n+1] = 128*Math.random()<<0
    pixels[n+2] = 128*Math.random()<<0
    pixels[n+3] = 255
  }
  context.putImageData(imgData, 0, 0)
}

function handleResize(){
  tempCanvas.width = canvas.width
  tempCanvas.height = canvas.height
  tempContext.drawImage(canvas,0,0,canvas.width,canvas.height)
  //
  w = target.clientWidth
  h = target.clientHeight
  zw = zoom*w
  zh = zoom*h
  zx = (w-zw)/2
  zy = (h-zh)/2
  //
  canvas.width = w
  canvas.height = h
  context.drawImage(tempCanvas,0,0,tempCanvas.width,tempCanvas.height,0,0,w,h)
  imgData = context.getImageData(0,0,w,h)
}

export default inst.expose