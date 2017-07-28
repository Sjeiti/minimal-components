import experiment from './base'
import color from '../math/color'
import vector from '../math/vector'
import {resize,animate,dragstart,drag,dragend} from '../signal/signals'
import {createGradient,drawCircle,drawPolygon,drawPolygram} from '../utils/canvasrenderingcontext2d'

  let inst = experiment('touches',{
    init
    ,exit
    ,handleAnimate
    ,handleResize
  })
  ,zuper = inst.zuper
  //
  // private variables
  ,target
  //
  ,w,h
  //
  ,deltaT
  //
  ,canvas
  ,context
  ,canvasTemp = document.createElement('canvas')
  //
  ,rings = {}
  ,ringsPool = []


function init(_target){
  target = _target
  canvas = zuper.init(_target)
  context = inst.context
  handleResize()
  //
  for (let i=0;i<20;i++) ringsPool.push(ring({pos:0}))
  //
  let nr = 0
    ,sizeMax = 125
    ,fnSpawn = function(){
      let fakeID = 'a'+nr++
        ,isHorVer = Math.random()<0.5
        ,fakeTouch = drag.touch(fakeID,vector(
          !isHorVer?-sizeMax+(w+2*sizeMax)*Math.random():(Math.random()<0.5?-sizeMax:w+sizeMax)
          ,isHorVer?-sizeMax+(h+2*sizeMax)*Math.random():(Math.random()<0.5?-sizeMax:h+sizeMax)
        ))
      fakeTouch.last.add(vector(9*(Math.random()-0.5),9*(Math.random()-0.5)))
      rings[fakeID] = getRing(fakeTouch)
      rings[fakeID].setSize(1).kill()
    }

  //
  setInterval(fnSpawn,1999)
  for (let i=0;i<5;i++) setTimeout(fnSpawn,i*40)
  //
  target.appendChild(canvas)
  //
  drag.stopPageScroll = false
  animate.add(handleAnimate)
  resize.add(handleResize)
  dragstart.add(function(added){//,touches){
    added.forEach((otouch,id)=>rings[id] = getRing(otouch))
  })
  dragend.add(function(del){//,touches){
    del.forEach((otouch,id)=>rings[id].kill())
  })
  //
  return canvas
}

function exit() {
  //todo:remove drag
  zuper.exit()
}

// protected methods

function handleAnimate(_deltaT,millis,frames){
  deltaT = _deltaT
  for (let ring in rings) rings[ring].update(context,deltaT,millis,frames)
}

function handleResize(){
  w = target.clientWidth
  h = target.clientHeight
  canvasTemp.width = canvas.width
  canvasTemp.height = canvas.height
  canvasTemp.getContext('2d').drawImage(canvas,0,0)
  canvas.width  = w
  canvas.height = h
  context.drawImage(canvasTemp,0,0)
}

function getRing(touch){
  return ringsPool.length?ringsPool.shift().reset(touch):ring(touch)
}

