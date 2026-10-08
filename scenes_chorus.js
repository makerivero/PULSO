'use strict';
// Bendito error — the build into the chorus, chorus 1 and the final chorus. Helpers use the _ch_ prefix.

// ───── Helpers ─────
// Write a per-pixel function straight into the frame (0 = keep what is there). Only outside a character layer.
F._ch_fill=function(fn,x0=0,y0=0,x1=this.W,y1=this.H){const W=this.W,b=this.buf;
 for(let y=Math.max(0,y0|0);y<Math.min(this.H,y1);y++)for(let x=Math.max(0,x0|0);x<Math.min(W,x1);x++){const v=fn(x,y);if(v)b[y*W+x]=v;}};
F._ch_pal=function(list){return list.map(h=>this.c(h));};
// Pick from a packed palette with ordered dithering: v in 0..1.
F._ch_pick=function(pal,v,x,y){const n=pal.length-1,k=Math.floor(v*n+this.d(x,y));return pal[k<0?0:k>n?n:k];};

// ───── Build into the chorus ─────
// ── Macro: Milton's eye in profile. Neon slides across the cornea, the pupil opens on the kick, one blink, slow push in.
F.shotEyeCU=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick;
 const Z=1.02+lt*.07,cx=150-lt*5,cy=96+lt*1.5;
 // Behind the profile: night city out of focus.
 this.vgrad(0,0,W,H,['#05050f','#0b0a20','#141232','#221a46']);
 for(const [bx,by,r,col,sp]of [[290,30,22,'#ff3fa4',30],[310,95,26,'#3af0ff',22],[282,150,18,'#ffb04a',34],[300,178,24,'#ff3fa4',26],[270,70,12,'#ffe14a',40]])this.glow(bx-((lt*sp)%60),by,r,col,.7);
 const skin=this._ch_pal(['#2a1430','#4a2238','#6e3442','#97504e','#bc6e5e','#d88e74','#ecaa8a','#f6c4a4','#ffdcc0']);
 const cskin=this._ch_pal(['#141432','#22264a','#34406a','#4a6084','#66849c','#8aa6b4','#b0c4c8','#d0d8d4','#e8ece4']);
 const beanie=this._ch_pal(['#5a3c08','#a67810','#d9a81e','#ffd23a','#fff08a']),brow=this.c('#3a2216'),brow2=this.c('#5a3826');
 const rimP=this.c(k>.5?'#ffd0ea':'#ff8fd0'),rimP2=this.c('#ff3fa4');
 // Profile line of the brow ridge, nasion and nose bridge (u as a function of v).
 const prof=v=>v<-40?118+(v+40)*-.05:v<-18?118+(v+40)*.1:v<4?120.2-(v+18)*.65:v<30?105.9+(v-4)*.25:112.4+(v-30)*.55;
 // Blink: the upper lid comes down between beats.
 const bk=lt-1.18,open=bk<0||bk>.2?1:bk<.07?1-bk/.07:bk<.1?0:(bk-.1)/.1;
 const ua=-66,ub=60,eyeF=u=>(u-ua)/(ub-ua);
 const lidU0=u=>{const f=eyeF(u);return -25*Math.sin(Math.PI*Math.pow(f,.78))-2;},lidL=u=>{const f=eyeF(u);return 15*Math.sin(Math.PI*Math.pow(f,.95))+2;};
 const lidU=u=>{const a=lidU0(u),b=lidL(u);return b-(b-a)*open;};
 const iu=24,iv=-6,irx=20,iry=25,pr=.34+.2*k+.04*Math.sin(lt*2);
 // Neon reflections sliding across the cornea (in the cornea's own warped space).
 const refl=[[-.9,.25,-.55,.5,'#ff3fa4'],[-.3,.12,-.6,.25,'#3af0ff'],[.5,.3,-.4,.1,'#ffb04a'],[1.2,.18,-.7,.6,'#3af0ff'],[1.9,.35,-.5,.3,'#ff3fa4']].map(r=>[r[0],r[1],r[2],r[3],this.c(r[4])]);
 const slide=lt*.95;
 const iris=this._ch_pal(['#0e0806','#2a1408','#4e2a12','#7a4a1e','#a8702e','#d0a050']);
 const scl=this._ch_pal(['#3a2a40','#7a6878','#b8a8b4','#e0d4dc','#f4ecf0']);
 this._ch_fill((x,y)=>{
  const u=(x-cx)/Z,v=(y-cy)/Z,pu=prof(v);
  if(u>pu)return 0;
  const bE=-80+u*.08;
  // Folded rib of the beanie brim at the top.
  if(v<bE){const rib=((u*.98+v*.12)%6+6)%6,band=(bE-v);let l=rib<1.2?0:rib<2.4?1:rib<4.6?3:2;if(band<3)l=Math.max(0,l-2);else if(band<6)l=Math.max(0,l-1);
   if(pu-u<3)return rimP;if(((Math.floor(v/3))&1)&&rib>2&&rib<3.2)l=Math.min(4,l+1);return beanie[l];}
  if(v<bE+1.5)return beanie[0];
  if(pu-u<1.6)return rimP;
  // Skin light: key from the front (neon), shadow under the brim, the eye socket and pores.
  let s=.7+Math.min(.16,Math.max(-.2,(u-(pu-46))/46*.18));
  const sb=v-bE;if(sb<14)s-=.32*(1-sb/14);
  const so=Math.hypot((u-4)/86,(v+14)/34);if(so<1)s-=.16*(1-so);
  const ch=Math.hypot((u-14)/54,(v-44)/12);if(ch<1)s+=.12*(1-ch);
  if(pu-u<5)s+=.12;
  if(this.rand((x*73)^(y*1931))<.035)s-=.08;
  // Brow: hair strokes slanting toward the front, thicker by the nose.
  const bc=-50-8*Math.sin(Math.PI*Math.min(1,Math.max(0,(u+90)/200))),bth=6+9*Math.min(1,Math.max(0,(u+90)/190));
  if(u>-90&&u<pu-6&&Math.abs(v-bc)<bth/2){const e=Math.abs(v-bc)/(bth/2),st=((u*.55-v*1.1+this.rand(Math.floor(u/3)+977)*3)%3+3)%3;if(st<2&&this.d(x,y)>e*e*.8)return st<1?brow:brow2;}
  const f=eyeF(u);
  if(f>0&&f<1){const yu=lidU(u),yl=lidL(u),yu0=lidU0(u),crease=yu0-11-7*Math.sin(Math.PI*f);
   if(v>yu&&v<yl){
    // Inside the eye: iris, pupil, sclera, all under the shadow of the upper lid.
    const a=(u-iu)/irx,b=(v-iv)/iry,di=Math.hypot(a,b),lidSh=Math.max(0,1-(v-yu)/7);
    let col;
    if(di<1){if(di<pr)col=iris[0];else{const r=(di-pr)/(1-pr),th=Math.atan2(b,a),fib=Math.sin(th*23+Math.sin(th*7)*2)*.5+Math.sin(th*41)*.3;let lv=.82-r*.55+fib*.18;if(r>.84)lv=.12;if(r<.12)lv=.25;lv-=lidSh*.5;col=this._ch_pick(iris,lv,x,y);}}
    else{let lv=.9-lidSh*.75-Math.pow(Math.abs(f-.52)*1.7,2)*.45-Math.max(0,b)*.08;if(f>.86)lv-=.15;col=this._ch_pick(scl,lv,x,y);if(f>.9&&this.d(x,y)<.5)col=this.c('#d88a90');}
    // Cornea reflections slide by; a hot window highlight stays put.
    if(di<1.12){const w=1/Math.sqrt(Math.max(.15,1-Math.min(.92,di*di*.8))),wa=a*w*.8,wb=b*w*.8;
     for(const [rx,rw,ry0,ry1,rc]of refl){let px=((rx-slide+3)%3.2+3.2)%3.2-1.6;if(wa>px&&wa<px+rw&&wb>ry0&&wb<ry1&&this.d(x,y)<.62-lidSh*.4){col=rc;break;}}
     if(a>.18&&a<.42&&b>-.62&&b<-.38)col=this.c('#ffffff');else if(Math.hypot(a+.35,b-.45)<.08)col=this.c('#e8f0ff');}
    return col;}
   // Lid margins, crease and lashes' roots.
   if(v<=yu&&v>yu-2.6)return this.c('#1e0e0e');
   if(v>=yl&&v<yl+1.6)return this.d(x,y)<.6?this.c('#d07a78'):this.c('#a85a5a');
   if(open>.5&&f>.15&&f<.97&&Math.abs(v-crease)<1.4)return this._ch_pick(skin,s-.2*Math.sin(Math.PI*(f-.15)/.82)*(1-Math.abs(v-crease)/1.6),x,y);
   if(v<yu&&v>crease)s+=.04*open;
   if(v>yl&&v<yl+10)s-=.07*(1-(v-yl)/10);}
  const cool=Math.min(.55,Math.max(0,(-u-30)/150));if(cool>0&&this.d(x,y)<cool*.5)return this._ch_pick(cskin,s-.1,x,y);
  return this._ch_pick(skin,s,x,y);
 });
 // Lashes: long upper ones curl up and forward; a blink drops them.
 const lash=this.c('#140808');
 for(let i=0;i<=17;i++){const f=.16+.84*i/17,u=ua+f*(ub-ua),ru=u,rv=lidU(u)-1.5,x0=cx+ru*Z,y0=cy+rv*Z;
  let th=-Math.PI/2-.9*(1-f)+.75*f;const down=.35+.3*f;th=th*open+down*(1-open);
  const len=(4+6*Math.sin(Math.PI*Math.min(1,f*1.05)))*Z;let x=x0,y=y0;
  for(let s=0;s<len;s++){x+=Math.cos(th);y+=Math.sin(th);th+=(open>.5?.045:-.02)*(f>.5?-1:1)*(open>.5?-1:1);this.px(x,y,lash);if(s<len*.25)this.px(x+1,y,lash);}}
 for(let i=0;i<9;i++){const f=.35+.6*i/9,u=ua+f*(ub-ua),x0=cx+u*Z,y0=cy+(lidL(u)+1.5)*Z;this.line(x0,y0,x0-3*Z+f*2,y0+(3+3*f)*Z,this.c('#3a1a14'));}
 // Rain beads on the skin.
 for(let i=0;i<7;i++){const u=-110+this.rand(i*5)*210,v=-30+this.rand(i*9)*110;if(u>prof(v)-6)continue;if(v>-12&&v<22&&u>ua&&u<ub)continue;const x=cx+u*Z,y=cy+v*Z+((lt*6*this.rand(i+3))%6);this.rect(x,y,2,3,this.c('#e8b8a0'));this.px(x,y,this.c('#ffffff'));this.px(x+1,y+2,this.c('#a86a5a'));}
 this.rain(t,.18,lt*10);
};

// A big white sneaker (side view, toe to the right) at scale S, rotated by tilt around (x,gy); shade darkens the far foot.
// Draws into the current target; returns the ankle point (top of the collar) for the shin.
F._ch_sneaker=function(x,gy,tilt,S,shade){
 const P=Film.CAST.milton,c=k=>this.c(P[k]),ct=Math.cos(tilt),st=Math.sin(tilt),R=(px,py)=>[x+px*S*ct-py*S*st,gy+px*S*st+py*S*ct],RR=a=>a.map(([u,v])=>R(u,v));
 const up=shade?'#c4c4d4':'#f4f4fa',lo=shade?'#8a8aa0':'#c8c8d8',hi=shade?'#e0e0ec':'#ffffff';
 const inv=(X,Y)=>{const dx=X+.5-x,dy=Y+.5-gy;return [(dx*ct+dy*st)/S,(-dx*st+dy*ct)/S];};
 this.poly(RR([[-30,-4],[-31,-20],[-26,-26],[-6,-25],[8,-21],[24,-13],[38,-9],[41,-5],[41,-3],[-30,-3]]),(X,Y)=>{const [u,v]=inv(X,Y);
  if(u<-22&&v<-12)return this.c(shade?'#b81c72':'#ff2f9a');
  if(v>-9+u*.04)return this.c(lo);if(u>22&&v<-8&&this.d(X,Y)<.35)return this.c(hi);return this.c(up);});
 // Swoosh stripe, eyelets and laces, toe cap seam.
 const ln=(a,b,c2,d,col,w=1)=>{const [p,q]=R(a,b),[r,s2]=R(c2,d);this.line(p,q,r,s2,col,w);};
 ln(-24,-9,6,-15,c('jacket'),Math.max(1,S*1.6));ln(6,-15,20,-11,c('jacket'),Math.max(1,S*1.2));
 for(let i=0;i<5;i++){ln(-12+i*5,-24+i*1.7,-8+i*5,-22+i*1.7,this.c(shade?'#6a6a7a':'#5a5a6a'),Math.max(1,S*.8));}
 ln(22,-12.5,36,-8,this.c(shade?'#9a9ab0':'#d8d8e4'));
 // Midsole and outsole with tread.
 this.poly(RR([[-31,-5],[41,-5],[42,-1],[-31,-1]]),this.c(shade?'#b8b8c8':'#e8e8f2'));
 this.poly(RR([[-31,-1],[42,-1],[40,2],[-29,2]]),(X,Y)=>{const [u]=inv(X,Y);return (Math.floor(u/2.2)&1)?this.c('#1a1a24'):c('sole');});
 return R(-14,-25);
};
// Out-of-focus light: a soft disc with a brighter rim (rx,ry for motion smear).
F._ch_bokeh=function(x,y,rx,ry,col,a){const c=this.c(col);this.ellipse(x,y,rx,ry,(X,Y,dx,dy)=>{const d=dx*dx+dy*dy;return this.d(X,Y)<(d>.72?a:a*.45)?c:0;});};
// Legs IK: knee of a two-bone leg from hip to ankle, bending forward (dir s).
F._ch_knee=function(hx,hy,ax,ay,l1,l2,s){const dx=ax-hx,dy=ay-hy,d=Math.min(l1+l2-1,Math.hypot(dx,dy)),a=Math.atan2(dy,dx),b=Math.acos(Math.max(-1,Math.min(1,(l1*l1+d*d-l2*l2)/(2*l1*d))));return [hx+Math.cos(a-s*b)*l1,hy+Math.sin(a-s*b)*l1];};

