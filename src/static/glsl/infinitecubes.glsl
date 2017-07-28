//ienclude "/script/noise3D.glsl"
#include "/static/glsl/noise3D.glsl"
#include "/static/glsl/noiseStack.glsl"

#define CAMERA_VIEWPORT 3.5
#define CAMERA_NEAR 0.5
#define CAMERA_FAR 60.0

float cubeDistance = 2.0;

uniform float time;
uniform vec2 resolution;
uniform float size;

uniform vec3 camP;
uniform vec3 lookAt;
uniform vec2 drag;

//const bool halfX = gl_FragCoord.x>0.5*resolution.x;
//const bool halfY = gl_FragCoord.y>0.5*resolution.y;

float noiseScale = 1.1;

float M_PI = 3.1415926535897932384626433832795;

////////////////////////////////////////////////////////////////////////

// PRNG
// From https://www.shadertoy.com/view/4djSRW
float rand (in vec2 seed) {
	seed = fract (seed * vec2 (5.3983, 5.4427));
	seed += dot (seed.yx, seed.xy + vec2 (21.5351, 14.3137));
	return fract (seed.x * seed.y * 95.4337);
}

float sdSphere(vec3 p, float s){
	return length(p)-s;
}

float sdCube(vec3 p, float s){
  vec3 d = abs(p) - s;
  return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}

float sdPillar(vec3 p, float s){
  vec3 d = abs(p) - s;
  return min(max(d.x,d.z),0.0) + length(max(d*vec3(1.0,0.0,1.0),0.0));
}

float sdPlanar(vec3 p){
//  vec3 pos = 0.5*p-1.1*time*vec3(0.0,0.0,1.0);
//	float noise = noiseStack(pos,2,0.4);
//	//
////	float noise = snoise(noiseScale*p+0.1*time*vec3(0.0,1.0,0.0));
//	float sphereDist = 1.5;
//  vec3 offset = vec3(sphereDist,-6.0,sphereDist);
////  vec3 repeat = mod(p,offset)-0.5*offset;
//  vec3 repeat = mod(p,offset)-0.5*offset;
//  vec3 ropeat = mod(p+0.3*vec3(time),offset)-0.5*offset;
//  float size = 0.4;
//	float spheres = length(repeat)-size*noise;
//	float spheres = sdSphere(repeat,size);
//	float spheres = sdCube(repeat,size);
//	float planes = (0.95-length(p.y))*spheres;
//	float posNeg = noise>0.0?1.0:-1.0;
//	float powNoise = pow(noise,4.0);
//float sphere = sdSphere(repeat-vec3(0.3),0.2);
//float cube = sdCube(repeat,size);
////float cabe = sdCube(ropeat,size);
//float spheres = min(sphere,cube);
////spheres = min(spheres,cabe);
////
//  vec3 radius = 1.1*vec3(1.0,1.0,0.0);
//
//  spheres = -sdSphere(p*vec3(1.0,1.0,0.0)*(1.0+0.3*curve*curve*curve),8.0);
//  spheres = -sdSphere(p*vec3(1.0,1.0,0.0)+2.0*curve,2.4*(1.0+noise*noise));
//  spheres = -sdSphere(p*vec3(1.0,1.0,0.0)+2.0*curve,2.4+0.2*noise*noise);
//  spheres = min(spheres,sdSphere(p*vec3(1.0,1.0,0.0),0.4));
//  spheres = min(spheres,sdSphere(p*vec3(1.0,1.0,0.0)-0.5*radius,0.1));
//float cubeRadius = 1.0/rand(vec2(p.x,p.y));
//vec3 cubeDistance = (0.1+drag.x/resolution.x)*4.0*vec3(1.0,1.0,1.0);
//vec3 cubeDistance = (0.01+mod(time,3.0)/3.0)*4.0*vec3(1.0,1.0,1.0);
//vec3 asdf = floor((p-vec3(cubeDistance/2.0))/cubeDistance);
//vec3 asdf = floor((p+vec3(cubeDistance/2.0))/cubeDistance);
//vec3 asdf = floor(p/cubeDistance);
//cubeRadius *= 0.1+mod(rand(vec2(asdf.x,asdf.y)),2.0);
//spheres = min(spheres,sdCube(mod(p,cubeDistance)-0.5*cubeDistance,0.1));
//spheres = sdCube(mod(p,cubeDistance)-0.5*cubeDistance,0.6*mod(rand(vec2(asdf.x,asdf.y)),2.0));
//
//float spheres = max(-sphere,cube);
//
//	return p.y+2.0 - 0.2*noise;// - spheres;//planes-0.4*noiseScale*powNoise;
  //
  float tubeSize = 20.0;
	float curvetubeNoise = snoise(0.1*p-0.2*time*vec3(0.0,1.0,0.0));
  float tube  = -sdSphere(vec3(0.0,-0.5*tubeSize,0.0)+p*vec3(1.0,1.0,0.0)*(1.0+0.3*curvetubeNoise*curvetubeNoise*curvetubeNoise),tubeSize);
  //
  vec3 cubeSize3 = floor(p/cubeDistance);
  float cubeSize = mod(rand(vec2(cubeSize3.x,cubeSize3.z)),1.0);//mod(rand(vec2(cubeSize3.x,rand(vec2(cubeSize3.y,cubeSize3.z)))),1.0);
  vec3 cubeDistance3 = vec3(cubeDistance);
  float cubes = sdPillar(mod(vec3(1.0,1.0,1.0)*p,cubeDistance3)-0.5*cubeDistance3,0.5);
//  float cubes = sdPillar(mod(vec3(1.0,1.0,1.0)*p,cubeDistance3)-0.5*cubeDistance3,0.1+cubeSize);
//  float cubes = sdCube(mod(vec3(1.0,1.0,1.0)*p,cubeDistance3)-0.5*cubeDistance3,0.1+cubeSize);
  //
//  float plane = 2.0 + p.y + 2.0*(1.0+sin(time + 3.0*cubeSize));
//  float plane = 2.0 + p.y + 2.0*(1.0+sin(time));
//  float plane = 2.0 + p.y + 2.0*(1.0+sin(time));
//  float planeNoise = snoise(0.1*p-0.2*time*vec3(0.0,1.0,0.0))+cubeSize;
  float plane = p.y+10.0*cubeSize;
//  plane += planeNoise;
  //
  float result = plane;
//  result = max(result,tube);
//  result = min(result,cubes);
  result = max(result,cubes);
//  result = max(result,tube);
  //
	return result;
}

