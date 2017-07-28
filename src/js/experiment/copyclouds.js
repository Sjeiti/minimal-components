import experiment from './base'
import lcg from '../math/lcg'
import perlin from '../math/perlin'

let inst = experiment('copyclouds',{
    init
    ,handleAnimate
    ,handleResize
  })
  ,zuper = inst.zuper
  ,rnd = lcg.random
  ,noise = perlin.noise
  //
  ,imageData
  ,data
  //
  ,target
  ,w,h
  //
  ,canvas
  ,context
  ,canvasTmp = document.createElement('canvas')
  ,contextTmp = canvasTmp.getContext('2d')
  //
  ,iSize = 32
  ,fRds = 2
  ,fNoiseScale = 0.02

function init(_target){
  target = _target
  canvas = zuper.init(_target)
  context = inst.context
  //
  handleResize()
  //
  return canvas
}
function handleResize(){
  zuper.handleResize.call(zuper,arguments)
  canvasTmp.width = w = target.clientWidth
  canvasTmp.height = h = target.clientHeight
  if (w*h) {
    imageData = context.createImageData(w,h)
    data = imageData.data
  }
}
function handleAnimate(deltaT,millis) {
  // rnd((millis*0.001)<<0)
  rnd(millis)
  for (let i=0,l=4*w*h;i<l;i+=4) {
    let gray = rnd()*255<<0//Math.random()*255<<0
    // let ii = i/4
    //     ,x = ii%w
    //   ,y = ii/w<<0
    //   ,gray = noise(
    //     1243+x*fNoiseScale
    //     ,2231+y*fNoiseScale
    //     ,5231+millis*.0001
    //   )*255<<0
  	data[i+0] = rnd()*255<<0
  	data[i+1] = rnd()*255<<0
  	data[i+2] = rnd()*255<<0
  	data[i+3] = 255
  }
  contextTmp.putImageData(imageData,0,0)
  contextTmp.globalAlpha = 0.7
  // context.globalCompositeOperation = 'multiply'
  for (let i=1,l=6;i<l;i++) {
    contextTmp.drawImage(canvasTmp,0,0,w,h,-rnd()*(w*i-w),-rnd()*(h*i-h),w*i,h*i)
  }
  //
  context.globalAlpha = 0.1
  context.drawImage(canvasTmp,0,0)
}

export default inst.expose