// ── Ground-level tracking: his sneakers sprint over wet asphalt; every footfall lands on a beat and throws up water.
F.shotFeetRun=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,hz=88,gy=150,S=1.45,camX=lt*300,P=Film.CAST.milton,c=q=>this.c(P[q]);
 // Out-of-focus street behind: bokeh discs smeared by the speed, the far curb and a lamp row.
 this.vgrad(0,0,W,hz+2,['#05050f','#0a0a22','#151236','#24184a','#34205a']);
 const span=420,bx=[];
 for(let i=0;i<14;i++){const r=7+this.rand(i*3)*14,par=.12+this.rand(i*5)*.25,x=((this.rand(i*7)*span-camX*par)%span+span)%span-50,y=20+this.rand(i*11)*(hz-36),col=['#ff3fa4','#3af0ff','#ffb04a','#ff3fa4','#ffe14a','#9a5aff'][i%6];
  this.glow(x,y,r,col,.6+(i%3===0?k*.3:0));this.glow(x+r*.8,y,r*.8,col,.3);this.ellipse(x,y,2,2,this.c('#ffffff'));if(i%2===0)bx.push([x,r,this.c(col)]);}
 for(let i=0;i<12;i++){const x=((i*53-camX*.7)%(W+80)+W+80)%(W+80)-40,y=hz-30+(i*13)%24;this.rect(x,y,24+(i*7)%30,1,this.c(i%3?'#4a3a7a':'#7a4a9a'));}
 this.rect(0,hz-7,W,7,(x,y)=>this.c(this.d(x,y)<.3?'#1c1834':'#141128'));this.rect(0,hz-8,W,1,this.c('#3a3058'));
 for(let i=-1;i<5;i++){const x=Math.round(i*90-((camX*.6)%90));this.rect(x+40,20,2,hz-28,this.c('#100e20'));}
 // Wet asphalt in perspective: grain, a lane line, puddles that mirror the bokeh.
 const pal=this._ch_pal(['#0a0918','#100f22','#16152c','#1e1c38']);
 this._ch_fill((x,y)=>{const dz=(y-hz)/(gy-hz),z=1/dz,wx=camX+(x-160)*z,wz=z*60;
  const cx=Math.floor(wx/150),cz=Math.floor(wz/26),pr=this.rand(cx*31+cz*977);let pud=0;
  if(pr<.4){const pcx=(cx+.25+this.rand(cx*7+cz)*.5)*150,pcz=(cz+.5)*26,ex=(wx-pcx)/(30+pr*80),ez=(wz-pcz)/9;const e2=ex*ex+ez*ez;pud=e2<1?(e2>.8?2:1):0;}
  if(y>=gy-2&&!pud)pud=y>=gy&&y<gy+16?1:0;
  if(pud===2)return this.c('#2a2848');
  if(pud){for(const [bx2,r,col]of bx){const dd=Math.abs(x-bx2)/(r*.9);if(dd<1&&this.d(x,y)<(1-dd)*.45)return col;}return this.c(this.d(x,y)<.18?'#1c1a3a':'#0c0c1e');}
  if(Math.abs(wz-48)<1.4*z&&(((wx/60)|0)&1))return this.c(this.d(x,y)<.5?'#8a8a9a':'#5a5a6a');
  const g=this.rand((Math.floor(wx/1.5)*73)^(Math.floor(wz*3)*1931));return pal[g<.08?3:g<.35?2:g<.75?1:0];},0,hz,W,H);
 this.rect(0,hz,W,1,this.c('#2a2440'));
 // Feet: one footfall per beat, each foot every second beat; stance slides with the ground, swing kicks the heel up.
 const v=300*Film.P,hipX=168,hipY=gy-330,b=bt.b,feet=[];
 for(const i of [0,1]){let kk=Math.floor(b);if(((kk%2)+2)%2!==i)kk-=1;const e=b-kk,land=208,st=.55;
  let fx,fy,tilt;
  if(e<st){fx=land-v*e;fy=gy;tilt=e<.12?-.12+e:Math.max(0,(e-.3)/(st-.3))*.45;}
  else{const u=(e-st)/(2-st),off=land-v*st;fx=off+(land-off)*Film.ease(u)+Math.sin(u*Math.PI)*-10;fy=gy-Math.sin(Math.pow(u,.7)*Math.PI)*58;tilt=.45+Math.sin(u*Math.PI)*.35-(u>.7?(u-.7)/.3*.95:0);}
  feet.push({i,fx,fy,tilt,kk,e});}
 // Splashes: crown ring + droplets thrown up at each landing, drifting back with the ground.
 const splash=(tl)=>{const e=(t-tl);if(e<0||e>.6)return;const x0=214-300*e,ph=e/.6;
  for(let r=0;r<2;r++){const rr=10+e*(170-r*70);this.ellipse(x0,gy+3,rr,rr*.17,(X,Y,dx,dy)=>Math.abs(dx*dx+dy*dy-1)<.16&&this.d(X,Y)<(1-ph)*.95?this.c(r?'#7a84c0':'#d8e0ff'):0);}
  // A crown sheet of water, then droplets on ballistic arcs.
  if(e<.26){const hh=e/.26;for(let q=-1;q<=1;q+=2){const ex=x0+(q<0?-44:58)*1;this.poly([[ex-q*6,gy+2],[ex+q*(4+hh*22),gy-8-hh*30],[ex+q*(10+hh*30),gy-6-hh*26],[ex+q*14,gy+2]],(X,Y)=>this.d(X,Y)<(1-hh)*.8?this.c(this.d(X,Y)<.25?'#ffffff':q<0?'#8ff4ff':'#ff8fd0'):0);}}
  for(let q=0;q<34;q++){const a=Math.PI*(.12+.76*this.rand(q*3+Math.round(tl*100))),sp=110+this.rand(q*5+7)*220,dir=q&1?1:-1,x=x0+dir*(18+Math.cos(a)*sp*e),y=gy-Math.sin(a)*sp*e+600*e*e;if(y>gy+2)continue;
   const cl=q%5===0?'#ff8fd0':q%5===1?'#8ff4ff':'#e8f0ff',sz=q%4===0?3:2;this.rect(x,y,sz,sz,this.c(cl));if(sz===3)this.px(x,y,this.c('#ffffff'));}};
feet.sort((a,b)=>(a.i===1?-1:1));
 for(const f of feet){const back=f.i===1;
  this.beginLayer();
  // Rotate around the toe while pushing off, around the heel at the strike.
  const ank0=[f.fx-14*S,f.fy-25*S],knee=this._ch_knee(hipX+(back?-8:8),hipY,ank0[0],ank0[1],175,178,1);
  const jc=back?c('jeansShade'):c('jeans');
  this.quad(ank0[0]+(knee[0]-ank0[0])*.25,ank0[1]+(knee[1]-ank0[1])*.25,knee[0],knee[1],42,48,(X,Y)=>this.d(X,Y)<.1?c('jeansShade'):jc);
  {const dx=knee[0]-ank0[0],dy=knee[1]-ank0[1],l=Math.hypot(dx,dy),ux=dx/l,uy=dy/l,nx=-uy,ny=ux,hw=20,P2=(a,b)=>[ank0[0]+ux*a+nx*b,ank0[1]+uy*a+ny*b];
   this.poly([P2(-4,-hw),P2(-4,hw),P2(60,hw-2),P2(60,-hw+2)],(X,Y)=>this.d(X,Y)<.12?c('jeansShade'):jc);this.poly([P2(-6,-hw-1),P2(-6,hw+1),P2(4,hw+1),P2(4,-hw-1)],back?this.c('#1c2c54'):c('jeansShade'));for(let q=8;q<60;q+=9){const [a,b]=P2(q,hw-4);this.px(a,b,this.c('#ffe14a'));}}
  this._ch_sneaker(f.fx,f.fy,f.tilt,S,back);
  // Wet reflection of this foot in the asphalt below the contact line.
  {const b2=this.box,L=this.L,dk=this.c('#0a0a18');if(b2[2]>=0)for(let y=gy+1;y<H;y++){const sy=2*gy-y;if(sy<b2[1]||sy>b2[3])continue;const fall=(y-gy)/38;if(fall>1)break;
    for(let x=Math.max(0,b2[0]);x<=Math.min(W-1,b2[2]);x++){const sx=Math.round(x+Math.sin(y*.7+t*9)*1.2),src=L[sy*W+Math.max(0,Math.min(W-1,sx))];if(src&&this.d(x,y)<.62*(1-fall))this.buf[y*W+x]=((((src&0xfefefe)>>>1)+((dk&0xfefefe)>>>1))|0xff000000)>>>0;}}}
  this.endLayer(k>.5?'#ffd0ea':'#ff8fd0',-1);}
 for(let n=bt.n-1;n<=bt.n;n++)splash(Film.BEAT0+n*Film.P);
 this.rain(t,.45,camX*.2);
};

// ── Detail: the headphone cup over the knit beanie. Sound rings pulse out on the kick, rain beads on the plastic.
F.shotPhonesCU=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,dx=-lt*6,dy=lt*2.5,ox=150+dx,oy=86+dy;
 // Bokeh beyond the head.
 this.vgrad(0,0,W,H,['#05050f','#0b0a20','#151232','#22184a']);
 for(const [bx,by,r,col,sp]of [[262,24,26,'#ff3fa4',.5],[300,80,30,'#3af0ff',.3],[250,140,20,'#ffb04a',.6],[312,160,24,'#ff3fa4',.4],[285,40,12,'#ffe14a',.7],[232,70,14,'#3af0ff',.6]])this.glow(bx+dx*sp*.6,by+dy*sp,r,col,.7);
 // Beanie: stockinette Vs over the crown, a ribbed fold at the bottom, all shaded by a light from the front-top.
 const bn=this._ch_pal(['#3a2808','#6a4a10','#a67810','#d9a81e','#ffd23a','#fff08a']);
 const knit=['23200232','13322331','01233210','00122100','10011001','21000012'];
 const front=v=>ox-115+200*Math.sqrt(Math.max(0,1-Math.pow((v-oy-50)/230,2)));
 const brimT=x=>oy+20+(x-ox)*.09,brimB=x=>oy+52+(x-ox)*.1;
 const skin=this._ch_pal(['#3a1a34','#6e3442','#a85a58','#d08a72','#ecaa8a','#f6c4a4']),hair=this.c('#4a3020'),hair2=this.c('#2e1c14');
 const nape=y=>{const b0=brimB(front(y))+0;return y<b0?front(y):front(b0)-(y-b0)*.45;};
 this._ch_fill((x,y)=>{
  const bt2=brimT(x),bb=brimB(x),edge=nape(y)-x;
  if(edge<0)return 0;
  if(y<bt2){const a=((Math.floor(x-dx)%8)+8)%8,b=((Math.floor(y-dy)%6)+6)%6,row=Math.floor((y-dy)/6),sh=(Math.floor((x-dx)/8)+row)&1;
   let l=+knit[b][a]+1;const lite=(x-ox)/170-(y-oy)/240;l+=lite>.25?1:lite<-.35?-1:0;if(edge<30&&this.d(x,y)<(30-edge)/40)l-=1;if(bt2-y<7)l-=1;if(edge<3)l+=2;
   if(sh&&this.d(x,y)<.12)l-=1;return bn[Math.max(0,Math.min(5,l))];}
  if(y<bb){const rib=((Math.floor(x-dx+(y-dy)*.05)%5)+5)%5;let l=[1,2,4,4,3][rib];if(y-bt2<2)l=0;else if(y-bt2<4)l-=1;if(bb-y<3)l-=1;if(edge<3)l+=1;return bn[Math.max(0,Math.min(5,l))];}
  // Under the brim: the cheek toward the face (left), short hair at the nape, the neck going down to the collar.
  const fy=y-bb;
  if(x<ox-40){let s=.7-Math.max(0,1-fy/12)*.45+Math.min(.1,(ox-40-x)/300);return this._ch_pick(skin,s,x,y);}
  if(fy<26-Math.max(0,x-ox)*.1){if(edge<2)return this.c('#8a5a40');const st=((x*.5-y*1.2)%4+4)%4;return st<1.2?hair2:hair;}
  let s=.55-Math.max(0,1-(fy-20)/10)*.3+(edge<3?.25:0)-(x<ox+10?.15:0);return this._ch_pick(skin,s,x,y);
 });
 // Rim light along the front of the beanie.
 for(let y=0;y<H;y++){const f=nape(y);if(f<W){this.px(f,y,this.c(k>.5?'#ffd0ea':'#ff8fd0'));if(y<brimB(f))this.px(f-1,y,this.c('#fff08a'));}}
 // Sound rings: one leaves the cup on every beat.
 const cx=ox-6,cy=oy+30;
 for(let n=0;n<3;n++){const e=bt.ph+n,r=60+e*62,a=Math.max(0,1-e/3)*(.85+(n===0?k*.15:0)),col=this.c((bt.n-n)&1?'#3af0ff':'#ff3fa4'),hi=this.c((bt.n-n)&1?'#d8fdff':'#ffd0ea');
  for(let q=0;q<Math.PI*2;q+=.7/r){const sx=Math.cos(q),sy=Math.sin(q);if(Math.abs(sy)>.72)continue;for(let w=-1;w<=2;w++){const x=cx+sx*(r+w),y=cy+sy*(r+w)*1.15;if(this.d(Math.round(x),Math.round(y))<a*(w===0||w===1?1:.35))this.px(x,y,(w===0)&&a>.45?hi:col);}}}
 // Band: slider up out of frame with a fork around the cup.
 const ph=this.c('#26263a'),ph2=this.c('#3a3a52'),phL=this.c('#6a6a84'),phD=this.c('#14141f');
 this.quad(cx+4,cy-58,cx+18,-20,16,14,ph);this.line(cx-1,cy-58,cx+12,-20,phL,2);this.line(cx+11,cy-58,cx+24,-20,phD,1);
 for(let i=0;i<6;i++){const f=i/6,x=cx+4+14*f*.55,y=cy-62-f*50;this.rect(x-6,y,13,1,phD);}
 for(const sd of [-1,1]){this.line(cx+4,cy-60,cx+sd*40,cy-50,phD,5);this.line(cx+4,cy-61,cx+sd*40,cy-51,ph2,2);this.line(cx+sd*40,cy-50,cx+sd*48,cy-30,phD,5);}
 // Cup: cushion ring, shell with a soft gradient, chrome trim, a logo plate and an LED that blinks on the kick.
 this.ellipse(cx,cy,52,62,(x,y,ddx,ddy)=>{const d=Math.hypot(ddx,ddy);return d>.92?phD:this.d(x,y)<(ddx<0?.6:.3)?this.c('#1a1a28'):this.c('#22222f');});
 this.ellipse(cx+5,cy-2,44,54,(x,y,ddx,ddy)=>{const d=Math.hypot(ddx,ddy);if(d>.94)return this.c('#8a8aa8');if(d>.88)return phD;
  const sp=Math.hypot(ddx-.35,ddy+.45);if(sp<.28&&this.d(x,y)<(.28-sp)*4)return this.c('#ffb0dc');
  if(ddx<-.55&&this.d(x,y)<(-ddx-.55)*1.8)return this.c('#1f6a7a');
  const l=.5-ddy*.25+ddx*.15;return this.d(x,y)<l*.5?ph2:ph;});
 this.ellipse(cx+8,cy-2,18,22,(x,y,ddx,ddy)=>{const d=Math.hypot(ddx,ddy);return d>.85?this.c('#9a9ab8'):d>.7?phD:((Math.round(d*8))&1)?ph2:this.c('#2e2e44');});
 this.text('M',cx+7,cy-4,this.c('#c8c8e0'),1,0);
 this.rect(cx+30,cy+24,3,3,this.c(k>.4?'#ffd0ea':'#ff3fa4'));if(k>.2)this.glow(cx+31,cy+25,10,'#ff3fa4',k*.8);
 // Rain beads on the plastic; one drop runs down every bar.
 for(let i=0;i<16;i++){const a=this.rand(i*7)*Math.PI*2,rr=Math.sqrt(this.rand(i*3))*.82,x=cx+5+Math.cos(a)*44*rr,y=cy-2+Math.sin(a)*54*rr+(i===3?((lt*24)%60):0),sz=1+(this.rand(i*5)*2|0);
  this.rect(x,y,sz+1,sz+1,this.c('#3a3a58'));this.px(x,y,this.c('#e8f6ff'));this.px(x+sz,y+sz,this.c(i&1?'#ff8fd0':'#5ff4ff'));}
 this.rain(t,.35,lt*6);
};

