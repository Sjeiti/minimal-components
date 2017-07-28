/**
 * Infinite cubes
 * @module experiment/infinitecubes
 * @see module:experiment/base
 */
import webgl from './webgl'
let inst = webgl('infinitecubes','/static/glsl/infinitecubes.glsl')
export default inst.expose