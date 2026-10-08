'use strict';
// Bendito error — finale: the keytar solo, the leap, the meeting on the bridge, the walk together and the end title.

// ── Helpers (prefix _fin) ────────────────────────────────────────────────────────────────────────────────

// Hand position of a person() arm for given [sw,bend] — used inside mid() hooks, where the front hand is not known yet.
F._finHand=function(sh,h,s,sw,bend){const ul=h*.17,fl=h*.16,el=[sh[0]+s*Math.sin(sw)*ul,sh[1]+Math.cos(sw)*ul],hd=[el[0]+s*Math.sin(sw+bend)*fl,el[1]+Math.cos(sw+bend)*fl];return [hd[0]+s*h*.01,hd[1]+h*.015];};

// The 80s keytar: a white wedge body with a key bed along its top edge, a neck with a rubber grip and a cyan pitch ribbon,
// pink headstock. a = tail end, ang = body angle (radians, screen space), L = body length, w = body width, s = dir.
// lit: index of the key lit right now (or -1), glow: 0..1 ribbon brightness.
F._finKeytar=function(ax,ay,ang,L,w,s,lit,glow){
 const ux=Math.cos(ang)*s,uy=Math.sin(ang),vx=-uy*s,vy=ux*s,NL=L*.62,nw=Math.max(3,w*.42),HS=w*.9;
 const P=(u,v)=>[ax+ux*u+vx*v,ay+uy*u+vy*v],UV=(x,y)=>{const dx=x+.5-ax,dy=y+.5-ay;return [dx*ux+dy*uy,dx*vx+dy*vy];};
 const ink=this.c('#120a18'),white=this.c('#f4f4fa'),shade=this.c('#c4c6dc'),deep=this.c('#8e90ae'),pink=this.c('#ff3fa4'),cyan=this.c('#3af0ff'),cyanHi=this.c('#d8fdff'),dark=this.c('#2a2a3a'),black=this.c('#16141f');
 const kw=Math.max(2,Math.round(w*.32)),k0=w*.55,k1=L*.86,kh=w*.48;
 const body=[[0,-w*.18],[w*.35,-w*.5],[L,-w*.5],[L+w*.35,-nw*.5],[L+w*.35,nw*.5],[L*.9,w*.5],[L*.42,w*.42],[w*.5,w*.5],[0,w*.2]];
 const neck=[[L,-nw/2],[L+NL,-nw/2],[L+NL,nw/2],[L,nw/2]],head=[[L+NL-1,-nw/2-1],[L+NL+HS,-nw/2-w*.35],[L+NL+HS*.8,nw/2],[L+NL-1,nw/2+1]];
 const grow=(pts,e)=>pts.map(([u,v])=>{const cu=L*.6;return [u+(u<cu?-e:e),v+(v<0?-e:e)];});
 for(const sh of [neck,head,body])this.poly(grow(sh,1).map(([u,v])=>P(u,v)),ink);
 // Neck: white, black rubber grip with ridges, glowing ribbon on the top edge.
 this.poly(neck.map(([u,v])=>P(u,v)),(x,y)=>{const [u,v]=UV(x,y),f=(u-L)/NL;
  if(f>.12&&f<.48)return (Math.floor(u)%3===0)?black:dark;
  if(f>.52&&f<.97&&v<-nw/2+Math.max(1,nw*.45))return glow>.55&&this.d(x,y)<glow?cyanHi:cyan;
  return v>nw*.15?shade:white;});
 this.poly(head.map(([u,v])=>P(u,v)),(x,y)=>{const [u,v]=UV(x,y);return v<-nw*.2&&this.d(x,y)<.5?this.c('#ff8fd0'):pink;});
 // Body: key bed on top, white shell shading down to a pink edge stripe, cyan tail fin, a small display.
 this.poly(body.map(([u,v])=>P(u,v)),(x,y)=>{const [u,v]=UV(x,y);
  if(v<-w*.5+kh&&u>k0&&u<k1){const ku=u-k0,ki=Math.floor(ku/kw),m=ku-ki*kw;
   if(m<1)return deep;
   const blackKey=v<-w*.5+kh*.58&&m>kw*.55&&(0x3b>>(ki%7)&1);
   if(blackKey)return black;
   if(ki===lit)return v<-w*.5+kh*.4?this.c('#ffd0ea'):pink;
   return v>-w*.5+kh-1.2?shade:white;}
  if(v<-w*.5+kh&&u>=k1&&u<L){return dark;}
  if(u<w*.9&&v>-w*.2+u*.3)return cyan;
  if(v>w*.28)return pink;
  if(u>L*.88&&u<L-1&&v>-w*.05&&v<w*.15)return this.d(x,y)<.3?cyanHi:dark;
  return v>w*.05&&this.d(x,y)<.55?shade:white;});
 return {P,neck:(f,v=0)=>P(L+NL*f,v),keys:(f)=>P(k0+(k1-k0)*f,-w*.5),tip:P(L+NL+HS*.7,-nw/2-w*.2)};
};

// Night skyline layer: building silhouettes with lit windows; par = parallax factor, base = street level hidden below.
F._finSkyline=function(camX,base,t,layer,hmax,cols){
 const W=this.W,k=Film.beat(t).kick,par=[.12,.3,.55][layer],bw0=[13,20,30][layer],ox=camX*par,i0=Math.floor(ox/bw0)-2,win=['#ffcf7a','#9fe8ff','#ffe9b0','#ff8fd0'];
 for(let i=i0;i<i0+Math.ceil(W/bw0)+4;i++){
  const r=this.rand(i*31+layer*977),bw=Math.round(bw0*(.75+r*.7)),x=Math.round(i*bw0-ox),top=Math.round(base-(10+this.rand(i*17+layer*5)*hmax));
  this.rect(x,top,bw,base-top+60,this.c(cols[(i&1)]));this.rect(x,top,bw,1,this.c(cols[2]));
  if(this.rand(i*7+layer)<.3){this.rect(x+bw/2-1,top-6,1,6,this.c(cols[2]));if(Math.floor(t*1.5+i)%2)this.px(x+bw/2-1,top-7,this.c('#ff4a5a'));}
  const st=layer?4:3;for(let wy=top+3;wy<base;wy+=st)for(let wx=x+2;wx<x+bw-2;wx+=st)if(this.rand(i*977+wy*7+wx*13+layer)<.22){const c=this.c(win[Math.floor(this.rand(wx*3+wy+i)*3.4)]);this.px(wx,wy,c);if(layer>1)this.px(wx,wy+1,c);}
  if(layer>=1&&this.rand(i*5+3)<.18){const nc=['#ff3fa4','#3af0ff','#ffb04a'][i%3&3]||'#ff3fa4';this.rect(x+2,top+5,bw-4,3,this.c(nc));this.glow(x+bw/2,top+6,10,nc,.4+k*.3,.6);}}
};
// Truss beam across the frame: two chords with zigzag diagonals.
F._finTruss=function(x0,x1,y,h,camX){
 const iron=this.c('#3a3654'),hi=this.c('#8a84b0'),dk=this.c('#17142a');
 this.rect(x0,y,x1-x0,2,iron);this.rect(x0,y,x1-x0,1,hi);this.rect(x0,y+h-2,x1-x0,2,iron);this.rect(x0,y+h-1,x1-x0,1,dk);
 const st=h,off=((camX%(st*2))+st*2)%(st*2);for(let x=x0-off;x<x1+st;x+=st*2){this.line(x,y+2,x+st,y+h-2,iron);this.line(x+st,y+h-2,x+st*2,y+2,iron);this.px(x,y+1,hi);}
};
// A searching stage beam: a dithered cone from (x0,y0) to a floor point, brightest near the source.
F._finBeam=function(x0,y0,x1,y1,w0,w1,col,amt){
 const c=this.c(col),dx=x1-x0,dy=y1-y0,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 this.poly([[x0+nx*w0,y0+ny*w0],[x1+nx*w1,y1+ny*w1],[x1-nx*w1,y1-ny*w1],[x0-nx*w0,y0-ny*w0]],(x,y)=>{const f=((x-x0)*dx+(y-y0)*dy)/(l*l),e=Math.abs((x-x0)*nx+(y-y0)*ny)/(w0+(w1-w0)*f);return this.d(x,y)<amt*(1-f*.55)*(1-e*e*.8)?c:0;});
};
// A speaker stack: two cabinets, woofers pump on the kick.
F._finSpeaker=function(x,y,w,h,k){
 const cab=h/2;for(let n=0;n<2;n++){const cy=y+n*cab;this.rect(x,cy,w,cab-1,this.c('#16131f'));this.rect(x,cy,w,1,this.c('#3a344e'));this.rect(x+1,cy+1,w-2,cab-3,(i,j)=>this.c(((i+j)&1)?'#1c1828':'#221d30'));
  const r=Math.min(w,cab)*.36,cx=x+w/2,wy=cy+cab*.58;this.ellipse(cx,wy,r+1,r+1,this.c('#0a0810'));this.ellipse(cx,wy,r,r,(i,j,dx,dy)=>{const d=Math.hypot(dx,dy);return d>.85?this.c('#4a4462'):d<.32+k*.18?this.c(k>.4?'#8a84b0':'#3a3454'):this.c(dx<-.2&&dy<-.2?'#2e2a40':'#1e1a2a');});
  this.ellipse(cx,cy+cab*.18,r*.3,r*.22,this.c('#4a4462'));}
};

