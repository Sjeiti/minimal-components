//ienclude "/script/noise3D.glsl"
#include "/static/glsl/noise3D.glsl"
#include "/static/glsl/noiseStack.glsl"
#include "/static/glsl/rotateVertexPosition.glsl"

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

float sealevel = 0.6;

float noiseScale = 1.1;

float M_PI = 3.1415926535897932384626433832795;

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

float mountains(vec3 pos){
  vec3 posNormalised = normalize(pos);
  vec3 posRotated = rotateVertexPosition(posNormalised,vec3(0.0,1.0,0.0),13.2*time);
  return noiseStack(1.0*posRotated,4,0.4);
}

float sdPlanar(vec3 p){
//	return sdSphere(p-vec3(0.0,0.0,-20.0),10.0+0.01*snoise(1.1*p-0.2*time*vec3(0.0,1.0,0.0)));
  float h = mountains(p);
  if (h<sealevel) h = sealevel;
  h -= sealevel;
  float earth = sdSphere(p,5.0+1.1*h);
	return earth;//min(earth,p.y);
}

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
//	bool halfScreen = gl_FragCoord.y>0.5*resolution.y;
//	bool halfScreen = gl_FragCoord.x>0.5*resolution.x;
//	float tmax = gl_FragCoord.x/resolution.x*100.0;
  float tmin = CAMERA_NEAR;
  float tmax = CAMERA_FAR;

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
		col = vec3(1.0,1.0,1.0);
		col = 0.2+0.8*floor(mod(pos/4.0,vec3(2.0,2.0,2.0)));
    // checker
    vec3 cubeSize3 = floor(pos/cubeDistance);
    float cubeSize = mod(rand(vec2(cubeSize3.x,rand(vec2(cubeSize3.y,cubeSize3.z)))),1.0);
    col = vec3(cubeSize);
    // noise
//    float noise = 0.5 + 0.5*snoise(1.1*pos-0.2*time*vec3(0.0,1.0,0.0));

//    vec3 noiseSpace = 0.2*pos-0.02*time*vec3(0.0,1.0,0.0);
//    float noise = noiseStack(noiseSpace,3,0.4);
    float noise = mountains(pos);
    vec3 colorSea = vec3(15.0,84.0,105.0)/255.0;
    vec3 colorLandMin = vec3(138.0,156.0,46.0)/255.0;
    vec3 colorLandMax = vec3(1.0,0.0,0.0);//vec3(157.0,134.0,95.0)/255.0;
    float landmix = (noise-sealevel)*(1.0/(1.0-sealevel));
    vec3 colorLand = colorLandMin + landmix*(colorLandMax-colorLandMin);
    col = noise>sealevel?colorLand:colorSea;

		// lighting
		vec3 lig = normalize(vec3(-0.6, 0.7, -0.5));
		float amb = clamp(0.5+0.5*nor.y, 0.0, 1.0);
		float dif = clamp(dot(nor, lig), 0.0, 1.0);
		float spe = pow(clamp(dot(ref, lig), 0.0, 1.0),16.0);

		vec3 brdf = vec3(0.0);
    brdf += 1.20*dif*vec3(1.00,0.80,0.60);
    brdf += 1.20*spe*vec3(1.00,0.90,0.60)*dif;
		brdf += 0.50*amb*vec3(0.60,0.70,0.50);
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