//float blob(vec3 p, float size){
//	float blobTime = 01.*time;
//	float sinBlobTime = sin(blobTime);
//	float piTime = floor(blobTime/M_PI);
//	float hollowSphere = max(sdSphere(p,size),-sdSphere(p,size-0.01));
//	return (.1*sinBlobTime*snoise(2.*p+2.*piTime*vec3(0,1,0))+hollowSphere)/1.2;
//}

////////////////////////////////////////////////////////////////////////


vec2 opU(vec2 d1, vec2 d2){
	return d1.x<d2.x ? d1 : d2;
}


////////////////////////////////////////////////////////////////////////

vec2 map(in vec3 pos){
	vec2 res = vec2(sdPlanar(pos),3.0);
//	res = opU(res, vec2(sdSphere(pos-vec3(1,0,1),0.60), 3.0));
	return res;
}

vec2 castRay(in vec3 ro, in vec3 rd){
	bool halfScreen = gl_FragCoord.y>0.5*resolution.y;
//	bool halfScreen = gl_FragCoord.x>0.5*resolution.x;
//	float tmax = gl_FragCoord.x/resolution.x*100.0;
  float tmin = CAMERA_NEAR;
  float tmax = CAMERA_FAR;

  // bounding volume
  /*if (halfScreen) {
    float tp1 = (0.0-ro.y)/rd.y; if( tp1>0.0 ) tmax = min( tmax, tp1 );
    float tp2 = (1.6-ro.y)/rd.y; if( tp2>0.0 ) { if( ro.y>1.6 ) tmin = max( tmin, tp2 );
                                                 else           tmax = min( tmax, tp2 ); }
  }*/

  float t = tmin;
  float m = -1.0;
  for( int i=0; i<64; i++ )
  {
    float precis = 0.0005*t;
    vec2 res = map( ro+rd*t );
      if( res.x<precis || t>tmax ) break;
      t += res.x;
    m = res.y;
  }

  if( t>tmax ) m=-1.0;
  return vec2( t, m );
}

vec3 calcNormal(in vec3 pos){
	vec3 eps = vec3(0.001, 0.0, 0.0);
	vec3 nor = vec3(map(pos+eps.xyy).x - map(pos-eps.xyy).x,
		map(pos+eps.yxy).x - map(pos-eps.yxy).x,
		map(pos+eps.yyx).x - map(pos-eps.yyx).x);
	return normalize(nor);
}

/*float calcAO(in vec3 pos, in vec3 nor){
	float occ = 0.0;
	float sca = 1.0;
	for(int i=0; i<5; i++){
		float hr = 0.01 + 0.12*float(i)/4.0;
		vec3 aopos = nor * hr + pos;
		float dd = map(aopos).x;
		occ += -(dd-hr)*sca;
		sca *= 0.95;
	}
	return clamp(1.0 - 3.0*occ, 0.0, 1.0);
}*/