// Composite the current layer as a flat silhouette whose top edge catches a rim of stage light.
F._finEndSil=function(rimTop){
 this.T=this.buf;const b=this.box;this.box=null;if(b[2]<0)return;const L=this.L,W=this.W,rt=this.c(rimTop);
 for(let y=Math.max(0,b[1]);y<=Math.min(this.H-1,b[3]);y++)for(let x=Math.max(0,b[0]);x<=Math.min(W-1,b[2]);x++){const v=L[y*W+x];if(!v)continue;this.buf[y*W+x]=(y>0&&!L[(y-1)*W+x])?rt:v;}
};
// A row of concert-goers seen from behind: heads, shoulders, arms thrown up on the beat. s = scale, y0 = head line.
F._finCrowd=function(t,y0,s,camX,par,col,rim,seed,up){
 const bt=Film.beat(t),sp=24*s,ox=camX*par,i0=Math.floor((ox-40)/sp);
 this.beginLayer();
 for(let i=i0;i<i0+this.W/sp+4;i++){const r=this.rand(i*13+seed),z=.8+this.rand(i*29+seed)*.38,S=s*z,x=i*sp-ox+(this.rand(i*41+seed)-.5)*sp*.8,ph=(bt.ph+this.rand(i+seed*7)*.2)%1,jump=Math.pow(1-ph,3)*5*s*(r<.6?1:.25),hy=y0+(this.rand(i*3+seed)-.5)*9*s-jump,c=this.c(col);
  this.ellipse(x,hy+22*S,15*S,12*S,c);this.rect(x-15*S,hy+22*S,30*S,60*S,c);this.ellipse(x,hy,6.5*S,7.5*S,c);this.rect(x-3*S,hy+4*S,6*S,12*S,c);
  if(this.rand(i*5+seed+1)<.18)this.ellipse(x+1*S,hy-4*S,8*S,4.5*S,c);
  for(const sd of [-1,1]){if(this.rand(i*11+sd+seed)>up)continue;const pump=Math.pow(1-ph,2)*6*s,sx=x+sd*11*S,sy=hy+16*S,hx=x+sd*(12+this.rand(i+sd)*10)*S,hyy=hy-24*S-pump+this.rand(i*7+sd)*8*S;
   this.quad(sx,sy,(sx+hx)/2+sd*3*S,(sy+hyy)/2,5*S,4*S,c);this.quad((sx+hx)/2+sd*3*S,(sy+hyy)/2,hx,hyy,4*S,3.5*S,c);this.ellipse(hx,hyy-2*S,2.6*S,3.2*S,c);
   if(this.rand(i*17+sd)<.12){this.rect(hx-2*S,hyy-9*S,4*S,6*S,c);this.rect(hx-1.5*S,hyy-8.5*S,3*S,5*S,this.c('#bff6ff'));}}}
 this._finEndSil(rim);
};
// ── Wide, low angle: the rooftop stage. Milton on the keytar, spots sweep and flash on the beat, the city behind.
F.shotKeytarWide=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,down=bt.n%4===0,camX=-12+lt*3,gy=134,X=160-camX,h=100,kt=Math.floor(bt.b*2);
 this.vgrad(0,0,W,H,['#05050f','#0a0a20','#141232','#221a48','#3a2462','#5a2a6a']);
 this.glow(160-camX*.1,150,150,'#ff3fa4',.22,.4);
 // Searchlights sweeping from the city behind.
 for(let i=0;i<2;i++){const bx=(i?250:70)-camX*.2,a=-Math.PI/2+Math.sin(t*.45+i*2.2)*.5;this._finBeam(bx,124,bx+Math.cos(a)*220,124+Math.sin(a)*220,1,14,'#6a5a9a',.3);}
 this._finSkyline(camX,118,t,0,46,['#0d0c22','#100f28','#1c1a3a']);
 // A water tower on the next roof.
 const wx=262-camX*.45;this.rect(wx-12,72,24,18,this.c('#121029'));this.poly([[wx-14,72],[wx,62],[wx+14,72]],this.c('#121029'));for(const lx of [-10,-3,4,10])this.rect(wx+lx,90,2,26,this.c('#121029'));this.line(wx-10,92,wx+10,110,this.c('#121029'));this.line(wx+10,92,wx-10,110,this.c('#121029'));for(let r=74;r<90;r+=4)this.rect(wx-12,r,24,1,this.c('#1c1a3a'));
 this._finSkyline(camX,126,t,1,34,['#131130','#161436','#2a2650']);
 // Truss with PAR cans; their beams sweep the deck and spike on every kick (white-hot on the downbeat).
 this._finTruss(-10,W+10,4,10,camX);
 const cols=['#ff3fa4','#3af0ff','#ffb04a','#3af0ff','#ff3fa4'];
 for(let i=0;i<5;i++){const cx=Math.round(24+i*68-camX),tx=cx+Math.sin(t*1.1+i*1.9)*70+(160-cx)*.25,col=down&&k>.4?'#fff1f8':cols[i];
  this._finBeam(cx,20,tx,gy+2,2,24,col,(down?.14:.2)+k*.3);this.glow(tx,gy,26,col,.35+k*.3,.22);}
 // Follow spot from above on Milton.
 this._finBeam(X+8,-4,X-4,gy,3,30,'#ffe9c8',.16+k*.12);this.glow(X,gy,40,'#ffe9c8',.5+k*.2,.18);
 for(let i=0;i<5;i++){const cx=Math.round(24+i*68-camX);this.rect(cx-1,14,3,3,this.c('#2a2640'));this.rect(cx-4,16,9,6,this.c('#1c1a2c'));this.rect(cx-3,21,7,1,this.c(k>.5?'#ffffff':cols[i]));this.glow(cx,22,10,cols[i],.5+k*.4);}
 // Speaker stacks on the deck.
 const sx=-camX;this._finSpeaker(sx+4,gy-74,46,50,k);this._finSpeaker(sx+4,gy-24,46,24,k);this._finSpeaker(sx+270,gy-74,46,50,k);this._finSpeaker(sx+270,gy-24,46,24,k);
 // Deck surface (a sliver, we look up at it).
 this.rect(0,gy-2,W,3,(i,j)=>this.c(j===gy-2?'#5a4a7a':this.d(i,j)<.2?'#2e2840':'#221d34'));
 // Milton, keystoned for the worm's-eye lens.
 this.beginLayer();
 this.person({x:X,y:gy,h,dir:1,who:'milton',pose:'keytar',arms:[[-.28+Math.sin(bt.b*Math.PI)*.08,1.5],[.95,.75]],mid:p=>{this._finKeytar(X-h*.19,gy-h*.47,-.42,h*.44,h*.11,1,(kt*5)%11,.5+k*.5);}});
 this.keystone(X,gy,.14);this.endLayer(k>.5?'#ffe0f0':'#ff8fd0',1);
 // Stage front: skirt with pleats and an LED lip chasing in eighths; below it the haze the crowd stands in.
 this.rect(0,gy+1,W,12,(i,j)=>{const pl=((i+Math.round(camX))%6+6)%6;return this.c(j<gy+3?'#3a3050':pl===0?'#07060c':this.d(i,j)<.12?'#14101e':'#0d0a16');});
 for(let x=-(((camX)%8)+8)%8;x<W;x+=8){const id=Math.round((x+camX)/8),on=(id+kt)%4===0;this.rect(x,gy+5,5,2,this.c(on?(kt&2?'#3af0ff':'#ff3fa4'):'#2a1f3a'));if(on)this.glow(x+2,gy+6,6,kt&2?'#3af0ff':'#ff3fa4',.5);}
 this.vgrad(0,gy+13,W,H-gy-13,['#3a2858','#2a1f46','#1c1634']);
 for(let i=0;i<26;i++){const x=((this.rand(i)*W*1.4+lt*(6+this.rand(i+5)*8)-camX)%(W+60)+W+60)%(W+60)-30,y=gy-4+this.rand(i+9)*12;this.glow(x,y,12+this.rand(i+2)*10,'#4a3a6a',.4,.35);}
 for(let i=0;i<5;i++){const cx=Math.round(24+i*68-camX),tx=cx+Math.sin(t*1.1+i*1.9)*70+(160-cx)*.25;this.glow(tx,gy+16,30,cols[i],.25+k*.25,.4);}
 this.rain(t,.35,camX);
 // The crowd below the lens, hands up.
 this._finCrowd(t,160,.62,camX,1.4,'#140f22',k>.5?'#c04a8a':'#5a2a5a',3,.4);
 this._finCrowd(t,172,.95,camX,2.2,'#07060c',k>.5?'#4ab0c0':'#1f4a5a',11,.3);
};

// Out-of-focus bokeh disc: a dithered flat disc with a brighter rim, like a fast lens wide open.
F._finBokeh=function(cx,cy,r,col,amt){
 const c=this.c(col);this.ellipse(cx,cy,r,r,(x,y,dx,dy)=>{const d=dx*dx+dy*dy;return this.d(x,y)<amt*(d>.78?1:.55)?c:0;});
};

