/**
 * Webgl marble displacement mapping
 * @module experiment/marbles
 * @see module:experiment/base
 */
import webgl from './webgl'
import Matter from 'matter-js'


let random = Math.random
    ,rnd = f=>f*(Math.random()-0.5)
    //
    ,Body
    ,Engine
    ,engine
    ,world
    //
    ,numMarbles = 16
    ,marbles = []
    ,marbleSelected
    //
    ,w,h
    //
    ,holeOffset = 0.35
    ,holePosition = {x:0,y:0}
    ,holeSize = 50
    //
    ,randomPulseTime = 0
    ,keyPressed = false
    //
    ,inst = webgl('marbles','/static/glsl/marbles.glsl',{
      images: {
        ground: '/static/img/wood.jpg'//'/static/img/stonetiles.jpg'//'/static/img/concrete.jpg'//'/static/img/concrete.jpg'//'/static/img/sand.jpg'//'/static/img/linen.jpg'//'/static/img/knit.jpg'//'/static/img/pavement.jpg'//'/static/img/felt.jpg'//
        ,sky: '/static/img/sky.jpg'
      }
      ,init
      ,handleAnimate
      ,handleResize
      ,handleDragStart
      ,handleDragEnd
      ,handleKeyPress
      ,handleKeyUp
    })
    ,touchListPos = inst.touchListPos
    ,setUniform = inst.setUniform
    ,addUniformChange = inst.addUniformChange

function init(){
  w = inst.target.clientWidth
  h = inst.target.clientHeight

  randomPulseTime = Date.now() + 10000

  addUniformChange('holeSize',[holeSize])

  Engine = Matter.Engine
  Body = Matter.Body
  engine = engine||Engine.create()

  world = engine.world
  world.gravity.y = 0

  for (let i=0;i<numMarbles;i++) {
    marbles.push(setMarble())
  }
  Matter.World.add(world,marbles);
}

function handleAnimate(fps,millis){
  Engine.update(engine,1/fps);
  /*if (!window.foo&&millis>2000) {
    console.log('marbles[0]',marbles[0]); // todo: remove log
    window.foo = true
  }*/
  // teleport at borders
  let w = inst.w
      ,h = inst.h
      ,dw = w/2
      ,dh = h/2
  marbles.forEach(marble=>{
    let position = marble.position
        ,x = position.x
        ,y = position.y
        ,nx = x
        ,ny = y
        ,out = false
    if (x>dw) {
      out = true
      nx = x - w
    } else if (x<-dw) {
      out = true
      nx = x + w
    }
    if (y>dh) {
      out = true
      ny = y - h
    } else if (y<-dh) {
      out = true
      ny = y + h
    }
    out&&Body.setPosition(marble,{x:nx,y:ny})
    // track travel
    let velocity = marble.velocity
        ,vx = velocity.x
        ,vy = velocity.y
    marble.travel += (vx>0?-1:1)*Math.sqrt(vx*vx+vy*vy)
    //
    if (keyPressed) {
      let g = 0.0001
          ,keyOffsetX = holeOffset*w
      Body.setVelocity(marble, {x:vx-g*(x+keyOffsetX),y:vy-g*y})
    }
    // hole
    let distHoleX = x - holePosition.x
        ,distHoleY = y - holePosition.y
        ,distHole = Math.sqrt(distHoleX*distHoleX+distHoleY*distHoleY)
    if (distHole<holeSize) {
      let holeDepth = 0.03
      Body.setVelocity(marble, {x:vx-holeDepth*distHoleX,y:vy-holeDepth*distHoleY})
      if (marble.timeInHole===0) {
        marble.timeInHole = Date.now()
      } else if (millis - marble.timeInHole>3000) {
        let shrink = 1
        if (marble.circleRadius-shrink<0.0) {
          resetMarble(marble)
        } else {
          marble.circleRadius -= shrink
        }
      }
    } else if (marble.timeInHole!==0) {
      marble.timeInHole = 0
    }
    //
  })
  // random
  if (randomPulseTime<millis) {
    setRandomPulseTime(500,5000)
    if (!inst.isMouseDown) {
      let rndMarble = marbles[Math.random()*numMarbles<<0]
      Body.setVelocity(rndMarble, {x:rnd(22),y:rnd(11)})
    }
  }
  // moving hole
  /*let holecx = holeOffset*w
      ,holecy = 0
      ,radians = 0.001*millis
      ,radius = 50
      ,holex = holecx + radius*Math.sin(radians)
      ,holey = holecy + radius*Math.cos(radians)
  holePosition.x = holex;
  holePosition.y = holey;
  addUniformChange('holePosition'[holePosition.x,holePosition.y])*/
  // view
  let gl = this.gl
      ,program = this.program
  marbles.forEach((marble,i)=>{
    let location
        ,position = marble.position
        ,baseName = 'marbles['+i+']'
    setUniform(baseName+'.position',[position.x,position.y])
    setUniform(baseName+'.travel',[marble.travel])
    setUniform(baseName+'.size',[marble.circleRadius])
    setUniform(baseName+'.color1',marble.color1)
    setUniform(baseName+'.color2',marble.color2)
    setUniform(baseName+'.selected',[marble.selected?1.0:0.0])
  })
}

