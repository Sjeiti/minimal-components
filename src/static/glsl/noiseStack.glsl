float noiseStack(vec3 pos,int octaves,float falloff){
  float noise = snoise(vec3(pos));
  float off = 1.0;
  if (octaves>1) {
    pos *= 2.0;
    off *= falloff;
    noise = (1.0-off)*noise + off*snoise(vec3(pos));
  }
  if (octaves>2) {
    pos *= 2.0;
    off *= falloff;
    noise = (1.0-off)*noise + off*snoise(vec3(pos));
  }
  if (octaves>3) {
    pos *= 2.0;
    off *= falloff;
    noise = (1.0-off)*noise + off*snoise(vec3(pos));
  }
  return (1.0+noise)/2.0;
}