function ring(touch){
  let touchPos = touch.pos
    ,rotation = 1
    ,sizeMin = 1
    ,sizeMax = 250
    ,sizeMaxH = sizeMax/2
    ,sizeDead
    ,size = sizeMin
    ,ageMax = 333
    ,born = Date.now()
    ,died = 0
    ,diedMax = 15000
    ,dead
    ,typeMax = 8
    ,type = (typeMax*Math.random())<<0
    ,sprite = (function(){
      let  sprite = document.createElement('canvas')
        ,spriteContext = sprite.getContext('2d')
        ,sizeMaxHalf = sizeMax/2
        ,colorSprite = color.apply(color,[192+Math.random()*63<<0,Math.random()*64<<0,Math.random()*255<<0].sort(function(){return Math.random()<0.5?1:-1;}))
        ,colorShade = colorSprite.clone().multiply(0.6).rgba(0.4)
        ,fill = createGradient.call(spriteContext,type!==0,sizeMaxHalf
        // ,fill = crc.createGradient(spriteContext,type!==0,sizeMaxHalf
          ,0		,colorSprite.clone().multiply(0.9)
          ,0.6999	,colorSprite
          ,0.7	,colorShade
          ,1		,colorSprite.clone().multiply(0.7).rgba(0)
        )

      sprite.width = sprite.height = sizeMax
      spriteContext.translate(sizeMaxH,sizeMaxH)
      spriteContext.fillStyle = fill
      if (type===0)		drawCircle.call(spriteContext,0,0,sizeMaxH)
      else if (type<5)	drawPolygon.call(spriteContext,0,0,sizeMaxH,type+2)
      else				drawPolygram.call(spriteContext,0,0,sizeMaxH,1-2.2/(type-2),type-2)
      // if (type===0)		crc.drawCircle(spriteContext,0,0,sizeMaxH)
      // else if (type<5)	crc.drawPolygon(spriteContext,0,0,sizeMaxH,type+2)
      // else				crc.drawPolygram(spriteContext,0,0,sizeMaxH,1-2.2/(type-2),type-2)
      return sprite
    })()
    ,animateSignal

  function updateView(context,x,y,scale,rotation,alpha) {
    if (alpha!==1) context.globalAlpha = alpha
    context.translate(x,y)
    context.scale(scale,scale)
    context.rotate(rotation)
    context.drawImage(sprite,-sizeMaxH,-sizeMaxH)
    context.setTransform(1,0,0,1,0,0)
    if (alpha!==1) context.globalAlpha = 1
  }
  function update(context,deltaT,millis){//,frames) {
    let isAlive = died===0
      ,age = millis-(isAlive?born:died)
      ,maxAge = isAlive?ageMax:diedMax
      ,sizeFrom = isAlive?sizeMin:sizeDead
      ,sizeTo = isAlive?sizeMax:sizeMin
    if (age<maxAge) {
      let ageOne = age/maxAge
      size = sizeFrom + ageOne*(sizeTo-sizeFrom)
      if (!isAlive) {
        let centerDistance = vector(w/2,h/2).subtract(touchPos)
          ,centerDistanceSize = centerDistance.size()
        dead.add(centerDistance.multiplyNumber(1/(centerDistanceSize*centerDistanceSize)))
        touch.pos.add(dead.clone().multiply(deltaT))
        rotation = rotation+0.01*deltaT*dead.size()
        if   (touchPos.getX()<-9999
          ||touchPos.getX()>w+9999
          ||touchPos.getY()<-9999
          ||touchPos.getY()>h+9999) fnDie()
      }
    } else if (!isAlive) {
      fnDie()
    }
    let sizeOne = size/sizeMax
      ,fade = 0.1
    updateView(
      context
      ,touchPos.getX()
      ,touchPos.getY()
      ,sizeOne/2+0.5
      ,rotation
      ,sizeOne<fade?sizeOne/fade:1
    )
  }
  function moveTo(x,y){
    if (animateSignal) animatecancel()
    let  starX = touchPos.getX()
      ,starY = touchPos.getY()
      ,distX = x-starX
      ,distY = y-starY
    animateSignal = animate.during(
        800
        ,f=>updateView(starX+f*distX,starY+f*distY)
        ,kill
    )
  }
  function setSize(f){
    let ff = f>1?1:f<0?0:f
    size = sizeMax*ff
    born = Date.now()-ageMax*ff
    return returnValue
  }
  function kill(){
    if (died===0) {
      died = Date.now()-(1-size/sizeMax)*diedMax
      sizeDead = size
      dead = touch.pos.clone().subtract(touch.last).divide(deltaT)
    }
  }
  function fnDie(){
    ringsPool.push(rings[touch.id])
    delete rings[touch.id]
  }
  let returnValue = {
    update
    ,moveTo
    ,setSize
    ,kill
    ,toString: ()=>'[object ring '+touch.id+']'
  }
  returnValue.reset = function(tch){
    touch = tch
    touchPos = touch.pos
    born = Date.now()
    died = 0
    return returnValue
  }
  return returnValue
}

export default inst.expose