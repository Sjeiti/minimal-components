/*globals WebGLProgram, WebGLShader*/
/**
 * Base script for initialising a webgl experiment
 * Exposes basic interaction uniforms
 * @module experiment/webgl
 * @see module:experiment/base
 */
import experiment from './base'
import {key} from '../signal/signals'
import parse from '../utils/parseglsl'
import {loadImage} from '../utils/utils'

let glProto = WebGLRenderingContext.prototype
    ,uniformsXF = [function(){},glProto.uniform1fv,glProto.uniform2fv,glProto.uniform3fv]

/**
 * Webgl scaffold that parses the following uniforms
 * - {float} time Time in seconds
 * - {vec2} resolution Resolution in pixels
 * - {vec3} camP Camera position in coordinates
 * - {vec3} lookAt Camera lookAt in coordinates
 * - {float} down Mouse down is 1.0, not is 0.0
 * - {vec2} drag Current drag in pixels
 * - {vec2} offset Total drag in pixels
 * @param {string} name
 * @param {string} scriptUri
 * @param {object} options
 * @param {object} [options.images]
 * @param {number[]} [options.init]
 * @param {number[]} [options.exit]
 * @param {number[]} [options.handleAnimate]
 * @param {number[]} [options.handleResize]
 * @param {number[]} [options.handleDragStart]
 * @param {number[]} [options.handleDrag]
 * @param {number[]} [options.handleDragEnd]
 * @param {number[]} [options.handleClick]
 * @returns {basePrototype}
 */