// Far skyline: towers in silhouette with sparse windows and blinking beacons.
F._ch_skyline=function(camX,par,base,seed,hmin,hmax,cols,t,lit=.16){
 const W=this.W,sp=16,off=camX*par,i0=Math.floor(off/sp)-3,bt=Film.beat(t),wc=this._ch_pal(['#ffcf7a','#9fe8ff','#ff8fd0']);
 for(let i=i0;i<i0+W/sp+6;i++){const r=q=>this.rand(seed+i*131+q*17),bw=12+Math.round(r(1)*18),x=Math.round(i*sp-off+(r(2)-.5)*8),top=Math.round(base-hmin-r(3)*(hmax-hmin)),col=this.c(cols[i&1]);
  this.rect(x,top,bw,base-top+1,col);this.rect(x,top,bw,1,this.c(cols[2]));
  if(r(4)<.3){this.rect(x+(bw>>1),top-7,1,7,col);if((bt.n+i)%3===0)this.px(x+(bw>>1),top-8,this.c('#ff3a4a'));}
  for(let wy=top+3;wy<base-2;wy+=4)for(let wx=x+2;wx<x+bw-2;wx+=3)if(this.rand(seed*7+i*977+wy*13+wx*7)<lit)this.px(wx,wy,wc[(wx+wy)%5===0?1:(wx*wy)%11===0?2:0]);}
};
// Mid layer: street-level buildings with lit shop windows, awnings and neon signs that pulse on the kick.
F._ch_storefronts=function(camX,par,gy,t,signs,seed){
 const W=this.W,bt=Film.beat(t),k=bt.kick,off=camX*par,sp=96,i0=Math.floor(off/sp)-2,neon=['#ff3fa4','#3af0ff','#ffb04a','#ffe14a','#7aff8a'];
 for(let i=i0;i<i0+W/sp+4;i++){const r=q=>this.rand(seed+i*311+q*29),x=Math.round(i*sp-off),bw=sp-2,top=Math.round(gy-70-r(1)*70),c0=['#1a1734','#201a3a','#16182e','#241a36'][Math.floor(r(2)*4)];
  this.rect(x,top,bw,gy-top,this.c(c0));this.rect(x,top,bw,2,this.c('#3a3058'));this.rect(x+bw-3,top,3,gy-top,this.c('#120f24'));
  for(let wy=top+8;wy<gy-44;wy+=14)for(let wx=x+8;wx<x+bw-14;wx+=14){const h=this.rand(seed+i*977+wy*7+wx);this.rect(wx,wy,8,9,h<.25?(a,b)=>this.c(this.d(a,b)<.3?(h<.08?'#9fe8ff':'#ffcf7a'):(h<.08?'#3a7a9a':'#a8703a')):this.c('#0d0b1c'));this.rect(wx-1,wy+9,10,1,this.c('#2e2848'));}
  // Shop: lit window, door, striped awning.
  const sx=x+6,sw=bw-30,sy=gy-34,lit=r(7)<.7,wc=lit?['#7a4a2a','#b8783a','#ffcf7a']:['#120f22','#1a1630','#2a2440'];this.rect(sx,sy,sw,30,(a,b)=>{const v=(b-sy)/30;return this.c(wc[this.d(a,b)<.25+v*.5?1:this.d(a,b)<.85-v?0:2]);});this.rect(sx,sy,sw,30,(a,b)=>((a-sx)%18<2||b===sy+14)?this.c('#241a28'):0);
  for(let q=0;q<4;q++)this.rect(sx+4+q*12,sy+18,6,12-(q&1)*4,this.c(lit?'#4a2a20':'#0c0a16'));
  this.rect(x+bw-22,gy-30,12,30,this.c('#2a2236'));this.rect(x+bw-20,gy-28,8,12,this.c('#ffcf7a'));
  const aw=['#a0306a','#2a8a9a','#a8703a'][Math.floor(r(5)*3)];this.rect(sx-3,sy-8,sw+6,8,(a,b)=>((Math.floor((a-sx)/6))&1)?this.c(aw):this.c(b<sy-5?'#9a90b0':'#6a6080'));this.rect(sx-3,sy,sw+6,1,this.c('#1a1424'));
  if(lit)this.glow(sx+sw/2,gy+2,sw*.6,'#ffb04a',.3,.25);
  // Neon sign.
  const txt=signs[((i%signs.length)+signs.length)%signs.length],nc=neon[((i*7)%5+5)%5],tw=this.textW(txt,2,1),nx=x+Math.round((bw-tw)/2)-4,ny=sy-24;
  this.rect(nx-4,ny-4,tw+8,18,this.c('#0e0b1a'));this.rect(nx-4,ny-4,tw+8,1,this.c('#3a2a50'));
  const on=!(this.rand(i*13+Math.floor(t*10))<.04);
  if(on){this.glow(nx+tw/2,ny+5,tw*.7,nc,.3+k*.3,.5);this.text(txt,nx,ny,this.c(k>.6?'#ffffff':nc),2,1);}else this.text(txt,nx,ny,this.c('#3a2a40'),2,1);}
};
// A side-tracking run down a wet neon street. o: {who, dir, leap (jump on the last beat), thread (red thread ahead), signs, seed, h}
F._ch_runStreet=function(lt,t,o){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,dir=o.dir||1,h=o.h||92,speed=1.08*h/(2*Film.P),camX=lt*speed*dir,gy=146,X=dir>0?132:188;
 let lift=0,leapU=-1;if(o.leap&&lt>o.leap){leapU=Math.min(1,(lt-o.leap)/(2-o.leap));lift=(1-Math.pow(1-leapU,2))*46;}
 const cy=lift*.45;// camera rises with the jump
 this.vgrad(0,0,W,gy,['#05050f','#0a0a22','#141236','#24184a','#3a2058']);
 this.glow(160,gy-20,170,'#4a1f6a',.4,.35);
 this.T=this.buf;
 // Shift the world down while the camera follows the leap.
 const yo=Math.round(cy);
 this._ch_skyline(camX,.14,gy-50+yo,(o.seed||0)+5,30,80,['#0e0d24','#12112c','#24204a'],t,.12);
 this._ch_storefronts(camX,.7,gy-4+yo,t,o.signs||['BAR','HOTEL','24HS','KIOSCO','PIZZA'],(o.seed||0)+77);
 // Sidewalk and curb.
 const sw=gy-4+yo;this.rect(0,sw,W,8,(x,y)=>{const u=x+Math.round(camX*1);return this.c(((u%28+28)%28)<1?'#141226':y===sw?'#4a4468':'#2a2640');});
 this.rect(0,sw+8,W,2,this.c('#5a5478'));this.rect(0,sw+10,W,H-sw-10,this.c('#0c0b1c'));
 // Runner.
 const walk=leapU>=0?(Math.floor(((t-Film.BEAT0)/Film.P)/2)+.25):((t-Film.BEAT0)/Film.P)/2+.25;
 this.beginLayer();
 const out=this.person({x:X,y:gy+yo-lift,h,dir,walk,who:o.who||'milton',pose:'run',arms:leapU>=0?[[2.0+leapU*.5,.2],[-1.3-leapU*.4,.5]]:null});
 this.endLayer(k>.5?'#ffe0f0':'#ff8fd0',dir);
 if(lift>0){this.ellipse(X,gy+yo+2,14-lift*.15,2,(x,y)=>this.d(x,y)<.5?this.c('#05050c'):0);}
 if(o.thread){const [hx,hy]=out.hands[0];this.redThread(hx,hy,dir>0?W+20:-20,hy-26,4,t,.6,1.2);}
 this.reflect(sw+10,H,sw+9,'#0a0a1a',t,1.8,.6);
 // Foreground lamp posts whip past; speed lines.
 const lsp=230,loff=((camX*2.6*dir)%lsp+lsp)%lsp;
 for(let i=-1;i<3;i++){const x=Math.round(i*lsp-loff*dir+40);this.rect(x,0,9,H,this.c('#07060e'));this.rect(x+1,0,1,H,this.c('#2a2448'));this.rect(x-14,yo+18,36,6,this.c('#07060e'));this.glow(x+4,yo+26,30,'#ffb04a',.45+k*.15);this.rect(x-10,yo+24,28,2,this.c('#ffe9b0'));}
 for(let i=0;i<16;i++){const len=20+this.rand(i*3)*60,y=Math.round(10+this.rand(i*5)*(H-20)),x=(((this.rand(i*7)*W*2-lt*900*dir*(1+this.rand(i)))%(W+120))+W+120)%(W+120)-60;if(Math.abs(y-(gy-h*.5))<h*.6&&Math.abs(x-X)<40)continue;
  for(let q=0;q<len;q++)if(this.d(Math.round(x+q),y)<(1-q/len)*(.5+(leapU>0?.4:0)))this.px(x+q*dir*-1+(dir<0?0:0),y,this.c(i%3?'#b8bce8':'#ffd0ea'));}
 this.rain(t,.5,camX);
 return out;
};
// ── Side tracking: Milton sprints through the neon city, strong parallax; on the last beat he leaps into the chorus.
F.shotRunFast=function(lt,t){this._ch_runStreet(lt,t,{who:'milton',dir:1,leap:1.5,signs:['BAR','HOTEL','24HS','KIOSCO','PIZZA','DISCO'],seed:0});};

