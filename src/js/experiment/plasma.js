import experiment from './base'
import color from '../math/color'
import vector from '../math/vector'

let inst = experiment('plasma',{
    init
    ,handleAnimate
    ,handleResize
  })
  ,zuper = inst.zuper
  //
  // private variables
  ,scale = 1
  ,center = vector(0,0)
  ,points = []
  ,num = 30
  ,elmCanvas
  ,context
  ,w,h
  ,target

function init(_target) {
  //
  target = _target
  //
  elmCanvas = zuper.init(_target)
  elmCanvas.classList.add('canvas')
  elmCanvas.style.zoom = scale
  //
  context = inst.context
  //
  points.length = 0
  for (let i = 0; i<num; i++) points.push(point())
  //
  handleResize()
  //
  return elmCanvas
}

// protected methods

function handleAnimate(deltaT,millis) {
  context.globalCompositeOperation = 'source-over'
  context.fillStyle = '#000'
  context.fillRect(0,0,w,h)

  context.translate(center.getX(),center.getY())
  context.globalCompositeOperation = 'lighter'
  for (let i = 0; i<num; i++) draw(points[i].step(millis))
  context.translate(-center.getX(),-center.getY())

  context.fillStyle = '#800';//'#800'
  context.shadowBlur = 0
  context.shadowColor = 0;//'rgb(0,0,0,0)'
  context.fillRect(0,0,w,h)
}

function handleResize(){
  w = Math.ceil(target.clientWidth/scale)
  h = Math.ceil(target.clientHeight/scale)
  center.set(w/2,h/2,w/4+h/4)
  elmCanvas.width = w
  elmCanvas.height = h
}

// private methods

function point(){
  let position = vector(0,0,0)
    ,speed = vector(0,0,0)
    ,size
    ,color1 = null
    ,color2 = null
    ,color1Time = 1
    ,color2Time = 1
    ,o = {
      toString:function(){return '[object Point]';}
      ,color:null
      ,size:null
      ,setPos:position.set
      ,x:position.getX()
      ,y:position.getY()
      ,setSpd:speed.set
      ,step:step
      ,reset:reset
      ,resetColor:resetColor
    }
  reset()
  function reset() {
    let iSze = 900/scale
      ,fSpd = 3/scale
    position.set(rnd(iSze),rnd(iSze))
    speed.set(rnd(fSpd),rnd(fSpd))
    color1 = color()
    color2 = color()
    o.color = color()
    size = Math.random()*iSze
    return o
  }
  function resetColor(t){
    color2.set(color1.get())
    color1.randomize()
    color1Time = t
    color2Time = t + 10000 + (10000*Math.random()<<0)
  }
  function step(t){
    speed.add(position.clone().multiply(-0.0001)).add(vector(rnd(0.0001),rnd(0.0001)))
    position.add(speed)
    o.x = position.getX()
    o.y = position.getY()
    o.size = 0.1*w+Math.sin(t*0.0004+size)*0.1*w
    if (t>color2Time) resetColor(t)
    o.color.set(color1.get()).average(color2,1-(t-color1Time)/(color2Time-color1Time))
    return o
  }
  return o
}
function draw(point){
  let i = point.size
  context.shadowColor = point.color.hex
  context.shadowBlur = i
  context.fillRect(point.x-i/2,point.y-i/2,i,i)
}
function rnd(f) {
  return f*(Math.random()-0.5)
}

export default inst.expose