function webgl(name,scriptUri,options={}){
  let glslUri = location.port!==''?scriptUri.replace('/wordpress/wp-content/themes/sjeiti',''):scriptUri
    ,images = options.images
    ,inst = experiment(name,{
      init
      ,exit
      ,handleAnimate
      ,handleResize
      ,handleDragStart
      ,handleDrag
      ,handleDragEnd
      ,handleClick
    },'webgl')
    ,zuper = inst.zuper
    //
    ,w,h
    //
    ,target
    ,canvas
    ,gl
    //
    ,buffer
    ,contentVertex = 'attribute vec3 position;void main() {gl_Position = vec4( position, 1.0 );}'
    ,currentProgram
    ,vertex_position
    //
    ,start_time = 0
    ,time = 0
    //
    ,isMouseDown = false
    //
    ,mouseLast = {x:0,y:0}
    ,offset = {x:0,y:0}
    //
    ,uniformChanges = []
    ,initialUniforms = Object.assign({
         size:[2]
        ,down:[0]
        ,drag:[0,0]
        ,offset:[0,0]
        ,resolution:[10,10]
      },options.uniforms||{})
  //
  for (let name in initialUniforms){
    addUniformChange(name,initialUniforms[name])
  }
  //
  Object.assign(inst,{
    options
    ,changes: uniformChanges
    ,isMouseDown
    ,touchListPos
    ,setUniform
    ,addUniformChange
  })
  //
  return inst

  /**
   * Override base init
   * @param {HTMLElement} _target
   * @returns {HTMLCanvasElement}
   */
  function init(_target) {
    target = _target
    canvas = zuper.init(_target)
    gl = inst.gl = inst.context
    //
    start_time = Date.now()
    //
    currentProgram = inst.program = null
    parse(glslUri)
        .then(handleFragmentRequest,console.warn.bind(console,'parse'))
        .then(loadImages)
    //
    // call child init before events
    callChildMethod(options.init,arguments)
    //
    key.press.add(handleKeyPress)
    key.up.add(handleKeyUp)
    //
    handleResize()
    //
    return canvas
  }

  /**
   * Override base exit
   */
  function exit(){
    zuper.exit()
    key.press.remove(handleKeyPress)
    key.up.remove(handleKeyUp)
  }

  /**
   * Override base handleAnimate
   */
  function handleAnimate(){
    if (!currentProgram) return
    // clear canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    // load program into GPU
    gl.useProgram(currentProgram)
    // set specific values to program variables
    time = Date.now() - start_time
    gl.uniform1f(gl.getUniformLocation(currentProgram,'time'),time / 1000)
    //
    // call child handleAnimate after useProgram has been called
    callChildMethod(options.handleAnimate,arguments)
    //
    // set arbitrary values to program variables
    applyUniformChanges()
    //
    // Render geometry
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer)
    gl.vertexAttribPointer(vertex_position,2,gl.FLOAT,false,0,0)
    gl.enableVertexAttribArray(vertex_position)
    gl.drawArrays(gl.TRIANGLES,0,6)
    gl.disableVertexAttribArray(vertex_position)
  }

  /**
   * Override base handleResize
   */
  function handleResize(){
    w = target.clientWidth
    h = target.clientHeight
    canvas.width = inst.w = w
    canvas.height = inst.h = h
    gl.viewport(0,0,w,h)
    addUniformChange('resolution',[w,h])
    callChildMethod(options.handleResize,[w,h])
  }

  /**
   * Override base handleDragStart
   */
  function handleDragStart(added,touches,e){
    if (e.target.nodeName==='CANVAS') {
      isMouseDown = inst.isMouseDown = true
      addUniformChange('down',[1])
      e.preventDefault()
      let pos = touchListPos(touches)
      addUniformChange('drag',[pos.x,pos.y])
      callChildMethod(options.handleDragStart,arguments)
    }
  }

  /**
   * Override base handleDrag
   */
  function handleDrag(touches,e){
    let pos = touchListPos(touches)
    if (isMouseDown&&pos) {
      let dragX = pos.x
        ,dragY = pos.y
        ,lastX = mouseLast.x
        ,lastY = mouseLast.y
        ,deltaX = dragX-lastX
        ,deltaY = dragY-lastY
        ,isFirst = lastX===0&&lastY===0
        ,isLast = dragX===0&&dragY===0

      if (!isFirst&&!isLast) {
        addUniformChange('offset',[offset.x+=deltaX,offset.y+=deltaY])
      }
      mouseLast.x = dragX
      mouseLast.y = dragY
      addUniformChange('drag',[dragX,dragY])
      callChildMethod(options.handleDrag,[touches,dragX,dragY,isFirst,isLast,deltaX,deltaY])//arguments
    }
  }

  /**
   * Override base handleDragEnd
   */
  function handleDragEnd(removed,touches,e){
    if (isMouseDown) {
      isMouseDown = inst.isMouseDown = false
      mouseLast.x = 0
      mouseLast.y = 0
      addUniformChange('down',[0])
      addUniformChange('drag',[0,0])
      callChildMethod(options.handleDragEnd,arguments)
    }
  }

  /**
   * Override base handleClick
   */
  function handleClick(e){
    callChildMethod(options.handleClick,arguments)
    inst.changes.push({name:'click',values:[e.offsetX,e.offsetY]})
  }

  /**
   * Create Vertex buffer (2 triangles) and program
   * @param {string} glslFragment
   * @returns {WebGLProgram}
   */
  function handleFragmentRequest(glslFragment){
    buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer)
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1.0,-1.0,1.0,-1.0,-1.0,1.0,1.0,-1.0,1.0,1.0,-1.0,1.0]),gl.STATIC_DRAW)
    currentProgram = inst.program = createProgram(contentVertex,glslFragment)
    return currentProgram
  }

  /**
   * Apply uniform changes
   */
  function applyUniformChanges() {
    let numChanges = uniformChanges.length
        ,changed = []
    while (numChanges--) {
      let change = uniformChanges[numChanges]
          ,name = change.name
      // only set last changes
      if (changed.indexOf(name)===-1) {
        setUniform(name,change.values)
        changed.push(name)
      }
    }
    uniformChanges.length = 0
  }

  /**
   * Set a uniform change to be applied
   * @param {string} name
   * @param {Array} values
   */
  function addUniformChange(name,values) {
    uniformChanges.push({name,values})
  }

  /**
   * Set a uniform
   * @param {string} name
   * @param {Array} values
   * @param {Function} type
   */
  function setUniform(name,values,type) {
    let uniformLocation = gl.getUniformLocation(currentProgram,name)
        ,num = values.length
        ,fn = type||uniformsXF[num]
    fn.call(gl,uniformLocation,values)
  }

  /**
   * Load images and append the textures to the program
   * @param {WebGLProgram} program
   * @returns {WebGLProgram}
   */
  function loadImages(program){
    images&&Promise.all(Object.keys(images).map(name=>{
      let src = images[name]
          ,srcParams = (src.match(/[?&]([^&]*)/g)||[])
              .map(s=>s.substr(1).split('='))
              .reduce((o,[k,v])=>((o[k]=v?decodeURIComponent(v):true),o),{})
          ,texture = gl.createTexture()
          ,getUniformLocation = gl.getUniformLocation(program, name)
          ,wrap = srcParams.clamp?gl.CLAMP_TO_EDGE:gl.REPEAT
      // set temporary 1x1 texture
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([255,0,0,255])); // red
      gl.bindTexture(gl.TEXTURE_2D, null);
      //
      return loadImage(src).then(e=>[e.target,wrap,texture,getUniformLocation])
    }))
        .then(loads=>{
          // first bind all textures
          loads.forEach(([image,wrap,texture])=>{
            gl.bindTexture(gl.TEXTURE_2D, texture)
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
          })
          // then apply all to program
          loads.forEach(([image,wrap,texture,uniformLocation],i)=>{
            gl.activeTexture(gl['TEXTURE'+i]) // gl.TEXTURE0
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.uniform1i(uniformLocation, i);
          })
        })
    return program
  }

  /**
   * Handle key up signal
   * @param {number} key
   */
  function handleKeyUp(){
    callChildMethod(options.handleKeyUp,arguments)
  }

  /**
   * Handle key press signal
   */
  function handleKeyPress(){//key,eLastKeyDown
    callChildMethod(options.handleKeyPress,arguments)
  }

  /**
   * Create the program from the vertex and the glsl fragment code
   * @param {string} vertex
   * @param {string} fragment
   * @returns {WebGLProgram}
   */
  function createProgram(vertex,fragment) {
    let program = gl.createProgram()
      ,vertexShader = initShader(vertex,gl.VERTEX_SHADER)
      ,fragmentShader = initShader('#ifdef GL_ES\nprecision highp float;\n#endif\n\n' + fragment,gl.FRAGMENT_SHADER)
    if (vertexShader===null || fragmentShader===null) return null
    gl.attachShader(program,vertexShader)
    gl.attachShader(program,fragmentShader)
    gl.deleteShader(vertexShader)
    gl.deleteShader(fragmentShader)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program,gl.LINK_STATUS)) {
      console.warn("ERROR:\n" + "VALIDATE_STATUS: " + gl.getProgramParameter(program,gl.VALIDATE_STATUS) + "\n" + "ERROR: " + gl.getError() + "\n\n" + "- Vertex Shader -\n" + vertex + "\n\n" + "- Fragment Shader -\n" + fragment)
      return null
    }
    return program
  }

  /**
   * Initialise webgl shader
   * @param {string} src
   * @param {number} type
   * @returns {WebGLShader}
   */
  function initShader(src,type) {
    src = src.replace(/^\s+|\s+$/g,'')
    let shader = gl.createShader(type)
    gl.shaderSource(shader,src)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) {
      console.warn(( type===gl.VERTEX_SHADER?"VERTEX":"FRAGMENT" ) + " SHADER:\n" + gl.getShaderInfoLog(shader))
      return null
    }
    return shader
  }

  function callChildMethod(method,methodArguments){
    method&&method.apply(inst,methodArguments)
  }

  function touchListPos(touchList){
    let touch
        ,value
    touchList&&touchList.forEach(_touch=>_touch.pos&&(touch = _touch))
    if (touch) {
      let pos = touch.pos
      value = {x:pos.getX(),y:pos.getY()}
    }
    return value
  }
}

export default webgl