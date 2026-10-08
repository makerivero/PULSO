'use strict';
// ───── CRT: a wide curved tube that fills the frame; only the very edges of the cabinet show ─────
class CRT{
 constructor(canvas){
  const g=canvas.getContext('webgl',{preserveDrawingBuffer:true,antialias:false,premultipliedAlpha:false});if(!g)throw new Error('WebGL no está disponible');this.g=g;this.canvas=canvas;
  const sh=(type,src)=>{const s=g.createShader(type);g.shaderSource(s,src);g.compileShader(s);if(!g.getShaderParameter(s,g.COMPILE_STATUS))throw new Error(g.getShaderInfoLog(s));return s;};
  const p=g.createProgram();g.attachShader(p,sh(g.VERTEX_SHADER,'attribute vec2 a;void main(){gl_Position=vec4(a,0,1);}'));g.attachShader(p,sh(g.FRAGMENT_SHADER,CRT.fragment));g.linkProgram(p);if(!g.getProgramParameter(p,g.LINK_STATUS))throw new Error(g.getProgramInfoLog(p));
  g.useProgram(p);this.p=p;const b=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,b);g.bufferData(g.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),g.STATIC_DRAW);const loc=g.getAttribLocation(p,'a');g.enableVertexAttribArray(loc);g.vertexAttribPointer(loc,2,g.FLOAT,false,0,0);
  this.tex=g.createTexture();g.bindTexture(g.TEXTURE_2D,this.tex);for(const [k,v]of [[g.TEXTURE_MIN_FILTER,g.LINEAR],[g.TEXTURE_MAG_FILTER,g.LINEAR],[g.TEXTURE_WRAP_S,g.CLAMP_TO_EDGE],[g.TEXTURE_WRAP_T,g.CLAMP_TO_EDGE]])g.texParameteri(g.TEXTURE_2D,k,v);
  this.u=Object.fromEntries(['u_tex','u_res','u_time','u_curve','u_scan','u_amb','u_glow','u_size','u_fade'].map(n=>[n,g.getUniformLocation(p,n)]));
 }
 render(src,style,t,fade=1){
  const g=this.g,u=this.u;g.viewport(0,0,this.canvas.width,this.canvas.height);g.bindTexture(g.TEXTURE_2D,this.tex);g.texImage2D(g.TEXTURE_2D,0,g.RGBA,g.RGBA,g.UNSIGNED_BYTE,src);
  g.uniform1i(u.u_tex,0);g.uniform2f(u.u_res,this.canvas.width,this.canvas.height);g.uniform2f(u.u_size,src.width,src.height);g.uniform1f(u.u_time,t);g.uniform1f(u.u_curve,style.curve);g.uniform1f(u.u_scan,style.scan);g.uniform1f(u.u_amb,style.ambient);g.uniform1f(u.u_glow,style.glow);g.uniform1f(u.u_fade,Math.max(0,Math.min(1,fade)));
  g.drawArrays(g.TRIANGLES,0,6);
 }
}
CRT.fragment=`precision highp float;
uniform sampler2D u_tex;uniform vec2 u_res,u_size;uniform float u_time,u_curve,u_scan,u_amb,u_glow,u_fade;
vec3 lin(vec3 c){return c*c;}
vec3 cellAt(vec2 c){return lin(texture2D(u_tex,(clamp(c,vec2(0),u_size-1.0)+.5)/u_size).rgb);}
vec3 soft(vec2 q){vec2 t=clamp(q,vec2(-.98),vec2(.98))*.5+.5;t.y=1.0-t.y;return lin(texture2D(u_tex,t).rgb);}
void main(){
 vec2 uv=(gl_FragCoord.xy-.5*u_res)/u_res.y,hs=vec2(.5*u_res.x/u_res.y-.012,.488),p=uv/hs;
 float k=.05*u_curve;vec2 q=p*(1.0+k*vec2(p.y*p.y,p.x*p.x*1.4));
 vec2 aq=abs(q);float corner=.045,d=length(max(aq-vec2(1.0-corner),0.0))-corner;
 if(d>0.0){
  // The cabinet barely shows: dark plastic lit by the picture and a thin bevel.
  vec3 col=vec3(.010,.009,.013);vec2 e=clamp(q,vec2(-.94),vec2(.94));vec3 s=vec3(0);
  for(int i=0;i<10;i++){float a=float(i)*2.39996,r=sqrt((float(i)+.5)/10.0)*.22;s+=soft(e+vec2(cos(a),sin(a))*r);}
  col+=s/10.0*exp(-d*7.0)*.85*u_amb;col+=vec3(.07,.07,.08)*exp(-d*90.0);
  col=1.0-exp(-col*1.5);gl_FragColor=vec4(pow(col,vec3(1.0/1.1))*u_fade,1);return;
 }
 vec2 g=(q*.5+.5)*u_size;g.y=u_size.y-g.y;vec2 cell=floor(g),f=fract(g)-.5;
 vec3 c=cellAt(cell);
 float r=length(f*vec2(1.0,1.12)),mask=1.0-smoothstep(.34,.52,r);
 vec3 col=c*(mask*1.75+.32);
 vec3 n=cellAt(cell+vec2(1,0))+cellAt(cell-vec2(1,0))+cellAt(cell+vec2(0,1))+cellAt(cell-vec2(0,1));
 col+=n*.045*u_glow*(1.0-mask*.5);
 vec2 tq=(q*.5+.5);tq.y=1.0-tq.y;vec3 halo=vec3(0);for(int i=0;i<6;i++){float a=float(i)*1.0472;halo+=lin(texture2D(u_tex,tq+vec2(cos(a),sin(a))*vec2(2.5)/u_size).rgb);}col+=halo/6.0*.18*u_glow;
 col*=mix(1.0,.74+.26*cos(f.y*6.2831853),u_scan);
 float m=mod(gl_FragCoord.x,3.0);col*=mix(vec3(1),vec3(m<1.0?1.12:.93,m>=1.0&&m<2.0?1.12:.93,m>=2.0?1.12:.93),.22*u_scan);
 col*=1.0+.04*sin((g.y/u_size.y-u_time*.09)*6.2831853)*u_scan;
 col*=1.0-smoothstep(.6,1.2,length(q*vec2(.8,1.0)))*.42;
 col*=smoothstep(0.0,-.01,d);
 vec2 rq=q-vec2(-.55,.62);col+=vec3(.9,.95,1.0)*exp(-dot(rq,rq)*4.0)*.022;
 col*=.988+.012*sin(u_time*52.0);
 col=1.0-exp(-col*1.3);gl_FragColor=vec4(pow(col,vec3(1.0/1.12))*u_fade,1);
}`;
window.CRT=CRT;
