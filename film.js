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
 rect(x,y,w,h,c){x=Math.round(x);y=Math.round(y);w=Math.round(w);h=Math.round(h);for(let j=Math.max(0,y);j<Math.min(this.H,y+h);j++)for(let i=Math.max(0,x);i<Math.min(this.W,x+w);i++){const v=typeof c==='function'?c(i,j):c;if(v)this.px(i,j,v);}}
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
 // Person seen from the side. o: {x, y (ground), h, dir, walk (gait phase, 1 = two steps), who,
 //  pose: 'walk' | 'run' | 'stand' | 'dance' | 'keytar' | 'reach', beat (0..1 phase for dance), mid(pts) hook drawn between body and front arm}.
 // Returns anchor points so scenes can attach props: {head, q (head size), hands:[front, back], sh, hip}.
 person(o){
  const P=Film.CAST[o.who||'milton'],c=k=>this.c(P[k]),h=o.h,s=o.dir||1,pose=o.pose||'walk',a=(o.walk||0)*Math.PI*2,X=o.x,G=o.y;
  const run=pose==='run',still=pose==='stand'||pose==='keytar'||pose==='reach',dance=pose==='dance',bp=o.beat||0;
  const stride=run?h*.27:h*.16,liftA=run?h*.13:h*.06,lean=run?h*.07:0;
  let bob=run?Math.abs(Math.sin(a))*h*.03:still?0:Math.abs(Math.cos(a))*h*.012;
  if(dance)bob=Math.pow(1-bp,2)*h*.05;
  const hip=[X+s*lean*.2,G-h*.47-bob],sh=[X+s*(h*.012+lean),G-h*.79-bob*.9],headH=h*.16,hc=[X+s*(h*.025+lean*1.15),G-h+headH*.52-bob*.9];
  const out={q:headH,sh,hip,hands:[null,null]};
  const leg=(i,back)=>{const ai=a+i*Math.PI;let lift,fx;
   if(still){lift=0;fx=X+s*(i?-h*.035:h*.05);}else if(dance){lift=0;fx=X+s*(i?-h*.07:h*.08);}else{lift=Math.max(0,Math.cos(ai))*liftA;fx=X+s*Math.sin(ai)*stride;}
   const fy=G-lift,kf=dance?bob*1.2:0,knee=[(hip[0]+fx)/2+s*(h*.025+lift*.6+kf),(hip[1]+fy)/2];
   const col=back?c('jeansShade'):c('jeans');this.quad(hip[0],hip[1],knee[0],knee[1],h*.085,h*.07,col);this.quad(knee[0],knee[1],fx,fy-h*.035,h*.07,h*.06,col);
   const sl=h*.12,sh2=h*.045,toe=!still&&!dance&&Math.sin(ai)>0&&lift>0?-.25:0;this.poly([[fx-s*sl*.35,fy-sh2],[fx+s*sl*.55,fy-sh2*.7+toe*sh2],[fx+s*sl*.65,fy],[fx-s*sl*.35,fy]],back?c('shoeShade'):c('shoe'));this.rect(Math.min(fx-s*sl*.35,fx+s*sl*.65),fy-Math.max(1,h*.012),sl,Math.max(1,h*.012),c('sole'));};
  const armPose=i=>{const ai=a+i*Math.PI;
   if(run){const sw=-Math.sin(ai)*.95;return [sw,1.35];}
   if(pose==='stand')return [.06+Math.sin((o.walk||0)*2+i)*.03,.18];
   if(pose==='keytar')return i?[.75,1.05]:[1.05,.75];
   if(pose==='reach')return i?[.1,.25]:[1.35,.12];
   if(dance){const up=i?(bp<.5?2.6:2.2):(bp<.5?2.0:2.75);return [up+(1-bp)*.15,.5];}
   const sw=-Math.sin(ai)*.55;return [sw,.35+Math.max(0,-sw)*.4];};
  const arm=(i,back)=>{const [sw,bend]=o.arms&&o.arms[i]?o.arms[i]:armPose(i),ul=h*.17,fl=h*.16,el=[sh[0]+s*Math.sin(sw)*ul,sh[1]+Math.cos(sw)*ul],hd=[el[0]+s*Math.sin(sw+bend)*fl,el[1]+Math.cos(sw+bend)*fl];
   const col=back?c('sleeveShade'):c('sleeve');this.quad(sh[0],sh[1],el[0],el[1],h*.075,h*.065,col);this.quad(el[0],el[1],hd[0],hd[1],h*.065,h*.055,col);this.rect(Math.min(el[0],hd[0])+Math.abs(hd[0]-el[0])*.75,el[1]+(hd[1]-el[1])*.75,Math.max(1,h*.03),Math.max(1,h*.012),c('cuff'));
   const hand=[hd[0]+s*h*.01,hd[1]+h*.015];this.ellipse(hand[0],hand[1],h*.03,h*.034,back?c('skinShade'):c('skin'));out.hands[i]=hand;};
  leg(1,true);arm(1,true);
  // Jacket: color blocks — body, yoke, a thin stripe and a zipper at the front.
  const tw=h*.088,tb=[[sh[0]-s*tw*1.0,sh[1]-h*.012],[sh[0]+s*tw*.8,sh[1]-h*.004],[sh[0]+s*tw*1.05,sh[1]+h*.12],[hip[0]+s*tw*.8,hip[1]+h*.035],[hip[0]-s*tw*.9,hip[1]+h*.035],[sh[0]-s*tw*1.1,sh[1]+h*.11]];
  const yoke=sh[1]+h*.06,stripe=sh[1]+h*.072,hem=hip[1];
  this.poly(tb,(x,y)=>{if(y>hem)return c('jacketDark');if(y<yoke)return s*(x-sh[0])<-tw*.5&&this.d(x,y)<.5?c('sleeveShade'):c('yoke');if(y<stripe+Math.max(1,h*.012))return c('stripe');return s*(x-hip[0])<-tw*.45&&this.d(x,y)<.55?c('jacketShade'):c('jacket');});
  this.line(sh[0]+s*tw*.95,sh[1]+h*.01,hip[0]+s*tw*.8,hip[1]+h*.02,c('zip'));
  this.quad(sh[0]-s*tw*.3,sh[1]-h*.005,sh[0]+s*tw*.5,sh[1]-h*.03,h*.05,h*.045,c('jacket'));
  // Head: profile with nose and chin; beanie with folded brim and headphones for him, long hair for her.
  const q=headH,hx=hc[0],hy=hc[1],F=(u,v)=>[hx+s*u*q,hy+v*q];out.head=[hx,hy];
  if(!P.beanie)this.poly([F(-.62,1.05),F(-.66,.3),F(-.52,-.1),F(-.2,.2),F(-.14,1.05)],(x,y)=>this.d(x,y)<.2?c('hairLight'):c('hair'));
  this.quad(...F(-.05,.32),sh[0]+s*h*.004,sh[1]-h*.01,q*.36,q*.42,c('skinShade'));
  this.ellipse(hx-s*q*.04,hy,q*.46,q*.5,(x,y,dx)=>s*dx<-.45&&this.d(x,y)<.6?c('skinShade'):c('skin'));
  this.poly([F(.28,-.32),F(.43,-.06),F(.55,.1),F(.43,.16),F(.45,.27),F(.36,.43),F(.12,.52),F(-.1,.42)],c('skin'));
  const [ex,ey]=F(.3,-.03);this.px(ex,ey,c('eye'));if(h>70){this.px(ex-s,ey,c('eye'));this.px(ex,ey-1,c(P.beanie?'skinDark':'eye'));const [nx,ny]=F(.44,.2);this.px(nx,ny,c('skinDark'));const [mx,my]=F(.36,.3);this.px(mx,my,P.lips?c('lips'):c('skinDark'));if(P.stache){const [sx,sy]=F(.4,.25);this.px(sx,sy,c('stache'));if(h>110)this.px(sx-s,sy,c('stache'));}}
  if(P.beanie){this.poly([F(-.18,.22),F(-.46,.16),F(-.5,-.15),F(-.36,-.5),F(-.05,-.64),F(.26,-.56),F(.44,-.34),F(.47,-.14)],c('hair'));
   this.poly([F(-.52,.1),F(-.55,-.2),F(-.4,-.52),F(-.08,-.68),F(.24,-.62),F(.44,-.42),F(.5,-.22),F(.48,-.12)],(x,y)=>{const u=s*(x-hx)/q,top=hy+(-.24+(.48-u)*.3)*q;if(y>top){const rib=h>60&&(Math.round(x)&1);return rib?c('beanieDark'):c('beanieShade');}return u>.12?(h>60&&this.d(x,y)<.3?c('beanieLight'):c('beanie')):u<-.3&&this.d(x,y)<.6?c('beanieShade'):c('beanie');});}
  else{this.poly([F(-.6,.5),F(-.6,.1),F(-.5,-.4),F(-.1,-.64),F(.3,-.52),F(.5,-.25),F(.36,-.26),F(.1,-.22),F(-.08,.0),F(-.16,.3),F(-.3,.55)],(x,y)=>this.d(x,y)<.25?c('hairLight'):c('hair'));}
  if(P.phones){const [cx,cy]=F(-.1,.06);this.ellipse(cx,cy,Math.max(1,q*.17),Math.max(1,q*.21),c('phones'));if(h>60)this.ellipse(cx+s,cy-1,q*.07,q*.08,c('phonesLight'));const [bx,by]=F(-.1,-.14),[tx,ty]=F(.02,-.66);this.line(bx,by,tx,ty,c('phones'),Math.max(1,q*.09));}
  leg(0,false);if(o.mid)o.mid(out);arm(0,false);
  return out;
 }
 // Person seen from behind, walking away (or toward the lens with front:true). o: {x, y (ground), h, walk, who}
 personBack(o){
  const P=Film.CAST[o.who||'milton'],c=k=>this.c(P[k]),h=o.h,a=(o.walk||0)*Math.PI*2,X=o.x,G=o.y,bob=Math.abs(Math.cos(a))*h*.012;
  const bw=o.bow||0,hipY=G-h*.47-bob,shY=G-h*.79-bob+bw*h*.012,hw=h*.075,sw=h*.12*(1-bw*.06),q=h*.16,hy=G-h+q*.52-bob+bw*q*.32;
  for(const i of [0,1]){const ai=a+i*Math.PI,lift=Math.max(0,Math.cos(ai))*h*.05,fx=X+(i?-1:1)*h*.05,fy=G-lift-Math.max(0,Math.sin(ai))*h*.02,col=c(i?'jeansShade':'jeans');
   this.quad(X+(i?-1:1)*hw*.5,hipY,fx,fy-h*.04,h*.085,h*.065,col);this.rect(fx-h*.035,fy-h*.045,h*.07,h*.045,c('shoe'));this.rect(fx-h*.035,fy-h*.012,h*.07,Math.max(1,h*.012),c('sole'));}
  for(const i of [0,1]){const sgn=i?-1:1,ai=a+i*Math.PI,sw2=Math.sin(ai)*h*.03,hx=X+sgn*sw*1.05,hyy=shY+h*.3+sw2;this.quad(X+sgn*sw*.8,shY+h*.03,hx,hyy,h*.075,h*.06,c('sleeveShade'));this.ellipse(hx,hyy+h*.02,h*.03,h*.034,c('skinShade'));}
  this.poly([[X-sw,shY],[X+sw,shY],[X+sw*.92,hipY+h*.03],[X-sw*.92,hipY+h*.03]],(x,y)=>{if(y>hipY)return c('jacketDark');if(y<shY+h*.06)return c('yoke');if(y<shY+h*.072+Math.max(1,h*.012))return c('stripe');return x>X+sw*.4&&this.d(x,y)<.5?c('jacketShade'):c('jacket');});
  this.rect(X-q*.18,shY-q*.3,q*.36,q*.35,c('skinShade'));
  if(P.beanie){this.ellipse(X,hy,q*.5,q*.56,c('hair'));this.ellipse(X,hy-q*.1,q*.52,q*.56,(x,y)=>y>hy+q*.05?((Math.round(x)&1)&&h>60?c('beanieDark'):c('beanieShade')):x<X-q*.2&&this.d(x,y)<.5?c('beanieLight'):c('beanie'));
   this.line(X-q*.5,hy+q*.05,X-q*.38,hy-q*.5,c('phones'),Math.max(1,q*.09));this.line(X+q*.5,hy+q*.05,X+q*.38,hy-q*.5,c('phones'),Math.max(1,q*.09));this.line(X-q*.38,hy-q*.55,X+q*.38,hy-q*.55,c('phones'),Math.max(1,q*.09));
   this.ellipse(X-q*.52,hy+q*.08,q*.13,q*.2,c('phones'));this.ellipse(X+q*.52,hy+q*.08,q*.13,q*.2,c('phones'));}
  else{this.ellipse(X,hy,q*.5,q*.56,c('hair'));this.poly([[X-q*.5,hy],[X+q*.5,hy],[X+q*.56,shY+h*.06],[X-q*.56,shY+h*.06]],(x,y)=>this.d(x,y)<.2?c('hairLight'):c('hair'));}
  return {head:[X,hy],q};
 }
 // Person seen from straight above. o: {x, y, r (shoulder half-width), ang (heading, radians), walk, who}
 personTop(o){
  const P=Film.CAST[o.who||'milton'],c=k=>this.c(P[k]),r=o.r,a=(o.walk||0)*Math.PI*2,ux=Math.cos(o.ang),uy=Math.sin(o.ang),vx=-uy,vy=ux,X=o.x,Y=o.y;
  const at=(f,sd)=>[X+ux*f*r+vx*sd*r,Y+uy*f*r+vy*sd*r],oval=(f,sd,ru,rv,col)=>{const pts=[];for(let i=0;i<16;i++){const th=i/16*Math.PI*2;pts.push(at(f+Math.cos(th)*ru,sd+Math.sin(th)*rv));}this.poly(pts,col);};
  // Feet step out ahead of the body on alternate beats; arms swing against them.
  for(const i of [0,1]){const sd=i?-.42:.42,step=Math.sin(a+i*Math.PI)*.75;oval(step+.15,sd,.36,.2,c(i?'shoeShade':'shoe'));}
  oval(0,0,.42,1.0,c('yoke'));oval(-.2,0,.28,.82,c('jacketShade'));
  for(const i of [0,1]){const sd=i?-1:1,sw=-Math.sin(a+i*Math.PI)*.6,[ax,ay]=at(0,sd*.95),[hx,hy]=at(sw,sd*1.12);this.line(ax,ay,hx,hy,c(i?'sleeveShade':'sleeve'),Math.max(2,r*.34));oval(sw*1.12,sd*1.14,.17,.17,c('skin'));}
  if(P.beanie){oval(.06,0,.52,.5,c('beanieShade'));oval(.08,0,.42,.4,(x,y)=>this.d(x,y)<.2?c('beanieLight'):c('beanie'));const [b1,b2]=at(.1,-.5),[b3,b4]=at(.1,.5);this.line(b1,b2,b3,b4,c('phones'),Math.max(1,r*.12));oval(.1,-.52,.16,.1,c('phones'));oval(.1,.52,.16,.1,c('phones'));}
  else{oval(-.25,0,.55,.42,(x,y)=>this.d(x,y)<.22?c('hairLight'):c('hair'));oval(.08,0,.46,.46,(x,y)=>this.d(x,y)<.12?c('hairLight'):c('hair'));}
 }
 // Close-up profile portrait. o: {x, y, S (scale), who, dir (1 faces right), blink, smile, open (mouth), look (-1 up .. 1 down),
 //  sweat (0..1), kick, rimFront, rimBack, collar}. With dir -1 the portrait mirrors around x.
 portrait(o){
  const P=Film.CAST[o.who||'milton'],c=k=>this.c(P[k]),S=o.S,ox=o.x,oy=o.y,dr=o.dir||1,her=!P.beanie,k=o.kick||0;
  const U=(u,v)=>[ox+dr*u*S,oy+v*S],pts=a=>a.map(([u,v])=>U(u,v)),uv=(x,y)=>[dr*(x-ox)/S,(y-oy)/S];
  const rimF=o.rimFront||(k>.5?'#ffd0ea':'#ff8fd0'),rimB=o.rimBack||'#5fe8f0';
  if(her)this.poly(pts([[.24,.30],[.12,.62],[.08,1.0],[.14,1.32],[.48,1.32],[.5,1.0],[.44,.7],[.4,.5]]),(x,y)=>{const [u,v]=uv(x,y),st=Math.sin(u*95+Math.sin(v*7)*3)*.6+Math.sin(u*37-v*5)*.4;return st>.55+this.d(x,y)*.3?c('hairLight'):st<-.6-this.d(x,y)*.3?this.c('#4a2a14'):c('hair');});
  // Neck and collar.
  this.poly(pts([[.50,.78],[.72,.86],[.78,1.4],[.40,1.4]]),(x,y)=>uv(x,y)[0]<.58?c('skinShade'):c('skin'));
  if(o.collar!==false)this.poly(pts([[.18,1.02],[.40,.93],[.62,.98],[.86,.92],[.98,1.0],[1.1,1.5],[.1,1.5]]),(x,y)=>{const [u,v]=uv(x,y);if(v>1.18)return c('yoke');if(Math.abs(v-1.14)<.012)return c('stripe');return u>.62?c('jacket'):c('jacketShade');});
  if(o.collar!==false)this.line(...U(.86,.93),...U(.92,1.4),this.c('#d8dce8'),2);
  const face=her?[[.45,.00],[.62,.02],[.74,.08],[.80,.18],[.82,.30],[.83,.38],[.855,.45],[.885,.53],[.905,.575],[.875,.605],[.85,.625],[.865,.655],[.85,.675],[.86,.705],[.83,.735],[.80,.79],[.78,.84],[.70,.88],[.58,.86],[.50,.80],[.40,.74],[.30,.64],[.22,.46],[.24,.25],[.32,.08]]
   :[[.45,.00],[.62,.02],[.74,.08],[.80,.18],[.82,.30],[.83,.38],[.86,.44],[.90,.53],[.93,.58],[.89,.61],[.86,.63],[.87,.66],[.85,.68],[.865,.71],[.83,.74],[.81,.79],[.80,.85],[.72,.90],[.58,.88],[.50,.80],[.40,.74],[.30,.64],[.22,.46],[.24,.25],[.32,.08]];
  this.poly(pts(face),(x,y)=>{const u=uv(x,y)[0];if(u<.52)return this.d(x,y)<.5?c('skinShade'):c('skinDark');if(u<.6)return this.d(x,y)<.5?c('skin'):c('skinShade');return c('skin');});
  for(let i=0;i<face.length;i++){const [a,b]=U(...face[i]),[a2,b2]=U(...face[(i+1)%face.length]);if(face[i][0]>.78)this.line(a,b,a2,b2,this.c(rimF));else if(face[i][0]<.3)this.line(a,b,a2,b2,this.c(rimB));}
  // Eye (with lashes for her), brow, nostril, mouth.
  const [ex,ey]=U(.775,.405),look=o.look||0,ed=dr;
  if(o.blink)this.rect(ex-3,ey,7,1,this.c('#7a4a3a'));
  else{this.rect(ex-3,ey-1,7,3,this.c('#f4ecec'));const py=ey-1+Math.round(look);this.rect(ex+(ed>0?1:-3),py,3,3,this.c(her?'#4a2a18':'#3a2418'));this.px(ex+(ed>0?2:-2),py,this.c('#ffffff'));this.rect(ex-4,ey-2,8,1,this.c(her?'#2a1410':'#6a3a2a'));
   if(her){this.px(ex+ed*4,ey-3,this.c('#2a1410'));this.px(ex+ed*5,ey-4,this.c('#2a1410'));this.px(ex+ed*3,ey-3,this.c('#2a1410'));}}
  const [bx,by]=U(her?.74:.73,her?.345:.355);this.rect(Math.min(bx,bx+dr*12),by-(o.look<0?1:0),12,her?1:2,this.c(her?'#4a2a14':'#5a3420'));
  this.rect(...U(.865,.595).map((v,i)=>i?v:v-(dr<0?2:0)),2,1,this.c('#9a5a48'));
  const [mx,my]=U(.82,.69);
  if(P.stache){for(let i=0;i<=12;i++){const u=.79+i*.0068,v=.648+Math.abs(i-7)*.0018,[a,b]=U(u,v),th=Math.max(1,Math.round(S/60))-((i<2||i>11)?1:0);for(let k=0;k<th;k++)if(i<2||i>11?this.d(Math.round(a),Math.round(b+k))<.6:true)this.px(a,b+k,c('stache'));}}
  if(o.open){this.rect(mx-(dr<0?4:0),my-1,5,3,this.c('#3a1018'));}
  else if(her){this.rect(mx-(dr<0?5:0),my,6,2,c('lips'));this.px(mx+dr*(o.smile?6:5),my-(o.smile?1:0),c('lips'));}
  else{this.rect(mx-(dr<0?4:0),my,5,1,this.c('#b06a5a'));if(o.smile){this.px(mx+dr*5,my-1,this.c('#b06a5a'));this.px(mx-dr*1,my+1,this.c('#d08a7a'));}}
  if(o.sweat){for(let i=0;i<3;i++){const ph=(o.sweat*1.3+i*.37)%1,[sx,sy]=U(.6+i*.07,.2+ph*.35);this.px(sx,sy,this.c('#e8fbff'));this.px(sx,sy+1,this.c('#9fd8f0'));}}
  if(P.beanie){
   this.poly(pts([[.22,.46],[.34,.50],[.36,.66],[.27,.62]]),(x,y)=>this.d(x,y)<.3?this.c('#6a4430'):c('hair'));
   const beanie=[[.18,.54],[.15,.32],[.22,.12],[.38,-.03],[.58,-.05],[.74,.02],[.84,.14],[.885,.27],[.875,.355],[.60,.38],[.38,.45]];
   this.poly(pts(beanie),(x,y)=>{const [u,v]=uv(x,y),brimTop=.255+(.86-u)*.17;if(v>brimTop){const rib=(Math.floor(x)+Math.floor(y*.15))%3;return rib===0?c('beanieDark'):u>.7?c('beanie'):c('beanieShade');}
    const knit=((Math.floor(y/3)&1)?(x&3)===0:(x&3)===2)&&this.d(x,y)<.6;if(knit)return c('beanieShade');return u>.66?(this.d(x,y)<.35?c('beanieLight'):c('beanie')):u<.3?c('beanieShade'):c('beanie');});
   for(let i=0;i<beanie.length;i++){if(beanie[i][0]<.6)continue;const [a,b]=U(...beanie[i]),[a2,b2]=U(...beanie[(i+1)%beanie.length]);if(beanie[(i+1)%beanie.length][0]>.6)this.line(a,b,a2,b2,this.c('#fff6c0'));}
   for(let s=0;s<=1;s+=.02){const u=.43+Math.sin(s*1.4)*.1,v=.36-s*.42;const [a,b]=U(u,v);this.rect(a-1,b-1,4,4,c('phones'));if(s>.15)this.px(a+1,b-1,c('phonesLight'));}
   const [cx,cy]=U(.42,.50);this.ellipse(cx,cy,13*S/120,16*S/120,(x,y,dx,dy)=>dx*dx+dy*dy>.75?this.c('#14141f'):dr*dx>.2&&dy<-.1?c('phonesLight'):c('phones'));this.ellipse(cx+2*dr,cy-1,5*S/120,6*S/120,this.c('#3a3a52'));}
  else{
   // Long brown hair: crown, a side-swept fringe and strands falling behind the ear.
   this.poly(pts([[.20,.50],[.16,.28],[.24,.08],[.40,-.05],[.60,-.07],[.76,.0],[.86,.12],[.88,.24],[.80,.2],[.7,.17],[.62,.24],[.56,.36],[.5,.5],[.46,.68],[.4,.62],[.3,.6]]),(x,y)=>{const [u,v]=uv(x,y),st=Math.sin(u*80-v*30+Math.sin(u*9)*2)*.6+Math.sin(u*31+v*12)*.4;if(v<.12&&u>.5&&this.d(x,y)<.4)return c('hairLight');return st>.55+this.d(x,y)*.3?c('hairLight'):st<-.6-this.d(x,y)*.3?this.c('#4a2a14'):c('hair');});
   for(let i=0;i<5;i++){const [a,b]=U(.62+i*.05,-.04+i*.03),[a2,b2]=U(.56+i*.04,.2+i*.05);this.line(a,b,a2,b2,this.c('#a06a44'));}
   this.poly(pts([[.5,.46],[.47,.62],[.44,.8],[.47,1.0],[.42,1.22],[.30,1.32],[.14,1.3],[.1,1.0],[.14,.62],[.2,.44]]),(x,y)=>{const [u,v]=uv(x,y),st=Math.sin(u*95+Math.sin(v*7)*3)*.6+Math.sin(u*37-v*5)*.4;return st>.55+this.d(x,y)*.3?c('hairLight'):st<-.6-this.d(x,y)*.3?this.c('#4a2a14'):c('hair');});
   for(let i=0;i<4;i++){const [a,b]=U(.86-i*.01,.16+i*.02);this.px(a,b,this.c(rimF));}const [jx,jy]=U(.47,.7);this.rect(jx-(dr<0?1:0),jy,2,3,this.c('#ffe14a'));}
 }
 // The red thread: a sagging line with a dithered glow. Returns nothing; draws over the current target.
 redThread(x0,y0,x1,y1,sag=10,t=0,glow=.5,wob=1){
  const n=Math.max(2,Math.ceil(Math.hypot(x1-x0,y1-y0)));const core=this.c('#ff2a3a'),hi=this.c('#ff9a9a');let px0=x0,py0=y0;
  for(let i=0;i<=n;i++){const f=i/n,x=x0+(x1-x0)*f,y=y0+(y1-y0)*f+Math.sin(f*Math.PI)*sag+Math.sin(f*9+t*3)*wob*Math.sin(f*Math.PI);
   if(glow>0&&i%3===0)for(let k=-3;k<=3;k++)if(k&&this.d(Math.round(x),Math.round(y+k))<glow*(1-Math.abs(k)/4)*.5)this.px(x,y+k,this.c('#a0142a'));
   this.px(x,y,core);if(this.d(Math.round(x),Math.round(y))<.3)this.px(x,y-1,hi);px0=x;py0=y;}
 }
 // ───── Shots ─────
 render(t,shots){
  const s=shots.find(x=>t>=x.t0&&t<x.t1)||shots[shots.length-1];this.T=this.buf;this.box=null;
  if(this[s.fn])this[s.fn](t-s.t0,t,s);else{this.clear('#0a0a14');this.text(s.fn,8,8,this.c('#ffd23a'),2,1);this.text((t-s.t0).toFixed(1),8,24,this.c('#8a8aa0'),2,1);}this.ctx.putImageData(this.image,0,0);return s;
 }
}
Film.P=.49985;Film.BEAT0=.082;Film.BAR0=2.081;
Film.BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v=>(v+.5)/16);
Film.CAST={
 milton:{beanie:'#ffd23a',beanieLight:'#fff08a',beanieShade:'#d9a81e',beanieDark:'#a67810',jacket:'#22d6c4',jacketShade:'#139c99',jacketDark:'#0d6f74',yoke:'#ff2f9a',stripe:'#ffe14a',sleeve:'#ff2f9a',sleeveShade:'#b81c72',cuff:'#22d6c4',zip:'#d8dce8',jeans:'#34508f',jeansShade:'#25396a',shoe:'#f2f2f6',shoeShade:'#b8b8c8',sole:'#2a2a36',skin:'#f6cfb0',skinShade:'#dca587',skinDark:'#b9806a',eye:'#1a1020',hair:'#4a3020',stache:'#5e3a22',phones:'#26263a',phonesLight:'#6a6a84'},
 her:{hairLight:'#8a5636',jacket:'#e8384f',jacketShade:'#b02238',jacketDark:'#7a1428',yoke:'#e8384f',stripe:'#ffd0d8',sleeve:'#e8384f',sleeveShade:'#a01c34',cuff:'#ffd0d8',zip:'#d8dce8',jeans:'#2a2440',jeansShade:'#1c1830',shoe:'#f2f2f6',shoeShade:'#b8b8c8',sole:'#2a2a36',skin:'#f8d6bc',skinShade:'#e0aa8c',skinDark:'#c08470',eye:'#1a1020',hair:'#6b3f22',lips:'#d0506a'}};
window.Film=Film;