// ── Detail: his fingers on the keytar keys; each eighth note lights a key, the pitch ribbon glows. Shallow focus.
F.shotKeys=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,e8=bt.b*2,n8=Math.floor(e8),p8=e8-n8;
 // Melody: per bar the hand sits on four keys; notes are fingers 0..3 of that hand position.
 // The last eighth of each bar is a rest: the hand slides to the next position then.
 const bar=Math.floor(bt.n/4),base=[6,9,7,10][((bar%4)+4)%4],nx=[6,9,7,10][(((bar+1)%4)+4)%4];
 const mel=[0,2,1,3,2,0,3,-1, 3,2,1,0,1,2,3,-1];const fing=mel[((n8%16)+16)%16];
 const barPh=(bt.b/4)-Math.floor(bt.b/4),hb=base+(nx-base)*Film.ease((barPh-.875)/.1);
 const kw=16,kl=50,a=-.14,ux=Math.cos(a),uy=Math.sin(a),vx=Math.sin(a)*.0+uy*-1*0,
  camU=hb*kw-104+lt*3,O=[14-camU*ux,150-camU*uy],P=(u,v)=>[O[0]+u*ux+v*Math.sin(a)*.25,O[1]+u*uy-v],UV=(x,y)=>{const yy=O[1]-y;/* solve x=O0+u*ux+v*.25*sin(a), y=O1+u*uy-v */const u=(x-O[0]-(-(y-O[1]))*Math.sin(a)*.25)/(ux+uy*Math.sin(a)*.25);return [u,u*uy-(y-O[1])];};
 // Dark stage with soft bokeh drifting (camera slides along the keys).
 this.vgrad(0,0,W,H,['#0a0818','#120e26','#1c1434','#140f26']);
 const bc=['#ff3fa4','#3af0ff','#ffb04a','#8a5aff','#ff3fa4','#3af0ff'];
 for(let i=0;i<11;i++){const x=((this.rand(i*7)*W*1.6-camU*.35)%(W+80)+W+80)%(W+80)-40,y=10+this.rand(i*3)*80,r=12+this.rand(i*5)*20;this._finBokeh(x,y,r,bc[i%6],.22+(i%3===0?k*.2:0));}
 // Keytar body: back panel with LEDs above the keys, shell and stripes in front of them.
 const nK=17,uEnd=nK*kw;
 const quad=(u0,v0,u1,v1,c)=>this.poly([P(u0,v0),P(u1,v0),P(u1,v1),P(u0,v1)],c);
 quad(-30,-40,uEnd+6,kl+22,this.c('#120a18'));
 quad(-28,kl,uEnd+4,kl+20,(x,y)=>this.d(x,y)<.25?this.c('#d4d6e8'):this.c('#eceef8'));
 for(let i=0;i<12;i++){const [lx,ly]=P(10+i*12,kl+12),on=(i+n8)%6===0;this.rect(lx,ly,3,2,this.c(on?'#3af0ff':'#3a3a52'));if(on)this.glow(lx+1,ly+1,6,'#3af0ff',.6);}
 for(const ku of [190,212,234]){const [kx,ky]=P(ku,kl+11);this.ellipse(kx,ky,4,3,this.c('#2a2a3a'));this.px(kx,ky-2,this.c('#ff3fa4'));}
 quad(-28,-38,uEnd+4,-2,(x,y)=>{const [u,v]=UV(x,y);if(v<-26&&v>-31)return this.c('#ff3fa4');if(v<-22&&v>-24)return this.c('#3af0ff');if(this.d(x,y)<.18&&x<90)return this.c('#ffc0e0');if(this.d(x,y)<.18&&x>230)return this.c('#c0f8ff');return v<-12&&this.d(x,y)<.4?this.c('#c8cadc'):this.c('#f4f4fa');});
 // Logo on the shell.
 {const [lx,ly]=P(uEnd-58,-8);const g=ArcadeGame.font;let cx=0;for(const ch of 'MV-80'){const gl=g[ch];for(let r=0;r<5;r++)for(let q=0;q<3;q++)if(gl[r*3+q]==='1'){const [x,y]=[lx+(cx+q)*2,ly+r*2+(cx+q)*2*uy];this.rect(x,y,2,2,this.c(ch==='-'?'#3af0ff':'#ff3fa4'));}cx+=4;}}
 // Keys: white keys with a front lip; the pressed key dips and glows pink, the last notes fade.
 const litAmt=key=>{let g=0;for(let j=0;j<3;j++){const m=n8-j,mm=mel[((m%16)+16)%16],kk=[6,9,7,10][((Math.floor(m/8)%4)+4)%4]+mm;if(mm>=0&&kk===key)g=Math.max(g,Math.exp(-(p8+j)*1.3));}return g;};
 for(let i=0;i<nK;i++){const g=litAmt(i),down=g>.75?2:0,blur=Math.min(1,Math.abs(i*kw+kw/2-(hb*kw+30))/120);
  const top=(x,y)=>{if(g>.35){const [u,v]=UV(x,y);return this.c(v<kl*.55&&this.d(x,y)<g*.8?'#ffd0ea':'#ff3fa4');}if(g>.08&&this.d(x,y)<g*1.6)return this.c('#ff7ac0');const [u,v]=UV(x,y);return v>kl-6&&this.d(x,y)<.5?this.c('#d8dae8'):this.c(blur>.5&&this.d(x,y)<.2?'#e4e6f2':'#fbfbff');};
  this.poly([P(i*kw+1,down),P(i*kw+kw-1,down),P(i*kw+kw-1,kl),P(i*kw+1,kl)],top);
  this.poly([P(i*kw+1,down-4),P(i*kw+kw-1,down-4),P(i*kw+kw-1,down),P(i*kw+1,down)],this.c(g>.5?'#c02a78':'#a8aac4'));
  if(g>.2){const [gx,gy]=P(i*kw+kw/2,kl+6);this.glow(gx,gy,26,'#ff3fa4',g*.7,.8);}}
 for(let i=0;i<nK-1;i++){if(!(0x3b>>(i%7)&1))continue;const cu=(i+1)*kw,g=0;
  this.poly([P(cu-4,kl*.42-2),P(cu+6,kl*.42-2),P(cu+6,kl),P(cu-4,kl)],this.c('#2a2238'));
  this.poly([P(cu-5,kl*.42),P(cu+5,kl*.42),P(cu+5,kl),P(cu-5,kl)],(x,y)=>{const [u,v]=UV(x,y);return u<cu-3?this.c('#4a4462'):this.c('#16121f');});}
 // Neck past the keys: rubber grip, then the pitch ribbon, glowing on the beat with a sliding bright spot.
 quad(uEnd+4,kl*.2,uEnd+200,kl*.8,this.c('#120a18'));
 quad(uEnd+6,kl*.22,uEnd+200,kl*.78,(x,y)=>{const [u,v]=UV(x,y);if(u<uEnd+40)return (Math.floor(u)%4===0)?this.c('#16141f'):this.c('#2a2a3a');
  const sp=uEnd+60+((bt.b*.5)%1)*80,near=Math.abs(u-sp)<6;if(v>kl*.32&&v<kl*.68)return near||this.d(x,y)<.35+k*.4?this.c('#d8fdff'):this.c('#3af0ff');return this.c('#eceef8');});
 {const [rx,ry]=P(uEnd+100,kl*.5);this.glow(rx,ry,40,'#3af0ff',.35+k*.35,.5);}
 // His hand: sleeve and cuff from the bottom, fingers on four keys, one presses on each eighth note.
 const hu=hb*kw+32,press=fing,dip=Math.exp(-p8*5);
 const HP=(du,v)=>P(hu+du,v);
 this.beginLayer();
 const sk=this.c('#f6cfb0'),skS=this.c('#dca587'),skD=this.c('#b9806a');
 this.poly([HP(-36,-120),HP(34,-120),HP(30,-46),HP(-30,-46)],(x,y)=>this.d(x,y)<.12?this.c('#b81c72'):this.c('#ff2f9a'));
 this.poly([HP(-31,-50),HP(31,-50),HP(29,-36),HP(-29,-36)],(x,y)=>{const [u,v]=UV(x,y);return v>-40?this.c('#139c99'):this.c('#22d6c4');});
 this.poly([HP(-26,-38),HP(26,-38),HP(30,-14),HP(28,0),HP(-30,0),HP(-32,-16)],(x,y)=>{const [u,v]=UV(x,y);return u-hu<-18&&this.d(x,y)<.6?skS:v<-30?skS:sk;});
 for(let j=0;j<4;j++){const fu=-24+j*16,isP=j===press,len=isP?16-dip*5:20+(j===1||j===2?3:0),lift=isP?0:2,col=isP?skS:sk;
  this.quad(...HP(fu,-4),...HP(fu+(isP?0:1),len),9,8,col);this.ellipse(...HP(fu+(isP?0:1),len),4.5,4,col);
  const [nx,ny]=HP(fu+(isP?0:1),len+1);this.rect(nx-2,ny-2,4,2,this.c('#ffe6d8'));
  const [kx,ky]=HP(fu,4);this.rect(kx-2,ky,4,1,skD);}
 this.quad(...HP(-28,-22),...HP(-40,-4),11,9,sk);this.ellipse(...HP(-40,-4),5,4.5,sk);
 this.endLayer(k>.5?'#ffd0ea':'#ff8fd0',1);
 // Foreground bokeh, way out of focus.
 this._finBokeh(300-lt*6,150,34,'#ff3fa4',.12);this._finBokeh(20-lt*4,30,28,'#3af0ff',.1);
};

// ── The iron truss bridge (same look as shotBridge), parametrized: deck line, height (deck-top), horizontal scroll camX,
// and the bridge's extent [bx0,bx1] in screen space before scrolling (ends get a heavy portal post).
F._finBridgeBack=function(camX,deck,top,k,bx0=-1e5,bx1=1e5,lamps=true){
 const W=this.W,s=(deck-top)/78,panel=52*s,off=((camX%panel)+panel)%panel,lo=Math.max(0,bx0-camX),hi=Math.min(W,bx1-camX),dim=this.c('#1c1830'),iron=this.c('#2a2440');
 if(hi<=lo)return;
 for(let i=-1;i<W/panel+2;i++){const x=Math.round(i*panel-off+20*s);if(x+panel<lo||x>hi)continue;const a=Math.max(lo,x),b=Math.min(hi,x+panel);
  if(a<b){this.line(Math.max(a,x),top+6*s+(Math.max(a,x)-x)/panel*(deck-top-10*s),Math.min(b,x+panel),top+6*s+(Math.min(b,x+panel)-x)/panel*(deck-top-10*s),dim,Math.max(1,2*s));
   this.line(Math.max(a,x),deck-4*s-(Math.max(a,x)-x)/panel*(deck-top-10*s),Math.min(b,x+panel),deck-4*s-(Math.min(b,x+panel)-x)/panel*(deck-top-10*s),dim,Math.max(1,2*s));}}
 this.rect(lo,top+4*s,hi-lo,Math.max(1,3*s),dim);
 this.rect(lo,deck,hi-lo,10*s,dim);this.rect(lo,deck,hi-lo,1,this.c('#4a4068'));this.rect(lo,deck+8*s,hi-lo,Math.max(1,2*s),this.c('#0e0b18'));
 if(lamps)for(let i=-1;i<W/panel+2;i++){const x=Math.round(i*panel-off),id=Math.floor((camX+i*panel)/panel),lx=x+24*s;if((((id%2)+2)%2)!==0||lx<lo||lx>hi)continue;
  this.rect(lx,deck-40*s,Math.max(1,2*s),40*s,iron);this.rect(lx-4*s,deck-42*s,10*s,Math.max(1,3*s),this.c('#3a3456'));this.rect(lx-3*s,deck-39*s,8*s,1,this.c('#ffcf8a'));this.glow(lx+s,deck-36*s,26*s,'#ffb04a',.45+k*.15);this.glow(lx+s,deck,22*s,'#ffb04a',.45,.22);}
};
F._finBridgeFront=function(camX,deck,top,bx0=-1e5,bx1=1e5){
 const W=this.W,s=(deck-top)/78,panel=52*s,off=((camX%panel)+panel)%panel,lo=Math.max(-10,bx0-camX),hi=Math.min(W+10,bx1-camX),iron=this.c('#2a2440'),hl=this.c('#5e5384'),rivet=this.c('#7a6fa0'),cw=Math.max(2,6*s);
 if(hi<=lo)return;
 this.rect(lo,top,hi-lo,cw,iron);this.rect(lo,top,hi-lo,1,hl);this.rect(lo,top+cw-1,hi-lo,1,this.c('#14101e'));this.rect(lo,deck-8*s,hi-lo,cw,iron);this.rect(lo,deck-8*s,hi-lo,1,hl);
 for(let i=-1;i<W/panel+2;i++){const x=Math.round(i*panel-off);if(x+panel<lo-4||x>hi+4)continue;
  if(x>=lo-2&&x<=hi+2){this.rect(x-2*s,top,Math.max(2,5*s),deck-top-2*s,iron);this.rect(x-2*s,top,1,deck-top-2*s,hl);for(let r=top+9*s;r<deck-10*s;r+=8*s)this.px(x,r,rivet);}
  const a=Math.max(x+2*s,lo),b=Math.min(x+panel-2*s,hi);if(b<=a)continue;const f0=(a-x-2*s)/(panel-4*s),f1=(b-x-2*s)/(panel-4*s),y0=top+6*s,y1=deck-8*s;
  this.line(a,y0+(y1-y0)*f0,b,y0+(y1-y0)*f1,iron,Math.max(1,3*s));this.line(a,y1-(y1-y0)*f0,b,y1-(y1-y0)*f1,iron,Math.max(1,3*s));
  for(let r=4*s;r<panel;r+=10*s)if(x+r>lo&&x+r<hi){this.px(x+r,top+2*s,rivet);this.px(x+r,deck-6*s,rivet);}}
 // Portal posts where the truss ends.
 for(const ex of [bx0-camX,bx1-camX])if(ex>-20&&ex<W+20){this.rect(ex-4*s,top-8*s,Math.max(3,8*s),deck-top+8*s,iron);this.rect(ex-4*s,top-8*s,1,deck-top+8*s,hl);this.rect(ex-6*s,top-10*s,12*s,Math.max(2,3*s),this.c('#3a3456'));for(let r=top;r<deck;r+=6*s)this.px(ex,r,rivet);}
};
// Night sky with the bridge moon (upper right in the bridge shots).
F._finMoon=function(mx,my,r){
 this.glow(mx,my,r*3.3,'#8a7ab0',.4);this.ellipse(mx,my,r,r,(x,y,dx,dy)=>dx<-.4&&dy<.3?this.c('#c8c0e0'):this.c('#f0eaff'));this.rect(mx-r*.5,my-r*.35,r*.28,r*.2,this.c('#d8d0ec'));this.rect(mx+r*.3,my+r*.3,r*.2,r*.15,this.c('#d8d0ec'));
};
// Far city across the river (the shotBridge backdrop), scrolled at parallax.
F._finFarCity=function(camX,base,t,k,par=.12,hmin=54,hr=44){
 for(let i=-2;i<26;i++){const bx=Math.round(i*15-camX*par),bw=11+this.rand(i*5)*8,tp=base-(base-hmin-this.rand(i*3)*hr);const T=Math.round(hmin+this.rand(i*3)*hr)+(base-124);
  this.rect(bx,T,bw,base-T,this.c(i&1?'#100f26':'#15142e'));for(let wy=T+4;wy<base-4;wy+=5)for(let wx=bx+2;wx<bx+bw-2;wx+=4)if(this.rand(i*977+wy*7+wx)<.2)this.px(wx,wy,this.c(this.rand(wx*3+wy)<.6?'#ffcf7a':'#9fe8ff'));if(((i%5)+5)%5===2)this.glow(bx+bw/2,T+8,8,'#ff3fa4',.5+k*.3);}
};

