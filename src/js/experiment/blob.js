/**
 * Dripping noise blobs
 * @module experiment/blob
 * @see module:experiment/base
 */
import webgl from './webgl'

let speedBase = 0.001
    ,speed = speedBase
    //
    ,lookAtRadius = 2
    ,lookAtRadians = {x: 0, y: -0.5*Math.PI}
    ,lookAtVec3 = [0,0,0]
    ,campPVec3 = [0.0,0.0,0.0]
    //
    ,inst = webgl('blob','/static/glsl/blob.glsl',{
      cameraPosition: [0.0,-0.1,0.0]
      ,init
      ,handleDrag
      ,handleKeyPress
      ,handleKeyUp
    })
    ,addUniformChange = inst.addUniformChange

function init(){
  let options = this.options;
  if (options.lookAtRadians) lookAtRadians = options.lookAtRadians
  if (options.cameraPosition) campPVec3 = options.cameraPosition
  addUniformChange('camP',campPVec3.slice(0))
  calcLookat()
}

function handleDrag(touchList,dragX,dragY,isFirst,isLast,deltaX,deltaY){
  if (!isFirst&&!isLast) {
    lookAtRadians.x += 0.005*deltaX
    lookAtRadians.y += 0.005*deltaY
    calcLookat()
  }
}

function handleKeyPress(key){
  let keys = key
    ,fw = keys[87]?1:(keys[83]?-1:0)
    ,lr = keys[65]?1:(keys[68]?-1:0)
  if (speed<1) speed *= 1.15
  if (fw!==0) {
    campPVec3[0] += fw*speed*[0]
    campPVec3[1] += fw*speed*lookAtVec3[1]
    campPVec3[2] += fw*speed*lookAtVec3[2]
  }
  if (lr!==0) {
    let up = [0,1,0]
      ,cr = crossProduct(campPVec3,up)
    campPVec3[0] += lr*speed*cr[0]
    campPVec3[1] += lr*speed*cr[1]
    campPVec3[2] += lr*speed*cr[2]
  }
  (fw!==0||lr!==0)&&addUniformChange('camP',campPVec3)
}

function handleKeyUp(key){
  speed = speedBase
  if (key===67) {
    console.log(
      'lookAtRadians',lookAtRadians
      ,'\n\tcampPVec3',campPVec3
    ); // log
  }
}

/**
 * Calculate the lookAt vector
 */
function calcLookat(){
  let radiansX = lookAtRadians.x
    ,radiansY = lookAtRadians.y
    ,sinY = Math.sin(radiansY)

  lookAtVec3[0] = lookAtRadius*Math.sin(radiansX)*sinY
  lookAtVec3[2] = lookAtRadius*Math.cos(radiansX)*sinY
  lookAtVec3[1] = lookAtRadius*Math.cos(radiansY)
  addUniformChange('lookAt',lookAtVec3)
}

/**
 * Calculate the crossproduct
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 */
function crossProduct(a,b){
  return [a[1]*b[2] - a[2]*b[1], a[2]*b[0] - a[0]*b[2], a[0]*b[1] - a[1]*b[0]]
}

export default inst.expose