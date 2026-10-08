'use strict';
// Bendito error — a cinematic pixel-art music video by Milton Valenzuela.
// Every shot is a hand-composed scene drawn into a 320×180 buffer. Cuts land on bar lines of the
// song's 120 BPM grid; characters walk on the beat and practical lights (neon, lamps) follow the kick.
class Film {
 constructor(){
  this.W=320;this.H=180;this.canvas=document.createElement('canvas');this.canvas.width=this.W;this.canvas.height=this.H;
  this.ctx=this.canvas.getContext('2d');this.image=this.ctx.createImageData(this.W,this.H);this.buf=new Uint32Array(this.image.data.buffer);
  this.L=new Uint32Array(this.W*this.H);this.T=this.buf;this.cache=new Map();this.box=null;
 }
 // ───── Color and timing ─────
 c(hex){let v=this.cache.get(hex);if(v===undefined){const n=parseInt(hex.slice(1),16);v=((255<<24)|((n&255)<<16)|(n&0xff00)|((n>>16)&255))>>>0;this.cache.set(hex,v);}return v;}
 mix(a,b,f){const ca=this.c(a),cb=this.c(b);const ch=(v,s)=>(v>>s)&255,m=s=>Math.round(ch(ca,s)+(ch(cb,s)-ch(ca,s))*f);return ((255<<24)|(m(16)<<16)|(m(8)<<8)|m(0))>>>0;}
 static beat(t){const b=(t-Film.BEAT0)/Film.P;return {b,n:Math.floor(b),ph:b-Math.floor(b),kick:Math.exp(-(b-Math.floor(b))*Film.P*9)};}
 static bar(i){return Film.BAR0+i*Film.P*4;}
 rand(n){n=Math.imul(n^0x9e3779b9,0x85ebca6b);n^=n>>>13;n=Math.imul(n,0xc2b2ae35);return ((n^(n>>>16))>>>0)/4294967296;}
 static ease(x){x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);}
 // ───── Raster primitives (write into this.T) ─────
 px(x,y,c){x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=this.W||y>=this.H)return;this.T[y*this.W+x]=c;if(this.box){const b=this.box;if(x<b[0])b[0]=x;if(x>b[2])b[2]=x;if(y<b[1])b[1]=y;if(y>b[3])b[3]=y;}}
 rect(x,y,w,h,c){x=Math.round(x);y=Math.round(y);w=Math.round(w);h=Math.round(h);for(let j=Math.max(0,y);j<Math.min(this.H,y+h);j++)for(let i=Math.max(0,x);i<Math.min(this.W,x+w);i++)this.px(i,j,typeof c==='function'?c(i,j):c);}
 d(x,y){return Film.BAYER[((x&3)|((y&3)<<2))];}
 line(x0,y0,x1,y1,c,w=1){const n=Math.max(1,Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0))));for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,y=y0+(y1-y0)*i/n;if(w<=1)this.px(x,y,c);else this.rect(x-w/2,y-w/2,w,w,c);}}
 // Even-odd scanline fill; c may be a function (x,y) → color or 0 to skip.
 poly(p,c){
  let y0=Infinity,y1=-Infinity;for(const q of p){y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1]);}
  for(let y=Math.max(0,Math.floor(y0));y<=Math.min(this.H-1,Math.ceil(y1));y++){const yc=y+.5,xs=[];
   for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];if((a[1]<=yc&&b[1]>yc)||(b[1]<=yc&&a[1]>yc))xs.push(a[0]+(yc-a[1])/(b[1]-a[1])*(b[0]-a[0]));}
   xs.sort((a,b)=>a-b);for(let k=0;k+1<xs.length;k+=2)for(let x=Math.max(0,Math.ceil(xs[k]-.5));x<=Math.min(this.W-1,Math.floor(xs[k+1]-.5));x++){const v=typeof c==='function'?c(x,y):c;if(v)this.px(x,y,v);}}
 }
 ellipse(cx,cy,rx,ry,c){for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++){const dx=(x+.5-cx)/rx,dy=(y+.5-cy)/ry;if(dx*dx+dy*dy<=1){const v=typeof c==='function'?c(x,y,dx,dy):c;if(v)this.px(x,y,v);}}}
 quad(x0,y0,x1,y1,w0,w1,c){const dx=x1-x0,dy=y1-y0,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;this.poly([[x0+nx*w0/2,y0+ny*w0/2],[x1+nx*w1/2,y1+ny*w1/2],[x1-nx*w1/2,y1-ny*w1/2],[x0-nx*w0/2,y0-ny*w0/2]],c);this.ellipse(x0,y0,w0/2,w0/2,c);this.ellipse(x1,y1,w1/2,w1/2,c);}
 // Dithered vertical gradient through a list of colors.
 vgrad(x,y,w,h,cols,f=null){this.rect(x,y,w,h,(i,j)=>{const t=Math.max(0,Math.min(1,(j-y)/Math.max(1,h-1)))*(cols.length-1)+(f?f(i,j):0),k=Math.floor(t+this.d(i,j));return this.c(cols[Math.max(0,Math.min(cols.length-1,k))]);});}
 // Soft light: a dithered radial falloff painted over what is already there.
 glow(cx,cy,r,col,amt=.6,sy=1){const c=this.c(col);for(let y=Math.floor(cy-r*sy);y<=cy+r*sy;y++)for(let x=Math.floor(cx-r);x<=cx+r;x++){const d=Math.hypot(x-cx,(y-cy)/sy)/r;if(d<1&&this.d(x,y)<(1-d)*(1-d)*amt)this.px(x,y,c);}}
 text(str,x,y,c,s=1,gap=1){str=String(str).toUpperCase();let cx=x;for(const ch of str){const g=ArcadeGame.font[ch];if(g&&ch!==' ')for(let r=0;r<5;r++)for(let k=0;k<3;k++)if(g[r*3+k]==='1')this.rect(cx+k*s,y+r*s,s,s,typeof c==='function'?c(r,k):c);cx+=(3+gap)*s;}}
 textW(str,s=1,gap=1){return String(str).length*(3+gap)*s-gap*s;}
 // Rain in depth layers: far streaks are short and dim, near ones long and bright.
 rain(t,amt=1,ox=0,oy=0,angle=.18){
  const layers=[[90,.55,3,'#3a3f6a',.9],[45,.8,6,'#6a6fa0',1.3],[14,1,11,'#b8bce8',1.9]];
  layers.forEach(([n,vis,len,col,spd],li)=>{const c=this.c(col);for(let i=0;i<n*amt;i++){const sp=(220+this.rand(i*7+li)*160)*spd,y=((this.rand(i*13+li*7)*(this.H+40)+t*sp+oy*(li+1)*.3)%(this.H+40))-20,x=((this.rand(i*5+li*3)*(this.W+60)-y*angle+ox*(li+1)*.4)%(this.W+60)+this.W+60)%(this.W+60)-30;
   for(let k=0;k<len;k++)if(this.d(Math.round(x+k*angle),Math.round(y+k))<vis)this.px(x+k*angle,y+k,c);}});
 }
 clear(c){this.T.fill(this.c(c));}
 // Reflection: rows below `axis` sample the mirrored rows above it, rippled, darkened and dithered into the base.
 reflect(y0,y1,axis,base,t,wob=1.5,strength=.6){
  const W=this.W,b=this.buf,bc=this.c(base);
  for(let y=Math.max(0,y0);y<Math.min(this.H,y1);y++){const f=(y-y0)/Math.max(1,y1-y0),sy=Math.round(2*axis-y+Math.sin(y*.9+t*3)*wob*.5);if(sy<0||sy>=this.H)continue;
   for(let x=0;x<W;x++){const ox=Math.max(0,Math.min(W-1,Math.round(x+Math.sin(y*.55+t*4+x*.02)*wob*(.6+f)))),src=b[sy*W+ox];
    b[y*W+x]=this.d(x,y)<strength*(1-f*.6)?((((src&0xfefefe)>>>1)+((src&0xfcfcfc)>>>2)+((bc&0xfcfcfc)>>>2))|0xff000000)>>>0:bc;}}
 }
 // ───── Characters: a rig drawn at any size, then outlined and rim-lit as one silhouette ─────
 beginLayer(){this.L.fill(0);this.T=this.L;this.box=[this.W,this.H,-1,-1];}
 // Low-angle keystone: rows above the ground line shrink toward cx, as if the lens sat at his feet.
 keystone(cx,gy,k){const b=this.box;if(!b||b[2]<0)return;const L=this.L,W=this.W,row=new Uint32Array(W);
  for(let y=Math.max(0,b[1]);y<=Math.min(this.H-1,b[3]);y++){const s=1-k*Math.max(0,gy-y)/this.H;row.fill(0);
   for(let x=0;x<W;x++){const sx=Math.round(cx+(x-cx)/s);if(sx>=0&&sx<W)row[x]=L[y*W+sx];}L.set(row,y*W);}
  b[0]=0;b[2]=W-1;}
 endLayer(rim=null,side=1,ink='#120a18'){
  this.T=this.buf;const b=this.box;this.box=null;if(b[2]<0)return;const L=this.L,W=this.W,H=this.H,o=this.c(ink),rc=rim?this.c(rim):0;
  for(let y=Math.max(0,b[1]-1);y<=Math.min(H-1,b[3]+1);y++)for(let x=Math.max(0,b[0]-1);x<=Math.min(W-1,b[2]+1);x++){const v=L[y*W+x];
   if(!v){const n=(x>0&&L[y*W+x-1])||(x<W-1&&L[y*W+x+1])||(y>0&&L[(y-1)*W+x])||(y<H-1&&L[(y+1)*W+x]);if(n)this.buf[y*W+x]=o;continue;}
   const edge=rim&&!(x+side>=0&&x+side<W&&L[y*W+x+side]);this.buf[y*W+x]=edge?rc:v;}
 }
 // Walking person seen from the side. o: {x, y (ground), h, dir, walk (gait phase, 1 = two steps), who, arms}
 person(o){
  const P=Film.CAST[o.who||'milton'],c=k=>this.c(P[k]),h=o.h,s=o.dir||1,a=(o.walk||0)*Math.PI*2,bob=Math.abs(Math.cos(a))*h*.012,X=o.x,G=o.y;
  const hip=[X,G-h*.47-bob],sh=[X+s*h*.012,G-h*.79-bob],headH=h*.16,hc=[X+s*h*.025,G-h+headH*.52-bob],stride=h*.16;
  const leg=(i,back)=>{const ai=a+i*Math.PI,lift=Math.max(0,Math.cos(ai))*h*.06,fx=X+s*Math.sin(ai)*stride,fy=G-lift,knee=[(hip[0]+fx)/2+s*(h*.025+lift*.6),(hip[1]+fy)/2];
   const col=back?c('jeansShade'):c('jeans');this.quad(hip[0],hip[1],knee[0],knee[1],h*.085,h*.07,col);this.quad(knee[0],knee[1],fx,fy-h*.035,h*.07,h*.06,col);
   const sl=h*.12,sh2=h*.045,toe=Math.sin(ai)>0&&lift>0?-.25:0;this.poly([[fx-s*sl*.35,fy-sh2],[fx+s*sl*.55,fy-sh2*.7+toe*sh2],[fx+s*sl*.65,fy],[fx-s*sl*.35,fy]],back?c('shoeShade'):c('shoe'));this.rect(Math.min(fx-s*sl*.35,fx+s*sl*.65),fy-Math.max(1,h*.012),sl,Math.max(1,h*.012),c('sole'));};
  const arm=(i,back)=>{const ai=a+i*Math.PI,sw=-Math.sin(ai)*.55,ul=h*.17,fl=h*.16,el=[sh[0]+s*Math.sin(sw)*ul,sh[1]+Math.cos(sw)*ul],bend=.35+Math.max(0,-sw)*.4,hd=[el[0]+s*Math.sin(sw+bend)*fl,el[1]+Math.cos(sw+bend)*fl];
   const col=back?c('sleeveShade'):c('sleeve');this.quad(sh[0],sh[1],el[0],el[1],h*.075,h*.065,col);this.quad(el[0],el[1],hd[0],hd[1],h*.065,h*.055,col);this.rect(Math.min(el[0],hd[0])+Math.abs(hd[0]-el[0])*.75,el[1]+(hd[1]-el[1])*.75,Math.max(1,h*.03),Math.max(1,h*.012),c('cuff'));this.ellipse(hd[0]+s*h*.01,hd[1]+h*.015,h*.03,h*.034,c('skin'));};
  leg(1,true);arm(1,true);
  // Jacket: 80s color blocks — turquoise body, fuchsia yoke, a thin yellow stripe and a zipper at the front.
  const tw=h*.088,tb=[[sh[0]-s*tw*1.0,sh[1]-h*.012],[sh[0]+s*tw*.8,sh[1]-h*.004],[sh[0]+s*tw*1.05,sh[1]+h*.12],[hip[0]+s*tw*.8,hip[1]+h*.035],[hip[0]-s*tw*.9,hip[1]+h*.035],[sh[0]-s*tw*1.1,sh[1]+h*.11]];
  const yoke=sh[1]+h*.06,stripe=sh[1]+h*.072,hem=hip[1];
  this.poly(tb,(x,y)=>{if(y>hem)return c('jacketDark');if(y<yoke)return s*(x-sh[0])<-tw*.5&&this.d(x,y)<.5?c('sleeveShade'):c('yoke');if(y<stripe+Math.max(1,h*.012))return c('stripe');return s*(x-hip[0])<-tw*.45&&this.d(x,y)<.55?c('jacketShade'):c('jacket');});
  this.line(sh[0]+s*tw*.95,sh[1]+h*.01,hip[0]+s*tw*.8,hip[1]+h*.02,c('zip'));
  this.quad(sh[0]-s*tw*.3,sh[1]-h*.005,sh[0]+s*tw*.5,sh[1]-h*.03,h*.05,h*.045,c('jacket'));
  // Head: profile with nose and chin, beanie with folded brim, headphones over the beanie.
  const q=headH,hx=hc[0],hy=hc[1],F=(u,v)=>[hx+s*u*q,hy+v*q];
  this.quad(...F(-.05,.32),sh[0]+s*h*.004,sh[1]-h*.01,q*.36,q*.42,c('skinShade'));
  this.ellipse(hx-s*q*.04,hy,q*.46,q*.5,(x,y,dx)=>s*dx<-.45&&this.d(x,y)<.6?c('skinShade'):c('skin'));
  this.poly([F(.28,-.32),F(.43,-.06),F(.55,.1),F(.43,.16),F(.45,.27),F(.36,.43),F(.12,.52),F(-.1,.42)],c('skin'));
  const [ex,ey]=F(.3,-.03);this.px(ex,ey,c('eye'));if(h>70){this.px(ex-s,ey,c('eye'));this.px(ex,ey-1,c('skinDark'));const [nx,ny]=F(.44,.2);this.px(nx,ny,c('skinDark'));const [mx,my]=F(.36,.3);this.px(mx,my,c('skinDark'));}
  if(P.beanie){this.poly([F(-.18,.22),F(-.46,.16),F(-.5,-.15),F(-.36,-.5),F(-.05,-.64),F(.26,-.56),F(.44,-.34),F(.47,-.14)],c('hair'));
   const brim=v=>hy+(-.14+(.47-v)*.38*1)*q;
   this.poly([F(-.52,.1),F(-.55,-.2),F(-.4,-.52),F(-.08,-.68),F(.24,-.62),F(.44,-.42),F(.5,-.22),F(.48,-.12)],(x,y)=>{const u=s*(x-hx)/q,top=hy+(-.24+(.48-u)*.3)*q;if(y>top){const rib=h>60&&(Math.round(x)&1);return rib?c('beanieDark'):c('beanieShade');}return u>.12?(h>60&&this.d(x,y)<.3?c('beanieLight'):c('beanie')):u<-.3&&this.d(x,y)<.6?c('beanieShade'):c('beanie');});}
  else{this.poly([F(-.6,.95),F(-.62,.2),F(-.5,-.4),F(-.1,-.62),F(.3,-.5),F(.48,-.25),F(.36,-.3),F(.02,-.26),F(-.12,.1),F(-.1,.95)],(x,y)=>this.d(x,y)<.25?c('hairLight'):c('hair'));}
  if(P.phones){const [cx,cy]=F(-.1,.06);this.ellipse(cx,cy,Math.max(1,q*.17),Math.max(1,q*.21),c('phones'));if(h>60)this.ellipse(cx+s,cy-1,q*.07,q*.08,c('phonesLight'));const [bx,by]=F(-.1,-.14),[tx,ty]=F(.02,-.66);this.line(bx,by,tx,ty,c('phones'),Math.max(1,q*.09));}
  leg(0,false);arm(0,false);
 }
 // ───── Shots ─────
 render(t,shots){
  const s=shots.find(x=>t>=x.t0&&t<x.t1)||shots[shots.length-1];this.T=this.buf;this.box=null;
  this[s.fn](t-s.t0,t,s);this.ctx.putImageData(this.image,0,0);return s;
 }
}
Film.P=.49985;Film.BEAT0=.082;Film.BAR0=2.081;
Film.BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v=>(v+.5)/16);
Film.CAST={
 milton:{beanie:'#ffd23a',beanieLight:'#fff08a',beanieShade:'#d9a81e',beanieDark:'#a67810',jacket:'#22d6c4',jacketShade:'#139c99',jacketDark:'#0d6f74',yoke:'#ff2f9a',stripe:'#ffe14a',sleeve:'#ff2f9a',sleeveShade:'#b81c72',cuff:'#22d6c4',zip:'#d8dce8',jeans:'#34508f',jeansShade:'#25396a',shoe:'#f2f2f6',shoeShade:'#b8b8c8',sole:'#2a2a36',skin:'#f6cfb0',skinShade:'#dca587',skinDark:'#b9806a',eye:'#1a1020',hair:'#4a3020',phones:'#26263a',phonesLight:'#6a6a84'},
 her:{hairLight:'#8a5636',jacket:'#e8384f',jacketShade:'#b02238',jacketDark:'#7a1428',yoke:'#e8384f',stripe:'#ffd0d8',sleeve:'#e8384f',sleeveShade:'#a01c34',cuff:'#ffd0d8',zip:'#d8dce8',jeans:'#2a2440',jeansShade:'#1c1830',shoe:'#f2f2f6',shoeShade:'#b8b8c8',sole:'#2a2a36',skin:'#f8d6bc',skinShade:'#e0aa8c',skinDark:'#c08470',eye:'#1a1020',hair:'#6b3f22'}};
window.Film=Film;