// ── Wide: the iron bridge again. He enters from the left, she from the right; the red thread spans the bridge between
// their hands and shortens as they walk to the middle.
F.shotBridgeApproach=function(lt,t){
 const W=this.W,H=this.H,k=Film.beat(t).kick,camX=lt*1.6,deck=124,top=46,h=38,v=.64*h,wk=walkAt(t);
 this.vgrad(0,0,W,deck,['#05050f','#0a0a22','#141236','#22184a','#30205a']);
 this._finMoon(262-camX*.05,30,14);
 this._finFarCity(camX,deck,t,k);
 this._finBridgeBack(camX,deck,top,k);
 const mx=-50+v*lt-camX,hx=372-v*lt-camX;
 this.beginLayer();const pm=this.person({x:mx,y:deck,h,dir:1,walk:wk,who:'milton'});this.endLayer('#ffb04a',1);
 this.beginLayer();const ph=this.person({x:hx,y:deck,h,dir:-1,walk:wk+.5,who:'her'});this.endLayer('#ffb04a',-1);
 const a=pm.hands[0],b=ph.hands[0],d=b[0]-a[0];
 this.redThread(a[0],a[1],b[0],b[1],Math.min(deck-5-Math.max(a[1],b[1]),Math.max(1.5,d*.05)),t,.5+Math.max(0,1-d/300)*.5+k*.2,1.2);
 this._finBridgeFront(camX,deck,top);
 this.reflect(deck+10,H,deck+9,'#07071a',t,2.4,.65);
 this.rain(t,.5,camX);
};

// ── Medium two-shot on the deck: the last two steps, they stop face to face; their hands rise, the thread between the
// pinkies shortens, tightens and burns brighter. The rain thins out. Slow push-in.
F.shotMeet=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,z=1+lt*.014,camX=lt*3,X=x=>160+(x-160)*z,Y=y=>96+(y-96)*z;
 const deck=Y(150),top=Y(52);
 this.vgrad(0,0,W,H,['#05050f','#0a0a22','#141236','#22184a','#30205a']);
 this._finMoon(X(250)-camX*.05,Y(26),12*z);
 for(let i=-2;i<30;i++){const bx=Math.round(i*12-camX*.25),bw=8+this.rand(i*5+3)*7,T=Math.round(Y(96+this.rand(i*3+1)*40));this.rect(bx,T,bw,deck-T,this.c(i&1?'#100f26':'#15142e'));for(let wy=T+3;wy<deck;wy+=4)for(let wx=bx+2;wx<bx+bw-1;wx+=3)if(this.rand(i*977+wy*7+wx)<.22)this.px(wx,wy,this.c(this.rand(wx*3+wy)<.6?'#ffcf7a':'#9fe8ff'));}
 this._finBridgeBack(camX,deck,top,k);this._finBridgeFront(camX,deck,top);
 // Deck boards running toward the lens, wet.
 this.rect(0,deck+1,W,H-deck,(x,y)=>{const f=(y-deck)/(H-deck),u=(x-160)/(1+f*1.4)+160+camX*1.0,seam=((Math.round(u)%14)+14)%14===0;return this.c(seam?'#120c18':this.d(x,y)<.15+f*.1?'#2e2436':'#221a2c');});
 const lampX=[];{const s=(deck-top)/78,panel=52*s,off=((camX%panel)+panel)%panel;for(let i=-1;i<W/panel+2;i++){const x=Math.round(i*panel-off),id=Math.floor((camX+i*panel)/panel);if((((id%2)+2)%2)===0)lampX.push(x+24*s);}}
 for(const lx of lampX)this.glow(lx,deck+10,30,'#ffb04a',.22,.3);
 // The two of them: two last steps, then still. Arms rise toward each other from bar 153.
 const walking=lt<1,u=Film.ease((lt-1.6)/4.2),h=110*z,G=Y(166);
 const mx=X(walking?42+70*lt:112),hx=X(walking?278-70*lt:208),wk=walking?walkAt(t):0;
 const arm=[.06+(1.22-.06)*u,.18+(.08-.18)*u],armB=[.05,.2];
 this.beginLayer();const pm=this.person({x:mx,y:G,h,dir:1,walk:wk,who:'milton',pose:walking?'walk':'stand',arms:walking?null:[arm,armB]});this.endLayer('#ffb04a',-1);
 this.beginLayer();const ph=this.person({x:hx,y:G,h,dir:-1,walk:wk+.5,who:'her',pose:walking?'walk':'stand',arms:walking?null:[arm,armB]});this.endLayer('#ffb04a',1);
 const a=pm.hands[0],b=ph.hands[0],d=Math.hypot(b[0]-a[0],b[1]-a[1]),tight=Film.ease((lt-2)/5);
 const gl=.45+tight*.55;
 this.glow((a[0]+b[0])/2,(a[1]+b[1])/2,10+tight*14,'#ff5a6a',.2+tight*.3+k*.1);
 this.redThread(a[0]+(-1),a[1]-2,b[0]+1,b[1]-2,Math.max(.5,d*.12*(1-tight)),t,gl,1-tight*.9);
 if(tight>.5){this.px(a[0]-1,a[1]-2,this.c('#ffd0d0'));this.px(b[0]+1,b[1]-2,this.c('#ffd0d0'));}
 this.rain(t,Math.max(.04,.9*Math.pow(1-lt/8,1.5)),camX);
};

// A raised hand from below (fist, pinky held out toward the other one). side 1 = comes from the left.
F._finRaisedHand=function(fx,fy,side,who,S){
 const P=Film.CAST[who],c=k=>this.c(P[k]),sx=fx-side*S*1.5,sy=fy+S*3.2;
 this.quad(sx-side*S*.4,sy+S*2,sx,sy,S*1.25,S*1.2,c('sleeve'));this.quad(sx,sy,fx-side*S*.55,fy+S*.75,S*1.15,S*1.0,c('cuff'));
 this.quad(fx-side*S*.62,fy+S*.9,fx-side*S*.48,fy+S*.55,S*1.0,S*.95,c('cuff'));
 this.ellipse(fx,fy,S*.62,S*.56,(x,y,dx,dy)=>side*dx<-.3||dy>.4?c('skinShade'):c('skin'));
 for(let i=0;i<3;i++)this.rect(fx+side*S*.18-(side<0?S*.18:0),fy-S*.4+i*S*.3,Math.max(1,S*.18),1,c('skinDark'));
 this.quad(fx+side*S*.35,fy+S*.22,fx+side*S*.95,fy-S*.02,S*.26,S*.22,c('skin'));
 return [fx+side*S*1.02,fy-S*.04];
};

// ── Close two-shot: their profiles face each other and smile; below, the thread between their raised hands glows.
// On the downbeat of bar 158 a soft bloom of warm light. Slow push-in.
F.shotFaces=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,bl=lt>=B(158)-B(156)?Math.exp(-(lt-(B(158)-B(156)))*.9):0,S=110+lt*1.2,g=44-lt*.9,oy=19-lt*.6;
 this.vgrad(0,0,W,H,['#07061a','#0e0b26','#181236','#1f1640']);
 const bk=[[40,40,22,'#ffb04a'],[110,20,14,'#ff3fa4'],[205,30,18,'#3af0ff'],[285,60,24,'#ffb04a'],[18,120,20,'#3af0ff'],[300,140,18,'#ff3fa4'],[160,80,16,'#ffb04a'],[250,10,12,'#ffe14a']];
 for(const [x,y,r,col] of bk)this._finBokeh(160+(x-160)*(1+lt*.02),y,r,col,.16);
 if(bl>0)this.glow(160,100,110,'#ffcf8a',bl*.55,.9);
 this.glow(160,95,50,'#ff6a7a',.12+bl*.2);
 const rimF=bl>.3?'#ffe6c8':'#ffa0b8';
 this.beginLayer();this.portrait({x:160-g/2-.93*S,y:oy,S,who:'milton',dir:1,smile:lt>1.4,blink:(lt>3.1&&lt<3.22)||(lt>6.4&&lt<6.52),rimFront:rimF,kick:0});this.endLayer();
 this.beginLayer();this.portrait({x:160+g/2+.905*S,y:oy+2,S,who:'her',dir:-1,smile:lt>2.1,blink:(lt>5.0&&lt<5.12),rimFront:rimF,rimBack:'#ff8fd0',kick:0});this.endLayer();
 // Raised hands at the bottom, the thread taut between the pinkies.
 const hs=17,hy=176-Math.sin(Math.min(1,lt/1.5)*Math.PI/2)*16;
 this.beginLayer();const pa=this._finRaisedHand(160-30,hy,1,'milton',hs);const pb=this._finRaisedHand(160+30,hy+1,-1,'her',hs);this.endLayer(bl>.3?'#ffe6c8':'#ffb0c0',1);
 this.glow(160,hy-1,20+bl*16,'#ff3a4a',.4+k*.15+bl*.3);this.glow(160,hy-1,8,'#ff9a9a',.5+bl*.4);
 this.redThread(pa[0],pa[1],pb[0],pb[1],.4,t,1,0);
 this.px(pa[0],pa[1],this.c('#ffe0e0'));this.px(pb[0],pb[1],this.c('#ffe0e0'));
 // The bloom also washes over their faces.
 if(bl>.05)this.glow(160,90,90,'#ffe0b0',bl*.3,.9);
 // After the bloom: a few warm motes drift up.
 if(bl>0)for(let i=0;i<24;i++){const ph=((lt-4)*.25+this.rand(i))%1,x=160+(this.rand(i+5)-.5)*220+Math.sin(lt+i)*4,y=170-ph*170;if(this.d(Math.round(x),Math.round(y))<(1-ph)*.9)this.px(x,y,this.c(i%3?'#ffd8a0':'#ffb0c0'));}
 this.rain(t,.06);
};

