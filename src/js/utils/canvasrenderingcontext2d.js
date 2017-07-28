/* global CanvasRenderingContext2D */
// todo: document
/**
* CanvasRenderingContext2D methods
* @namespace iddqd.internal.host.canvasrenderingcontext2d
*/

let aStyle = ['strokeStyle','fillStyle','font','lineWidth']
  ,oStoredStyle = {}

function createGradient(isLinear,ysize,pos,color) {
  let oGradient = isLinear?this.createLinearGradient(0,0,0,ysize):this.createRadialGradient(0,0,0,0,0,ysize)
    ,i = arguments.length-2
    ,j = i/2
    ,f,c
  if (i<=0||i%2===1) {
    throw {message:'please provide position and color'+pos+color};// todo: pos and color?
  }
  while (j--) {
    f = arguments[2*j+2]
    c = arguments[2*j+3]
    oGradient.addColorStop(f,c)
  }
  return oGradient
}

function storeStyle(){
  let oStore = {}
  loop(aStyle,function(prop){
    if (this.hasOwnProperty(prop)) oStore[prop] = this[prop]
  })
  return oStore
}

function restoreStyle(o){
  loop(o||oStoredStyle,function(value,prop){
    if (this.hasOwnProperty(prop)) this[prop] = value
  })
}

function drawLine(ax,ay,bx,by,lineColor){
  this.storeStyle()
  this.beginPath()
  if (lineColor) this.strokeStyle = lineColor
  this.moveTo(ax,ay)
  this.lineTo(bx,by)
  this.stroke()
  this.closePath()
  this.restoreStyle()
}

function drawCircle(x,y,radius,lineColor,fillColor){
//        this.storeStyle()
  this.beginPath()
  if (lineColor) this.strokeStyle = lineColor
  if (fillColor) this.fillStyle = fillColor
  this.arc(x,y,radius,0,2*Math.PI)
  lineColor&&this.stroke()
  fillColor&&this.fill()
  this.closePath()
//        this.restoreStyle()
}

function drawText(text,x,y,lineColor,fillColor){
  this.storeStyle()
  this.beginPath()
  if (lineColor) this.strokeStyle = lineColor
  if (fillColor) this.fillStyle = fillColor
  if (lineColor) {
    this.strokeText(text,x,y)
    this.stroke()
  }
  if (fillColor||lineColor===undefined) {
    this.fillText(text,x,y)
    this.fill()
  }
  this.closePath()
  this.restoreStyle()
}

function drawRect(x,y,w,h,lineColor,fillColor){
  this.storeStyle()
  this.beginPath()
  if (lineColor) this.strokeStyle = lineColor
  if (fillColor) this.fillStyle = fillColor
  this.rect(x,y,w,h)
  lineColor&&this.stroke()
  fillColor&&this.fill()
  this.closePath()
  this.restoreStyle()
}

function clear(){
  this.canvas.width = this.canvas.width
}

/*,drawCircle: function(x,y,radius,fill,stroke) {
  if (fill===undefined) fill = true
  if (stroke===undefined) stroke = false
  this.translate(x,y)
  this.beginPath()
  this.arc(0,0,radius,0,2*Math.PI)
  fill&&this.fill()
  stroke&&this.stroke()
  this.closePath()
  this.translate(-x,-y)
  return this
}*/

function drawPolygon(x,y,radius,sides,fill,stroke) {
  if (fill===undefined) fill = true
  else this.fillStyle = fill
  if (stroke===undefined) stroke = false

  this.translate(x,y)
  for (let i=0
      ,l=sides
      ,a=2*Math.PI/l
      ,s = Math.cos(a/2); i<l; i++) {
    this.beginPath()
    this.moveTo(0,-1)
    this.rotate(-a/2)
    this.lineTo(0,radius)
    this.rotate(a)
    this.lineTo(0,radius)
    this.rotate(-a/2)
    if (fill) {
      this.scale(s,s)
      this.fill()
      this.scale(1/s,1/s)
      //console.log('fill',fill); // log
    }

  /*if (fill) {
    this.fill()
  }*/
    this.rotate(a)
    stroke&&this.stroke(); // todo: fix strokes to boundary
    this.closePath()
  }
  this.translate(-x,-y)
  return this
}

function drawPolygram(x,y,radius,inset,sides,fill,stroke) {
  if (fill===undefined) fill = true
  if (stroke===undefined) stroke = false
  this.translate(x,y)
  for (let i = 0
      ,TWOPI = 2*Math.PI
      ,iNumRot = 2*sides
      ,fAngle = TWOPI/iNumRot
      ,fAngleH = 0.5*fAngle
      ,fInset = inset
      //
      ,BB = fInset*Math.sin(fAngle)
      ,b = Math.atan(BB/(1-Math.sqrt(fInset*fInset-BB*BB)))
      //
      ,fGradientScale = Math.tan(b)
      ,fGradientAngle = -fAngle/2+Math.PI/2-b
      ,bSide; i<iNumRot; i++) {
    bSide = i%2
    this.beginPath()
    this.moveTo(0,-1)
    this.rotate(-fAngleH)
    this.lineTo(0,bSide?radius:fInset*radius)
    this.rotate(fAngle)
    this.lineTo(0,bSide?fInset*radius:radius)
    this.rotate(-fAngleH)
    if (fill) {
      this.rotate(bSide?fGradientAngle:-fGradientAngle)
      this.scale(fGradientScale,fGradientScale)
      this.fill()
      this.scale(1/fGradientScale,1/fGradientScale)
      this.rotate(bSide?-fGradientAngle:fGradientAngle)
    }
    this.rotate(fAngle)
    stroke&&this.stroke(); // todo: fix strokes to boundary
    this.closePath()
  }
  this.translate(-x,-y)
  return this
}

/**
 * Traverse an object or array
 * @name iddqd.loop
 * @method
 * @param {Object} o The object or array
 * @param {Function} fn Callback function with the parameters value and key.
 */
function loop(o,fn){
  if (o&&fn) {
    var bArray = Array.isArray?Array.isArray(o):Object.prototype.toString.call(o)=='[object Array]';
    if (bArray) {
      var l = o.length
        ,i = l
        ,j;
      while (i--) {
        j = l-i-1;
        fn(o[j],j);
      }
    } else {
      //for (var s in o) if (o.hasOwnProperty(s)) fn(s,o[s]);
      for (var s in o) if (fn.call(o[s],o[s],s)===false) break; // ie8 fix
    }
  }
}

export {
  createGradient
  ,storeStyle
  ,restoreStyle
  ,drawLine
  ,drawCircle
  ,drawText
  ,drawRect
  ,clear
  ,drawPolygon
  ,drawPolygram
}