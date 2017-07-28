#include "/static/glsl/noise3D.glsl"
#include "/static/glsl/prng.glsl"

#define PI 3.1415926535897932384626433832795

uniform float time;
uniform vec2 resolution;
uniform vec2 offset;
uniform vec2 drag;
uniform float down;
uniform vec2 click;

uniform vec2 holePosition;
uniform float holeSize;

uniform sampler2D ground;
uniform sampler2D sky;

const int numMarbles = 16;
struct Marble {
    vec2 position;
    float travel;
    float size;
    vec3 color1;
    vec3 color2;
    float selected;
};
uniform Marble marbles[numMarbles];

// https://www.shadertoy.com/view/MlcGDB
// draw line segment from A to B
float segment(vec2 P, vec2 A, vec2 B, float r) {
    vec2 g = B - A;
    vec2 h = P - A;
    float d = length(h - g * clamp(dot(g, h) / dot(g,g), 0.0, 1.0));
	return smoothstep(r, 0.5*r, d);
}

mat2 rotate2d(float angle){
    return mat2(cos(angle),-sin(angle),
                sin(angle),cos(angle));
}

vec2 wrapPosition(vec2 coord, vec2 position) {
  vec2 positionT = position + vec2(0.0,resolution.y);
  vec2 positionR = position + vec2(resolution.x,0.0);
  vec2 positionB = position - vec2(0.0,resolution.y);
  vec2 positionL = position - vec2(resolution.x,0.0);
  float dst = distance(position,coord);
  if      (distance(positionT,coord)<dst) position = positionT;
  else if (distance(positionR,coord)<dst) position = positionR;
  else if (distance(positionB,coord)<dst) position = positionB;
  else if (distance(positionL,coord)<dst) position = positionL;
  return position;
}

vec2 positionMarble(vec2 coord,vec2 position,float size, float refract){
  position = wrapPosition(coord,wrapPosition(coord,position));
  float dst = distance(position,coord);
  if (dst<size) {
    float dstPart = dst/size;
    coord = coord - refract*pow(sin(0.5*(1.0-dstPart)*PI),0.5)*(coord - position);
  }
  return coord;
}

vec2 positionMarble(vec2 pos,vec2 position,float size){
  return positionMarble(pos,position,size,0.9);
}