// Twinkling stars for the clearing sky; amt 0..1 fades them in, camY scrolls (tilt), seed picks the field.
F._finStars=function(amt,t,camY=0,yMax=180,n=90,seed=0){
 if(amt<=0)return;const W=this.W;
 for(let i=0;i<n;i++){const x=Math.floor(this.rand(i*7+seed)*W),wy=this.rand(i*13+seed)*(yMax+400)-400,y=Math.round(wy-camY);if(y<0||y>=yMax)continue;
  const tw=.5+.5*Math.sin(t*(1.5+this.rand(i+3)*3)+i),on=this.rand(i*3+1+seed)<amt;if(!on)continue;const big=this.rand(i*5+seed)<.12;
  this.px(x,y,this.c(tw>.7?'#ffffff':tw>.35?'#c8c8f0':'#6a6aa0'));if(big&&tw>.5){this.px(x-1,y,this.c('#8a8ac0'));this.px(x+1,y,this.c('#8a8ac0'));this.px(x,y-1,this.c('#8a8ac0'));this.px(x,y+1,this.c('#8a8ac0'));}}
};

// ── Wide tracking shot: walking together across the bridge, hand in hand through a short glowing thread.
F.shotTogether=function(lt,t){
 const W=this.W,H=this.H,k=Film.beat(t).kick,camX=200+lt*26,deck=124,top=46,h=46,wk=walkAt(t),a=wk*Math.PI*2;
 this.vgrad(0,0,W,deck,['#05050f','#0a0a22','#141236','#22184a','#30205a']);
 this._finStars(.8,t,0,90,140,5);
 this._finMoon(250-lt*1.5,30,14);
 this._finFarCity(camX,deck,t,k);
 this._finBridgeBack(camX,deck,top,k);
 const X=112+lt*3.2,sw=Math.sin(a)*.08;
 this.beginLayer();const ph=this.person({x:X-21,y:deck-1,h:h-2,dir:1,walk:wk,who:'her',arms:[[.42+sw,.25],null]});this.endLayer('#ffb04a',1);
 this.beginLayer();const pm=this.person({x:X,y:deck,h,dir:1,walk:wk,who:'milton',arms:[null,[-.36+sw,.3]]});this.endLayer('#ffb04a',1);
 const p=ph.hands[0],q=pm.hands[1];
 this.glow((p[0]+q[0])/2,(p[1]+q[1])/2,9,'#ff3a4a',.45+k*.15);
 this.redThread(p[0],p[1],q[0],q[1],1.5+Math.sin(a*2)*.8,t,1,.4);
 this._finBridgeFront(camX,deck,top);
 this.reflect(deck+10,H,deck+9,'#07071a',t,2.4,.65);
 this.rain(t,.08,camX);
};

// ── From behind, at deck level: one-point perspective down the bridge. They walk away together toward the city lights,
// the thread between their hands swinging. The lens creeps after them.
F.shotTogetherLow=function(lt,t){
 const W=this.W,H=this.H,k=Film.beat(t).kick,hz=96,f=150,cz=lt*.14,cy=.55+lt*.01,wk=walkAt(t);
 const S=(x,y,z)=>{const zz=Math.max(.05,z-cz);return [160+f*x/zz,hz-f*(y-cy)/zz];};
 this.vgrad(0,0,W,hz+2,['#05050f','#0a0a22','#141236','#261a4e','#3a2462']);
 this._finStars(.9,t,0,70,160,9);
 this.glow(160,hz,120,'#ff6aa0',.3,.35);
 // City lights at the far end of the bridge.
 for(let i=0;i<22;i++){const bx=96+i*6+Math.floor(this.rand(i)*4),bw=5+Math.floor(this.rand(i+9)*5),th=6+Math.floor(this.rand(i*3)*26*(1-Math.abs(i-11)/14));this.rect(bx,hz-th,bw,th,this.c(i&1?'#1a1534':'#211a3e'));
  for(let wy=hz-th+2;wy<hz;wy+=2)for(let wx=bx+1;wx<bx+bw-1;wx+=2)if(this.rand(i*97+wy*7+wx)<.35)this.px(wx,wy,this.c(this.rand(wx+wy*3)<.6?'#ffcf7a':this.rand(wx*7+wy)<.5?'#ff8fd0':'#9fe8ff'));}
 this.glow(160,hz-4,46,'#ffb04a',.35+k*.1,.4);
 // Deck: planks across, curbs, wet sheen.
 this.rect(0,hz,W,H-hz,(x,y)=>{const zz=f*cy/Math.max(.5,y-hz+.5)+cz,lx=(x-160)*(zz-cz)/f;if(Math.abs(lx)>4.2)return this.c('#0c0a16');const pz=zz*2.6,pl=Math.floor(pz)%2,seam=pz-Math.floor(pz)<.09*(zz-cz)+.04;const curb=Math.abs(lx)>3.7;
  if(curb)return this.c(Math.abs(lx)<3.78?'#5a4a72':'#2e2640');if(seam)return this.c('#120c18');return this.c(pl?(this.d(x,y)<.25?'#2c2238':'#262032'):(this.d(x,y)<.2?'#2e2438':'#211a2c'));});
 // Truss walls: posts, diagonals, chords; lamps on the posts every 4 m.
 const iron=this.c('#2a2440'),hl=this.c('#5e5384'),rivet=this.c('#7a6fa0');
 for(let z=40;z>=1;z-=2){if(z-cz<.4)continue;const z2=z+2;
  for(const sd of [-1,1]){const [x0,yb]=S(sd*4,0,z),[,yt]=S(sd*4,5,z),[x1,yb1]=S(sd*4,0,z2),[,yt1]=S(sd*4,5,z2),w=Math.max(1,16/(z-cz));
   this.line(x0,yb,x1,yt1,iron,Math.max(1,w*.5));this.line(x0,yt,x1,yb1,iron,Math.max(1,w*.5));
   this.line(x0,yt,x1,yt1,iron,Math.max(1,w*.7));const [,yc]=S(sd*4,.6,z),[,yc1]=S(sd*4,.6,z2);this.line(x0,yc,x1,yc1,iron,Math.max(1,w*.7));
   this.rect(x0-w/2,yt,w,yb-yt,iron);this.rect(sd<0?x0+w/2-1:x0-w/2,yt,1,yb-yt,hl);
   if(z-cz<14)for(let r=0;r<6;r++){const [rx,ry]=S(sd*4,r*.8+.6,z);this.px(rx+(sd<0?1:-1),ry,rivet);}}
  const [lx,ly]=S(-4,5,z),[rx]=S(4,5,z);if(z-cz>6)this.line(lx,ly,rx,ly,iron,Math.max(1,10/(z-cz)));
  if(z%4===0){for(const sd of [-1,1]){const [px0,py0]=S(sd*3.6,0,z),[,py1]=S(sd*3.6,3.2,z),w=Math.max(1,6/(z-cz));this.rect(px0-w/2,py1,w,py0-py1,this.c('#3a3456'));this.rect(px0-w*2,py1-w,w*4,w,this.c('#ffcf8a'));this.glow(px0,py1,Math.min(60,90/(z-cz)),'#ffb04a',.45+k*.15);
   const [gx,gy]=S(sd*2.6,0,z);this.glow(gx,gy,Math.min(70,150/(z-cz)),'#ffb04a',.25,.3);}}}
 // Wet deck: the lamps smear long reflections toward the lens.
 for(let z=4;z<=40;z+=4){if(z-cz<1)continue;for(const sd of [-1,1]){const [rx,ry]=S(sd*3.3,0,z),len=Math.min(90,260/(z-cz)),w=Math.max(1,8/(z-cz));for(let j=0;j<len;j++){const y=ry+j;if(y>=H)break;for(let q=-w;q<=w;q++){const x=rx+q+Math.sin(j*.7+t*3)*.8;if(this.d(Math.round(x),Math.round(y))<(1-j/len)*.55*(1-Math.abs(q)/(w+1)))this.px(x,y,this.c(j<len*.3?'#ffcf8a':'#c07a3a'));}}}}
 // The two of them, from behind.
 const zP=2.5+lt*.36,a=wk*Math.PI*2;
 const [hxm,gym]=S(-.42,0,zP),[hxh,gyh]=S(.42,0,zP),hgt=f*1.75/(zP-cz),hh=f*1.66/(zP-cz);
 this.beginLayer();this.personBack({x:hxm,y:gym,h:hgt,walk:wk,who:'milton'});this.endLayer('#ffb04a',-1);
 this.beginLayer();this.personBack({x:hxh,y:gyh,h:hh,walk:wk,who:'her'});this.endLayer('#ffb04a',1);
 const hand=(X,G,h,i)=>{const bob=Math.abs(Math.cos(a))*h*.012,shY=G-h*.79-bob,sgn=i?-1:1;return [X+sgn*h*.12*1.05,shY+h*.3+Math.sin(a+i*Math.PI)*h*.03+h*.02];};
 const p=hand(hxm,gym,hgt,0),q=hand(hxh,gyh,hh,1);
 this.glow((p[0]+q[0])/2,(p[1]+q[1])/2+3,10,'#ff3a4a',.45+k*.15);
 this.redThread(p[0],p[1]+1,q[0],q[1]+1,3+Math.sin(a*2)*2.5,t,1,1.5);
 const fy=Math.round(Math.max(gym,gyh))+1;this.reflect(fy,Math.min(H,fy+Math.round(hgt*.6)),fy-1,'#211a2c',t,1,.3);
 this.rain(t,.04);
};

// A thread in any direction with a lateral ripple (redThread only ripples vertically).
F._finThreadLine=function(x0,y0,x1,y1,t,glow,wob){
 const n=Math.max(2,Math.ceil(Math.hypot(x1-x0,y1-y0))),l=Math.hypot(x1-x0,y1-y0)||1,nx=-(y1-y0)/l,ny=(x1-x0)/l,core=this.c('#ff2a3a'),hi=this.c('#ff9a9a'),gl=this.c('#a0142a');
 for(let i=0;i<=n;i++){const f=i/n,o=Math.sin(f*l*.06-t*2.2)*wob*Math.sin(f*Math.PI),x=x0+(x1-x0)*f+nx*o,y=y0+(y1-y0)*f+ny*o;
  if(glow>0&&i%2===0)for(let k=-3;k<=3;k++)if(k&&this.d(Math.round(x+nx*k),Math.round(y+ny*k))<glow*(1-Math.abs(k)/4)*.5)this.px(x+nx*k,y+ny*k,gl);
  this.px(x,y,core);if(this.d(Math.round(x),Math.round(y))<.3)this.px(x+nx,y+ny,hi);}
};
// A bright star with a four-point twinkle.
F._finStar=function(x,y,r,col,t){
 const c=this.c(col),w=this.c('#ffffff');this.glow(x,y,r*2.4,col,.5);
 for(let i=1;i<=r;i++){const f=1-i/(r+1);const cc=f>.5?w:c;this.px(x+i,y,cc);this.px(x-i,y,cc);this.px(x,y+i,cc);this.px(x,y-i,cc);}
 this.rect(x-1,y-1,3,3,w);if(r>4){this.px(x+1,y+1,c);this.px(x-1,y-1,c);this.px(x+2,y+2,c);this.px(x-2,y-2,c);this.px(x+2,y-2,c);this.px(x-2,y+2,c);}
};

