import experiment from './base'
import color from '../math/color.js'

let inst = experiment('type',{
    init
    ,handleAnimate
    ,handleClick
  })
	,zuper = inst.zuper
  //
  ,target
  ,canvas
  ,context
  //
  ,fonts
  ,apiKey = 'AIzaSyCHuA5f_5Bl-Qh2XgSJeaklFhrDq1iITVM'
  ,apiUri = `https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}`
  ,fontBase = 'https://fonts.googleapis.com/css?family='
  ,fillColor = color()
  ,isBlack = true
  ,pausedResolve

function init(_target) {
  target = _target
setTimeout(inst.handleResize.bind(inst))
  canvas = zuper.init(_target)
  canvas.style.boxShadow = '0 0 0 1px #fff' 
  context = inst.context
  context.fillStyle = '#fff'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.shadowColor = 'rgba(0,0,0,0.7)'
  context.shadowOffsetX = 0
  context.shadowOffsetY = 0
  context.shadowBlur = 16
        context.save()
  //context.globalAlpha = 0.95
  fetch(apiUri)
        .then(r=>r.json())
        .then(r=>{fonts = r.items})
        .then(start)
  return canvas
}

function start(){
  loadFont(getRandomFont())
    .then(wait())
    .then(loadAndDraw)
}

function loadAndDraw(font){
  return Promise.all([
    loadFont(getRandomFont())
    ,Promise.resolve(font)
      .then(repeat(drawText,500))
  ])
    .then(wait())
    .then(([font])=>loadAndDraw(font))
}

function loadFont(font){
  console.log('loadFont',font.family,!!document.fonts,font.files.regular)
  const fontFace = new FontFace(font.family, `url(${font.files.regular})`)
  document.fonts.add(fontFace)
  return fontFace.load().then(()=>font)
}

function handleAnimate(){  
}

function handleClick(){
  inst.pause()
  if (!inst.paused&&pausedResolve){
    pausedResolve()
    pausedResolve = null
  }
}

function drawText(font){
  const {family} = font
  const size = 10 + Math.random()*Math.random()*650<<0
  const char = String.fromCharCode((Math.random()<0.5?97:65)+(Math.random()*26<<0))
  const x = Math.random()*inst.w<<0
  const y = Math.random()*inst.h<<0
  const deg = Math.random()*360<<0

  isBlack = !isBlack

  context.font = `${size}px ${family}`
  context.save() 

  context.shadowColor = 'rgba(0,0,0,0.4)'
  /*context.shadowOffsetX = 0
  context.shadowOffsetY = 0*/
  context.shadowBlur = 1 + size/20

  context.translate(x,y)
  context.rotate(deg)
  context.fillStyle = isBlack?'#000':'#fff'//color().toString() 
  //context.fillStyle = fillColor.toString() 
  context.fillText(char,x,y) 
  context.restore()
  //console.log('drawText',arguments.length,x,y,context.font)
  return font
}

function getRandomFont(){
  return fonts[Math.random()*fonts.length<<0]
}

function getFontUri(font){
  return `${fontBase}${font.family.replace(/\s/g,'+')}`
}

function wait(millis=1){
  return (...args)=>new Promise(r=>setTimeout(r.bind(null,...args),millis))
}

function pause(...args){ 
  return new Promise(r=>{
    if (inst.paused){
      pausedResolve = r.bind(null,...args)
    }else{
      r(...args)
    }    
  })
}

function repeat(fn,nr){
  return (...args)=>{
    let p = Promise.resolve(...args)
    while (nr--) p = p.then(fn).then(wait()).then(pause)
    return p
  }
}

export default inst.expose
