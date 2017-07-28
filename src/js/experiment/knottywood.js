/**
 * Perlin noise turned wood
 * @module experiment/knottywood
 * @see module:experiment/base
 */
import webgl from './webgl'
let inst = webgl('knottywood','/static/glsl/knottywood.glsl',{
  images: {
    u_image0: '/static/img/knottywood.jpg'
  }
})
export default inst.expose