// ── 16-second tilt up: from the two of them on the bridge, joined hands raised, to the night sky. Stars come out;
// the thread rises from their hands into the sky and draws a line between two bright stars.
F.shotSkyTilt=function(lt,t){
 const W=this.W,H=this.H,k=Film.beat(t).kick,tilt=Film.ease((lt-1.2)/11.5),camY=-tilt*372,Y=y=>Math.round(y-camY);
 // Sky: the gradient lives in world space, deep at the zenith.
 this.rect(0,0,W,H,(x,y)=>{const wy=y+camY,v=Math.max(0,Math.min(1,(wy+420)/600))**2.2*5;return this.c(['#03030a','#05050f','#090920','#100f2c','#1a1640','#2a1e52'][Math.max(0,Math.min(5,Math.floor(v+this.d(x,y))))]);});
 if(Y(140)<H+60)this.glow(160,Y(150),150,'#4a1f5a',.4,.35);
 // Stars fade in as we rise; a few twinkle hard.
 const sAmt=Math.min(1,.25+tilt*1.1);
 for(let i=0;i<260;i++){const x=Math.floor(this.rand(i*7+3)*W),wy=-420+this.rand(i*13+1)*480,y=Y(wy);if(y<0||y>=H||this.rand(i*3+11)>sAmt*(1-Math.max(0,wy+0)/120))continue;
  const tw=.5+.5*Math.sin(t*(1.2+this.rand(i+3)*3)+i*1.7);this.px(x,y,this.c(tw>.75?'#ffffff':tw>.4?'#c8c8f0':'#5a5a90'));
  if(this.rand(i*5+2)<.1&&tw>.6){const c=this.c('#8a8ac0');this.px(x-1,y,c);this.px(x+1,y,c);this.px(x,y-1,c);this.px(x,y+1,c);}}
 // Wisps of cloud crossing the moon.
 this._finMoon(246,Y(-150),15);
 for(let i=0;i<4;i++){const cy=Y(-60-i*62),cx=((i*131+lt*(2.5+i*.8))%460)-90;if(cy<-20||cy>H+20)continue;
  for(let j=0;j<4;j++){const ex=cx+j*22-(j&1)*6,ey=cy-(j===1||j===2?3:0),rx=26-Math.abs(j-1.5)*4,ry=4.5;this.ellipse(ex,ey,rx,ry,(x,y,dx,dy)=>this.d(x,y)<.55-dy*.2?this.c(dy<-.5?'#3a3268':'#1c1840'):0);}}
 // The bridge at the bottom of the world.
 const deck=Y(150),top=Y(98);
 if(top<H+10){
  this._finFarCity(0,deck,t,k,.12,deck-70,40);
  this._finBridgeBack(30,deck,top,k);
 }
 const raise=Film.ease(lt/1.6),arm=[.06+(2.45-.06)*raise,.18+(.12-.18)*raise],h=34;
 let hands=[160,deck-h*1.1];
 if(top<H+10){
  this.beginLayer();const pm=this.person({x:151,y:deck,h,dir:1,who:'milton',pose:'stand',arms:[arm,null]});this.endLayer('#ffb04a',-1);
  this.beginLayer();const ph=this.person({x:169,y:deck,h:h-1,dir:-1,who:'her',pose:'stand',arms:[arm,null]});this.endLayer('#ffb04a',1);
  hands=[(pm.hands[0][0]+ph.hands[0][0])/2,(pm.hands[0][1]+ph.hands[0][1])/2-1];
  this._finBridgeFront(30,deck,top);
  if(deck+10<H)this.reflect(deck+10,H,deck+9,'#07071a',t,2.4,.65);
 }else hands=[160,Y(150-h*1.1)];
 // The thread rises from their hands to 41 Arietis, then stitches the constellation of Aries:
 // 41 Ari → Hamal (α, the brightest) → Sheratan (β) → Mesarthim (γ). Each star flares as the thread reaches it.
 const ARIES=[[84,-338],[168,-312],[214,-296],[223,-279]],A=ARIES[0],rise=Film.ease((lt-1.4)/9.8),tipW=112-(112-A[1])*rise,hx=hands[0];
 if(lt>1.4){const ax=hx+(A[0]-hx)*((112-tipW)/(112-A[1]));this._finThreadLine(hx,hands[1],ax,Y(tipW),t,.8,3*(1-rise));if(rise<1)this.glow(ax,Y(tipW),8,'#ff5a6a',.6);}
 const segT=[11.2,12.5,13.4],segD=[1.3,.9,.6],reach=[11.2];
 for(let i=0;i<3;i++){const p=ARIES[i],q=ARIES[i+1],f=Film.ease((lt-segT[i])/segD[i]);reach.push(segT[i]+segD[i]);if(f<=0)continue;
  const bx=p[0]+(q[0]-p[0])*f,by=p[1]+(q[1]-p[1])*f;this._finThreadLine(p[0],Y(p[1]),bx,Y(by),t,.9,.8*(1-f));if(f<1)this.glow(bx,Y(by),8,'#ff5a6a',.6);}
 // Faint background stars of the ram, then the name once the figure is complete.
 for(const s2 of [[120,-350],[196,-330],[240,-262],[150,-284]])this._finStar(s2[0],Y(s2[1]),1,'#8a9ad8',t);
 ARIES.forEach((st,i)=>{const on=Math.min(1,Math.max(0,(lt-reach[i])/.4)),big=i===1?2:i===3?0:1,fl=on>0&&on<1?Math.round((1-on)*3):0;
  this._finStar(st[0],Y(st[1]),2+big+Math.round(on*2)+fl+(on>=1&&i===1?Math.round(k*1.5):0),on>0?'#ffd0d8':'#c8c8f0',t);});
 const lab=Math.min(1,Math.max(0,(lt-14.4)/.8));
 if(lab>0){const tx=Math.round(ARIES[1][0]-this.textW('ARIES',2,2)/2),ty=Y(-296)+22;this.text('ARIES',tx,ty,(r,q)=>this.d(tx+q*2,ty+r*2)<lab*.95?this.c('#d8c8ff'):0,2,2);}
};

// ── End title over the starry sky: BENDITO ERROR drops in letter by letter (same rendering as shotTitle), the name types
// in between pink dashes, and the red thread draws itself as an underline. Then hold (the player fades out).
F.shotEndTitle=function(lt,t){
 const W=this.W,H=this.H;this.vgrad(0,0,W,H,['#03030a','#05050f','#090920','#100f2c','#1a1440']);
 this.glow(160,196,190,'#4a1f5a',.5,.35);this.glow(60,200,90,'#1f3a5a',.35,.4);
 // Stars (the same sky the camera rose into), twinkling.
 for(let i=0;i<200;i++){const x=Math.floor(this.rand(i*7+3)*W),y=Math.floor(this.rand(i*13+1)*H*.95);const tw=.5+.5*Math.sin(t*(1.2+this.rand(i+3)*3)+i*1.7);if(this.rand(i*3+11)>.8-y/H*.5)continue;
  this.px(x,y,this.c(tw>.75?'#ffffff':tw>.4?'#b8b8e8':'#4a4a80'));if(this.rand(i*5+2)<.08&&tw>.6){const c=this.c('#7a7ab0');this.px(x-1,y,c);this.px(x+1,y,c);this.px(x,y-1,c);this.px(x,y+1,c);}}
 this._finStar(36,150,3,'#ffd0d8',t);this._finStar(290,22,3,'#ffd0d8',t);
 // Title letters: scale-7 font, sun-ramp gradient, ink outline, shadow, dropping in one by one.
 const ink=this.c('#120a18'),ramp=['#fff1c2','#fff1c2','#ffc46b','#ff7a5c'],shadow=this.c('#05040c');
 const lines=['BENDITO','ERROR'],s=7;let idx=0;
 lines.forEach((ln,li)=>{const x0=Math.round((W-this.textW(ln,s,1))/2),y0=24+li*44;
  for(let n=0;n<ln.length;n++,idx++){const g=ArcadeGame.font[ln[n]],appear=.5+idx*.14;if(lt<appear)continue;const k=Math.min(1,(lt-appear)/.45),drop=Math.round(k<1?-(1-k)*(1-k)*70:0),x=x0+n*4*s,y=y0+drop;
   for(let pass=0;pass<3;pass++)for(let r=0;r<5;r++)for(let q=0;q<3;q++){if(g[r*3+q]!=='1')continue;const bx=x+q*s,by=y+r*s;
    if(pass===0)this.rect(bx+2,by+3,s,s,shadow);else if(pass===1)this.rect(bx-1,by-1,s+2,s+2,ink);
    else this.rect(bx,by,s,s,(i,j)=>{const f=(r*s+(j-by))/(5*s)*3.99;return this.c(ramp[Math.min(3,Math.floor(f+this.d(i,j)))]);});}}});
 // The red thread underlines the title, drawing itself from left to right with a bright needle point.
 const ux0=58,ux1=262,uy=116,dr=Film.ease((lt-2.2)/1.8);
 if(dr>0){const xe=ux0+(ux1-ux0)*dr;this.redThread(ux0,uy,xe,uy,1.2*dr,t,.7+(dr>=1?Film.beat(t).kick*.25:0),dr<1?.9:.4);
  if(dr<1){this.glow(xe,uy+1,10,'#ff5a6a',.7);this.px(xe,uy,this.c('#ffffff'));this.px(xe+1,uy,this.c('#ffd0d8'));}}
 const name='MILTON VALENZUELA',shown=name.slice(0,Math.max(0,Math.floor((lt-2.6)*12)));
 if(shown){const w=this.textW(name,2,2),x=Math.round((W-w)/2);this.rect(x-14,136,8,1,this.c('#ff3fa4'));this.rect(x+w+6,136,8,1,this.c('#ff3fa4'));this.text(shown,x,132,this.c('#e8f6ff'),2,2);}
};

// A laser ray: a hard 1px core with a dithered halo, from (x0,y0) along angle a.
F._finLaser=function(x0,y0,a,len,col,core,amt){
 const c=this.c(col),cc=this.c(core),dx=Math.cos(a),dy=Math.sin(a),nx=-dy,ny=dx;
 for(let i=4;i<len;i++){const x=x0+dx*i,y=y0+dy*i;if(x<-2||x>this.W+2||y<-2||y>this.H+2){if(i>40)break;continue;}const f=1-i/len;
  this.px(x,y,f>.35?cc:c);if(this.d(Math.round(x+nx),Math.round(y+ny))<amt*f)this.px(x+nx,y+ny,c);if(this.d(Math.round(x-nx),Math.round(y-ny))<amt*f*.7)this.px(x-nx,y-ny,c);}
};

// String of party bulbs hanging in a catenary between (x0,y0) and (x1,y1), sag in px; bulbs flicker in a chase on the beat.
F._finFestoon=function(x0,y0,x1,y1,sag,t,seed){
 const bt=Film.beat(t),n=Math.ceil(Math.abs(x1-x0)/11),cols=['#ffcf7a','#ff8fd0','#9ff4ff','#ffe14a'],wire=this.c('#1a1626');let px=x0,py=y0;
 for(let i=0;i<=n;i++){const f=i/n,x=x0+(x1-x0)*f,y=y0+(y1-y0)*f+Math.sin(f*Math.PI)*sag;this.line(px,py,x,y,wire);px=x;py=y;
  if(i===0||i===n)continue;const col=cols[(i+seed)%4],on=((i+bt.n+seed)%4)!==0||bt.kick<.3;this.px(x,y+1,wire);this.rect(x-1,y+2,2,3,this.c(on?col:'#3a3048'));if(on){this.px(x-1,y+2,this.c('#ffffff'));this.glow(x,y+3,6,col,.45);}}
};

