import {TweenLite,TweenMax,Power1} from 'gsap'

/**
 * Returns the hash for a scoped module
 * @param {HTMLElement} elm
 * @returns {string}
 */
function getHash(elm){
  let attrs = elm.attributes
      ,hash = ''
  for (let i = attrs.length - 1; i>=0; i--) {
    let name = attrs[i].name
        ,isHash = /^data\-v\-\w+$/.test(name)
    if (isHash) hash = name
  }
  return hash
}

/**
 * Scroll
 * @param {HTMLElement} elm
 * @param {number} [t=1000] time in milliseconds
 * @param {function} [ease=Power1.easeInOut] easing
 * @param {number} [offset=0]
 * @param {boolean} [update=false]
 * @returns {string}
 */
function scrollTo(elm,t=1000,ease=Power1.easeInOut,offset=0,update=false){
  let currentY = getScrollY()
      ,animObj = {y:currentY}
      ,elmTop = elm.getBoundingClientRect().top
      ,targetY = currentY + elmTop + offset
      ,tweenMethod = update&&TweenMax||TweenLite
      ,tweenInstance

  tweenInstance = tweenMethod.to(
      animObj
      ,t/1000
      ,{
        y: targetY
        ,ease: ease
        ,onUpdate: function() {
          window.scrollTo(0, animObj.y)
          if (update) {
            let curElmTop = elm.getBoundingClientRect().top
                ,newTargetY = animObj.y + curElmTop + offset
            if (newTargetY!==targetY) tweenInstance.updateTo({y:newTargetY})
          }
        }
      }
  )
}

/**
 * Retreive current vertical scroll position
 * @returns {Number}
 */
function getScrollY() {
  return (window.pageYOffset!==null)?window.pageYOffset:(html.scrollTop!==null)?html.scrollTop:document.body.scrollTop
}

function parseLocalUri(uri) {
 return uri.replace('http://localhost.ronvalstar','').replace('http://'+location.host,'')
}


function toggleFullScreen(element) {
  let isNotFullscreen = !document.fullscreenElement
    &&!document.mozFullScreenElement
    &&!document.webkitFullscreenElement
    &&!document.msFullscreenElement

  if (isNotFullscreen){
    if (element.requestFullscreen) {
      element.requestFullscreen()
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen()
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen()
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen()
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    }
  }
  return isNotFullscreen
}

function wait(ticks){
	// requestAnimFrame()
}

/**
 * Recursive Object.freeze
 * @param {Object} o
 * @returns {Object}
 */
function deepFreeze (o) {
  Object.freeze(o)
  Object.getOwnPropertyNames(o).forEach(function (prop) {
    if (
        o.hasOwnProperty(prop)&&
        o[prop] !== null&&
        (typeof o[prop] === "object" || typeof o[prop] === "function")&&
        !Object.isFrozen(o[prop])
    ) {
      deepFreeze(o[prop])
    }
  })
  return o
}

function loadImage(src){
  return new Promise((resolve,reject)=>{
    let img = new Image()
    img.addEventListener('load',resolve)
    img.addEventListener('error',reject)
    img.src = src
  })
}

/**
 * Function that executes the callback asap.
 * @name requestAnimationFrame
 * @method
 */
const requestAnimationFrame = window.requestAnimationFrame||
  window.webkitRequestAnimationFrame||
  window.mozRequestAnimationFrame||
  window.oRequestAnimationFrame||
  window.msRequestAnimationFrame||
  (callback=>window.setTimeout(callback,1000/60))

/**
 * @param {number} n
 * @param {number} [min=0]
 * @param {number} [max=1]
 * @returns {number}
 */
function clamp(n, min=0, max=1) {
  return Math.min(Math.max(n, min), max)
}

export {
  getHash
  ,scrollTo
  ,getScrollY
  ,parseLocalUri
  ,toggleFullScreen
  ,wait
  ,deepFreeze
  ,loadImage
  ,requestAnimationFrame
  ,clamp
}