// ───── Chorus 1 ─────
// 3D helpers: rotation matrices (row-major 3×3) and a neon die drawn as a true cube with pips on its faces.
F._ch_rot=function(ax,ang){const c=Math.cos(ang),s=Math.sin(ang);return ax==='x'?[1,0,0,0,c,-s,0,s,c]:ax==='y'?[c,0,s,0,1,0,-s,0,c]:[c,-s,0,s,c,0,0,0,1];};
F._ch_mul=function(a,b){const r=new Array(9);for(let i=0;i<3;i++)for(let j=0;j<3;j++)r[i*3+j]=a[i*3]*b[j]+a[i*3+1]*b[3+j]+a[i*3+2]*b[6+j];return r;};
F._ch_PIPS={1:[[0,0]],2:[[-.5,-.5],[.5,.5]],3:[[-.5,-.5],[0,0],[.5,.5]],4:[[-.5,-.5],[.5,-.5],[-.5,.5],[.5,.5]],5:[[-.5,-.5],[.5,-.5],[0,0],[-.5,.5],[.5,.5]],6:[[-.5,-.5],[-.5,0],[-.5,.5],[.5,-.5],[.5,0],[.5,.5]]};
// cam: {x,y,z,f,cx,hy} → project(X,Y,Z). c: [ramp dark..light], edge, edgeHi, pip.
F._ch_die=function(pos,half,R,cam,cols,sq,refl){
 const proj=(X,Y,Z)=>{const d=Z-cam.z;return [cam.cx+(X-cam.x)*cam.f/d,cam.hy-(Y-cam.y)*cam.f/d];};
 const tw=(lx,ly,lz)=>{const x=lx*half*sq[0],y=ly*half*sq[1],z=lz*half*sq[0];return [pos[0]+R[0]*x+R[1]*y+R[2]*z,pos[1]+R[3]*x+R[4]*y+R[5]*z,pos[2]+R[6]*x+R[7]*y+R[8]*z];};
 const faces=[[[1,0,0],[0,1,0],[0,0,1],3],[[-1,0,0],[0,1,0],[0,0,-1],4],[[0,1,0],[1,0,0],[0,0,-1],1],[[0,-1,0],[1,0,0],[0,0,1],6],[[0,0,1],[1,0,0],[0,1,0],2],[[0,0,-1],[-1,0,0],[0,1,0],5]];
 const ramp=this._ch_pal(cols.ramp),edge=this.c(cols.edge),hi=this.c(cols.hi),pip=this.c(cols.pip),pipG=this.c(cols.pipGlow),L=[-.45,.75,-.48];
 const drawn=[];
 for(const [n,u,v,val]of faces){const c0=tw(...n),nw=[c0[0]-pos[0],c0[1]-pos[1],c0[2]-pos[2]],ln=Math.hypot(...nw),nn=nw.map(q=>q/ln);
  const view=[cam.x-c0[0],cam.y-c0[1],cam.z-c0[2]];if(nn[0]*view[0]+nn[1]*view[1]+nn[2]*view[2]<=0)continue;
  const corner=(a,b)=>proj(...tw(n[0]+u[0]*a+v[0]*b,n[1]+u[1]*a+v[1]*b,n[2]+u[2]*a+v[2]*b));
  const pts=[corner(-1,-1),corner(1,-1),corner(1,1),corner(-1,1)],lam=Math.max(0,nn[0]*L[0]+nn[1]*L[1]+nn[2]*L[2])/Math.hypot(...L),b=.18+lam*.7;
  // Glossy face: a vertical sheen band slides with the face orientation.
  const sheen=nn[0]*.8+nn[2]*.3;
  if(refl){this.poly(pts,(x,y)=>{const f=Math.max(0,(y-cam.floorY)/70);return this.d(x,y)<.8-f?this._ch_pick(ramp,b*.75,x,y):0;});for(let i=0;i<4;i++){const [a,b2]=pts[i],[c2,d]=pts[(i+1)%4];this._ch_dline(a,b2,c2,d,edge,.5);}continue;}
  this.poly(pts,(x,y)=>{const yy=(y-pts[0][1])*.004;return this._ch_pick(ramp,b-yy+(Math.abs(((x*.02+sheen*2)%1+1)%1-.5)<.06?.18:0),x,y);});
  for(const [pu,pv]of this._ch_PIPS[val]){const ring=[];for(let q=0;q<12;q++){const a=q/12*Math.PI*2;ring.push(corner(pu+Math.cos(a)*.2,pv+Math.sin(a)*.2));}
   const [gx,gy]=corner(pu,pv);this.poly(ring,pipG);const ring2=ring.map(([x,y])=>[gx+(x-gx)*.62,gy+(y-gy)*.62]);this.poly(ring2,pip);drawn.push([gx,gy]);}
  for(let i=0;i<4;i++){const [a,b2]=pts[i],[c2,d]=pts[(i+1)%4];this.line(a,b2,c2,d,edge,2);}
  for(let i=0;i<4;i++){const [a,b2]=pts[i],[c2,d]=pts[(i+1)%4];this.line(a,b2,c2,d,hi,1);}}
 return drawn;
};
// ── «Baila el azar, canta el vacío»: two neon dice dance on a glossy stage; the camera pans to an empty mic stand.
F.shotDiceDance=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,ph=bt.ph,n=bt.n;
 const pan=Film.ease((lt-1.85)/1.25),cam={x:-.2+pan*7.4+Math.sin(lt*.7)*.1,y:2.3-pan*.5,z:-1+lt*.15+pan*1.6,f:300,cx:160,hy:46+pan*8};
 const proj=(X,Y,Z)=>{const d=Z-cam.z;return [cam.cx+(X-cam.x)*cam.f/d,cam.hy-(Y-cam.y)*cam.f/d];};
 const Zd=7.5,base=proj(0,0,Zd)[1];
 // Stage: curtain folds behind, a lighting truss, haze.
 const back=proj(0,0,14)[1];
 this._ch_fill((x,y)=>{const wx=cam.x*cam.f/14.5;const u=x+wx,fold=Math.sin(u*.21)+Math.sin(u*.07+1)*.6;const v=.28+fold*.1-(y/back)*.12;return this.c(this.d(x,y)<v?'#2a1238':this.d(x,y)<v+.25?'#1c0c2a':'#12081e');},0,0,W,back);
 this.rect(0,back,W,2,this.c('#3a2050'));
 // Glossy stage floor with board lines converging to the back.
 this.rect(0,back+2,W,H-back-2,(x,y)=>this.c(this.d(x,y)<(y-back)/(H-back)*.35?'#140c20':'#0c0814'));
 for(let i=-14;i<26;i++){const X=i*.9,[x0,y0]=proj(X,0,Zd-5),[x1,y1]=proj(X,0,14);if(Math.max(x0,x1)<-60||Math.min(x0,x1)>W+60)continue;this._ch_dline(x0,y0,x1,y1,this.c('#2e1a40'),.7);}
 for(let z=Zd-5;z<14;z+=.9){const [,y]=proj(0,0,z);this._ch_dline(0,y,W,y,this.c('#24143a'),.5);}
 this.glow(proj(0,0,Zd)[0],back-10,120,'#5a1a6a',.35,.5);
 this.glow(proj(7.4,0,Zd)[0],back-10,90,'#2a3a7a',.3,.5);
 // Truss with lamps.
 const tr=8;this.rect(0,tr,W,2,this.c('#3a3654'));this.rect(0,tr+8,W,2,this.c('#3a3654'));for(let x=-((cam.x*cam.f/9)%12+12)%12;x<W;x+=12){this.line(x,tr+2,x+6,tr+8,this.c('#2a2640'));this.line(x+6,tr+8,x+12,tr+2,this.c('#2a2640'));}
 // Sweeping beams from the truss onto the dice; one hard white spot on the empty mic.
 const beams=[[-2.2,'#ff3fa4',0],[2.2,'#3af0ff',2],[0,'#d8c8ff',4],[5.2,'#ff3fa4',1],[9.6,'#3af0ff',3]];
 const tgt=(bx,ph0)=>proj(bx*.3+Math.sin(t*1.3+ph0)*1.6+(bx>4?4.8:0),0,Zd)[0];
 for(const [bx,col,ph0]of beams){const [sx]=proj(bx,0,Zd-1);this.rect(sx-4,tr+9,9,5,this.c('#1c1a2c'));this.rect(sx-3,tr+13,7,1,this.c(k>.5?'#ffffff':col));this._ch_beam(sx,tr+14,tgt(bx,ph0),base+4,2,26,col,.13+k*.12);}
 const [mx,mBase]=proj(7.4,0,Zd-1.2);this.rect(mx-4,tr+9,9,5,this.c('#1c1a2c'));this._ch_beam(mx,tr+14,mx,mBase+4,3,44,'#fff1d8',.17);
 for(const [bx,col,ph0]of beams)this.glow(tgt(bx,ph0),base+2,30,col,.4+k*.2,.22);
 this.ellipse(mx,mBase+2,46,8,(x,y,dx,dy)=>this.d(x,y)<(1-dx*dx-dy*dy)*.8?this.c(dx*dx+dy*dy<.3?'#fff8ec':'#d8c8b0'):0);this.glow(mx,mBase+2,60,'#fff1d8',.35,.25);
 // The dice: a hop per beat with a quarter-turn tumble, squash on landing; they sway around each other.
 const hop=4*ph*(1-ph),sq=[1+.12*k,1-.2*k],phB=(ph+.5)%1,kB=Math.exp(-phB*Film.P*9),sqB=[1+.12*kB,1-.2*kB];
 const sway=Math.sin((n+ph)*Math.PI/2);
 const dA={pos:[-1.55+sway*.45,.8*sq[1]+hop*1.5,Zd+.3],R:this._ch_mul(this._ch_rot('y',.55+Math.sin(lt*1.1)*.25),this._ch_rot('z',-(n+Film.ease(ph))*Math.PI/2)),sq,cols:{ramp:['#1a0414','#4a0a32','#8a1458','#d02a88','#ff5fb4'],edge:'#ff3fa4',hi:'#ffd0ea',pip:'#ffffff',pipGlow:'#ffb0dc'}};
 const dB={pos:[1.55-sway*.45,.8*sqB[1]+4*phB*(1-phB)*1.1,Zd-.2],R:this._ch_mul(this._ch_rot('y',-.6+Math.cos(lt*1.3)*.25),this._ch_rot('x',(n+(phB<ph?1:0)+Film.ease(phB))*Math.PI/2)),sq:sqB,cols:{ramp:['#02141a','#063a4a','#0a6a7a','#1ab0c0','#6ff8ff'],edge:'#3af0ff',hi:'#e0ffff',pip:'#ffffff',pipGlow:'#a8f8ff'}};
 cam.floorY=base;
 const M=[1,0,0,0,-1,0,0,0,1];
 for(const d of [dB,dA]){const [sx,sy]=proj(d.pos[0],0,d.pos[2]),hh=d.pos[1]-.8;this.ellipse(sx,sy+1,Math.max(8,44-hh*16),5,(x,y)=>this.d(x,y)<.7?this.c('#05030a'):0);
  this._ch_die([d.pos[0],-d.pos[1],d.pos[2]],.8,this._ch_mul(M,d.R),cam,d.cols,d.sq,true);}
 // Mic stand (and its mirror image): tripod, pole, boom, the capsule with a grille; cable snaking off.
 const Zm=Zd-1.2,ms=(X,Y)=>proj(7.4+X,Y,Zm);
 const stand=(sgn,dim)=>{const st=this.c(dim?'#120e1c':'#1a1626'),sh=this.c(dim?'#4a4460':'#c8c4e0'),Y=v=>v*sgn;const [b0x]=ms(0,0),[tpx,tpy]=ms(0,Y(1.7)),[mhx,mhy]=ms(.3,Y(1.95)),py=ms(0,Y(.35))[1];
  for(const [lx,lz]of [[-.45,.1],[.42,.1],[.05,-.4]]){const [ax,ay]=proj(7.4+lx,0,Zm+lz);this.line(ax,ay,b0x,py,st,2);}
  this.line(b0x,py,tpx,tpy,st,4);this.line(b0x+1,py,tpx+1,tpy,sh,1);this.line(b0x-1,py,tpx-1,tpy,this.c(dim?'#2a2438':'#5a5478'),1);this.line(tpx,tpy,mhx,mhy,st,3);
  this.ellipse(mhx+1,mhy-4*sgn,7,10,(x,y,dx,dy)=>dx*dx+dy*dy>.6?this.c('#2a2638'):dim&&this.d(x,y)>.5?0:((x+y)&1)?this.c(dim?'#5a566e':'#e0dcf0'):this.c(dim?'#2a2638':'#6a6680'));if(!dim){this.rect(mhx-1,mhy-12,4,2,this.c('#ffffff'));this.rect(mhx-3,mhy+5,9,4,this.c('#2a2638'));this.rect(mhx-3,mhy+5,9,1,this.c('#8a84a8'));}};
 if(ms(0,0)[0]>-60&&ms(0,0)[0]<W+60){stand(-1,true);for(let q=0;q<70;q++){const [cx2,cy2]=proj(7.4-.1-q*.07,0,Zm-.3+Math.sin(q*.3)*.25);this.px(cx2,cy2,this.c('#1a1626'));}stand(1,false);
  for(let i=0;i<26;i++){const x=mx-24+this.rand(i*3)*48+Math.sin(t*.8+i)*4,y=tr+24+((this.rand(i*7)*(base-tr-24)+t*6*(1+this.rand(i)))%(base-tr-24));if(this.d(Math.round(x),Math.round(y))<.6)this.px(x,y,this.c('#fff1d8'));}}
 const glows=[];
 for(const d of [dB,dA])glows.push(...this._ch_die(d.pos,.8,d.R,cam,d.cols,d.sq).map(p=>[p,d.cols.pipGlow]));
 for(const [[x,y],col]of glows)this.glow(x,y,6,col,.45+k*.3);
};
// A dithered 1px line (amt = share of pixels drawn).
F._ch_dline=function(x0,y0,x1,y1,c,amt){const n=Math.max(1,Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0))));for(let i=0;i<=n;i++){const x=Math.round(x0+(x1-x0)*i/n),y=Math.round(y0+(y1-y0)*i/n);if(this.d(x,y)<amt)this.px(x,y,c);}};
// A dithered light beam from (x0,y0) to (x1,y1), widening from w0 to w1, brightest near the source.
F._ch_beam=function(x0,y0,x1,y1,w0,w1,col,amt){const c=this.c(col),dx=x1-x0,dy=y1-y0,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 this.poly([[x0+nx*w0,y0+ny*w0],[x1+nx*w1,y1+ny*w1],[x1-nx*w1,y1-ny*w1],[x0-nx*w0,y0-ny*w0]],(x,y)=>{const f=((x-x0)*dx+(y-y0)*dy)/(l*l),e=Math.abs((x-x0)*nx+(y-y0)*ny)/(w0+(w1-w0)*f);return this.d(x,y)<amt*(1-f*.5)*(1-e*e*.85)?c:0;});};

