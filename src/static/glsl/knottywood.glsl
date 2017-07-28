#include "/static/glsl/noise3D.glsl"
#include "/static/glsl/noiseStack.glsl"

uniform float time;
uniform vec2 resolution;
uniform float size;
uniform float down;
uniform vec2 offset;

uniform vec3 camP;
uniform vec3 lookAt;

uniform sampler2D u_image0;

void main(){
	vec4 fragCoord = gl_FragCoord;
	vec2 iResolution = resolution;
	//
  vec4 coordScaled = 0.002*(fragCoord - vec4(offset.x,-offset.y,0.0,0.0));
  vec3 position = vec3(1223.0+coordScaled.x,6434.0+coordScaled.y,8425.0);
  vec3 timing = time*vec3(0.0,0.0,0.01);
  //
	float noisea = noiseStack(position+timing,4,0.4);
	float noiseh = snoise(position+timing) - noisea;
	float noisev = snoise(position+timing) - noisea;
	//
	float imageSize = 1.0/256.0;
  vec4 a = texture2D(u_image0,imageSize*vec2(fragCoord.x,fragCoord.y)-6.0*vec2(noiseh,noisev));
  vec4 b = texture2D(u_image0,imageSize*vec2(fragCoord.x,fragCoord.y)+6.0*vec2(noiseh,noisev)+vec2(23.45,835.83));
	//
	vec4 fragColor = (a+b)/2.0;//a*b;//1.5*a-b;//
	gl_FragColor = fragColor;
}