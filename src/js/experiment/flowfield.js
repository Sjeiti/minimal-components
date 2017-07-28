import experiment from './base'
import perlin from '../math/perlin'
import pool from '../pattern/pool'
import color from '../math/color'

let inst = experiment('flowfield',{
    init: init
    ,handleAnimate: handleAnimate
    ,handleResize: handleResize
  })
  ,zuper = inst.zuper
	//
	,target
	,imageData, pixels, i
	,scale = 1
	,w
	,h
	,particlesNum = 0
	,particles = []
	,fieldScale = 0.01*scale
	,timeScale = 0.0009
	,particleSpeed = 0.25
	,flowfieldScale = 2
	,flowfield = []
	,canvas,context
	,canvasTemp = document.createElement('canvas')
	,contextTemp = canvasTemp.getContext("2d")
	,aFPos = [[-1,-1],[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0]]
	,point = pool(point_)
;

function init(_target) {
  target = _target;
  canvas = zuper.init(_target);
  context = inst.context;
  //
  handleResize();
  //
  perlin.noiseDetail(1);
  //
  if (particlesNum===0) for (i = 0; i<3000; i++) addParticle();
  //
  return canvas;
}

// protected methods
function handleResize(){
	canvasTemp.width = canvas.width;
	canvasTemp.height = canvas.height;
	contextTemp.drawImage(canvas,0,0,canvas.width,canvas.height);
	//
	w = target.clientWidth/scale<<0;
	h = target.clientHeight/scale<<0;
	canvas.width = w;
	canvas.height = h;
	imageData = context.getImageData(0,0,w,h);
	pixels = imageData.data;
	context.fillStyle = color('#402').rgba(0.1);
}

function handleAnimate(deltaT,millis,frame){
	// adjust number of particles fps 24 ~ 1000/24=41
	if (deltaT<30) {
		let num = 10;
		while (num--) addParticle();
	} else if (deltaT>40) {
		removeParticle();
	}
	//
	// blur a bit
	let iPos = frame%8
		,iPos2 = (iPos+4)%8
		,aFFPos = aFPos[iPos]
		,aFFPos2 = aFPos[iPos2];
	context.drawImage(canvas,aFFPos[0],aFFPos[1]);
	context.drawImage(canvas,aFFPos2[0],aFFPos2[1]);
	//
	context.fillRect(0, 0, w, h);
	//
	imageData = context.getImageData(0,0,w,h);
	pixels = imageData.data;
	//
	let aCheck = []
		,oPoint, iAge, n, x, y, xy, fSpeed, iModMillis;
	flowfield.length = 0;
	i = particlesNum;
	while (--i) {
		oPoint = particles[i];
		oPoint.run(deltaT,millis,flowfield);
		iAge = oPoint.getAge();
		x = oPoint.getX()<<0;
		y = oPoint.getY()<<0;
		xy = y*w+x;
		if (aCheck[xy]) {
			oPoint.reset();
		} else {
			aCheck[xy] = true;
			n = 4*(y*w+x);
			fSpeed = oPoint.getSpeed()/particleSpeed*10;
			iModMillis = ((millis+oPoint.id)*0.1)%511<<0;
			pixels[n]   = fSpeed*255;
			pixels[n+1] = iModMillis<=255?iModMillis:511-iModMillis;
			pixels[n+2] = 255-fSpeed*255;
			pixels[n+3] = 255;
		}
	}
	context.putImageData(imageData, 0, 0);
}

function addParticle() {
	particlesNum = particles.push(point(w*Math.random(),h*Math.random()));
}

function removeParticle() {
	particles.pop().drop();
	particlesNum = particles.length;
}

function point_(_x,_y) {
	if (point.id===undefined) point.id = 0;
	let x = _x
		,y = _y
		,vx = 0.81 * (Math.random() - 0.5)
		,vy = 0.81 * (Math.random() - 0.5)
		,fOff = 0.1
		,fP1, fP2, fP3
		,scaleX, scaleY
		,iSx, iSy
		,birth = Math.random()*1E9<<0
		,age = 0
		,id = point.id++
	;
	function run(deltaT,millis,flowfield){
		scaleX = fieldScale * x;
		scaleY = fieldScale * y;
		iSx = x>>flowfieldScale;
		iSy = y>>flowfieldScale;
		//
		let iFlowfieldIndex = iSx + iSy*(w>>flowfieldScale);
		if (flowfield.length>iFlowfieldIndex&&flowfield[iFlowfieldIndex]!==undefined) {
			let aFlowfieldVector = flowfield[iFlowfieldIndex];
			vx = aFlowfieldVector[0];
			vy = aFlowfieldVector[1];
		} else {
			fP1 = perlin.noise(timeScale*millis,scaleX,scaleY);
			fP2 = perlin.noise(timeScale*millis,scaleX + fOff,scaleY);
			fP3 = perlin.noise(timeScale*millis,scaleX,scaleY + fOff);
			vx = fP2 - fP1;
			vy = fP3 - fP1;
			flowfield[iFlowfieldIndex] = [vx,vy];
		}
		//
		x = x + deltaT*particleSpeed*vx;
		y = y + deltaT*particleSpeed*vy;
		//
		age = millis-birth;
		if (x<0 || x>w || y<0 || y>h) {
			reset(millis);
		}
	}

	function reset(millis){
		birth = millis;
		x = w * Math.random();
		y = w * Math.random();
		vx = 0;
		vy = 0;
	}

	function getSpeed(){
		return Math.sqrt(vx * vx + vy * vy);
	}

	return {
		toString: function(){return '[object point '+id+']';}
		,getX: function() {
			return x;
		}
		,getY: function() {
			return y;
		}
		,getAge: function() {
			return age;
		}
		,id: id
		,run:run
		,reset:reset
		,getSpeed:getSpeed
	};
}

export default inst.expose;