void main(){
  vec2 halfResolution = resolution/2.0;
	vec2 fragCoord = gl_FragCoord.xy + 0.0*offset*vec2(-1.0,1.0);
	//
  vec2 center = fragCoord - halfResolution;
  vec2 pos = center;
  vec2 lightPos = (resolution.x>resolution.y?vec2(0.1,-0.5):vec2(-0.5,-0.1))+center/resolution.x;//vec2(-1.0,1.0)*(drag-halfResolution)/resolution.x+center/resolution.x;
  //
  vec2 marblePos = pos;
  //
  // marble texture positions
  for(int i=0;i<numMarbles;i++) {
    Marble marble = marbles[i];
    vec2 marblePosition = marble.position;
//    if (i==0) marblePosition = vec2(1.0,-1.0)*(drag - halfResolution); //////////#########################################
    if (marble.size>0.0){
      marblePos = positionMarble(marblePos,marblePosition,marble.size);
    }
  }
  //
  // hole texture position
  marblePos = positionMarble(marblePos,holePosition,holeSize,-0.5);
	//
  vec4 fragColor = texture2D(ground,(1.0/512.0)*rotate2d(3.3)*marblePos);
  //
  // hole lighting
  vec2 holeVec = fragCoord - holePosition - halfResolution;
  float holeDst = length(holeVec);
  float holeDstPart = holeDst/holeSize;
  if (holeDstPart<1.0) {
    fragColor.xyz *= 1.0 - 0.1*holeDstPart;
    vec2 holeHVec = fragCoord - holePosition - halfResolution - holeSize*lightPos;//vec2(-0.2*holeSize,0.6*holeSize);
    float holeHDst = length(holeHVec);
    float holeHDstPart = holeHDst/holeSize;
    fragColor.xyz *= 1.2 + 0.3*(1.0-holeHDstPart*holeHDstPart);
//    fragColor.xyz = vec3(pow(1.0-holeDstPart,0.5));
  }
  //
  Marble selectedMarble = marbles[0];
  //
  for(int i=0;i<numMarbles;i++) {
    float ii = float(i);
    Marble marble = marbles[i];
    float marbleSize = marble.size;
    vec2 marblePosition = marble.position;


//    if (i==0) marblePosition = vec2(1.0,-1.0)*(drag - halfResolution); //////////#########################################

    marblePosition = wrapPosition(pos,wrapPosition(pos,marblePosition));

    if (marble.selected==1.0) {
      selectedMarble = marble;
    }
    if (marbleSize>0.0){
      vec2 marbleCenter = marblePosition-pos;
      float marbleDistance = length(marbleCenter);
      float distancePart = marbleDistance/marbleSize;
      float distancePartInv = 1.0-distancePart;
      float shadeSize = 1.1*marbleSize;
      float dstShade = distance(marblePosition+lightPos*shadeSize,pos);
      //
      if (distancePart<1.0) {
        // darken glass edge / lighten middle
        fragColor.xyz *= 0.4+0.8*vec3(pow(distancePartInv,0.2));
        // color swirl
        float offset = 0.4*distancePartInv*snoise(vec3(1.0*marbleCenter/marbleSize,123.78*ii+0.001*marble.travel));
        vec2 offsetCenter = marbleCenter + vec2(0.0,offset*marbleSize);
        //
        float travel = marble.travel;
        vec2 rotatedPosition = rotate2d(1.3*travel/marbleSize)*offsetCenter;
        rotatedPosition = positionMarble(rotatedPosition,vec2(0.0),marbleSize);
        float colorRange = 0.5+0.5*(rotatedPosition.y/marbleSize)/(0.1*distancePartInv);
        colorRange += snoise(vec3(1.0*rotatedPosition/marbleSize,213.78*ii));
        if (colorRange>0.0&&colorRange<1.0) { //&&abs(colorRange-0.5)>0.05
          vec3 color = colorRange*marble.color1+(1.0-colorRange)*marble.color2;
          fragColor = vec4(color,1.0);
        }
        // reflection
        vec2 relPos = marbleCenter/marbleSize;
        float relPosLen = length(relPos);
        float relLen = pow(1.0-sin(0.5*PI+0.5*relPosLen*PI),0.5);
        vec2 reflectPos = 0.5*relLen*relPos+vec2(0.5);
        vec4 reflect = texture2D(sky,reflectPos);
        reflect.xyz *= pow(1.0-relPosLen,0.5);
        float reflectPart = 0.1+0.2*distancePart;
        fragColor.xyz += reflectPart*reflect.xyz;
        // selected
        if (marble.selected==1.0) {
          fragColor.xyz *= 1.3;
        }
        // sun
        //vec2 sunOffset = vec2(-0.2*(center.x/resolution.x)-0.01,0.1);
        vec2 sunOffset = -0.2*lightPos;//vec2(-0.05,0.1);
        vec2 sunSphere = positionMarble(relPos+sunOffset,sunOffset,1.0);
        float sunDst = max(0.0,1.0-1.0*length(sunSphere));
        fragColor.xyz += 0.7*vec3(pow(sunDst,16.0));
      } else if (dstShade<shadeSize) {
        // shade
        float dstShadePart = dstShade/shadeSize;
        fragColor.xyz *= vec3(0.6 + 0.4*dstShadePart*dstShadePart*dstShadePart);
      }
    }
  }
  // shoot indication
  if (selectedMarble.selected==1.0) {
    float marbleSize = selectedMarble.size;
    vec2 marblePosition = selectedMarble.position;
    vec2 coordCenter = fragCoord-halfResolution;
    vec2 marbleCenter = coordCenter-marblePosition;
    float marbleDistance = length(marbleCenter);
    if (marbleDistance>marbleSize) {
      vec2 lineFrom = marblePosition;
      vec2 lineTo = marblePosition - length(resolution)*normalize(marblePosition - vec2(1.0,-1.0)*(drag - halfResolution));
      float seg = segment(coordCenter,lineFrom,lineTo,selectedMarble.size);
      if (seg>0.01) {
        vec2 lineTo2 = marblePosition + (marblePosition - vec2(1.0,-1.0)*(drag - halfResolution));
        float lineDistance = distance(lineFrom,lineTo2);
        float coordDistance = lineDistance/distance(coordCenter,marblePosition);
        if (coordDistance>0.01) fragColor.xyz *= 1.0+0.4*pow(coordDistance,0.5)*seg;
      }
    }
  }
  //
	gl_FragColor = fragColor;
}