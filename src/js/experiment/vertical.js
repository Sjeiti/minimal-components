import experiment from './base'

let inst = experiment('vertical',{
				init
				,exit
				,handleAnimate
				,handleResize
		})
		,zuper = inst.zuper
	//
	// private variables
	,w,h,hMax
	,target
	//
	,canvas
	,context
	//
	,patternCanvas
	,patternContext
	//
	,img
	,imgTemp
	,imgPreview
	,imgPreviewUri
	,feedback
	,margin = 8
	,millisOffset = 0
	,millisScale = 0.01
	,switchMillLst = 0
	,switchMillCnt = 0

function init(_target){
	target = _target
	canvas = zuper.init(_target)
	context = inst.context
	//
	patternCanvas = document.createElement('canvas')
	patternContext = patternCanvas.getContext('2d')
	//
	handleResize()
	//
	canvas.addEventListener('click',loadImage,true)
	//
	imgPreview = document.createElement('img')
	imgPreview.setAttribute('style','position:absolute;top:0;left:0;width:10%;display:none;')
	target.appendChild(imgPreview)
	//
	imgPreviewUri = document.createElement('code')
	imgPreviewUri.setAttribute('style','position:absolute;bottom:0;left:0;font:bold 12px Arial;color:white;text-shadow:0 0 2px #000;display:none;')
	target.appendChild(imgPreviewUri)
	//
	feedback = document.createElement('p')
	Object.assign(feedback.style,{
		position:'absolute'
		,bottom:'5px'
		,left:'0'
		,display:'none'
		,width:'100%'
		,textAlign:'left'
		,font:'bold 12px Arial'
		,color:'white'
		,textShadow:'0 0 2px #000'
	})
	feedback.innerText = 'loading google jsapi'
	target.appendChild(feedback)
	//
	loadImage()
	//
	return canvas
}

function exit(){
	zuper.exit()
	target.removeChild(imgPreview)
	target.removeChild(imgPreviewUri)
	target.removeChild(feedback)
	canvas.removeEventListener('click',loadImage,true)
}

// protected methods

function handleAnimate(deltaT,millis){
	if (img) {
		millis -= millisOffset
		canvas.width = w
		context.fillStyle = '#f00'
		context.fillRect(0,0,10,10)
		let iMaxH = hMax-margin
			,iMil = millisScale*millis<<0
			,iMill = iMil%iMaxH
			,iOff = iMaxH-Math.abs(2*iMill-iMaxH)
			,sx = 1
			,sy = 0

		switchMillCnt += iMil-switchMillLst
		switchMillLst = iMil
		if (switchMillCnt>0.45*iMaxH) {
			switchMillCnt = 0
			loadImage()
		}
		//
		context.save()
		context.globalCompositeOperation = 'source-over'
		context.transform(1,sy,sx,1,0,0)
		context.drawImage(patternCanvas,0,iOff,w,margin,-h,0,w + h,h)
		context.restore()
		//
		context.globalCompositeOperation = 'lighter'
		sx = -1
		context.transform(1,sy,sx,1,0,0)
		context.drawImage(patternCanvas,0,iOff,w,margin,0,0,w + h,h)
	}
}

function handleResize(){
	zuper.handleResize()
	w = inst.w
	h = inst.h
	hMax = h
	patternCanvas.width = w
	patternCanvas.height = hMax
	if (img) {
		buildPattern()
	}
}

// private methods

function loadImage() {
	feedback.innerText = 'loading image'
	if (!img) {
		imgTemp = document.createElement('img')
		imgTemp.setAttribute('crossOrigin', 'anonymous')
	}
	imgTemp.addEventListener('load',handleImageLoad,false)
	imgTemp.addEventListener('error',handleImageError,false)
	// imgTemp.setAttribute('src', 'https://unsplash.it/200/300/?random'+(Math.random()<0.1?'&blur':''))
	imgTemp.setAttribute('src', '/api/rv/v1/image')
}

function handleImageError(){
	loadImage()
	imgTemp.removeEventListener('error',handleImageError)
}

function handleImageLoad(){
	img = imgTemp
	//
	buildPattern()
	//
	let sSrc = img.getAttribute('src')
	imgPreview.setAttribute('src', sSrc)
	imgPreviewUri.innerHTML = sSrc
	feedback.innerText = ''
	//
	switchMillLst = 0
	switchMillCnt = 0
	millisOffset = Date.now()
	//
	imgTemp.removeEventListener('load',handleImageLoad)
}

function buildPattern(){
	patternCanvas.width = w
	patternContext.fillStyle = 'rgba(0,0,0,.3)'
	patternContext.drawImage(img,0,0,img.width,img.height,0,0,w,hMax)
	patternContext.rect(0,0,w,h)
	patternContext.fill()
}

export default inst.expose