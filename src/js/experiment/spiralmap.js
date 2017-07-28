/**
 * Webgl spiral displacement mapping
 * @module experiment/spiralmap
 * @see module:experiment/base
 */
import webgl from './webgl'
let inst = webgl('spiralmap','/static/glsl/spiralmap.glsl',{
  images: {
    u_image0: '/static/img/crystal0.jpg'
    ,u_image1: '/static/img/crystal1.jpg'
  }
})
export default inst.expose