vec3 render(in vec3 ro, in vec3 rd){
	vec3 baseColor = vec3(0);
	vec3 col = baseColor;
	vec2 res = castRay(ro,rd);
	float t = res.x;
	float m = res.y;
	if(m>-0.5){
		vec3 pos = ro + t*rd;
		vec3 nor = calcNormal(pos);
		vec3 ref = reflect(rd, nor);

		// material
//		col = 0.45 + 0.3*sin(vec3(0.05,0.08,0.10)*snoise(4.*pos+2.*time*vec3(0,.1,0))*(m-1.0));
//		col = 0.45 + 0.3*sin(vec3(0.05,0.08,0.10)*(m-1.0));

//		if(m<1.5){
//			float f = mod(floor(5.0*pos.z) + floor(5.0*pos.x), 2.0);
//			col = 0.4 + 0.1*f*vec3(1.0);
//		} else if(m==2.0){
			col = vec3(1.0,1.0,1.0);
			col = 0.2+0.8*floor(mod(pos/4.0,vec3(2.0,2.0,2.0)));
//  float cubeDistance = 4.0;
  vec3 cubeSize3 = floor(pos/cubeDistance);
  float cubeSize = mod(rand(vec2(cubeSize3.x,cubeSize3.z)),1.0);//mod(rand(vec2(cubeSize3.x,rand(vec2(cubeSize3.y,cubeSize3.z)))),1.0);
			col = vec3(cubeSize);
//			col = (col.x+col.y+col.z)>1.5?vec3(.8):vec3(0.2);
//		} else if(m==3.0){
//			float noise = snoise(noiseScale*pos+0.1*time*vec3(0.0,1.0,0.0));
//			col = vec3(1.0,1.0,1.0)*(noise+0.5);
//		} else {
//			col = 0.45 + 0.3*sin(vec3(0.05,0.08,0.10)*snoise(4.*pos+2.*time*vec3(0,.1,0))*(m-1.0));
//		}

		// lighting
//		float occ = calcAO(pos, nor);
		vec3 lig = normalize(vec3(-0.6, 0.7, -0.5));
		float amb = clamp(0.5+0.5*nor.y, 0.0, 1.0);
		float dif = clamp(dot(nor, lig), 0.0, 1.0);
//		float bac = clamp(dot(nor, normalize(vec3(-lig.x,0.0,-lig.z))), 0.0, 1.0)*clamp(1.0-pos.y,0.0,1.0);
//		float dom = smoothstep(-0.1, 0.1, ref.y);
//		float fre = pow(clamp(1.0+dot(nor,rd),0.0,1.0), 2.0);
		float spe = pow(clamp(dot(ref, lig), 0.0, 1.0),16.0);

		vec3 brdf = vec3(0.0);
    brdf += 1.20*dif*vec3(1.00,0.80,0.60);
    brdf += 1.20*spe*vec3(1.00,0.90,0.60)*dif;
		brdf += 0.50*amb*vec3(0.60,0.70,0.00);
//		brdf += 0.50*amb*vec3(0.60,0.70,1.00)*occ;
//		brdf += 0.40*dom*vec3(0.50,0.70,1.00)*occ;
//		brdf += 0.30*bac*vec3(0.25,0.25,0.25)*occ;
//		brdf += 0.40*fre*vec3(1.00,1.00,1.00)*occ;
		brdf += 0.2;
		col = col*brdf;
		//
		// fog
		col = mix(col, baseColor, 1.0-exp(-0.001*t*t));
	}
	return vec3(clamp(col,0.0,1.0));
}

mat3 setCamera(in vec3 ro, in vec3 ta, float cr){
	vec3 cw = normalize(ta-ro);
	vec3 cp = vec3(sin(cr), cos(cr),0.0);
	vec3 cu = normalize(cross(cw,cp));
	vec3 cv = normalize(cross(cu,cw));
	return mat3(cu, cv, cw);
}

void main(){
	vec4 fragCoord = gl_FragCoord;
	vec4 fragColor;
	vec2 iResolution = resolution;

	vec2 q = fragCoord.xy/iResolution.xy;
	vec2 p = -1.0+2.0*q;
	p.x *= iResolution.x/iResolution.y;

	float t = 15.0 + time;

	// camera
	vec3 ro = camP;
//	vec3 ro = camP*vec3(1,1.0,1);//+vec3(0,0,-time*.1);
	vec3 ta = ro+lookAt;
	mat3 ca = setCamera(ro, ta, 0.0);

	// ray direction
	vec3 rd = ca * normalize(vec3(p.xy,CAMERA_VIEWPORT));

	// render
	vec3 col = render(ro, rd);

	col = pow(col, vec3(0.5));

	fragColor = vec4(col, 1.0);
	gl_FragColor = fragColor;
}