// ── Medium: Milton solos; lasers fan out from behind him on the beat, the rooftop crowd throws its hands up in front.
// The camera arcs slowly (background and crowd drift in opposite directions).
F.shotKeytarLasers=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,n=bt.n,down=n%4===0,arc=(lt/8-.5)*44,kt=Math.floor(bt.b*2);
 this.vgrad(0,0,W,H,['#04040c','#08081a','#100c28','#1c1238','#2a1846']);
 this._finSkyline(-arc*2.2,150,t,0,60,['#0b0a1e','#0e0d24','#1a1838']);
 this._finSkyline(-arc*3,166,t,1,46,['#100e28','#13112e','#24224a']);
 // Haze bank behind him that catches the light; festoon bulbs strung across the roof.
 this.glow(150+arc*.3,120,120,'#3a1f5a',.45,.5);
 this._finFestoon(-40-arc*1.2,18,360-arc*1.2,30,26,t,0);this._finFestoon(-60-arc*1.6,44,380-arc*1.6,10,30,t,3);
 // Lasers: a fan from behind his shoulders. Each beat re-aims the fan; the downbeat flips the colour and flashes white.
 const X=150+arc*.15,h=176,G=212+Math.round(k*2),ox=X-8,oy=G-h*.66;
 const pal=[['#ff3fa4','#ffd0ea'],['#3af0ff','#e0fdff'],['#ffe14a','#fff8d0'],['#3af0ff','#e0fdff']],bar=Math.floor(n/4),[lc,lcore]=pal[((bar%4)+4)%4];
 const beatInBar=((n%4)+4)%4,spread=[1.25,.75,1.05,.6][beatInBar]+Math.sin(bt.ph*Math.PI)*.08,rot=Math.sin(t*.9)*.25+[0,.18,-.12,.08][beatInBar],N=11;
 for(let i=0;i<N;i++){const a=-Math.PI/2+rot+(i/(N-1)-.5)*2*spread;this._finLaser(ox,oy,a,420,down&&k>.5?'#ffffff':lc,lcore,.35+k*.5);}
 // Cross beams from the truss corners, scanning in eighths.
 for(const sd of [-1,1]){const cx=sd<0?-4:W+4,a0=sd<0?.35:Math.PI-.35,sweep=Math.sin(bt.b*Math.PI*.5+(sd>0?1:0))*.3;for(let j=0;j<3;j++)this._finLaser(cx,-4,a0+sd*(sweep+j*.12),380,sd<0?'#ff3fa4':'#3af0ff',sd<0?'#ffd0ea':'#e0fdff',.25+k*.3);}
 this.glow(ox,oy,24,lc,.5+k*.4);this.glow(ox,oy,8,'#ffffff',.6);
 // Milton.
 this.beginLayer();
 this.person({x:X,y:G,h,dir:1,who:'milton',pose:'keytar',arms:[[-.28+Math.sin(bt.b*Math.PI)*.08,1.5],[.95,.75]],mid:p=>{this._finKeytar(X-h*.19,G-h*.47,-.42,h*.44,h*.11,1,(kt*5)%11,.5+k*.5);}});
 this.endLayer(k>.5?'#ffffff':lc==='#ffe14a'?'#ffe9a0':lcore,-1);
 // Thin haze in front of him, then the crowd.
 for(let i=0;i<16;i++){const x=((this.rand(i)*W*1.5+lt*(5+this.rand(i+5)*7)+arc*2)%(W+80)+W+80)%(W+80)-40,y=150+this.rand(i+9)*24;this.glow(x,y,18+this.rand(i+2)*12,'#3a2858',.4,.4);}
 this._finCrowd(t,150,1.05,arc,2.6,'#120d1e',k>.5?'#ff8fd0':'#8a3a7a',21,.55);
 this._finCrowd(t,166,1.45,arc,4.2,'#06050a',k>.5?lcore:lc,29,.45);
};

// ── Close-up: Milton lost in the solo, eyes shut, nodding hard on every kick; sweat flies off in glints; the keytar's
// headstock bobs into frame. Lasers and bokeh flash behind him.
F.shotBeanieNod=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,n=bt.n,pal=[['#ff3fa4','#ffd0ea'],['#3af0ff','#e0fdff'],['#ffe14a','#fff8d0'],['#3af0ff','#e0fdff']],[lc,lcore]=pal[((Math.floor(n/4)%4)+4)%4];
 this.vgrad(0,0,W,H,['#06051a','#0c0a24','#160f30','#1e1438']);
 const shake=k>.7?(n&1?1:-1):0;
 // Lasers behind him, then bokeh.
 const beatInBar=((n%4)+4)%4,spread=[1.2,.7,1.0,.55][beatInBar],rot=Math.sin(t*.9)*.25;
 for(let i=0;i<9;i++){const a=-Math.PI/2+rot+(i/8-.5)*2*spread;this._finLaser(120+shake,150,a,420,k>.6&&beatInBar===0?'#ffffff':lc,lcore,.3+k*.4);}
 const bk=[[230,40,26,'#ff3fa4'],[290,110,30,'#3af0ff'],[200,150,18,'#ffb04a'],[262,10,16,'#ffe14a'],[20,30,22,'#3af0ff'],[40,150,20,'#ff3fa4']];
 bk.forEach(([x,y,r,col],i)=>this._finBokeh(x-lt*4,y,r,col,.16+((i+n)%3===0?k*.3:0)));
 // The nod: down on the kick, back up through the beat.
 const nod=Math.pow(1-bt.ph,2.2),S=122+lt*1.5,ox=58+nod*4+shake-lt*1.2,oy=20+nod*9-lt*.6;
 this.beginLayer();
 this.portrait({x:ox,y:oy,S,who:'milton',dir:1,blink:true,open:nod>.55&&(n%2===0),smile:nod<=.55,kick:k,rimFront:k>.5?'#ffffff':lcore,rimBack:lc,sweat:(lt*1.7)%1});
 this.endLayer();
 // Sweat thrown off the beanie on each nod: drops arc out with four-point glints.
 for(let j=0;j<12;j++){const ph=bt.ph,sx=ox+S*(.45+this.rand(j+n*7)*.4),sy=oy+S*(.0+this.rand(j*3+n)*.3),vx=(this.rand(j*5+n)-.15)*90,vy=-50-this.rand(j*11+n)*60,x=sx+vx*ph,y=sy+vy*ph+110*ph*ph;
  if(ph>.8)continue;const c=this.c(ph<.35?'#ffffff':'#bfefff');this.rect(x,y,2,2,c);this.px(x,y+2,this.c('#6ab8e0'));if(j%3===0&&ph<.45){const g=this.c(ph<.2?'#ffffff':'#8fd8f0');for(let r=2;r<=4;r++){this.px(x-r,y,g);this.px(x+1+r,y,g);this.px(x,y-r,g);this.px(x,y+1+r,g);}}}
 // The keytar headstock and ribbon rising into frame bottom-right, riding the same nod.
 this.beginLayer();
 {const bx=318+shake,by=222+nod*6,ang=-2.0,ux=Math.cos(ang),uy=Math.sin(ang),vx=-uy,vy=ux,P=(u,v)=>[bx+ux*u+vx*v,by+uy*u+vy*v],w=9,UV=(x,y)=>[(x+.5-bx)*ux+(y+.5-by)*uy,(x+.5-bx)*vx+(y+.5-by)*vy];
  this.poly([P(0,-w),P(124,-w),P(124,w),P(0,w)],(x,y)=>{const [u,v]=UV(x,y);if(u<46)return (Math.floor(u)%4===0)?this.c('#16141f'):this.c('#2a2a3a');if(v<-w*.15&&u<120)return this.d(x,y)<.3+k*.45?this.c('#e0fdff'):this.c('#3af0ff');return v>w*.5?this.c('#c4c6dc'):this.c('#f4f4fa');});
  this.poly([P(122,-w-1),P(168,-w-22),P(176,-w-18),P(150,w-2),P(132,w+3),P(122,w+1)],(x,y)=>{const [u,v]=UV(x,y);if(Math.abs(v-(-w-1-(u-122)*.38))<2.2&&u>128)return this.c('#3af0ff');return v<-w*.2&&this.d(x,y)<.45?this.c('#ff8fd0'):this.c('#ff3fa4');});
  const [rx,ry]=P(86,-w*.6);this.glow(rx,ry,24,'#3af0ff',.3+k*.35);}
 this.endLayer(k>.5?'#ffffff':lcore,-1);
};

// ── Tracking: she runs right→left along the riverside toward the iron bridge; the red thread on her pinky pulls ahead.
F.shotHerBridgeRun=function(lt,t){
 const W=this.W,H=this.H,k=Film.beat(t).kick,h=80,v=.27*h*4,cam=-v*lt,G=160,X=196;
 this.vgrad(0,0,W,112,['#05050f','#0a0a22','#141236','#22184a','#30205a']);
 this._finMoon(262,30,12);
 this._finFarCity(cam*.6,112,t,k,.1,60,34);
 // The bridge across the river, its near end sliding toward her.
 const bc=cam*.18,deck=102,top=52;
 this._finBridgeBack(bc,deck,top,k,-600,150,true);this._finBridgeFront(bc,deck,top,-600,150);
 {const ex=150-bc;this.rect(ex-6,deck,14,14,this.c('#1c1830'));this.rect(ex-6,deck,14,1,this.c('#4a4068'));}
 for(let i=0;i<4;i++){const px=150-bc-40-i*110;this.rect(px-5,deck+6,10,12,this.c('#16122a'));this.rect(px-5,deck+6,1,12,this.c('#3a3456'));}
 this.rect(0,112,W,34,this.c('#0a0a1e'));
 this.reflect(113,146,112,'#07071a',t,2,.6);
 // Promenade railing, then the wet flagstones she runs on.
 const rp=cam*.85,rail=this.c('#2a2440'),hl=this.c('#5a4f7a');
 this.rect(0,126,W,2,rail);this.rect(0,126,W,1,hl);this.rect(0,138,W,2,rail);
 for(let i=-1;i<W/22+2;i++){const x=Math.round(i*22-(((-rp)%22)+22)%22);this.rect(x,124,2,24,rail);this.px(x,124,hl);}
 this.rect(0,146,W,H-146,(x,y)=>{const u=Math.round(x+(-cam)),seam=((u+Math.floor((y-146)/7)*9)%26+26)%26===0||(y-146)%7===0;return this.c(seam?'#141022':this.d(x,y)<.12?'#2a2440':'#1e1a32');});
 this.rect(0,146,W,1,this.c('#4a4068'));
 // Her.
 this.beginLayer();const p=this.person({x:X,y:G,h,dir:-1,walk:((t-Film.BEAT0)/Film.P)/2,who:'her',pose:'run'});this.endLayer('#ffb04a',1);
 const hd=p.hands[0];
 this._finThreadLine(hd[0],hd[1],-6,deck-6,t,.7,1.5);this.glow(hd[0],hd[1],8,'#ff3a4a',.5);
 this.reflect(G+1,H,G,'#16122a',t,1.2,.4);
 // Lamp posts flashing past in the foreground.
 for(let i=-1;i<3;i++){const x=Math.round(i*190-(((-cam*1.35)%190)+190)%190)+60;this.rect(x,0,6,H,this.c('#0a0812'));this.rect(x+1,0,1,H,this.c('#3a2a40'));this.glow(x+3,20,30,'#ffb04a',.35);}
 this.rain(t,.8,cam);
};