// ── The neon maze (shared by «laberinto» and the final chorus). Built once: a perfect maze by depth-first carving.
F._ch_mazeData=function(){
 if(F._ch_mazeCache)return F._ch_mazeCache;
 const N=31,open=new Uint8Array(N*N);// bit 1 = open east, bit 2 = open south
 let seed=0x5eed1234;const rnd=()=>{seed=(seed+0x6D2B79F5)|0;let q=Math.imul(seed^(seed>>>15),1|seed);q=(q+Math.imul(q^(q>>>7),61|q))^q;return ((q^(q>>>14))>>>0)/4294967296;};
 // Randomized Prim: many junctions and short blind alleys, the classic look from above.
 const seen=new Uint8Array(N*N),front=[],inF=new Uint8Array(N*N);
 const addF=(i,j)=>{for(const [di,dj]of [[1,0],[-1,0],[0,1],[0,-1]]){const a=i+di,b=j+dj;if(a>=0&&b>=0&&a<N&&b<N&&!seen[b*N+a]&&!inF[b*N+a]){inF[b*N+a]=1;front.push([a,b]);}}};
 seen[15*N+15]=1;addF(15,15);
 while(front.length){const fi=Math.floor(rnd()*front.length),[i,j]=front[fi];front[fi]=front[front.length-1];front.pop();
  const nb=[];for(const [di,dj]of [[1,0],[-1,0],[0,1],[0,-1]]){const a=i+di,b=j+dj;if(a>=0&&b>=0&&a<N&&b<N&&seen[b*N+a])nb.push([di,dj]);}
  const [di,dj]=nb[Math.floor(rnd()*nb.length)];if(di===1)open[j*N+i]|=1;else if(di===-1)open[j*N+i-1]|=1;else if(dj===1)open[j*N+i]|=2;else open[(j-1)*N+i]|=2;
  seen[j*N+i]=1;addF(i,j);}
 const can=(i,j,di,dj)=>{if(di===1)return i<N-1&&(open[j*N+i]&1);if(di===-1)return i>0&&(open[j*N+i-1]&1);if(dj===1)return j<N-1&&(open[j*N+i]&2);return j>0&&(open[(j-1)*N+i]&2);};
 const bfs=(si,sj)=>{const prev=new Int32Array(N*N).fill(-1),dist=new Int32Array(N*N).fill(-1),q=[si+sj*N];dist[q[0]]=0;for(let h=0;h<q.length;h++){const c=q[h],i=c%N,j=(c/N)|0;for(const [di,dj]of [[1,0],[-1,0],[0,1],[0,-1]])if(can(i,j,di,dj)){const d=(i+di)+(j+dj)*N;if(dist[d]<0){dist[d]=dist[c]+1;prev[d]=c;q.push(d);}}}return {prev,dist};};
 const pathTo=(prev,c)=>{const p=[];while(c>=0){p.unshift([c%N,(c/N)|0]);c=prev[c];}return p;};
 const {prev,dist}=bfs(15,15);
 // Exit: the border cell on the east side farthest from the centre.
 let ex=-1,best=-1;for(let j=0;j<N;j++){const c=(N-1)+j*N;if(dist[c]>best){best=dist[c];ex=c;}}
 const solution=pathTo(prev,ex);
 // Chorus 1 walk: from the centre toward a cell 13 steps out, with a detour into a dead end on the way.
 const target=pathTo(prev,(()=>{for(let c=0;c<N*N;c++)if(dist[c]===13&&c%N>15)return c;for(let c=0;c<N*N;c++)if(dist[c]===13)return c;})());
 let walk=target.slice();
 for(const s of [3,4,5,6,2,7,8,1,9,10]){const [i,j]=target[s],[ni,nj]=target[s+1],[pi,pj]=target[s-1];let done=false;
  for(const [di,dj]of [[1,0],[-1,0],[0,1],[0,-1]]){if(!can(i,j,di,dj))continue;const a=i+di,b=j+dj;if((a===ni&&b===nj)||(a===pi&&b===pj))continue;
   // nearest dead end inside this side branch (BFS that never steps back onto the junction)
   const pv=new Map(),q=[[a,b,0]];pv.set(a+b*N,-1);let ok=false,br=null;
   for(let h=0;h<q.length&&!ok;h++){const [ci,cj,dd]=q[h];let deg=0;const nx=[];for(const [ei,ej]of [[1,0],[-1,0],[0,1],[0,-1]])if(can(ci,cj,ei,ej)){deg++;const xi=ci+ei,xj=cj+ej;if(!(xi===i&&xj===j)&&!pv.has(xi+xj*N))nx.push([xi,xj]);}
    if(deg===1){ok=true;br=[];let c=ci+cj*N;while(c>=0){br.unshift([c%N,(c/N)|0]);c=pv.get(c);}break;}
    if(dd<3)for(const [xi,xj]of nx){pv.set(xi+xj*N,ci+cj*N);q.push([xi,xj,dd+1]);}}
   if(ok){walk=target.slice(0,s+1).concat(br,[null,null],br.slice(0,-1).reverse(),target.slice(s));done=true;break;}}
  if(done)break;}
 F._ch_mazeCache={N,open,solution,walk,exit:[ex%N,(ex/N)|0]};return F._ch_mazeCache;
};
// Position along a cell sequence (null entries = hold and look around) at move index m (1 move per unit).
F._ch_mazeAt=function(seq,m,CS){m=Math.max(0,Math.min(seq.length-1.001,m));const i=Math.floor(m),f=m-i;let a=seq[i],b=seq[i+1],hold=false;
 if(!a){let q=i;while(!seq[q])q--;a=seq[q];hold=true;}if(!b){b=a;hold=true;}
 const ax=(a[0]+.5)*CS,ay=(a[1]+.5)*CS,bx=(b[0]+.5)*CS,by=(b[1]+.5)*CS;return {x:ax+(bx-ax)*f,y:ay+(by-ay)*f,dx:bx-ax,dy:by-ay,hold};};
// Draw the maze from above. o: {camX, camY, Z, t, k, thread:[cells] or null, threadUpTo (cells index lit so far)}
F._ch_mazeDraw=function(o){
 const W=this.W,H=this.H,M=this._ch_mazeData(),N=M.N,CS=40,WT=7,Z=o.Z,k=o.k,t=o.t;
 const sx=X=>(X-o.camX)*Z+W/2,sy=Y=>(Y-o.camY)*Z+H/2;
 const wx0=o.camX-W/2/Z,wy0=o.camY-H/2/Z,wx1=o.camX+W/2/Z,wy1=o.camY+H/2/Z;
 // Floor: dark tiles with a faint grid, puddles holding neon reflections and rain rings.
 const fl=this._ch_pal(['#07060e','#0b0916','#100d1e','#16122a']),gridC=this.c('#1c1634'),pud=this.c('#141030'),pudHi=this.c('#3a2a6a');
 this._ch_fill((x,y)=>{const X=(x-W/2)/Z+o.camX,Y=(y-H/2)/Z+o.camY;
  if(X<0||Y<0||X>N*CS||Y>N*CS)return this.c(this.d(x,y)<.2?'#0a0814':'#05040a');
  const ci=Math.floor(X/CS),cj=Math.floor(Y/CS),h=this.rand(ci*977+cj*131);
  if(h<.22&&Z>.3){const pcx=(ci+.3+h*1.8)*CS,pcy=(cj+.35+this.rand(ci+cj*7)*.3)*CS,ex=(X-pcx)/(9+h*30),ey=(Y-pcy)/(6+h*14),e=ex*ex+ey*ey;if(e<1){const rr=((t*1.3+h*7)%1),ring=Math.abs(Math.sqrt(e)-rr)<.07&&this.d(x,y)<1-rr;return ring?pudHi:(this.d(x,y)<.2?this.c(h<.11?'#3a1a4a':'#1a2a4a'):pud);}}
  const gx=X%10,gy=Y%10;if(Z>.45&&(gx<1/Z||gy<1/Z))return gridC;
  return fl[Math.floor(this.rand((Math.floor(X/2)*73)^(Math.floor(Y/2)*1931))*2.2+this.d(x,y)*.5)];});
 // Thread on the floor (under the walls' glow).
 if(o.thread){const pts=o.thread.map(([i,j])=>[sx((i+.5)*CS),sy((j+.5)*CS)]);const n=Math.min(pts.length-1,o.threadTo==null?pts.length-1:o.threadTo);
  for(let q=0;q<n;q++){const [a,b]=pts[q],[c2,d]=pts[q+1];if(Math.max(a,c2)<-20||Math.min(a,c2)>W+20||Math.max(b,d)<-20||Math.min(b,d)>H+20)continue;
   if(Z>.3){for(let g=-3;g<=3;g++)this._ch_dline(a+(b===d?0:g),b+(b===d?g:0),c2+(b===d?0:g),d+(b===d?g:0),this.c('#a0142a'),.32*(1-Math.abs(g)/4));}
   this.line(a,b,c2,d,this.c('#ff2a3a'),Z>.5?2:1);if(Z>.5)this._ch_dline(a,b-1,c2,d-1,this.c('#ff9a9a'),.5);}}
 // Walls: glowing tube outlines, pink/cyan by district; the kick flashes them.
 const i0=Math.max(-1,Math.floor(wx0/CS)-1),i1=Math.min(N,Math.ceil(wx1/CS)+1),j0=Math.max(-1,Math.floor(wy0/CS)-1),j1=Math.min(N,Math.ceil(wy1/CS)+1);
 const pal=[[this.c('#ff3fa4'),this.c('#ffd0ea'),this.c('#7a1a5a')],[this.c('#3af0ff'),this.c('#e0ffff'),this.c('#145a7a')]],core=this.c('#120a1e');
 const segs=[];
 for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){
  const inside=i>=0&&j>=0&&i<N&&j<N;
  // east wall of (i,j) and south wall; borders when outside.
  if(j>=0&&j<N&&i>=-1&&i<N){const ow=i>=0&&i<N-1?(M.open[j*N+i]&1):0,isExit=i===N-1&&M.exit[1]===j;if(!ow&&!isExit&&!(i===-1&&false))segs.push([(i+1)*CS,j*CS,(i+1)*CS,(j+1)*CS,((i>>2)+(j>>2))&1]);}
  if(i>=0&&i<N&&j>=-1&&j<N){const ow=j>=0&&j<N-1?(M.open[j*N+i]&2):0;if(!ow)segs.push([i*CS,(j+1)*CS,(i+1)*CS,(j+1)*CS,((i>>2)+(j>>2))&1]);}
  if(!inside)continue;}
 const kk=o.pulse!=null?o.pulse:k;
 if(Z>.3){
  for(const [x0,y0,x1,y1,c]of segs){const a=sx(x0)-WT/2*Z,b=sy(y0)-WT/2*Z,w=(x1-x0)*Z+WT*Z,h=(y1-y0)*Z+WT*Z,hl=6*Z+kk*5*Z,col=pal[c][2];
   this.rect(a-hl,b-hl,w+hl*2,h+hl*2,(x,y)=>{const dx=Math.max(a-x,0,x-(a+w)),dy=Math.max(b-y,0,y-(b+h)),dd=Math.max(dx,dy)/hl;return this.d(x,y)<(1-dd)*(.55+kk*.3)?(kk>.5&&dd<.3?pal[c][0]:col):0;});}
  for(const [x0,y0,x1,y1,c]of segs){const a=sx(x0)-WT/2*Z,b=sy(y0)-WT/2*Z,w=(x1-x0)*Z+WT*Z,h=(y1-y0)*Z+WT*Z;this.rect(a,b,w,h,pal[c][kk>.6?1:0]);}
  for(const [x0,y0,x1,y1,c]of segs){const a=sx(x0)-WT/2*Z,b=sy(y0)-WT/2*Z,w=(x1-x0)*Z+WT*Z,h=(y1-y0)*Z+WT*Z;this.rect(a+1,b+1,w-2,h-2,pal[c][0]);}
  for(const [x0,y0,x1,y1,c]of segs){const a=sx(x0)-WT/2*Z,b=sy(y0)-WT/2*Z,w=(x1-x0)*Z+WT*Z,h=(y1-y0)*Z+WT*Z;this.rect(a+2,b+2,w-4,h-4,core);}}
 else{for(const [x0,y0,x1,y1,c]of segs){this.line(sx(x0),sy(y0),sx(x1),sy(y1),pal[c][kk>.6?1:0]);}}
 // Exit portal.
 const [exi,exj]=M.exit,ex=sx(N*CS+8),ey=sy((exj+.5)*CS);if(ex>-60&&ex<W+60&&ey>-60&&ey<H+60){this.glow(ex,ey,Math.max(10,40*Z),'#fff1d8',.6);this.glow(ex,ey,Math.max(6,22*Z),'#ffe14a',.7);}
 return {sx,sy,CS};
};
// Overhead rain: short streaks falling away from the lens toward the centre.
F._ch_rainTop=function(t,n){const W=this.W,H=this.H,c1=this.c('#8a8ec0'),c2=this.c('#d0d4ff');
 for(let i=0;i<n;i++){const a=this.rand(i*3)*Math.PI*2,ph=(t*1.6+this.rand(i*7))%1,r=(1-ph)*190+10,len=3+(1-ph)*6;
  for(let q=0;q<len;q++){const rr=r-q,x=W/2+Math.cos(a)*rr*1.2,y=H/2+Math.sin(a)*rr*.75;if(this.d(Math.round(x),Math.round(y))<.3+(1-ph)*.5)this.px(x,y,ph<.4?c2:c1);}}};
// ── «en este laberinto que ya no es mío»: overhead on the neon maze; he walks, turns, hesitates at a dead end; pull-up reveal.
F.shotMaze=function(lt,t){
 const bt=Film.beat(t),k=bt.kick,M=this._ch_mazeData(),CS=40,lb=lt/Film.P;
 const pos=m=>this._ch_mazeAt(M.walk,m,CS);
 const p=pos(lb*.92);let cx=0,cy=0;for(let q=0;q<6;q++){const pp=pos(lb*.92-q*.12);cx+=pp.x/6;cy+=pp.y/6;}
 const zu=Film.ease((lt-6)/1.9),Z=1.15*(1-zu)+.19*zu,mid=M.N*CS/2;
 this._ch_mazeDraw({camX:cx+(mid-cx)*zu,camY:cy+(mid-cy)*zu,Z,t,k});
 // Heading: along the corridor; at the dead end he looks left and right, then turns back.
 let ang=Math.atan2(p.dy,p.dx);if(p.hold){const hp=(lb*.92)%1;ang=Math.atan2(p.dy||0,p.dx||1);const idx=Math.floor(lb*.92);const prevC=M.walk[idx-1]||M.walk[idx-2],cur=M.walk.slice(0,idx+1).filter(Boolean).pop();
  const prev=M.walk.slice(0,idx).filter(Boolean);const a2=prev[prev.length-2]||cur;ang=Math.atan2(cur[1]-a2[1],cur[0]-a2[0])+Math.sin(hp*Math.PI*2)*.9;}
 const sx=(p.x-(cx+(mid-cx)*zu))*Z+160,sy=(p.y-(cy+(mid-cy)*zu))*Z+90;
 this.beginLayer();this.personTop({x:sx,y:sy,r:Math.max(2,10*Z),ang,walk:p.hold?0:walkAt(t),who:'milton'});this.endLayer(k>.5?'#ffe0f0':'#ff8fd0',1);
 if(zu>.5){const r=6+Math.sin(lt*8)*2;this.ellipse(sx,sy,r+3,r+3,(x,y,dx,dy)=>Math.abs(dx*dx+dy*dy-.8)<.2?this.c('#ffe14a'):0);}
 this._ch_rainTop(t,60);
};

