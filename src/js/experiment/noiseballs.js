import experiment from './base'
import perlin from '../math/perlin'
import color from '../math/color'

// get an instance
let inst = experiment('noiseballs',{
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
  ,orientationX = 0
  ,orientationY = 0
  //
  ,fieldZoom = 4
  ,fieldW// = w/fieldZoom<<0
  ,fieldH// = h/fieldZoom<<0
  ,fieldSize// = fieldW*fieldH
  ,fieldScale = 0.012
  ,fieldStep = 0.01
  ,fieldHeight = 8E2
  ,firstPoint
  ,pointSize = 7
  //
  ,gridSize = pointSize
  ,gridW// = Math.ceil(w/gridSize)+3
  ,gridH// = Math.ceil(h/gridSize)+3
  ,gridLength// = gridW*gridH
  ,gridCheck// = [-gridW-1,-gridW,-gridW+1,-1,0,1,gridW-1,gridW,gridW+1]
  ,gridCheckLength// = gridCheck.length
  ,grid/* = (function(a,i){
    while (i--) a.push([])
    return a
  })([],gridLength)*/
  //
  ,numPoints = 444
  ,spdv = 0.0018
  ,frc = 0.94
  ,maxhitB = 55


function init(_target){
  target = _target
  canvas = zuper.init(_target)
  context = inst.context
  //
  context.globalCompositeOperation = 'screen'
  //
  handleResize()
  !firstPoint&&initBalls()
  //
  window.addEventListener('deviceorientation', onOrientation, false)
  window.addEventListener('MozOrientation', onOrientation, false)
  //
  return canvas
}

// protected methods

function handleAnimate(){//deltaT,millis
  step()
}

function handleResize(){
  zuper.handleResize()
  w = inst.w
  h = inst.h
  wh = w+h
  cx = wHalf = w/2
  cy = hHalf = h/2
  diagonal = Math.sqrt(w*w+h*h)
  fieldW = w/fieldZoom<<0
  fieldH = h/fieldZoom<<0
  fieldSize = fieldW*fieldH
  spdv = 2.5/diagonal
  //
  gridW = Math.ceil(w/gridSize)+3
  gridH = Math.ceil(h/gridSize)+3
  gridLength = gridW*gridH
  gridCheck = [-gridW-1,-gridW,-gridW+1,-1,0,1,gridW-1,gridW,gridW+1]
  gridCheckLength = gridCheck.length
  grid = (function(a,i){
    while (i--) a.push([])
    return a
  })([],gridLength)
}

// private methods

function noise(x,y){
  let PerlinSimplex = perlin
  return PerlinSimplex.noise(
    157+fieldScale*x
    ,249+fieldScale*y
    ,328+0.00021*Date.now()
  )
}

function initBalls(){
  let pointPrototype = {
      init: function(o){
        for (let key in o) this[key] = o[key]
        return this
      }
      ,step: function(){
        let vx = this.vx
          ,vy = this.vy
          ,x = this.x
          ,y = this.y
          ,b = this.b
          ,n = noise(x,y)
          ,nx = noise(x+fieldStep,y)
          ,ny = noise(x,y+fieldStep)
          ,neighbours = this.getGrid()
          ,i = neighbours.length

        if (i>1) {
        while (i--) {
          let p = neighbours[i]
          if (p!==this){
            let dx = p.x-x
              ,dy = p.y-y
              ,pow = dx*dx+dy*dy
              ,dist = Math.sqrt(pow)
              ,maxDist = p.r+this.r
              ,mdist = 0.2/pow

            if (dist<maxDist) {
              if (b===0&&b===p.b) {
                b = this.b = p.b = maxhitB
              } else {
                this.b = p.b
                p.b = b
                b = this.b
              }
              vx -= mdist*dx
              vy -= mdist*dy
            }
          }
        }
        }
        if (b>0) this.b = b-1
        vx = frc*(vx+spdv*orientationX+fieldHeight*(n-nx))
        vy = frc*(vy+spdv*orientationY+fieldHeight*(n-ny)+0.1)
        this.x += vx
        this.y += vy
        this.vx = vx
        this.vy = vy
        this.setGrid()
        //
        return this
      }
      ,setGrid: function(){
        let index = (this.x/gridSize+1<<0)+gridW*(this.y/gridSize+1<<0)
        if (index!==this.gridIndex) {
          if (this.gridIndex) {
            let a = grid[this.gridIndex]
              ,i = a&&a.indexOf(this)||-1
            i!==-1&&a.splice(i,1)
          }
          grid[index]&&grid[index].push(this)
          this.gridIndex = index
        }
      }
      ,getGrid: function(){
        let neighbours = []
          ,gridIndex = this.gridIndex
          ,push = Array.prototype.push
          ,i = gridCheckLength
        if (gridIndex) {
          while (i--) {
            push.apply(neighbours,grid[gridIndex+gridCheck[i]])
          }
        }
        return neighbours
      }
      ,wrapField: function(){
        let x = this.x
          ,y = this.y
          ,r = this.r
        if (x>w+r) this.x -= w+2*r
        else if (x<-r) this.x += w+2*r
        if (y>h+r) this.y -= h+2*r
        else if (y<-r) this.y += h+2*r
        return this
      }
      /*,borderField: function(){
        let x = this.x
          ,y = this.y
          ,r = this.r
        if (x>w-r) this.x = w-r
        else if (x<r) this.x = r
        if (y>h-r) this.y = h-r
        else if (y<r) this.y = r
        return this
      }*/
      ,draw: function(ctx){
        if (this.b!==0){
        let x = this.x
          ,y = this.y
          ,r = this.r
          //,bb = (this.b/maxhitB*255<<0).toString(16)
          //,c = '#'+bb+bb+bb
          ,c = this.color.clone()//.multiply(this.b/maxhitB).toString()
          //,ffffgg=log(x,y,r)
          ,gradient = ctx.createRadialGradient(x,y,r,x,y,0)

        gradient.addColorStop(0,c.setAlpha(0).toString(true))
        gradient.addColorStop(1,c.setAlpha(this.b/maxhitB).toString(true))
        //ctx.fillStyle = this.b?'#F00':'#FFF'
        //ctx.fillStyle = '#'+bb+bb+bb
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x,y,r,0,Math.PI*2)
        ctx.fill()
        }
        return this
      }
    }
    ,base = color('#F48')
    ,i = numPoints
  while (i--) {
    firstPoint = Object.create(pointPrototype).init({
      x: random()*w
      ,y: random()*h
      ,vx: (random()-0.5)*(w+h)*0.001
      ,vy: (random()-0.5)*(w+h)*0.001
      ,r: pointSize-0.8*random()*pointSize
      ,b: 0
      ,color: color().average(base,0.65)//.multiply(i%2===0?1:0.1)
      ,next: firstPoint
      ,i: i
    })
  }
}

function step(){
  context.clearRect(0, 0,w, h)
  context.fillStyle = '#000'
  context.fillRect(0,0,w,h)
  context.fill()
  let point = firstPoint
  while(point){
    point = point
      .step()
      .wrapField()
      .draw(context)
      .next

  }
}

function onOrientation(evt){
  try {
    if (!evt.gamma && !evt.beta) {
      evt.gamma = -(evt.x * (180 / Math.PI))
      evt.beta = -(evt.y * (180 / Math.PI))
    }
  } catch(err) {
  }
  orientationX = evt.gamma
  orientationY = evt.beta
}

export default inst.expose