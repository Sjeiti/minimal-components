#include "/static/glsl/noise3D.glsl"

#define PI 3.1415926535897932384626433832795
#define TWO_PI 2.0*PI
#define HALF_PI 0.5*PI

uniform float time;
uniform vec2 resolution;
uniform vec2 offset;
uniform float down;

uniform sampler2D u_image0;
uniform sampler2D u_image1;

void main(){
	vec4 fragCoord = gl_FragCoord;
	//
  vec2 center = resolution.xy/2.0;
	vec2 spiralOffset = offset + center + vec2(-200.0,0);
  vec2 pos = fragCoord.xy - center;
  float diagonal = sqrt(resolution.x*resolution.x+resolution.y*resolution.y);
  //
  float posdist = sqrt(pos.x*pos.x+pos.y*pos.y)/diagonal*2.0;
  float pdistCurve = 1.0-sin(posdist*HALF_PI+HALF_PI);
  float pdistRound = pow(pdistCurve,0.2);
  //
  vec3 posn = vec3(0.006*(1.0/pdistRound)*pos,828.93+0.5*time);
  float diff = 0.1;
	float noisea = snoise(posn);
	float noiseh = snoise(posn+vec3(diff,0.0,0.0)) - noisea;
	float noisev = snoise(posn+vec3(0.0,diff,0.0)) - noisea;
  pos += pdistRound*50.0*vec2(noiseh,noisev);
  //
  float angle = atan(fragCoord.y-center.y, fragCoord.x-center.x);
  float angle1 = angle/(2.0*PI)+.5;
  //
  float dist = sqrt(pos.x*pos.x+pos.y*pos.y)/diagonal*2.0;
  float distCurve = 1.0-sin(dist*HALF_PI+HALF_PI);
  float distRound = sqrt(distCurve);
  //
  //
  float spiral = mod(angle1+distRound,1.0);
  //
  float scale = 8.0;
  vec2 m = (spiralOffset.xy-center)/resolution.xy;
  float spiralm = scale*mod(angle1+1.0*m.x*log(distRound),1.0);
  vec2 spiralv = vec2(spiralm,scale*.2*log(distRound));
  //
  //
  vec2 n = time*vec2(0.15,-0.25) + spiralv;
  vec4 a = texture2D(u_image0,n);
  //
  vec2 u = time*vec2(0.2,-0.3) + spiralv;
  vec4 b = texture2D(u_image1,u);
  //
  float blend = 1.3;
  vec4 fade = vec4(vec3(2.0-1.8*pow(1.0-pdistCurve,2.0)),1.0);
  vec4 fragColor = fade*blend*(a*b - (1.0-1.0/blend));
  if (down==1.0) fragColor = vec4(mod(spiralv,1.0),0.0,1.0);
  //
	gl_FragColor = fragColor;
}