// ── «Siente el motor, la sangre, el gancho»: profile, chest and head; a glowing heart beats through the jacket and sends
// pulses of light up circuit-veins in the neck into the headphones.
F.shotHeart=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,P=Film.CAST.milton,c=q=>this.c(P[q]);
 const S=108+lt*2.4,ox=84-lt*2,oy=-6+(bt.ph<.15?1:0)-lt*.8,U=(u,v)=>[ox+u*S,oy+v*S],pts=a=>a.map(([u,v])=>U(u,v)),uv=(x,y)=>[(x-ox)/S,(y-oy)/S];
 this.vgrad(0,0,W,H,['#05050f','#090a1c','#120f2c','#1a1238']);
 for(let i=0;i<9;i++){const x=((this.rand(i*3)*420+lt*(6+i*2))%420)-50,y=20+this.rand(i*7)*150,r=10+this.rand(i*5)*22;this.glow(x,y,r,['#ff3fa4','#3af0ff','#ffb04a','#9a5aff'][i%4],.55);}
 // The head first (eyes closed, feeling it); the jacket goes over the neck.
 this.portrait({x:ox,y:oy,S,who:'milton',dir:1,blink:true,kick:k,smile:lt>2.5,collar:false});
 // Torso in profile: yoke, stripe and body of the windbreaker, a standing collar, the near arm.
 const torso=[[.3,.98],[.12,1.12],[.04,1.4],[.0,2.2],[1.1,2.2],[1.06,1.6],[1.0,1.25],[.88,1.02]];
 this.poly(pts(torso),(x,y)=>{const [u,v]=uv(x,y),st=1.36+(u-.5)*.06;if(v<st)return u>.8&&this.d(x,y)<.3?this.c('#ff6fc0'):u<.2&&this.d(x,y)<.5?c('sleeveShade'):c('yoke');if(v<st+.05)return c('stripe');return u<.22&&this.d(x,y)<.6?c('jacketShade'):u>.98?this.c('#5ff4ea'):c('jacket');});
 this.poly(pts([[.4,.9],[.58,.86],[.8,.92],[.9,1.04],[.62,1.06],[.36,1.04]]),(x,y)=>{const [u,v]=uv(x,y);return v<.9+(u-.4)*.1+.02?this.c('#5ff4ea'):u<.55?c('jacketShade'):c('jacket');});
 for(let i=0;i<9;i++){const [a,b]=U(.88+i*.016,1.04+i*.13),[a2,b2]=U(.88+(i+1)*.016,1.04+(i+1)*.13);this.line(a,b,a2,b2,c('zip'));}
 const [s0x,s0y]=U(.36,1.14),[elx,ely]=U(.34,1.9);this.quad(s0x,s0y,elx,ely,.26*S,.22*S,(x,y)=>{const [u]=uv(x,y);return u<.3&&this.d(x,y)<.6?c('sleeveShade'):c('sleeve');});
 this.line(...U(.47,1.2),...U(.46,1.95),this.c('#ff6fc0'));
 // X-ray window over the heart: the jacket turns translucent, ribs and the beating heart show through.
 const hu=.74,hv=1.34,[hx,hy]=U(hu,hv),sc=1+.24*k,R=.27*S;
 this.ellipse(hx,hy,R*1.15,R,(x,y,dx,dy)=>{const d=dx*dx+dy*dy;if(this.d(x,y)<(d-.55)*2.2)return 0;const rib=Math.abs(Math.sin((y-hy)*.32+(x-hx)*.06))<.18;return rib?this.c('#3a2a5a'):this.c(d<.5?'#160a22':'#1e1030');});
 this.glow(hx,hy,R*1.25,'#ff2a4a',.25+k*.4);
 // Motor ring: teeth spinning around the heart.
 for(let q=0;q<16;q++){const a=q/16*Math.PI*2+bt.b*Math.PI/4,x=hx+Math.cos(a)*R*.86,y=hy+Math.sin(a)*R*.74;this.rect(x-1,y-1,2,2,this.c(k>.5&&q%2?'#ffd0ea':'#7a2a5a'));}
 const hs=R*.42*sc;
 const heart=[];for(let q=0;q<40;q++){const a=q/40*Math.PI*2,x=16*Math.pow(Math.sin(a),3),y=-(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a));heart.push([hx+x/16*hs,hy+y/16*hs]);}
 this.poly(heart.map(([x,y])=>[x+(x-hx)*.12,y+(y-hy)*.12]),this.c('#5a0a1a'));
 this.poly(heart,(x,y)=>{const dx=(x-hx)/hs,dy=(y-hy)/hs;return dx<-.2&&dy<-.1&&this.d(x,y)<.6?this.c('#ffb0c0'):dx>.3&&dy>.2?this.c('#c0102a'):this.c(k>.5?'#ff6a7a':'#ff2a4a');});
 this.rect(hx-hs*.45,hy-hs*.55,2,2,this.c('#ffffff'));
 // Circuit-veins: heart → neck → headphones; a packet of light runs up on every beat.
 const paths=[[[hu,hv-.12],[.74,1.12],[.68,1.0],[.66,.9],[.6,.8],[.52,.72],[.45,.62]],[[hu-.1,hv-.06],[.6,1.18],[.56,1.04],[.54,.92],[.5,.8],[.44,.68]],[[hu+.1,hv+.04],[.92,1.5],[.96,1.9]],[[hu-.08,hv+.1],[.62,1.56],[.56,1.7],[.54,1.9]]];
 const dim=this.c('#a02a50'),node=this.c('#ff6a8a'),mid=this.c('#ff3a6a'),hot=this.c('#ffd0dc');
 for(const p of paths){const sp=p.map(([u,v])=>U(u,v));let L=0;const seg=[];for(let i=0;i+1<sp.length;i++){const l=Math.hypot(sp[i+1][0]-sp[i][0],sp[i+1][1]-sp[i][1]);seg.push([sp[i],sp[i+1],L,l]);L+=l;}
  for(const [[a,b],[c2,d]]of seg)this._ch_dline(a,b,c2,d,dim,.85);for(const [x,y]of sp.slice(1,-1)){this.rect(x-1,y-1,3,3,dim);this.px(x,y,node);}
  const head=bt.ph*1.15*L;
  for(const [[a,b],[c2,d],L0,l]of seg)for(let s=0;s<=l;s+=.5){const pos=L0+s,e=head-pos;if(e<0||e>26)continue;const f=s/l,x=a+(c2-a)*f,y=b+(d-b)*f;this.px(x,y,e<5?hot:mid);if(e<10){this.px(x+1,y,mid);this.px(x,y+1,mid);}}}
 // The pulse lands in the headphones.
 const [cx,cy]=U(.42,.5),land=Math.max(0,1-Math.abs(bt.ph-.8)*4);if(land>0){this.glow(cx,cy,20+land*10,'#ff3fa4',land*.7);for(let q=0;q<3;q++){const r=16+q*6+land*6;this.ellipse(cx,cy,r,r*1.2,(x,y,dx,dy)=>Math.abs(dx*dx+dy*dy-1)<.08&&dx<-.2&&this.d(x,y)<land?this.c('#ffd0ea'):0);}}
};

// Finish a character layer as a backlit silhouette: flat dark fill, a rim of light on both sides and on top, dark outline.
F._ch_silEnd=function(fill,rimL,rimR,rimT,ink='#05030a'){
 this.T=this.buf;const b=this.box;this.box=null;if(!b||b[2]<0)return;const L=this.L,W=this.W,H=this.H,f=this.c(fill),rl=this.c(rimL),rr=this.c(rimR),rt=this.c(rimT||rimL),o=this.c(ink);
 const at=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&L[y*W+x];
 for(let y=Math.max(0,b[1]-1);y<=Math.min(H-1,b[3]+1);y++)for(let x=Math.max(0,b[0]-1);x<=Math.min(W-1,b[2]+1);x++){
  if(!L[y*W+x]){if(at(x-1,y)||at(x+1,y)||at(x,y-1)||at(x,y+1))this.buf[y*W+x]=o;continue;}
  this.buf[y*W+x]=!at(x-1,y)?rl:!at(x+1,y)?rr:!at(x,y-1)?rt:(!at(x-2,y)&&this.d(x,y)<.5)?rl:(!at(x+2,y)&&this.d(x,y)<.5)?rr:f;}
};
// A passer-by under an umbrella, in silhouette.
F._ch_passer=function(x,gy,h,dir,t,seed,rim){
 this.beginLayer();const o=this.person({x,y:gy,h,dir,walk:((t-Film.BEAT0)/Film.P)/2*.5+seed,who:seed&1?'her':'milton',pose:'walk',arms:[[.9,1.4],[0,.3]]});
 const [hx,hy]=o.hands[0];this.line(hx,hy,hx,gy-h*1.12,0xff222222,1);this.poly([[hx-h*.36,gy-h*1.02],[hx-h*.25,gy-h*1.14],[hx,gy-h*1.2],[hx+h*.25,gy-h*1.14],[hx+h*.36,gy-h*1.02]],0xff222222);
 this._ch_silEnd('#0c0918',rim,rim,rim,'#0c0918');
};

// ── Instrumental: Milton dances under a street lamp on a wet corner; light cone, reflections, passers-by; slow pan.
F.shotStreetDance=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,camX=lt*9-20,gy=146;
 this.vgrad(0,0,W,gy,['#05050f','#0a0a22','#141236','#20184a','#30205a']);
 for(let i=0;i<40;i++){const x=((this.rand(i*3)*360-camX*.05)%360+360)%360-20,y=this.rand(i*7)*60;this.px(x,y,this.c(this.rand(i)<.2?'#e8e4ff':'#5a5888'));}
 this._ch_skyline(camX,.15,gy-30,31,30,90,['#0e0d24','#12112c','#24204a'],t,.12);
 // Corner building: a face-on facade and a side receding into the cross street, a corner bar at street level.
 const bx=40-camX*.6,cw=150,top=26,side=58;
 this.rect(bx,top,cw,gy-top-8,(x,y)=>{const row=Math.floor((y-top)/4),u=(x-bx+(row&1)*4);return this.c((y-top)%4===0||u%8===0?'#1a1430':'#241a3a');});
 this.poly([[bx+cw,top],[bx+cw+side,top+16],[bx+cw+side,gy-14],[bx+cw,gy-8]],(x,y)=>this.c(((x-bx-cw)%7===0)?'#120e22':'#191430'));
 this.rect(bx,top-3,cw,4,this.c('#3a2e58'));this.line(bx+cw,top-3,bx+cw+side,top+13,this.c('#3a2e58'),3);
 for(let fy=top+10;fy<gy-50;fy+=22)for(let fx=bx+12;fx<bx+cw-14;fx+=28){const h2=this.rand(fx*7+fy*3+5);this.rect(fx,fy,14,14,this.c(h2<.4?'#d89a50':'#0c0a1a'));if(h2<.4){this.rect(fx,fy,14,3,this.c('#ffcf7a'));this.rect(fx+6,fy,1,14,this.c('#5a3a2a'));}this.rect(fx-1,fy+14,16,2,this.c('#3a3050'));}
 for(let fy=top+24;fy<gy-50;fy+=22)for(let q=0;q<2;q++){const fx=bx+cw+12+q*24,yy=fy+q*6;this.poly([[fx,yy],[fx+10,yy+3],[fx+10,yy+16],[fx,yy+13]],this.c(this.rand(fy+q*31)<.4?'#a8703a':'#0a0816'));}
 // Bar at the corner: lit window and a neon sign.
 const sy=gy-40;this.rect(bx+10,sy,cw-20,30,(x,y)=>this.c(this.d(x,y)<.3?'#ffcf7a':'#b8783a'));for(let q=0;q<5;q++)this.rect(bx+16+q*26,sy+14,10,16,this.c('#3a2420'));this.rect(bx+10,sy+12,cw-20,2,this.c('#3a2420'));
 const nx=bx+cw/2-this.textW('ESQUINA',2,1)/2;this.rect(nx-4,sy-18,this.textW('ESQUINA',2,1)+8,15,this.c('#0e0b1a'));this.glow(nx+40,sy-11,46,'#ff3fa4',.3+k*.3,.4);this.text('ESQUINA',nx,sy-15,this.c(k>.6?'#ffd0ea':'#ff5fb4'),2,1);
 // Far sidewalk, passers-by with umbrellas.
 this.rect(0,gy-10,W,4,this.c('#2a2440'));this.rect(0,gy-6,W,H,this.c('#100e20'));
 for(let i=0;i<3;i++){const x=((i*140+lt*(12+i*5)*(i&1?-1:1)-camX*.65)%420+420)%420-50;this._ch_passer(x,gy-9,38-i*3,i&1?-1:1,t+i,i*3+1,'#4a3c78');}
 // Near curb and the lamp.
 this.rect(0,gy-2,W,3,this.c('#4a4468'));
 const lx=180-camX,ly=22,cx0=lx+22;
 this.poly([[cx0-6,ly+6],[cx0+6,ly+6],[cx0+58,gy+4],[cx0-58,gy+4]],(x,y)=>this.d(x,y)<(.18+k*.08)*(1-(y-ly)/(gy-ly)*.4)?this.c('#ffb04a'):0);
 this.glow(cx0,gy+2,70,'#ffb04a',.55+k*.15,.22);
 // Milton dances in the pool of light.
 this.beginLayer();this.person({x:cx0,y:gy,h:84,dir:Math.floor(bt.n/4)%2?-1:1,pose:'dance',beat:bt.ph,who:'milton'});this.endLayer(k>.5?'#fff0c0':'#ffcf7a',1);
 this.rect(lx-1,ly,4,gy-ly,this.c('#1c1830'));this.rect(lx,ly,1,gy-ly,this.c('#5a5078'));this.rect(lx-3,gy-8,8,8,this.c('#1c1830'));
 this.line(lx+1,ly,lx+14,ly-7,this.c('#1c1830'),3);this.rect(cx0-10,ly-9,20,6,this.c('#2a2440'));this.rect(cx0-8,ly-4,16,2,this.c('#fff1c8'));this.glow(cx0,ly,30,'#ffcf7a',.55+k*.2);
 // Rain catches the lamp light inside the cone.
 for(let i=0;i<70;i++){const x=cx0-50+this.rand(i*3)*100,y=((this.rand(i*7)*160+t*300)%160)+ly,in2=Math.abs(x-cx0)<(y-ly)*.42+6;if(!in2)continue;for(let q=0;q<5;q++)this.px(x+q*.18,y+q,this.c('#ffe9b0'));}
 this.reflect(gy+2,H,gy+1,'#0a0918',t,1.6,.7);
 // Foreground bollard in silhouette.
 const fx=260-camX*1.6;this.rect(fx,118,14,H-118,this.c('#06050c'));this.rect(fx-2,114,18,6,this.c('#06050c'));this.rect(fx+1,116,12,1,this.c('#3a3058'));
 this.rain(t,.5,camX);
};

