/**
 * Earth
 * @module experiment/earth
 * @see module:experiment/base
 */
import webgl from './webgl'
let inst = webgl('earth','/static/glsl/earth.glsl',{
  cameraPosition: [0,10,20]
  ,lookAtRadians: {x:0,y:-0.6*Math.PI}
})
export default inst.expose