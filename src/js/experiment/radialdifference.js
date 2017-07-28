/**
 * Diffence of animated radial gradients
 * @module experiment/radialdifference
 * @see module:experiment/base
 */
import experiment from './base'
import color from '../math/color'
import {Cubic, TweenMax} from 'gsap'

// get an instance
let inst = experiment('radialdifference',{
    init
    ,handleAnimate
    ,handleResize
  })
  ,zuper = inst.zuper
  //
  // private variables
  ,random = Math.random
  ,w,h,wHalf,hHalf
  ,diagonal
  ,wh,cx,cy
  //
  ,canvas
  ,context
  //
  ,target
  //
  ,numPoints = 17
  ,firstPoint
  ,spdv = 0.005
  ,spdn = 0.0004
  ,friction = 0.96
  ,drawDots = false
  ,animT = 4000

window.addEventListener('deviceorientation', orientationhandler, false)
window.addEventListener('MozOrientation', orientationhandler, false)

/**
 * Override base init
 * @param {HTMLElement} _target
 * @returns {HTMLCanvasElement}
 */
function init(_target){
  target = _target
  canvas = zuper.init(_target)
  context = inst.context
  //
  !firstPoint&&handleResize()
  //
  initPoints()
  canvas.addEventListener('click',reset)
  canvas.addEventListener('touchstart',function(){drawDots=true;})
  canvas.addEventListener('touchend',function(){drawDots=false;})
  //
  return canvas
}

/**
 * Override base handleAnimate
 */
function handleAnimate(){//deltaT,millis
  context.clearRect(0, 0, w, h)
  context.globalCompositeOperation = 'difference'
  let point = firstPoint
  while(point){
    point = point
      .step()
      .drawRadial(context)
      .next

  }
  drawDots&&dot(context)
}

/**
 * Override base handleResize
 */
function handleResize(){
  zuper.handleResize()
  w = inst.w
  h = inst.h
  wh = w+h
  cx = wHalf = w/2
  cy = hHalf = h/2
  diagonal = Math.sqrt(w*w+h*h)
  spdv = 2.5/diagonal
}

function initPoints(){
  let i = numPoints, lastPoint, endPoint
    ,pointPrototype = {
      init: function(o){
        for (let key in o) if (o.hasOwnProperty(key)) this[key] = o[key]
        return this
      }
      ,setRadius: function(){
        this.mass = 1 + 0.7*(random()-0.5)
        this.r = this.mass*diagonal/2
        return this
      }
      ,setColor: function(){
        let fnBool = function(){return random()<0.5?'F':'0';}
        this.c1 =  '#'+fnBool()+fnBool()+fnBool()
        this.c2 = this.c1.replace(/F/g,'g').replace(/0/g,'F').replace(/g/g,'0')
        return this
      }
      ,step: function(){
        let p = firstPoint
          ,vx = this.vx
          ,vy = this.vy
          ,x = this.x
          ,y = this.y

        while (p){
          if (p!==this){
            let dx = p.x-x
              ,dy = p.y-y
              ,mdist = 8/(dx*dx+dy*dy)

            vx -= mdist*dx
            vy -= mdist*dy
          }
          p = p.next
        }
        let n = this.next||firstPoint
          ,previous = this.previous
          ,ex = (n.x+previous.x)/2
          ,ey = (n.y+previous.y)/2
          ,previousdx = ex-x
          ,previousdy = ey-y
        vx += spdn*previousdx
        vy += spdn*previousdy
        //
        vx = friction*(vx-spdv*(x-cx))
        vy = friction*(vy-spdv*(y-cy))
        this.x += this.mass*vx
        this.y += this.mass*vy
        this.vx = vx
        this.vy = vy
        //
        return this
      }
      ,drawRadial: function(context){
        let x = this.x
          ,y = this.y
          ,r = this.r
          ,gradient = context.createRadialGradient(x,y,r,x,y,0)
        gradient.addColorStop(0,this.c1)
        gradient.addColorStop(1,this.c2)
        context.fillStyle = gradient
        context.fillRect(0,0,w,h)
        return this
      }
    }

  //
  while (i--) {
    lastPoint = firstPoint
    firstPoint = Object.create(pointPrototype).init({
      x: random()*w
      ,y: random()*h
      ,vx: (random()-0.5)*(w+h)*0.1
      ,vy: (random()-0.5)*(w+h)*0.1
      ,previous: lastPoint
      ,next: firstPoint
    }).setColor().setRadius()
    if (!endPoint) endPoint = firstPoint
  }
  endPoint.previous = firstPoint
}

function dot(context){
  context.globalCompositeOperation = 'source-over'
  let point = firstPoint
  context.strokeStyle = '#FFF'
  context.beginPath()
  while(point){
    context.lineTo(point.x,point.y)
    !point.next&&context.lineTo(firstPoint.x,firstPoint.y)
    point = point.next
  }
  context.stroke()
  //
  point = firstPoint
  context.strokeStyle = '#000'
  while(point){
    context.beginPath()
    context.arc(point.x,point.y,point.r,0,Math.PI*2,true)
    context.stroke()
    point = point.next
  }
}

/*function screen(i){
  operation(i||1,'screen')
}

function multiply(i){
  operation(i||1,'multiply')
}

function overlay(i){
  operation(i||1,'overlay')
}

function operation(i,type){
  context.globalCompositeOperation = type
  while (i--) context.drawImage(canvas, 0, 0)
}*/

function reset(){
  let point = firstPoint
  while(point){
    let change = firstPoint.setRadius.call({})
      ,col = firstPoint.setColor.call({})
      ,c1 = color(point.c1)
      ,c2 = color(point.c2)
      ,c3 = color(col.c1)
      ,c4 = color(col.c2)

    point.part = 0
    TweenMax.to(point,animT/1000,{
      r: change.r
      ,mass: change.mass
      ,part: 1
      ,ease: Cubic.easeInOut
      ,overwrite: 'all'
      ,onUpdate: function(c1,c2,c3,c4,point){
        let part = point.part
        point.c1 = c1.clone().average(c3,part).toString()
        point.c2 = c2.clone().average(c4,part).toString()
      }.bind(null,c1,c2,c3,c4,point)
    })
    point = point.next
  }
}

function orientationhandler(e){
  // For FF3.6+
  try {
    if (!e.gamma && !e.beta) {
      e.gamma = -(e.x * (180 / Math.PI))
      e.beta = -(e.y * (180 / Math.PI))
    }
  } catch(err){
  }
  cx = wHalf+e.gamma
  cy = hHalf+e.beta
  // use e.gamma, e.beta, and e.alpha according to dev.w3.org/geo/api/spec-source-orientation
}

export default inst.expose