// ── «oh-oh-oh»: Milton dances in silhouette in front of a giant LED wall of chunky pixels: EQ bars, then waves, then a ring.
F.shotLedWall=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,fy=140,drift=Math.sin(lt*.6)*6+lt*3,pitch=8;
 this.rect(0,0,W,H,this.c('#05030a'));
 const mode=lt<1.33?0:lt<2.67?1:2,cols=Math.ceil(W/pitch)+2,rows=Math.ceil(fy/pitch);
 const ramp=['#3af0ff','#3af0ff','#7a8aff','#ff3fa4','#ff3fa4','#ffb04a','#ffe14a'];
 let dom='#3af0ff';
 for(let c=0;c<cols;c++)for(let r=0;r<rows;r++){const x=Math.round(c*pitch-(drift%pitch)),y=r*pitch+2,cc=c+Math.floor(drift/pitch),rb=rows-1-r;let col=null,dim=false;
  if(mode===0){const hgt=Math.round((.25+.75*this.rand(cc*31+bt.n*7))*(.55+.45*k)*rows);if(rb<hgt)col=ramp[Math.min(6,Math.floor(rb/rows*7))];else if(rb===hgt+1&&this.rand(cc+bt.n)<.7)col='#ffffff';}
  else if(mode===1){const w1=rows*.5+Math.sin(cc*.32+t*5)*rows*.28*(.7+.3*k),w2=rows*.5+Math.sin(cc*.21-t*4+1)*rows*.2;if(Math.abs(rb-w1)<1.2)col='#3af0ff';else if(Math.abs(rb-w2)<1)col='#ff3fa4';else if(rb<w1)dim=true;dom='#3af0ff';}
  else{const d=Math.hypot(cc-cols/2-drift/pitch,(r-rows/2)*1.0),rr=bt.ph*24;if(Math.abs(d-rr)<1.3)col=bt.n&1?'#ff3fa4':'#ffe14a';else if(Math.abs(d-rr-12)<.9)col='#7a3a8a';else if(d<3+k*3)col='#ffffff';dom=bt.n&1?'#ff3fa4':'#ffe14a';}
  const cv=col?this.c(col):this.c(dim?'#1a3040':'#140c22');this.rect(x+1,y,5,7,cv);this.rect(x,y+1,7,5,cv);if(col)this.px(x+2,y+1,this.c('#ffffff'));}
 if(mode===0)dom=k>.5?'#ff3fa4':'#3af0ff';
 // Wall frame and the stage edge.
 this.rect(0,fy-4,W,4,this.c('#1a1626'));this.rect(0,fy-4,W,1,this.c('#4a4462'));
 this.glow(160,fy,150,dom,.3+k*.2,.25);
 // Milton in silhouette with a strong rim.
 const X=160+Math.sin(lt*.8)*6-drift*.3;
 this.beginLayer();this.person({x:X,y:fy+16,h:118,dir:Math.floor(bt.n/2)%2?-1:1,pose:'dance',beat:bt.ph,who:'milton'});this._ch_silEnd('#0a0612',dom,dom,k>.5?'#ffffff':dom);
 this.rect(0,fy,W,H-fy,this.c('#08060e'));
 this.reflect(fy,H,fy-1,'#07050c',t,.6,.8);
 // The figure stands on the stage in front of the wall; redraw him over the floor.
 this.beginLayer();this.person({x:X,y:fy+16,h:118,dir:Math.floor(bt.n/2)%2?-1:1,pose:'dance',beat:bt.ph,who:'milton'});this._ch_silEnd('#0a0612',dom,dom,k>.5?'#ffffff':dom);
};

// ── The rancho: a humble adobe hut with a tin roof, alone in the pampa at night. The door opens onto a whole universe.
// o: {Z, open (0..1 door swing), pour (0..1 light pouring out), milton:{y (world ground), h, walk, sil}, thread, inside (0..1 walking into the stars)}
F._ch_rancho=function(lt,t,o){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,Z=o.Z,fx=179,fy=135,zf=Math.min(1,(Z-1)/1.2),px=fx+(160-fx)*zf,py=fy+(100-fy)*zf;
 const X=x=>(x-fx)*Z+px,Y=y=>(y-fy)*Z+py,wX=x=>(x-px)/Z+fx,wY=y=>(y-py)/Z+fy;
 const R=(x,y,w,h,c)=>this.rect(X(x),Y(y),w*Z,h*Z,c),P=(pts,c)=>this.poly(pts.map(([a,b])=>[X(a),Y(b)]),c);
 const hz=Y(124);
 // Sky with the Milky Way and stars (slower parallax than the hut).
 this.vgrad(0,0,W,Math.max(1,hz)+2,['#03030a','#06061a','#0c0a26','#161034','#241848']);
 const sp=1+(Z-1)*.25;
 for(let i=0;i<260;i++){const sx=160+(this.rand(i*3)*360-180)*sp,sy=hz-(this.rand(i*7)*hz*1.4)*sp,b=this.rand(i*11);if(sy<0||sy>hz)continue;const tw=this.rand(i+Math.floor(t*4))<.1;this.px(sx,sy,this.c(tw?'#3a3a6a':b<.08?'#ffffff':b<.3?'#c8c4f0':'#5a5890'));}
 for(let i=0;i<500;i++){const f=this.rand(i*13),sx=160+(f*400-200)*sp,sy=(hz-20-f*70-Math.sin(f*7)*10+(this.rand(i*17)-.5)*26)*1-(Z-1)*20;if(sy<0||sy>hz)continue;if(this.d(Math.round(sx),Math.round(sy))<.5)this.px(sx,sy,this.c(this.rand(i)<.5?'#4a4078':'#2e2a58'));}
 this.glow(160,hz,140*sp,'#2a1a4a',.4,.3);
 // Pampa: dark grass to the horizon, a lone tree, a fence line.
 this.rect(0,hz,W,H-hz,(x,y)=>{const wy=wY(y);return this.c(this.d(x,y)<.12+(wy-124)*.004?'#141a1c':'#0b0f12');});
 const tx=X(282),ty=Y(124);this.rect(tx-2*Z,ty-34*Z,4*Z,34*Z,this.c('#05060a'));for(let q=0;q<9;q++){const a=-Math.PI/2+(q-4)*.32;this.line(tx,ty-26*Z,tx+Math.cos(a)*24*Z,ty-26*Z+Math.sin(a)*18*Z,this.c('#05060a'),Math.max(1,2*Z));this.ellipse(tx+Math.cos(a)*24*Z,ty-28*Z+Math.sin(a)*18*Z,9*Z,6*Z,this.c('#070910'));}
 for(let q=0;q<8;q++){const x=X(20+q*22);this.rect(x,Y(140),2*Z,12*Z,this.c('#1a1614'));}this.rect(X(20),Y(143),160*Z,Math.max(1,Z),this.c('#2a2420'));
 // Dirt path to the door.
 P([[176,150],[184,150],[230,200],[130,200]],(x,y)=>this.c(this.d(x,y)<.3?'#2a2226':'#1c171c'));
 // Roof: corrugated tin in perspective, rusty, with stones holding it down.
 P([[90,104],[244,104],[236,84],[100,84]],(x,y)=>{const wx=wX(x),wy=wY(y),u=Math.floor(wx/3),rust=this.rand(Math.floor(wx/8)*7+Math.floor(wy/5))<.18;return this.c(rust&&this.d(x,y)<.6?'#5a3424':(u&1)?'#4a4a62':'#6a6a86');});
 R(88,103,158,3,this.c('#2a2a3a'));R(88,103,158,1,this.c('#8a8aa8'));
 for(const [sx,sy]of [[120,92],[160,96],[210,90]]){this.ellipse(X(sx),Y(sy),4*Z,2.5*Z,this.c('#3a3438'));this.px(X(sx)-Z,Y(sy)-Z,this.c('#6a6068'));}
 // Whitewashed adobe walls in moonlight; the lime has flaked off in patches.
 R(96,106,140,44,(x,y)=>{const wx=wX(x),wy=wY(y),pn=Math.sin(wx*.21+wy*.05)+Math.sin(wy*.33-wx*.07)+Math.sin(wx*.05+1.3)*1.2,patch=pn>2.05;if(patch)return this.c(this.d(x,y)<.5?'#3a2c2c':'#4e3a34');const shade=(wy-106)/44+(pn>1.45?.3:0);return this.c(this.d(x,y)<.3+shade*.5?'#383652':this.d(x,y)<.85?'#4e4c70':'#626088');});
 R(96,106,140,3,this.c('#3a3850'));
 for(let q=0;q<4;q++){const cx=X(110+q*36),cy=Y(120+q%2*10);this.line(cx,cy,cx+3*Z,cy+6*Z,this.c('#5a5870'));}
 // Window with a wooden shutter.
 R(116,116,18,15,this.c('#120e16'));R(116,116,9,15,(x,y)=>((Math.floor(wX(x))-116)%3===0)?this.c('#3a2618'):this.c('#5a3a24'));R(115,115,20,1,this.c('#3a2618'));R(115,131,20,2,this.c('#3a2618'));
 // Doorway: the universe, the door leaf swinging inward.
 const d0=170,d1=188,dt=120,db=150,op=o.open||0,pour=o.pour||0;
 const gcx=X((d0+d1)/2),gcy=Y((dt+db)/2-2);
 if(op>0){const gal=this._ch_pal(['#0a0418','#2a0a4a','#5a1a7a','#9a3aaa','#ff6ac0','#ffb0e0','#fff4ff']);
  this._ch_fill((x,y)=>{const dx=(x-gcx)/Z,dy=(y-gcy)/Z,r=Math.hypot(dx,dy*1.3)+.01,a=Math.atan2(dy*1.3,dx);
   const arm=Math.sin(2*a-Math.log(r)*3.2+t*1.4),neb=Math.sin(dx*.4+t*.5)*Math.sin(dy*.5-t*.3);let v=(arm*.5+.5)*Math.max(0,1-r/18)*.9+Math.max(0,1-r/6)*1.1+neb*.15;
   if(this.rand((x*73)^(y*1931))<.05)v=Math.max(v,.85);if(r>8&&arm<-.4&&this.d(x,y)<.4)return this.c('#3af0ff');return this._ch_pick(gal,v,x,y);},X(d0),Y(dt),X(d1),Y(db));
  const lw=(d1-d0)*Math.cos(op*1.45);P([[d0,dt],[d0+lw,dt+op*2],[d0+lw,db-op*1],[d0,db]],(x,y)=>((Math.floor(wX(x))-d0)%4===0)?this.c('#2a1a10'):this.c(op>.5?'#3a2618':'#5a3a24'));}
 else{R(d0,dt,d1-d0,db-dt,(x,y)=>((Math.floor(wX(x))-d0)%4===0)?this.c('#3a2618'):this.c('#5a3a24'));R(d0+13,dt+15,2,2,this.c('#c8a060'));
  if(o.leak){const a=o.leak*(.5+k*.5);for(const [x0,y0,x1,y1]of [[d0,dt,d1,dt],[d1,dt,d1,db],[d0,dt,d0,db]])this._ch_dline(X(x0),Y(y0),X(x1),Y(y1),this.c('#ffd0f0'),a);this.glow(gcx,Y(db),18*Z,'#ff6ac0',a*.6,.3);}}
 R(d0-2,dt-2,d1-d0+4,2,this.c('#2a1a10'));R(d0-2,dt,2,db-dt,this.c('#2a1a10'));R(d1,dt,2,db-dt,this.c('#2a1a10'));
 // Lantern by the door.
 const lfl=.75+Math.sin(t*13)*.08+Math.sin(t*7.3)*.06;R(196,115,1,4,this.c('#2a2420'));R(194,118,5,7,this.c('#2a2420'));R(195,119,3,5,this.c('#ffcf7a'));this.glow(X(196.5),Y(121),26*Z,'#ffb04a',.5*lfl);
 // Light pouring out of the door: rays, a carpet of light on the ground, stars streaming toward the lens.
 if(pour>0){
  const [ax0,ay0,ax1,ay1]=[X(d0),Y(dt),X(d1),Y(db)];
  // Light spills on the wall around the frame and in a wedge across the ground.
  this.glow(gcx,gcy,34*Z,'#ff6ac0',.45*pour+k*.15,.9);
  for(let q=0;q<6;q++){const a=.35+q/5*(Math.PI-.7)+Math.sin(t*.5+q*1.7)*.06,len=(150+this.rand(q)*80)*pour*Z;this._ch_beam(gcx,Y(db)-4,gcx+Math.cos(a)*len*1.4,Y(db)-4+Math.sin(a)*len*.5,2*Z,(10+q%3*5)*Z,['#ff8fd0','#c8a8ff','#8ff4ff'][q%3],(.14+k*.06)*pour);}
  this.glow(gcx,Y(84),70*Z,'#9a3aaa',.3*pour,.4);
  P([[d0,db],[d1,db],[d1+34*pour,200],[d0-34*pour,200]],(x,y)=>{const f=(wY(y)-db)/50;return this.d(x,y)<.55*pour*(1-f)?this.c(f<.25&&this.d(x,y)<.3?'#fff0ff':'#ff8fd0'):0;});
  // Nebula and stars streaming out of the door in a slow spiral.
  for(let q=0;q<70;q++){const ph=(t*.3+this.rand(q*5))%1,a=this.rand(q*3)*Math.PI*2+ph*2.2,r=(4+ph*ph*150)*pour*Z,x=gcx+Math.cos(a)*r*1.2,y=gcy+Math.sin(a)*r*.6;if(x>ax0&&x<ax1&&y>ay0&&y<ay1)continue;
   if(q%4===0)this.glow(x,y,4+ph*14*Z,q%8?'#b04ac0':'#3a8aff',.55*(1-ph));else{const sz=ph>.6?2:1;this.rect(x,y,sz,sz,this.c(q%3?'#ffffff':'#ffd0f0'));}}
  for(let q=0;q<40;q++){const ph=(t*.35+this.rand(q*5))%1,a=this.rand(q*3)*Math.PI*2,r=ph*ph*260*pour,x=gcx+Math.cos(a)*r,y=gcy+Math.sin(a)*r*.7;const sz=ph>.7?2:1;this.rect(x,y,sz,sz,this.c(q%3?'#ffffff':'#ffd0f0'));}}
 // Milton: from behind, facing the door; backlit when the universe is open.
 if(o.milton){const m=o.milton,sx=X(m.x||179),sy=Y(m.y),h=m.h*Z;
  this.beginLayer();this.personBack({x:sx,y:sy,h,walk:m.walk||0,who:'milton'});
  if(m.clip){const L=this.L,b=this.box,cx0=X(d0),cx1=X(d1),cy0=Y(dt),cy1=Y(db);for(let y=Math.max(0,b[1]);y<=Math.min(H-1,b[3]);y++)for(let x=Math.max(0,b[0]);x<=Math.min(W-1,b[2]);x++)if(x<cx0||x>=cx1||y<cy0||y>=cy1)L[y*W+x]=0;}
  if(m.sil)this._ch_silEnd('#0a0612','#ffd0f0','#ffd0f0',k>.5?'#ffffff':'#ff8fd0');else this.endLayer('#ffcf7a',1);
  m.hand=[sx+h*.12*1.05,sy-h*.79+h*.3+h*.02];}
 return {X,Y,gcx,gcy,door:[X(d0),Y(dt),X(d1),Y(db)]};
};
// ── «el universo cabe en este rancho»: push in on the lonely rancho; on the downbeat of bar 52 the door opens on the universe.
F.shotRancho=function(lt,t){
 const tOpen=B(52),e=t-tOpen,open=e<0?0:Film.ease(e/.35),pour=e<0?0:Math.min(1,e/.6);
 this._ch_rancho(lt,t,{Z:1+Film.ease(lt/6)*.9,open,pour,leak:e<0?Math.max(0,(lt-.6)/1.4):0,milton:{x:166,y:168,h:26,sil:e>=0}});
 this.rain(t,.15,0);
};

