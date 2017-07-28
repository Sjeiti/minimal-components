import Signal from 'signals'
import vector from '../math/vector'

/**
 * Signal for start of drag.<br/>
 * The callback for this signal is Function(oAdd,oTouches)
 * @name dragstart
 * @type Signal
 */
/**
 * Signal for dragging.<br/>
 * The callback for this signal is Function(oTouches)
 * @name drag
 * @type Signal
 */
/**
 * Signal for end of drag.<br/>
 * The callback for this signal is Function(oDelete,oTouches)
 * @name dragend
 * @type Signal
 */
/**
 * Stop page scrolling when dragging
 * @name drag.stopPageScroll
 * @type Boolean
 */
/**
 * todo: ?
 * @name drag.touch
 * @type Function
 */

let typeOfTouch = typeof window.Touch
  ,bTouch = !!((typeOfTouch=='object'||typeOfTouch=='function') || window.DocumentTouch && document instanceof DocumentTouch)
  ,loop = (oa,fn)=>{
    for (let i=0,l=oa.length;i<l;i++) fn(oa[i])
  }
  ,iFakeId = 0
  ,dragstart = new Signal
  ,drag = Object.assign(new Signal,{stopPageScroll:false,touch})
  ,dragend = new Signal
  ,oTouches = {}

Object.defineProperty(oTouches,'length',{
  value: 0
    ,writable: true
})
Object.defineProperty(oTouches, 'add', {
  value: function(touch){
    this[touch.id] = touch
    this.length++
    return touch
  }
})
Object.defineProperty(oTouches, 'remove', {
  value: function(id){
    let touch = this[id]
    delete this[id]
    this.length = Math.max(this.length-1,0)
    return touch
  }
})
addForEach(oTouches)

function addForEach(o){
  Object.defineProperty(o, 'forEach', {
    value: function(fn){
      for (let s in this) {
        fn(this[s],s,this)
      }
    }
  })
  return o
}

/**
 * Initialise event listeners
 */
let mBody = document.body
document.addEventListener('mousemove',handleDrag,false)
document.addEventListener('mousedown',handleDrag,false)
document.addEventListener('mouseup',handleDrag,false)
if (bTouch) {
  mBody.ontouchstart = mBody.ontouchmove = mBody.ontouchend = handleDrag
}

/**
 * Handles event for both touch and
 * @param e
 * @returns {boolean}
 */
function handleDrag(e){
  //e.preventDefault()
  let bReturn = true
    ,isMouse = Object.prototype.toString.call(e)=='[object MouseEvent]'// is ['touchstart'...].indexOf(e.type) faster?

  bTouch = !isMouse
  switch (e.type) {
    case 'mousedown': case 'touchstart':
      let oAdd = addForEach({})
      if (bTouch) {
        loop(e.changedTouches,function(o){
          if (typeof o!='object') return
          let id = o.identifier
          oAdd[id] = oTouches.add(touch(id,vector(o.pageX,o.pageY)))
        })
      } else {
        iFakeId++
        oAdd[iFakeId] = oTouches.add(touch(iFakeId,vector(e.pageX,e.pageY)))
      }
      dragstart.dispatch(oAdd,oTouches,e)
    break
    case 'mouseup': case 'touchend':
      let oDelete = addForEach({})
      if (bTouch) {
        loop(e.changedTouches,function(o){
          if (typeof o!='object') return
          let id = o.identifier
          oDelete[id] = oTouches.remove(id)
        })
      } else {
        oDelete[iFakeId] = oTouches.remove(iFakeId)
      }
      dragend.dispatch(oDelete,oTouches,e)
    break
    case 'mousemove': case 'touchmove':
      if (bTouch) {
        loop(e.touches,function(o){
          if (typeof o!='object') return
          let oTouch = oTouches[o.identifier]
          oTouch.update(o.pageX,o.pageY)
        })
      } else {
        let oTouch = oTouches[iFakeId]
        if (oTouch!==undefined) oTouch.update(e.pageX,e.pageY)
      }
      if (oTouches.length>0) drag.dispatch(oTouches,e)
      bReturn = false
    break
    default: console.log(e.type,e)
  }
  if (bTouch&&e.touches&&e.touches.length!==oTouches.length) checkForOrphans(e.touches)
  return !drag.stopPageScroll||bReturn
}

/**
 *
 * @param id
 * @param vpos
 * @returns {{id: *, pos: (*|Object|Mixed), start: *, last: (*|Object|Mixed), update: update, toString: toString}}
 */
function touch(id,vpos) {
  let oReturn = {
    id: id
    ,pos: vpos.clone()
    ,start: vpos
    ,last: vpos.clone()
    ,update
    ,toString: ()=>'[object touch ' + id + ']'
  }
  function update(x,y) {
    oReturn.last.set(oReturn.pos.getX(),oReturn.pos.getY())
    oReturn.pos.set(x,y)
  }
  return oReturn
}

/**
 * @param touches
 */
function checkForOrphans(touches){
  let aIds = []
  loop(touches,function(o){
    aIds.push(o.identifier)
  })
  let oDead = {}
  loop(oTouches,function(o,id){
    if (aIds.indexOf(parseInt(id,10))===-1) {
      oDead[id] = o
      oTouches.remove&&oTouches.remove(id); // todo: check
    }
  })
  dragend.dispatch(oDead,touches)
}

export {
  dragstart
  ,drag
  ,dragend
}