// A rooftop block in side view: parapet, facade with windows dropping out of frame.
F._finRoof=function(x0,x1,y,seed){
 const W=this.W,H=this.H,a=Math.max(-5,x0),b=Math.min(W+5,x1);if(b<=a)return;
 this.rect(a,y,b-a,H-y,(x,yy)=>this.c(((x-x0)%30+30)%30<2?'#0e0c1c':'#16132a'));
 for(let wy=y+14;wy<H;wy+=14)for(let wx=x0+6;wx<x1-6;wx+=15){if(wx+8<a||wx>b)continue;const lit=this.rand(seed*97+wx*7+wy*13)<.4;this.rect(wx,wy,8,9,this.c(lit?(this.rand(wx+wy*3+seed)<.6?'#ffcf7a':'#9fe8ff'):'#0b0a18'));if(lit)this.rect(wx,wy+7,8,2,this.c('#c98a4a'));}
 this.rect(a,y-5,b-a,5,this.c('#2a2440'));this.rect(a,y-5,b-a,1,this.c('#5e5384'));this.rect(a,y,b-a,1,this.c('#0a0812'));
};

// ── Side shot: Milton sprints off the rooftop stage and leaps the gap to the next roof — the street lights far below —
// a big slow-motion arc with the thread taut from his pinky; he touches down on the downbeat of bar 144 (the cut).
F.shotLeap=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,h=56,T0=1.0,T1=B(144)-B(142);
 const u=Math.max(0,Math.min(1,(lt-T0)/(T1-T0))),fly=lt>=T0,yL=120,yR=130,edgeL=96,edgeR=236;
 const mxW=fly?edgeL-4+(268-edgeL+4)*u:edgeL-4-(T0-lt)*62,myW=fly?yL+(yR-yL)*u-4*62*u*(1-u):yL;
 const cam=(mxW-160)*.35,camY=fly?-Math.sin(u*Math.PI)*14:0;
 const tR=fly?B(142)+T0+(lt-T0)*.12:t; // slow motion: the rain nearly hangs in the air
 this.vgrad(0,0,W,H,['#05050f','#0a0a20','#141232','#221a48','#3a2462']);
 this._finMoon(70-cam*.05,34-camY*.2,12);
 // The city far below: a carpet of lights and street grids, hazy.
 const cy0=Math.round(112-camY*.3);
 this.vgrad(0,cy0,W,H-cy0,['#1a1238','#140f2c','#0d0b20']);
 for(let i=0;i<480;i++){const x=((this.rand(i*7)*W*1.3-cam*.25)%(W+40)+W+40)%(W+40)-20,y=cy0+3+Math.pow(this.rand(i*13),.7)*(H-cy0);this.px(x,y,this.c(['#ffcf7a','#9fe8ff','#ff8fd0','#ffe9b0'][i%4]));}
 for(let r=0;r<4;r++){const y=cy0+10+r*16+r*r*3;for(let x=0;x<W;x+=2)if(((x+Math.floor(t*30*(r&1?1:-1))+r*7)%9)<2)this.px(x,y,this.c(r&1?'#ff4a5a':'#ffe9b0'));}
 this.glow(160,cy0+30,140,'#4a2a6a',.3,.35);
 // Mid skyline with tops below the roofline (it is a long way down).
 this._finSkyline(cam*.5,cy0+16,t,0,4,['#120f28','#151330','#262248']);
 // Looking down the canyon between the two buildings: the street far below with traffic.
 {const gx0=edgeL-cam,gx1=edgeR-cam,sy=H-14;this.rect(gx0,sy-30,gx1-gx0,44,(x,y)=>this.d(x,y)<(y-sy+30)/50?this.c('#0a0816'):0);
  for(let i=0;i<10;i++){const x=gx0+((i*37+t*(i&1?40:-55))%(gx1-gx0)+(gx1-gx0))%(gx1-gx0);this.rect(x,sy+(i&1?3:7),2,1,this.c(i&1?'#ff4a5a':'#fff1c2'));}}
 // The two roofs: stage edge with a speaker and the truss end on the left, a water tank on the right.
 this._finRoof(-60-cam,edgeL-cam,yL-camY,3);this._finRoof(edgeR-cam,420-cam,yR-camY,7);
 this._finSpeaker(10-cam,yL-5-camY-40,30,40,k);this.rect(48-cam,yL-5-camY-110,4,110,this.c('#3a3654'));this._finTruss(-20-cam,52-cam,yL-5-camY-112,8,0);
 {const wx=300-cam,wy=yR-5-camY;this.rect(wx-14,wy-44,28,22,this.c('#1c1832'));this.poly([[wx-16,wy-44],[wx,wy-54],[wx+16,wy-44]],this.c('#1c1832'));for(const lx of [-12,-4,4,12])this.rect(wx+lx,wy-22,2,22,this.c('#1c1832'));}
 // Milton: running, then frozen mid-leap — front leg reaching, arm out toward her.
 const X=mxW-cam,G=myW-camY;
 this.beginLayer();
 const p=fly?this.person({x:X,y:G,h,dir:1,walk:.25,who:'milton',pose:'run',arms:[[1.95,.15],[-1.2,.5]]}):this.person({x:X,y:G,h,dir:1,walk:((t-Film.BEAT0)/Film.P)/2,who:'milton',pose:'run'});
 this.endLayer('#ff8fd0',-1);
 const hd=p.hands[0];this._finThreadLine(hd[0],hd[1],W+8,hd[1]-24-u*10,t,.8,fly?.3:1.2);this.glow(hd[0],hd[1],7,'#ff3a4a',.55);
 // Motion trail behind him in the slow-mo.
 if(fly)for(let j=1;j<6;j++){const uu=Math.max(0,u-j*.025),tx=edgeL-4+(268-edgeL+4)*uu-cam,ty=yL+(yR-yL)*uu-4*62*uu*(1-uu)-camY-h*.5;this.glow(tx,ty,6,'#ff3fa4',.35-j*.05);}
 this.rain(tR,.6,cam);
};

// One half of the split screen, drawn full-frame as if the runner runs right; the bridge's end comes to meet the runner.
F._finRunHalf=function(lt,t,who,h){
 const W=this.W,H=this.H,k=Film.beat(t).kick,G=142,X=70,v=.27*h*4,cam=v*lt,Xb=X+v*4.6,deck=G,top=G-74,bS=cam;
 this.vgrad(0,0,W,G,['#05050f','#0a0a22','#141236','#22184a','#30205a']);
 for(let i=0;i<40;i++){const x=Math.floor(this.rand(i*7+1)*W),y=Math.floor(this.rand(i*3+2)*60);this.px(x,y,this.c(this.rand(i)<.3?'#ffffff':'#8a8ac0'));}
 // The moon sits on the divider: each half holds one side of it.
 this._finMoon(160,30,13);
 this._finFarCity(cam*.6,G-16,t,k,.1,G-80,40);
 // Before the bridge: street blocks with signs; after: open river under the deck.
 for(let i=-1;i<12;i++){const bx=i*58-((cam*.55)%58),wx=bx+cam*.55;if(wx>Xb*.55+40)continue;const tp=40+this.rand(i*5+(who==='her'?9:0)+Math.floor(cam*.55/58)*7)*40;
  this.rect(bx,tp,52,G-tp,this.c(i&1?'#17152e':'#1b1834'));for(let wy=tp+6;wy<G-8;wy+=9)for(let wx2=bx+5;wx2<bx+48;wx2+=9)if(this.rand(Math.round(wx)*7+wy*13+wx2*3+(who==='her'?5:0))<.35)this.rect(wx2,wy,4,5,this.c(this.rand(wy+wx2*3)<.6?'#ffcf7a':'#9fe8ff'));
  if(this.rand(Math.round(wx)*3)<.4){const nc=['#ff3fa4','#3af0ff','#ffb04a'][((i%3)+3)%3];this.rect(bx+8,tp+10,36,4,this.c(nc));this.glow(bx+26,tp+12,16,nc,.4+k*.3,.5);}}
 this._finBridgeBack(bS,deck,top,k,Xb,1e5);
 // Ground: sidewalk before the bridge, deck over the river after it.
 const bx0=Xb-bS;
 this.rect(0,G,Math.max(0,Math.min(W,bx0)),H-G,(x,y)=>this.c(y===G?'#4a4068':((x+Math.round(cam))%16===0)?'#141022':this.d(x,y)<.15?'#2a2440':'#1e1a32'));
 if(bx0<W){const a=Math.max(0,bx0);this.rect(a,G+10,W-a,H-G-10,this.c('#0a0a1e'));}
 // The runner and the thread, pulled toward the divider.
 this.beginLayer();const p=this.person({x:X,y:G,h,dir:1,walk:((t-Film.BEAT0)/Film.P)/2+(who==='her'?.5:0),who,pose:'run'});this.endLayer(who==='her'?'#ffb04a':'#ff8fd0',-1);
 const hd=p.hands[0];this._finThreadLine(hd[0],hd[1],162,100,t,.7,1.4);this.glow(hd[0],hd[1],7,'#ff3a4a',.5);
 this._finBridgeFront(bS,deck,top,Xb,1e5);
 if(bx0<W){const a=Math.max(0,Math.round(bx0));this.reflect(G+10,H,G+9,'#07071a',t,2,.6);if(a>0)this.rect(0,G+1,a,H-G-1,(x,y)=>this.c(y===G+1?'#4a4068':((x+Math.round(cam))%16===0)?'#141022':this.d(x,y)<.15?'#2a2440':'#1e1a32'));}
 this.rain(t,.6,cam);
};

// ── Split screen: him running left→right, her right→left; over eight seconds both halves arrive at the two ends of the
// same iron bridge (the moon straddles the divider, the thread crosses it).
F.shotConverge=function(lt,t){
 const W=this.W,H=this.H,buf=this.buf,k=Film.beat(t).kick;
 this._finRunHalf(lt,t,'milton',62);
 const keep=new Uint32Array(W*H);keep.set(buf);
 this._finRunHalf(lt,t,'her',60);
 for(let y=0;y<H;y++){const r=y*W;for(let x=0;x<W/2;x++)buf[r+W-1-x]=buf[r+x];for(let x=0;x<W/2;x++)buf[r+x]=keep[r+x];}
 // Divider.
 this.rect(158,0,4,H,this.c('#05040a'));this.rect(159,0,2,H,(x,y)=>this.d(x,y)<.25+k*.3?this.c('#ff3fa4'):this.c('#1a1028'));
 this._finThreadLine(150,100,170,100,t,.9,0);
};
