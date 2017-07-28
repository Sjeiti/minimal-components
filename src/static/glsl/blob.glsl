#include "/static/glsl/noise3D.glsl"

#define CAMERA_VIEWPORT 2.5
#define CAMERA_NEAR 0.5
#define CAMERA_FAR 20.0

uniform float time;
uniform vec2 resolution;
uniform float size;

uniform vec3 camP;
uniform vec3 lookAt;

float noiseScale = 1.1;

float sdSphere(vec3 p, float s){
	return length(p)-s;
}

float sdPlanar(vec3 p){
	float noise = snoise(noiseScale*p+0.1*time*vec3(0.0,1.0,0.0));
	float sphereDist = 5.5;
  vec3 offset = vec3(sphereDist,0,sphereDist);
  vec3 repeat = mod(p,offset)-0.5*offset;
	float spheres = length(repeat)-1.0;
	float planes = (0.5-length(p.y))*spheres;
	float posNeg = noise>0.0?1.0:-1.0;
	float powNoise = pow(noise,4.0);
	//
	return planes-0.4*noiseScale*powNoise;
}

vec2 map(in vec3 pos){
	vec2 res = vec2(sdPlanar(pos),3.0);
	return res;
}

vec2 castRay(in vec3 ro, in vec3 rd){
	float tmin = CAMERA_NEAR;
	float tmax = CAMERA_FAR;
	float precis = 0.0001;
	float t = tmin;
	float m = -1.0;
	for(int i=0; i<50; i++){
		vec2 res = map(ro+rd*t);
		if(res.x<precis || t>tmax) break;
		t += res.x;
		m = res.y;
	}
	if(t>tmax) m=-1.0;
	return vec2(t, m);
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
    float noise = snoise(noiseScale*pos+0.1*time*vec3(0.0,1.0,0.0));
    col = vec3(1.0,1.0,1.0)*(noise+0.5);

		// lighting
		vec3 lig = normalize(vec3(-0.6, 0.7, -0.5));
		float amb = clamp(0.5+0.5*nor.y, 0.0, 1.0);
		float dif = clamp(dot(nor, lig), 0.0, 1.0);
		float spe = pow(clamp(dot(ref, lig), 0.0, 1.0),16.0);

		vec3 brdf = vec3(0.0);
		brdf += 1.20*dif*vec3(1.00,0.80,0.60);
		brdf += 1.20*spe*vec3(1.00,0.90,0.60)*dif;
		brdf += 0.50*amb*vec3(0.60,0.70,1.00);
		brdf += 0.02;
		col = col*brdf;

		// fog
		col = mix(col, baseColor, 1.0-exp(-0.01*t*t));
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
	vec2 iResolution = resolution;

	vec2 q = fragCoord.xy/iResolution.xy;
	vec2 p = -1.0+2.0*q;
	p.x *= iResolution.x/iResolution.y;

	float t = 15.0 + time;

	// camera
	vec3 ro = camP;
//	vec3 ro = camP*vec3(1,0,1)+vec3(0,0,-time*0.1);
	vec3 ta = ro+lookAt;
	mat3 ca = setCamera(ro, ta, 0.0);

	// ray direction
	vec3 rd = ca * normalize(vec3(p.xy,CAMERA_VIEWPORT));

	// render
	vec3 col = render(ro, rd);

	col = pow(col, vec3(0.5));

	gl_FragColor = vec4(col, 1.0);
}