function handleResize(_w,_h){
  w = _w
  h = _h
  let isLandscape = w>h
  holePosition.x = isLandscape?holeOffset*w:0
  holePosition.y = isLandscape?0:holeOffset*h
  addUniformChange('holePosition',[holePosition.x,holePosition.y])
}

function setMarble(marble){
  let isLandscape = w>h
      ,x = isLandscape?rnd(222)-holeOffset*w:rnd(333)
      ,y = isLandscape?rnd(333):rnd(222)-holeOffset*h
      ,v = 2.0
      ,circleRadius = (20+rnd(15))
  //
  // force 16 vertices for all marbles
  if (marble===undefined) marble = Matter.Bodies.polygon(x, y, 16, circleRadius, {circleRadius,label: 'Circle Body'})
  //
  Body.setPosition(marble, {x,y})
  Body.setVelocity(marble, {x:0,y:0})
  Matter.Body.set(marble, {
      circleRadius
      ,positionPrev: { x: x + rnd(v), y: y + rnd(v) }
      ,friction: 0.0001
      ,frictionAir: 0.01
      ,restitution: 0.66 //http://hypertextbook.com/facts/2006/restitution.shtml
  })
  // change radius
  if (marble.orgRadius&&marble.orgRadius!==circleRadius) {
    let scale = circleRadius/marble.orgRadius
    // Matter.Body.scale(marble, scale) // shit disappears
    Matter.Vertices.scale(marble.vertices,scale,scale)
    Matter.Bounds.update(marble.bounds, marble.vertices)
    Matter.Body.setVertices(marble, marble.vertices)
    marble.orgRadius = circleRadius
  }
  //
  marble.color1 = [random(),random(),random()]
  marble.color2 = [random(),random(),random()]
  marble.travel = 0
  marble.selected = false
  marble.timeInHole = 0
  marble.orgRadius = circleRadius
  //
  return marble
}

function resetMarble(marble){
  setMarble(marble)
}

function handleDragStart(add,touches,e){
  let pos = touchListPos(add)
      ,x = pos.x - inst.w/2
      ,y = -(pos.y - inst.h/2)
      ,closest
      ,closestD = Number.POSITIVE_INFINITY
  marbles.forEach(marble=>{
    let pos = marble.position
        ,dx = x-pos.x
        ,dy = y-pos.y
        ,d = Math.sqrt(dx*dx+dy*dy)
    if (d<closestD) {
      closestD = d
      closest = marble
    }
  })
  if (closest) {
    marbleSelected = closest
    marbleSelected.selected = true
  }
}

function handleDragEnd(removed,touches,e){
  if (marbleSelected) {
    let pos = touchListPos(removed)
        ,x = pos.x - inst.w/2
        ,y = -(pos.y - inst.h/2)
        ,position = marbleSelected.position
        ,velocity = marbleSelected.velocity
        ,marbleX = position.x
        ,marbleY = position.y
        ,dx = x-marbleX
        ,dy = y-marbleY
        ,d = Math.sqrt(dx*dx+dy*dy)
        ,force = 5E-5*d
    Body.setVelocity(marbleSelected, {x:velocity.x+force*dx,y:velocity.y+force*dy})
    marbleSelected.selected = false
    marbleSelected = null
    setRandomPulseTime()
  }
}

function handleKeyPress(){
	keyPressed = true
}

function handleKeyUp(){
	keyPressed = false
}

function setRandomPulseTime(mint=10000,maxt=15000){
  randomPulseTime = Date.now() + Math.round(mint+(maxt-mint)*Math.random())
}

export default inst.expose