// ───── Final chorus ─────
// ── Rooftop run: side tracking across the roofs; he clears the gap between two buildings on the downbeat of bar 121.
// The red thread on his pinky stretches ahead out of frame, leading him.
F.shotRoofRun=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,h=80,speed=104,camX=lt*speed,X=118,P=Film.CAST.milton;
 const t1=1.5,t2=2.5,gA=134,gB=144,xEdge=t1*speed+X+10,xB=t2*speed+X-10;
 this.vgrad(0,0,W,H,['#05050f','#0a0a22','#141236','#22184a','#3a2058','#4a2462']);
 for(let i=0;i<60;i++){const x=((this.rand(i*3)*360-camX*.03)%360+360)%360-20,y=this.rand(i*7)*80;this.px(x,y,this.c(this.rand(i)<.2?'#e8e4ff':'#5a5888'));}
 const mx=250-camX*.04;this.glow(mx,36,50,'#8a7ab0',.4);this.ellipse(mx,36,15,15,(x,y,dx,dy)=>dx<-.4&&dy<.3?this.c('#c8c0e0'):this.c('#f0eaff'));this.rect(mx-6,32,4,3,this.c('#d8d0ec'));
 this._ch_skyline(camX,.12,150,61,30,100,['#0e0d24','#12112c','#24204a'],t,.14);
 this._ch_skyline(camX,.3,165,71,20,70,['#141230','#171535','#2a2652'],t,.2);
 // The two near buildings and the gap between them, a long drop to a lit alley.
 const sx=v=>Math.round(v-camX);
 const gl=sx(xEdge),gr=sx(xB);
 this.rect(gl,gA,gr-gl,H-gA,(x,y)=>this.c(this.d(x,y)<(y-gA)/(H-gA)*.5?'#120c1c':'#05040a'));for(let y=gA+14;y<H;y+=12){this.rect(gl+4,y,gr-gl-8,1,this.c('#1c1628'));for(let q=gl+8;q<gr-8;q+=14)this.line(q,y,q+10,y+12,this.c('#16101f'));}for(let q=0;q<3;q++){const wy=gA+20+q*14;this.rect(gl+10+q*17,wy,5,7,this.c(q===1?'#ffcf7a':'#5a3a2a'));}this.glow((gl+gr)/2,H+6,36,'#ffb04a',.45,.6);
 const bldg=(x0,x1,gy,col)=>{if(x1<-10||x0>W+10)return;this.rect(x0,gy,x1-x0,H-gy,(x,y)=>{const u=x+Math.round(camX),row=Math.floor((y-gy)/4);return this.c(((y-gy)%4===0||((u+(row&1)*4)%8===0))?'#140f22':col);});
  for(let wy=gy+14;wy<H;wy+=20)for(let wx=x0+10;wx<x1-14;wx+=22){const h2=this.rand((wx+Math.round(camX))*7+wy);this.rect(wx,wy,10,12,this.c(h2<.35?'#d89a50':'#0c0a18'));}
  this.rect(x0,gy-6,x1-x0,6,this.c('#2e2840'));this.rect(x0,gy-7,x1-x0,1,this.c('#5a4f7a'));this.rect(x1-2,gy-6,2,H-gy+6,this.c('#3a3058'));};
 bldg(-20,gl,gA,'#1e1830');bldg(gr,W+20,gB,'#1c1a34');
 // Roof clutter: water tank, vents, an antenna.
 const tk=sx(150);if(tk>-60&&tk<W+20){this.rect(tk,gA-48,34,30,this.c('#2c2236'));for(let q=0;q<4;q++)this.rect(tk-1,gA-46+q*8,36,1,this.c('#4a3e5e'));this.poly([[tk-3,gA-48],[tk+17,gA-60],[tk+37,gA-48]],this.c('#2a2034'));for(const lx of [tk+3,tk+28])this.rect(lx,gA-18,3,12,this.c('#1c1828'));}
 const vt=sx(xB+120);if(vt<W+30){this.rect(vt,gB-22,22,16,this.c('#241e34'));this.rect(vt-2,gB-24,26,3,this.c('#3a3254'));this.rect(vt+40,gB-60,2,54,this.c('#1c1828'));for(let q=0;q<3;q++)this.rect(vt+34+q,gB-52+q*8,14-q*4,1,this.c('#1c1828'));if(bt.n%2===0)this.px(vt+40,gB-61,this.c('#ff4a5a'));}
 // Milton: run → leap over the gap (legs split, arms reaching) → land and run on.
 let y=gA,walk=((t-Film.BEAT0)/Film.P)/2+.25,arms=null;
 const wx=camX+X;if(lt>=t1&&lt<t2){const u=(lt-t1)/(t2-t1);y=gA+(gB-gA)*u-Math.sin(u*Math.PI)*46;walk=Math.floor(((Film.BEAT0+Math.round((B(121)-Film.BEAT0)/Film.P)*Film.P)-Film.BEAT0)/Film.P/2)+.25;arms=[[2.2,.2],[-1.4,.5]];}else if(lt>=t2)y=gB;
 this.beginLayer();const out=this.person({x:X,y,h,dir:1,walk,who:'milton',pose:'run',arms});this.endLayer(k>.5?'#ffe0f0':'#ff8fd0',1);
 if(lt>=t1&&lt<t2)for(let q=0;q<6;q++){const yy=y-h*.2-q*9;this.rect(X-40-q*6,yy,26,1,this.c('#b8bce8'));}
 const [hx,hy]=out.hands[0];this.redThread(hx,hy,W+24,hy-34+Math.sin(lt*2)*6,6,t,.7,1.4);
 this.rain(t,.4,camX);
};
// ── Her side of the city: she runs (to the left) down a wet neon street, the red thread on her pinky pulling ahead.
F.shotHerRun=function(lt,t){this._ch_runStreet(lt,t,{who:'her',dir:-1,thread:true,signs:['CAFE','FLORES','LIBROS','HOTEL','BAR','LAVADERO'],seed:9,h:88});};
// ── The maze again: now the red thread marks the true path and he runs it, solving the maze; the camera pulls up to the exit.
F.shotMazeThread=function(lt,t){
 const bt=Film.beat(t),k=bt.kick,M=this._ch_mazeData(),CS=40,lb=lt/Film.P,sol=M.solution,L=sol.length-1,rate=L/7.2;
 const pos=m=>this._ch_mazeAt(sol,m,CS);
 const m=Math.min(L,lb*rate),p=pos(m);let cx=0,cy=0;for(let q=0;q<6;q++){const pp=pos(Math.min(L,(lb-q*.1)*rate));cx+=pp.x/6;cy+=pp.y/6;}
 const zu=Film.ease((lt-2.7)/1.2),Z=.8*(1-zu)+.19*zu,mid=M.N*CS/2,camX=cx+(mid-cx)*zu,camY=cy+(mid-cy)*zu;
 this._ch_mazeDraw({camX,camY,Z,t,k,thread:sol});
 // A bright pulse races ahead of him along the thread on every beat.
 const sxy=([i,j])=>[((i+.5)*CS-camX)*Z+160,((j+.5)*CS-camY)*Z+90];
 const pq=Math.min(L,m+bt.ph*6);if(pq<L){const a=sol[Math.floor(pq)],b=sol[Math.min(L,Math.floor(pq)+1)],f=pq%1,[ax,ay]=sxy(a),[bx2,by2]=sxy(b);this.glow(ax+(bx2-ax)*f,ay+(by2-ay)*f,6,'#ffd0d8',.9*(1-bt.ph));}
 const ang=Math.atan2(p.dy||0,p.dx||1),sx=(p.x-camX)*Z+160,sy=(p.y-camY)*Z+90;
 if(m<L){this.beginLayer();this.personTop({x:sx,y:sy,r:Math.max(2,10*Z),ang,walk:lb,who:'milton'});this.endLayer(k>.5?'#ffe0f0':'#ff8fd0',1);
  if(Z>.5)for(let q=1;q<4;q++)this._ch_dline(sx-Math.cos(ang)*(8+q*5)*Z*1.5,sy-Math.sin(ang)*(8+q*5)*Z*1.5,sx-Math.cos(ang)*(14+q*5)*Z*1.5,sy-Math.sin(ang)*(14+q*5)*Z*1.5,this.c('#ffd0ea'),.6);}
 else{const e=(lb*rate-L)/rate*Film.P;this.glow(sx+20*Z,sy,20+e*60,'#fff1d8',.8);}
 if(zu>.4&&m<L){this.ellipse(sx,sy,7,7,(x,y,dx,dy)=>Math.abs(dx*dx+dy*dy-.8)<.2?this.c('#ffe14a'):0);}
 this._ch_rainTop(t,50);
};
// ── The rancho with the universe inside: the red thread runs through the door into the stars, and Milton steps through.
F.shotRanchoBoth=function(lt,t){
 const walkIn=Math.min(1,lt/2.7),inside=Math.max(0,(lt-2.7)/1.3),wy=184-34*Film.ease(walkIn)-inside*10,h=36-12*walkIn-inside*16;
 const r=this._ch_rancho(lt,t,{Z:1.75+lt*.12,open:1,pour:1,milton:{x:179,y:wy,h:Math.max(4,h),walk:inside>=1?0:walkAt(t),sil:true,clip:inside>0}});
 const m=r?null:null;
 const Z=1.75+lt*.12,zf=Math.min(1,(Z-1)/1.2),X=x=>(x-179)*Z+179+(160-179)*zf,Y=y=>(y-135)*Z+135+(100-135)*zf;
 const hh=Math.max(4,h)*Z,hx=X(179)+hh*.13,hy=Y(wy)-hh*.47;
 // Thread: from beyond the frame, through his pinky, over the threshold and into the heart of the galaxy.
 if(inside<.6){this.redThread(X(150),this.H+12,hx,hy,4,t,.6,1);this.redThread(hx,hy,r.gcx,r.gcy,-2,t,.8,.8);}
 else this.redThread(X(150),this.H+12,r.gcx,r.gcy,6,t,.8,1);
 this.glow(r.gcx,r.gcy,8,'#ff2a3a',.6+Film.beat(t).kick*.3);
};
