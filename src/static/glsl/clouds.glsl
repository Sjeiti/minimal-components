#include "/static/glsl/noise3D.glsl"
#include "/static/glsl/noiseStack.glsl"

uniform float time;
uniform vec2 resolution;
uniform float down;
uniform vec2 offset;

void main(){
	vec4 fragCoord = gl_FragCoord;
	//
	float scale = resolution.y/210.0;
	//
  vec4 coordScaled = 0.01*fragCoord - 0.02*vec4(offset.x,-offset.y,0.0,0.0);
  vec3 position = vec3(1223.0+coordScaled.x,6434.0+coordScaled.y,8425.0)/scale;
  vec3 timing = pow(scale,.05)*time*vec3(0.1,-0.07,0.1);
  //
	float xpart = fragCoord.x/resolution.x;
	float ypart = fragCoord.y/resolution.y;
  //
  ypart = 0.8*ypart + 0.7;
	ypart = ypart*ypart*ypart;
  //
	float noise = ypart*noiseStack(position+timing,4,0.4);
	noise = clamp(noise,0.0,1.0);
	//
	vec3 colorSky = vec3(114.0,121.0,254.0)/255.0;
	vec3 colorCld = vec3(255.0,179.0,156.0)/255.0;
	vec3 color = (1.0-noise)*colorCld + noise*colorSky;
	//
	vec4 fragColor = vec4(color,1.0);
	gl_FragColor = fragColor;
}