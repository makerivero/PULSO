'use strict';
// Break, verse 2 and the full stop (114–178 s): disconnected, the city goes dark, the discotheque,
// the shattered glass, the jazz of noise, the run, the same moon, and the frozen frame.

// ───── Helpers (prefix _dc_) ─────
F._dc_rgb=function(r,g,b){return ((255<<24)|(b<<16)|(g<<8)|r)>>>0;};
// Recolor every pixel of the current character layer: fn(x,y,r,g,b) → packed color (0 keeps it).
F._dc_tint=function(fn){const b=this.box;if(!b||b[2]<0)return;const L=this.L,W=this.W;
 for(let y=Math.max(0,b[1]);y<=Math.min(this.H-1,b[3]);y++)for(let x=Math.max(0,b[0]);x<=Math.min(W-1,b[2]);x++){const i=y*W+x,v=L[i];if(v){const o=fn(x,y,v&255,(v>>8)&255,(v>>16)&255);if(o)L[i]=o;}}};
// Silhouette: a dark figure keeping two tones of its own shading.
F._dc_sil=function(dark,mid){const d=this.c(dark),m=this.c(mid);this._dc_tint((x,y,r,g,b)=>(r+g+b)>400?m:d);};
// Shear the layer around a ground line: rows above gy shift by (gy-y)*k (a lean).
F._dc_shear=function(gy,k){const b=this.box;if(!b||b[2]<0)return;const L=this.L,W=this.W,row=new Uint32Array(W);
 for(let y=Math.max(0,b[1]);y<=Math.min(this.H-1,b[3]);y++){const sh=Math.round((gy-y)*k);if(!sh)continue;row.fill(0);for(let x=0;x<W;x++){const sx=x-sh;if(sx>=0&&sx<W)row[x]=L[y*W+sx];}L.set(row,y*W);}
 b[0]=Math.max(0,b[0]-Math.abs(Math.round((gy-b[1])*k)));b[2]=Math.min(W-1,b[2]+Math.abs(Math.round((gy-b[1])*k)));};
// Rotate a rectangle of the layer around (px,py) — used to tilt a head up toward the moon.
F._dc_rot=function(x0,y0,x1,y1,px,py,ang){const L=this.L,W=this.W,H=this.H;x0=Math.max(0,Math.floor(x0));y0=Math.max(0,Math.floor(y0));x1=Math.min(W-1,Math.ceil(x1));y1=Math.min(H-1,Math.ceil(y1));
 const w=x1-x0+1,h=y1-y0+1,src=new Uint32Array(w*h);for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){src[(y-y0)*w+x-x0]=L[y*W+x];L[y*W+x]=0;}
 const co=Math.cos(ang),si=Math.sin(ang),m=Math.ceil(Math.max(w,h)*.5),b=this.box;
 for(let y=Math.max(0,y0-m);y<=Math.min(H-1,y1+m);y++)for(let x=Math.max(0,x0-m);x<=Math.min(W-1,x1+m);x++){const dx=x-px,dy=y-py,sx=Math.round(px+dx*co+dy*si),sy=Math.round(py-dx*si+dy*co);
  if(sx<x0||sx>x1||sy<y0||sy>y1)continue;const v=src[(sy-y0)*w+sx-x0];if(v){L[y*W+x]=v;if(x<b[0])b[0]=x;if(x>b[2])b[2]=x;if(y<b[1])b[1]=y;if(y>b[3])b[3]=y;}}};
// Pixel-font text that also knows Ñ (the font has no tilde: it is drawn as a wave of pixels over an N).
F._dc_text=function(str,x,y,col,s=1,gap=1){str=String(str).toUpperCase();let cx=x;
 for(const ch of str){if(ch==='Ñ'){this.text('N',cx,y,col,s,gap);const w=3*s,a=Math.max(1,s*.6),th=Math.max(1,Math.round(s*.67));const cy=y-1-th/2-a;for(let i=0;i<w;i++)this.rect(cx+i,Math.round(cy-Math.sin(i/(w-1)*Math.PI*2)*a),1,th,col);}else this.text(ch,cx,y,col,s,gap);cx+=(3+gap)*s;}};
// Neon tubes: the glyph cells are joined by tubes (diagonals round the corners), with a bright core.
F._dc_neon=function(str,x,y,s,tube,core,on){str=String(str).toUpperCase();const tc=this.c(tube),cc=this.c(core);let cx=x,i=0;
 for(const ch of str){const g=ArcadeGame.font[ch];if(g&&ch!==' '&&(!on||on(i))){const cell=(r,k)=>r>=0&&r<5&&k>=0&&k<3&&g[r*3+k]==='1',segs=[];
   for(let r=0;r<5;r++)for(let k=0;k<3;k++)if(cell(r,k)){let n=0;if(cell(r,k+1)){segs.push([r,k,r,k+1]);n++;}if(cell(r+1,k)){segs.push([r,k,r+1,k]);n++;}
    if(cell(r+1,k+1)&&!cell(r,k+1)&&!cell(r+1,k)){segs.push([r,k,r+1,k+1]);n++;}if(cell(r+1,k-1)&&!cell(r,k-1)&&!cell(r+1,k)){segs.push([r,k,r+1,k-1]);n++;}
    if(!n&&!cell(r-1,k)&&!cell(r,k-1)&&!cell(r-1,k-1)&&!cell(r-1,k+1))segs.push([r,k,r,k]);}
   const P=(r,k)=>[cx+k*s+s/2,y+r*s+s/2];
   for(const [r0,k0,r1,k1]of segs){const [a,b]=P(r0,k0),[a2,b2]=P(r1,k1);this.line(a,b,a2,b2,tc,3);}
   for(const [r0,k0,r1,k1]of segs){const [a,b]=P(r0,k0),[a2,b2]=P(r1,k1);this.line(a,b,a2,b2,cc,1);}}
  cx+=4*s;i++;}};
// TV static inside a rectangle, optionally masked: mask(x,y) → 0..1 probability of noise.
F._dc_static=function(x0,y0,w,h,t,cols,mask){const fr=Math.floor(t*30),pc=cols.map(v=>this.c(v)),n=pc.length;x0=Math.max(0,Math.round(x0));y0=Math.max(0,Math.round(y0));
 const x1=Math.min(this.W,x0+Math.round(w)),y1=Math.min(this.H,y0+Math.round(h)),T=this.T,W=this.W;
 for(let y=y0;y<y1;y++){const rowSeed=this.rand(y*131+fr*7),roll=Math.sin((y-t*90)*.05)>.92?1:0;for(let x=x0;x<x1;x++){if(mask){const m=mask(x,y);if(m<=0||(m<1&&this.d(x,y)>m))continue;}
  const v=this.rand(x*9277+y*26699+fr*7919);let k=Math.floor(v*v*n*(.75+rowSeed*.5));if(roll)k=Math.min(n-1,k+1);T[y*W+x]=pc[Math.min(n-1,k)];}}};

// ═════════ BREAK (no bass) ═════════

// ── Close-up: the phone in his hand finds no signal; rain lands on the glass; the screen drowns in static.
F.shotNoSignal=function(lt,t){
 const W=this.W,H=this.H,P=Film.CAST.milton,c=k=>this.c(P[k]),bt=Film.beat(t);
 const hx=Math.sin(lt*1.3)*2.6+Math.sin(lt*3.1+1)*.8,hy=Math.cos(lt*.9)*2+Math.sin(lt*2.2)*.7;
 // Defocused street behind: soft bokeh drifting against the hand.
 this.vgrad(0,0,W,H,['#04040c','#07071a','#0c0b24','#120e2c']);
 for(const [x,y,r,col]of [[34,40,30,'#3af0ff'],[66,132,22,'#ff3fa4'],[262,28,26,'#ffb04a'],[296,118,34,'#ff3fa4'],[224,166,18,'#3af0ff'],[14,164,24,'#ffe14a'],[304,58,14,'#3af0ff'],[40,94,12,'#ffb04a']])this.glow(x-hx*2.5,y-hy*2.5,r,col,.42);
 this.rain(t,.45,-hx*3,0);
 const X=Math.round(100+hx),Y=Math.round(10+hy),PW=84,PH=146,sx=X+5,sy=Y+14,sw=PW-10,sh=PH-26,mx=sx+sw/2;
 this.glow(mx,sy+sh/2,78,'#2a4a8a',.3,1.1);
 // Hand behind the phone: fingers curl round the left edge, the palm under it, wrist to the right, turquoise cuff, fuchsia sleeve.
 this.beginLayer();
 this.quad(X+170,Y+170,X+272,Y+204,52,78,(x,y)=>{const f=Math.sin((x*.5-y*1.2)*.16);return f>.6?c('sleeveShade'):(f<-.85&&this.d(x,y)<.5?this.c('#ff6ab8'):c('sleeve'));});
 this.quad(X+150,Y+162,X+172,Y+171,40,44,(x,y)=>((x*2+y)%5===0)?c('jacketShade'):c('cuff'));this.quad(X+150,Y+162,X+156,Y+164,40,40,c('jacketShade'));
 this.quad(X+104,Y+146,X+152,Y+163,40,36,(x,y)=>{const u=(y-(Y+146))-(x-(X+104))*.35;return u>8&&this.d(x,y)<.6?c('skinShade'):u<-8&&this.d(x,y)<.3?this.c('#ffe0cc'):c('skin');});
 this.poly([[X+14,Y+92],[X+80,Y+88],[X+104,Y+104],[X+120,Y+130],[X+118,Y+156],[X+96,Y+170],[X+50,Y+170],[X+14,Y+160]],(x,y)=>y>Y+158&&this.d(x,y)<.5?c('skinDark'):c('skinShade'));
 this.line(X+40,Y+163,X+86,Y+166,c('skinDark'));
 for(let i=0;i<4;i++){const fy=Y+94+i*15,w=12-i*.8,col=i===3?c('skinShade'):c('skin');this.quad(X+18,fy,X-3,fy+2,w,w-1,col);this.ellipse(X-4,fy+2,w/2,w/2+.5,col);this.px(X-7,fy,this.c('#ffe0cc'));this.px(X-6,fy-1,this.c('#ffe0cc'));this.line(X-3,fy+w/2+1,X+6,fy+w/2+1,c('skinDark'));}
 this.endLayer('#ff8fd0',-1);
 // Phone body: rounded slab with a bevel catching the light.
 const body=this.c('#16161f');this.rect(X+2,Y,PW-4,PH,body);this.rect(X,Y+2,PW,PH-4,body);this.rect(X+1,Y+1,PW-2,PH-2,body);
 this.rect(X,Y+3,1,PH-6,this.c('#44445e'));this.rect(X+3,Y,PW-6,1,this.c('#4a4a66'));this.rect(X+PW-1,Y+3,1,PH-6,this.c('#2a2a3c'));this.rect(X+3,Y+PH-1,PW-6,1,this.c('#22222e'));
 this.rect(mx-8,Y+6,16,2,this.c('#2c2c40'));this.ellipse(mx+14,Y+7,1.6,1.6,this.c('#3a4a7a'));
 // Screen: no service. Status bar, empty bars being searched, SIN SEÑAL, a spinner.
 this.vgrad(sx,sy,sw,sh,['#0a1024','#0c1430','#0f1938','#121c3e']);
 const dim=this.c('#8a96c0'),white=this.c('#eef4ff');
 this.text('23:58',sx+3,sy+3,dim,1,1);this.rect(sx+sw-14,sy+3,10,5,this.c('#5a6690'));this.rect(sx+sw-13,sy+4,8,3,this.c('#0c1430'));this.rect(sx+sw-13,sy+4,2,3,this.c('#ff4a6a'));this.rect(sx+sw-4,sy+4,1,3,this.c('#5a6690'));
 this.rect(sx+3,sy+11,sw-6,1,this.c('#1c2850'));
 const search=Math.floor(lt*7)%6,bx0=Math.round(mx-17),bb=sy+44;
 for(let k=0;k<4;k++){const bh=8+k*6,bx=bx0+k*9;this.rect(bx,bb-bh,7,bh,this.c(search===k?'#7ad8ff':'#4a5a8a'));this.rect(bx+1,bb-bh+1,5,bh-2,this.c(search===k?'#1e5a80':'#0c1430'));}
 const xc=this.c('#ff4a6a');for(let i=0;i<5;i++){this.px(bx0+37+i,bb-6+i,xc);this.px(bx0+41-i,bb-6+i,xc);}
 const tw=(s2,str)=>this.textW(str,s2,1);
 this.text('SIN',Math.round(mx-tw(3,'SIN')/2)+1,sy+51,this.c('#1a0a20'),3,1);this.text('SIN',Math.round(mx-tw(3,'SIN')/2),sy+50,white,3,1);
 this._dc_text('SEÑAL',Math.round(mx-tw(3,'SEÑAL')/2)+1,sy+77,this.c('#1a0a20'),3,1);this._dc_text('SEÑAL',Math.round(mx-tw(3,'SEÑAL')/2),sy+76,white,3,1);
 this.rect(Math.round(mx-14),sy+96,28,1,this.c('#ff3fa4'));
 const sp=Math.floor(lt*10);for(let i=0;i<8;i++){const a=i/8*Math.PI*2,age=(sp-i+800)%8;this.rect(Math.round(mx+Math.cos(a)*6)-1,Math.round(sy+109+Math.sin(a)*6)-1,2,2,this.c(age===0?'#d8f6ff':age<3?'#4aa8d0':'#1c3058'));}
 // Second bar: the screen dissolves into flickering static (inside the glass only).
 const p=Film.ease((lt-1.9994)/1.55);
 if(p>0){const fr=Math.floor(t*30),ghost=this.rand(fr*17)<.12;
  if(lt<2.12){for(let y=sy;y<sy+sh;y++){const off=Math.round((this.rand(Math.floor(y/3)+fr*91)-.5)*14);if(!off)continue;const row=this.buf.slice(y*W+sx,y*W+sx+sw);for(let x=0;x<sw;x++){const s2=x-off;if(s2>=0&&s2<sw)this.buf[y*W+sx+x]=row[s2];}}}
  if(!ghost)this._dc_static(sx,sy,sw,sh,t,['#06080e','#141a26','#2c3448','#58627e','#9aa4c0','#e4eaf8'],(x,y)=>{const u=this.rand((x>>1)*31+(y>>1)*977+7);return u<p*1.15-.05?1:0;});}
 // Raindrops landing on the glass: each lens flips and magnifies what is under it.
 const snap=this.buf.slice();
 for(let i=0;i<13;i++){const tl=Math.round(i*1.3+(i>6?1:0))*Film.P*.5+.04;if(lt<tl)continue;const age=lt-tl,r=2.2+this.rand(i*7)*2.8,dx=sx+4+this.rand(i*3+1)*(sw-8),slide=age>1.1&&this.rand(i+40)<.5?Math.min(40,(age-1.1)*(10+this.rand(i)*14)):0,dy=sy+6+this.rand(i*5+2)*(sh-30)+slide;
  if(age<.14){const rr=r+age*30;for(let a=0;a<10;a++){const an=a/10*Math.PI*2;this.px(dx+Math.cos(an)*rr,dy+Math.sin(an)*rr*.8,this.c('#c8e8ff'));}}
  if(slide>0)for(let y=dy-slide;y<dy-r;y+=1)if(this.d(Math.round(dx),Math.round(y))<.45)this.px(dx+Math.sin(y*.3)*.5,y,this.c('#3a5a8a'));
  this.ellipse(dx,dy,r,r*1.12,(x,y,ex,ey)=>{const qx=Math.max(sx,Math.min(sx+sw-1,Math.round(dx-ex*r*.55))),qy=Math.max(sy,Math.min(sy+sh-1,Math.round(dy-ey*r*.6))),v=snap[qy*W+qx];
   const e2=ex*ex+ey*ey;if(e2>.62&&ey<.1)return this.c('#070a14');if(ey>.45&&e2>.45)return this.c('#d8f2ff');return ((((v&0xfefefe)>>>1)+0x585040)&0xffffff|0xff000000)>>>0;});
  this.px(dx-r*.35,dy-r*.35,this.c('#ffffff'));}
 // Glass sheen: a diagonal band of reflected street light.
 for(let y=sy;y<sy+sh;y++)for(let x=sx;x<sx+sw;x++){const u=(x-sx)+(y-sy)*.55-20-hx*4;if(u>0&&u<10&&this.d(x,y)<.12)this.px(x,y,this.c('#6a7ab0'));}
 // Thumb resting on the right edge, lit by the screen.
 this.beginLayer();
 this.ellipse(X+99,Y+138,12,16,(x,y)=>this.d(x,y)<.35?c('skinShade'):c('skin'));
 this.quad(X+99,Y+134,X+83,Y+114,15,12,c('skin'));this.ellipse(X+82,Y+113,6,6.5,c('skin'));
 this.ellipse(X+81,Y+112,3.6,4.2,this.c('#ffd8c8'));this.px(X+79,Y+110,this.c('#ffffff'));this.line(X+88,Y+124,X+94,Y+122,c('skinDark'));this.line(X+93,Y+146,X+104,Y+150,c('skinShade'));
 this.endLayer('#bfe8ff',-1);
 this.rain(t,.18,-hx*6,0);
};

// ── Wide: the street at night; on every beat a group of windows goes dark, far to near, until only the lamps remain.
F.shotLightsOut=function(lt,t){
 const W=this.W,H=this.H,k=Film.beat(t).kick,cam=lt*16,gy=146,P=Film.P;
 const gone=Math.min(7,Math.max(0,Math.floor(lt/P)))/7;
 this.vgrad(0,0,W,gy,['#04040c','#07081a','#0e0f28','#171538','#221c48']);
 this.glow(160,gy+30,170,'#4a2260',.55*(1-gone*.85),.45);
 const offAt=(g,j)=>(g+1)*P+this.rand(j)*.09,lit=(g,j)=>lt<offAt(g,j),flash=(g,j)=>{const o=offAt(g,j);return lt>o-.07&&lt<o;};
 const amb=[this.c('#ffcf7a'),this.c('#ffe9b0'),this.c('#9fe8ff')],flashC=this.c('#fffbe8');
 // Four depths of buildings, two groups each (alternate buildings), switching off from the farthest.
 const layers=[{p:.12,top:[30,84],w:[12,22],col:['#0d0c20','#100f24'],ww:1,wh:1,sx:3,sy:4,prob:.3,g:[0,1]},
  {p:.3,top:[34,80],w:[20,32],col:['#121128','#15142c'],ww:2,wh:2,sx:5,sy:6,prob:.3,g:[2,3]},
  {p:.6,top:[36,70],w:[26,40],col:['#171530','#1a1834'],ww:3,wh:3,sx:7,sy:8,prob:.32,g:[4,5]},
  {p:1,top:[78,104],w:[56,80],col:['#1c1a36','#201d3a'],ww:5,wh:6,sx:12,sy:13,prob:.45,g:[6,6]}];
 layers.forEach((L,li)=>{let x=-60-Math.round(cam*L.p),i=0;
  for(let n=0;x<W+40&&n<60;n++,i++){const r1=this.rand(i*13+li*1000),bw=Math.round(L.w[0]+r1*(L.w[1]-L.w[0])),top=Math.round(L.top[0]+this.rand(i*7+li*991)*(L.top[1]-L.top[0])),g=L.g[i&1];
   this.rect(x,top,bw,gy-top,this.c(L.col[i&1]));
   if(li===3){this.rect(x,top,bw,2,this.c('#2c2848'));this.rect(x+bw-1,top,1,gy-top,this.c('#14122a'));}
   for(let wy=top+3+(li>2?4:0);wy<gy-(li>2?18:4);wy+=L.sy)for(let wx=x+2+(li>2?4:0);wx<x+bw-L.ww-(li>2?3:1);wx+=L.sx){const id=Math.round(wx+cam*L.p)*7+wy*131+li*5;if(this.rand(id)>L.prob)continue;
    if(lit(g,id)){const col=flash(g,id)?flashC:amb[(this.rand(id+3)*3)|0];this.rect(wx,wy,L.ww,L.wh,col);if(li===3){this.rect(wx,wy+L.wh-1,L.ww,1,this.c('#c98a4a'));}}
    else if(li===3)this.rect(wx,wy,L.ww,L.wh,this.c('#0e0d1e'));}
   // Signs ride with their building's group.
   if(li===2&&i%5===2){const on=lit(g,i*3+1)||flash(g,i*3+1);this.rect(x+bw-8,top+6,7,30,this.c('#0e0b1a'));if(on){this.glow(x+bw-4.5,top+21,14,'#ff3fa4',.4+k*.2);for(let q=0;q<4;q++)this.rect(x+bw-6,top+9+q*7,3,4,this.c('#ff5fb4'));}}
   if(li===3&&i%3===1){const on=lit(6,i*5+2);this.rect(x+10,top+20,12,12,this.c('#0e0b1a'));if(on){this.glow(x+16,top+26,16,'#3aff8a',.45);this.rect(x+14,top+21,4,10,this.c('#5aff9a'));this.rect(x+11,top+24,10,4,this.c('#5aff9a'));}}
   if(li===3){const shop=lit(6,i*11+5),sw2=Math.floor((bw-20)/2);this.rect(x+5,gy-18,bw-10,16,this.c('#0e0c1a'));this.rect(x+bw/2-3,gy-16,6,14,this.c('#1a1426'));
    for(const wx of [x+6,x+bw-6-sw2]){if(shop){this.vgrad(wx,gy-17,sw2,14,['#ffd890','#e0a058','#a8683a']);this.rect(wx,gy-11,sw2,1,this.c('#6a4028'));this.rect(wx,gy-6,sw2,1,this.c('#6a4028'));for(let q=wx+2;q<wx+sw2-2;q+=4)this.rect(q,gy-10,2,3,this.c(this.rand(q*3+i)<.5?'#ff6a8a':'#5aa0c8'));}else this.rect(wx,gy-17,sw2,14,this.c('#0b0a16'));}
    if(shop)this.glow(x+bw/2,gy-2,30,'#ffb04a',.3,.4);}
   x+=bw+(li===3?6:Math.round(this.rand(i*3+li)*6));}});
 // Sidewalk and the street lamps: the only lights that stay on.
 this.rect(0,gy-2,W,6,(i,j)=>this.c(this.d(i,j)<.15?'#34345a':'#26263e'));this.rect(0,gy+4,W,2,this.c('#4a4a6a'));this.rect(0,gy+6,W,H-gy-6,this.c('#0c0c1e'));
 for(let i=-1;i<5;i++){const lx=Math.round(i*120+60-(cam%120));this.rect(lx,gy-62,2,62,this.c('#2a2840'));this.rect(lx-1,gy-64,12,3,this.c('#3a3654'));this.rect(lx+3,gy-61,7,1,this.c('#ffcf8a'));
  this.poly([[lx+4,gy-59],[lx+9,gy-59],[lx+28,gy],[lx-15,gy]],(a,b)=>this.d(a,b)<.07?this.c('#a8703a'):0);this.glow(lx+6,gy-57,12,'#ffcf8a',.7);this.glow(lx+6,gy,34,'#ffb04a',.55,.22);this.rect(lx-6,gy-1,26,1,this.c('#c98a4a'));}
 this.drawMilton(100+lt*3.2,gy,30,walkAt(t),'#ffb04a',1);
 this.reflect(gy+6,H,gy+5,'#0a0a1c',t,2,.7);
 this.rain(t,.8,cam);
};

// ── Exterior: the DISCO sign; the camera tilts down to the door as Milton walks in past the queue.
F.shotDiscoDoor=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,camY=Math.round(118*Film.ease(lt/3.4)),y=v=>v-camY;
 const pulse=.62+.38*k;
 // Brick facade, warm pink near the door, violet up high.
 const mort=this.c('#120a16'),bricks=['#2a1626','#30182a','#26142a','#341c2e'].map(v=>this.c(v));
 this.rect(0,0,W,Math.min(H,y(268)),(x,yy)=>{const wy=yy+camY,row=Math.floor(wy/6),bx=Math.floor((x+(row&1)*7)/14);if(wy%6===0||(x+(row&1)*7)%14===0)return mort;return bricks[(this.rand(row*131+bx*7)*4)|0];});
 for(const px of [24,296]){this.rect(px-5,0,10,Math.min(H,y(268)),this.c('#1c1020'));this.rect(px-5,0,1,Math.min(H,y(268)),this.c('#3a2440'));}
 // The sign: dark backing board, cyan tube frame, pink letters — the S buzzes.
 const sx0=46,sy0=14;this.rect(sx0,y(sy0),228,76,this.c('#0c0912'));this.rect(sx0,y(sy0),204,1,this.c('#2a2236'));
 for(const [bx,by]of [[sx0+4,sy0+4],[sx0+223,sy0+4],[sx0+4,sy0+71],[sx0+223,sy0+71]])this.px(bx,y(by),this.c('#4a4058'));
 this.glow(160,y(52),110,'#ff3fa4',.28+k*.08,.5);
 const fl=this.rand(Math.floor(t*15)*7+3)<.28||(this.rand(Math.floor(t*40))<.2&&this.rand(Math.floor(t*3))<.4);
 const tube=(x0,y0,x1,y1)=>{this.line(x0,y(y0),x1,y(y1),this.c('#1ac8e0'),3);this.line(x0,y(y0),x1,y(y1),this.c('#d8fdff'),1);};
 this.glow(160,y(sy0+4),40,'#3af0ff',.2,.2);
 tube(sx0+6,sy0+6,sx0+222,sy0+6);tube(sx0+6,sy0+70,sx0+222,sy0+70);tube(sx0+6,sy0+6,sx0+6,sy0+70);tube(sx0+222,sy0+6,sx0+222,sy0+70);
 for(let i=0;i<5;i++)if(!(i===2&&fl))this.glow(65+i*40+15,y(sy0+38),24,'#ff3fa4',.38+k*.2);
 this._dc_neon('DISCO',65,y(sy0+13),10,'#ff3fa4',k>.55?'#ffffff':'#ffd0ea',i=>!(i===2&&fl));
 if(fl)this._dc_neon('S',145,y(sy0+13),10,'#3a1428','#5a2040');
 // Canopy with chasing bulbs, then the open door spilling light that breathes with the bass.
 const dx0=132,dx1=188,dy0=166,dy1=268;
 this.rect(108,y(146),104,14,this.c('#120c1a'));this.rect(108,y(159),104,2,this.c('#2a1e36'));
 for(let i=0;i<17;i++){const on=(i+bt.n*2+Math.floor(bt.ph*2))%3===0;this.rect(111+i*6,y(151),2,2,this.c(on?'#fff1c2':'#5a4030'));if(on)this.glow(112+i*6,y(152),5,'#ffcf7a',.6);}
 this.glow(160,y(220),78,'#ff3fa4',.3*pulse+.1);
 this.rect(dx0-5,y(dy0-5),dx1-dx0+10,dy1-dy0+5,this.c('#0e0a14'));this.rect(dx0-5,y(dy0-5),dx1-dx0+10,1,this.c('#4a3a58'));
 this.rect(dx0,y(dy0),dx1-dx0,dy1-dy0,(x,yy)=>{const u=(x-dx0)/(dx1-dx0),v=(yy+camY-dy0)/(dy1-dy0),c0=1-Math.abs(u-.5)*1.6,beam=Math.sin((u*3+v*1.5)*6-t*5)>.7;let f=c0*pulse+(beam?.25:0)-v*.15;const lvl=f+this.d(x,yy)*.35;
  return this.c(lvl>1.05?'#fff0fa':lvl>.82?'#ffb0e0':lvl>.6?'#ff5fb4':lvl>.38?'#c02a8a':'#5a1450');});
 for(let i=0;i<3;i++){const ix=dx0+12+i*15+Math.sin(t*2+i)*2,iy=dy1-12,ih=22-i*2,b=Math.abs(Math.sin((bt.b+i*.3)*Math.PI))*2;this.ellipse(ix,y(iy-ih-b),2.4,2.6,this.c('#3a0a30'));this.rect(ix-3,y(iy-ih+2-b),6,ih-2+b,this.c('#3a0a30'));this.line(ix-2,y(iy-ih+3-b),ix-5,y(iy-ih-5),this.c('#3a0a30'),2);}
 this.rect(dx0,y(dy0),5,dy1-dy0,this.c('#2a0e2a'));this.rect(dx1-5,y(dy0),5,dy1-dy0,this.c('#2a0e2a'));
 // Steps and the wet sidewalk.
 this.rect(118,y(268),84,6,this.c('#3a2a3e'));this.rect(118,y(268),84,1,this.c('#8a5a7a'));this.rect(110,y(274),100,6,this.c('#30223a'));this.rect(110,y(274),100,1,this.c('#6a4a68'));
 this.rect(0,y(280),W,H,(x,yy)=>this.c(this.d(x,yy)<.12?'#241c34':'#1a1428'));this.rect(0,y(280),W,1,this.c('#3a2e48'));
 this.poly([[dx0,y(274)],[dx1,y(274)],[dx1+70,y(320)],[dx0-70,y(320)]],(x,yy)=>this.d(x,yy)<(.42-(yy+camY-274)/46*.3)*pulse?this.c('#ff5fb4'):0);
 // People in depth order: the queue behind the rope, the bouncer, Milton walking in.
 const mwy=lt<1.5?400:270+56*(1-Film.ease((lt-1.5)/3.9)),inDoor=Film.ease((lt-5.25)/.7),mgy=mwy-inDoor*8,mh=50+(mgy-262)*.72-inDoor*4,mx=152+(mgy-270)*.25;
 const actors=[];
 actors.push([290,()=>{for(const [px,ph,who,dir,sw]of [[74,60,'her',1,0],[90,64,'milton',1,1.3]]){this.beginLayer();this.person({x:px,y:y(290),h:ph,dir,walk:.1+Math.sin(t*1.3+sw)*.02,who,pose:'stand'});this._dc_sil('#140c1c','#22162c');this.endLayer('#ff7ac8',1);}
  for(const px of [64,110]){this.rect(px-1,y(294)-22,3,22,this.c('#c9a040'));this.rect(px-3,y(294)-24,7,3,this.c('#ffd060'));this.rect(px-3,y(294)-1,7,2,this.c('#8a6a2a'));}
  for(let x=64;x<=110;x++){const f=(x-64)/46;this.px(x,y(294)-20+Math.sin(f*Math.PI)*7,this.c('#c0203a'));this.px(x,y(294)-19+Math.sin(f*Math.PI)*7,this.c('#7a1028'));}}]);
 actors.push([292,()=>{const bx=226,by=y(292),nod=lt>4.3&&lt<4.8?1:0;this.beginLayer();const dk=this.c('#120c18'),md=this.c('#1e1628');
  this.rect(bx-12,by-34,9,34,dk);this.rect(bx+2,by-34,9,34,md);this.rect(bx-14,by-3,13,3,dk);this.rect(bx+1,by-3,13,3,dk);
  this.poly([[bx-20,by-70],[bx+18,by-70],[bx+15,by-32],[bx-16,by-32]],md);this.poly([[bx-20,by-70],[bx-4,by-70],[bx-6,by-32],[bx-16,by-32]],dk);
  this.rect(bx-21,by-56,40,9,dk);this.rect(bx-21,by-56,40,1,this.c('#2a2036'));this.ellipse(bx-1,by-78+nod,7.5,9,md);this.rect(bx-5,by-73,11,6,md);this.rect(bx-8,by-80+nod,10,3,this.c('#05040a'));
  this.endLayer('#ff7ac8',-1);this.px(bx-6,by-80+nod,this.c(k>.5?'#ffffff':'#ff9ad4'));this.px(bx+6,by-76+nod,this.c('#3af0ff'));}]);
 if(mgy<330&&inDoor<1)actors.push([mgy,()=>{this.beginLayer();this.personBack({x:mx,y:y(mgy),h:mh,walk:walkAt(t),who:'milton'});
  if(inDoor>0){const hot=[this.c('#ffd0ea'),this.c('#ff8fd0')];this._dc_tint((x,yy)=>this.d(x,yy)<inDoor*1.1?hot[(x+yy)&1]:0);}
  this.endLayer('#ff9ad4',1);}]);
 actors.sort((a,b)=>a[0]-b[0]).forEach(a=>a[1]());
 const wet=y(282);if(wet<H)this.reflect(wet,H,wet-1,'#140e22',t,1.6,.6);
 this.rain(t,.75,0,camY);
};

// ═════════ VERSE 2 ═════════

// ── Wide interior: mirror ball, LED floor on the beat, a crowd of dancing silhouettes — and Milton, still, a tear glinting. Slow push.
F.shotDiscoFloor=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,n=bt.n,z=1+.22*Film.ease(lt/4.5),fx=160,fy=100;
 const X=x=>fx+(x-fx)*z,Y=y=>fy+(y-fy)*z,yH=60,yN=200,TW=64,wallY=80,sv=v=>1/(1+v*.45);
 const tiles=['#ff3fa4','#3af0ff','#ffb04a','#a04aff'].map(v=>this.c(v)),tilesD=['#5a1440','#145a68','#5a3a14','#3a1a5a'].map(v=>this.c(v)),grout=this.c('#07050c'),off=this.c('#120c20'),off2=this.c('#181030');
 const wall=[this.c('#0c0818'),this.c('#110b20'),this.c('#160e28')],strip=this.c('#3af0ff'),stripC=this.c('#d8fdff'),seam=this.c('#07050e');
 // Room: back wall with panels and a cyan neon strip; LED floor in perspective.
 this.rect(0,0,W,H,(x,y)=>{const wx=fx+(x-fx)/z,wy=fy+(y-fy)/z;
  if(wy<wallY){if(Math.abs(wy-64)<.8)return wy<64?strip:stripC;if(Math.abs(wy-64)<2.2)return this.d(x,y)<.5?this.c('#1a6a80'):wall[2];const p=Math.floor((wx+400)/30);if(((wx+400)%30)<1.2/z+.5)return seam;return wall[Math.min(2,Math.floor(wy/34+this.d(x,y)*.8))];}
  const s=(wy-yH)/(yN-yH),v=(1/s-1)/.45,u=(wx-160)/(TW*s),iu=Math.floor(u),iv=Math.floor(v),fu=u-iu,fv=v-iv;
  if(fu<.05||fv<.06+.02*v)return grout;
  const dist=Math.hypot(u,(v-3.2)*1.1),ring=n%4===0&&Math.abs(dist-bt.ph*9)<.9,on=ring||((iu+iv+n)&1)===0&&this.rand(iu*31+iv*7+n*13)<.7;
  if(!on)return (iu+iv)&1?off:off2;const ci=((iu*3+iv*5+n)%4+4)%4,lvl=(ring?1:.35+.6*k)-v*.03;return this.d(x,y)<lvl?tiles[ci]:tilesD[ci];});
 // Mirror ball on its chain, facets glinting; beams sweep from the ceiling cans.
 const bx=X(160),by=Y(24),br=12*z;this.line(bx,0,bx,by-br,this.c('#3a3456'));
 for(const [cx,col,sp]of [[40,'#ff3fa4',.7],[280,'#3af0ff',-.6],[160,'#ffe14a',.4]]){const a=Math.sin(t*sp+cx)*.5,ex=X(cx+Math.sin(a)*260),ey=Y(170),pc=this.c(col);
  this.poly([[X(cx),Y(0)],[ex-26*z,ey],[ex+26*z,ey]],(x,y)=>this.d(x,y)<.1+k*.05?pc:0);this.rect(X(cx)-4,Y(0),8,4,this.c('#2a2436'));}
 this.glow(bx,by,34*z,'#c8c0ff',.35+k*.2);
 this.ellipse(bx,by,br,br,(x,y,dx,dy)=>{const lon=Math.floor((Math.asin(Math.max(-1,Math.min(1,dx/Math.sqrt(Math.max(.05,1-dy*dy)))))*4+t*3)),lat=Math.floor(dy*6),h=this.rand(lon*17+lat*131+Math.floor(t*6));
  if(((x+y)&3)===0)return this.c('#1a1830');return this.c(h>.9?'#ffffff':h>.7?(lon&1?'#ffb0e0':'#b0f8ff'):dx<-.3?'#8a8ab0':'#5a5a80');});
 // Crowd in depth order; Milton in the middle, still.
 const ppl=[[-3.2,9],[-1.6,8.6],[.4,9.6],[1.9,8.2],[3.4,9.2],[-2.4,6.8],[2.6,6.6],[.95,6.1],[-.9,7.1],[-1.5,3.7],[1.4,3.1],[-2.6,2.6],[2.7,4.1],[-.75,4.9],[.95,5.1],[-2.15,.85],[2.05,.6]];
 const order=ppl.map((p,i)=>[p[1],i]).concat([[3.2,-1]]).sort((a,b)=>b[0]-a[0]);
 for(const [v,i]of order){const s=sv(v),gy=Y(yH+(yN-yH)*s),h=150*s*z;
  if(i<0){const mx=X(160);this.poly([[mx-6,0],[mx+6,0],[mx+30*z,gy+4],[mx-30*z,gy+4]],(x,y)=>this.d(x,y)<.13?this.c('#c8d8ff'):0);this.glow(mx,gy,40*z,'#c8d8ff',.4,.25);
   this.beginLayer();const o=this.person({x:mx,y:gy,h,dir:1,walk:.25,who:'milton',pose:'stand'});this.endLayer('#e0ecff',1);
   const q=o.q,ex=o.head[0]+q*.3,ey=o.head[1]-q*.03,dr=Math.min(1,lt/2.2),tx=ex+.5,ty=ey+2+dr*q*.45;
   this.rect(tx,ty,1,2,this.c('#bff4ff'));this.px(tx,ty+2,this.c('#6ad8ff'));if(dr>.3)for(let j=1;j<dr*q*.45;j+=2)this.px(ex+.5,ey+1+j,this.c('#f0c8b8'));
   const gl=Math.max(k,Math.exp(-Math.abs(lt-1.5)*6),Math.exp(-Math.abs(lt-3.5)*6));if(gl>.2){const L=Math.round(2+gl*4),wc=this.c('#ffffff'),hc=this.c('#9fe8ff');this.glow(tx,ty,9,'#bff4ff',.6*gl);this.px(tx,ty,wc);for(let j=1;j<=L;j++){const cc=j>L/2?hc:wc;this.px(tx+j,ty,cc);this.px(tx-j,ty,cc);this.px(tx,ty-j,cc);this.px(tx,ty+j,cc);}this.px(tx+1,ty+1,hc);this.px(tx-1,ty-1,hc);this.px(tx+1,ty-1,hc);this.px(tx-1,ty+1,hc);}
   continue;}
  const [u]=ppl[i],x=X(160+u*TW*s),who=this.rand(i*5)<.45?'her':'milton',dir=u>0?-1:1,ph=(bt.b+(i%3===0?.5:0)+this.rand(i)*.1)%1,st=(i+Math.floor(n/2))%4,bp=ph;
  let arms=null;if(st===1)arms=[[2.7-(bp<.3?.5:0),.2],[.5,1.6]];else if(st===2)arms=[[1.1+Math.sin(bp*Math.PI*2)*.3,1.6],[.9,1.8]];else if(st===3)arms=[[2.5+(1-bp)*.2,.3],[2.4+(1-bp)*.2,.3]];
  this.beginLayer();this.person({x,y:gy,h,dir,walk:.1,who,pose:'dance',beat:bp,arms});
  const near=v<1.5;this._dc_sil(near?'#07050c':v>6?'#1c1430':'#100a1c',near?'#0e0a18':v>6?'#261c3e':'#1a1228');this.endLayer(u<0?'#5ff4ff':'#ff6ac0',u<0?1:-1);}
 // Light dots from the ball sweep over everything.
 const dots=[this.c('#ffffff'),this.c('#ffd0ec'),this.c('#c8fbff')];
 for(let i=0;i<150;i++){const span=W*1.5,x=((this.rand(i*3)*span+t*(26+this.rand(i)*20))%span)-W*.25,y=this.rand(i*7+1)*H,sz=y>110?2:1;if(this.d(Math.round(x),Math.round(y))>.85-k*.2)continue;this.rect(x,y,sz+1,sz,dots[i%3]);}
};

// ── Close-up: the cocktail glass on the bar shatters on the bar line; two beats later the lights die — only EXIT remains.
F.shotGlass=function(lt,t){
 const W=this.W,H=this.H,k=Film.beat(t).kick,TS=1.0,TO=2.0,a=lt-TS,dark=lt>=TO&&!(lt>2.08&&lt<2.13),cy=128;
 const shake=a>0&&a<.6?Math.sin(a*70)*3*Math.exp(-a*7):0,push=1+.05*Math.min(lt,TS),gx=160+shake,sc=v=>v*push;
 const exitX=262,exitY=24,exit=()=>{this.rect(exitX-14,exitY-6,28,12,this.c('#06140c'));this.rect(exitX-14,exitY-6,28,1,this.c('#1a4a2a'));this.glow(exitX,exitY,26,'#1aff6a',dark?.42:.25);this.text('EXIT',exitX-7,exitY-2,this.c('#5aff9a'),1,1);};
 // Shards: born on the bowl, thrown out from its middle, landing on the counter.
 const shards=[],G=430;for(let i=0;i<46;i++){const r1=this.rand(i*11+1),r2=this.rand(i*11+2),r3=this.rand(i*11+3),yy=44+r1*46,hw=46*(92-yy)/48,x0=gx+(r2*2-1)*hw,y0=yy,ang=Math.atan2(y0-70,x0-gx)+(r3-.5)*.8,sp=70+this.rand(i*11+4)*230;
  const vx=Math.cos(ang)*sp,vy=Math.sin(ang)*sp-90,land=cy+4+this.rand(i*11+5)*44,ta=(vy+Math.sqrt(vy*vy+2*G*Math.max(1,land-y0)))/G;shards.push({x0,y0,vx,vy,land,ta,sz:2+this.rand(i*11+6)*5,rot:this.rand(i*11+7)*6,spin:(this.rand(i*11+8)-.5)*30});}
 const shardAt=(s,aa)=>{const ta=Math.min(aa,s.ta),fr=aa>s.ta?Math.min(.25,(aa-s.ta))*.5:0;return [s.x0+s.vx*(ta+fr),s.y0+s.vy*ta+.5*G*ta*ta,s.rot+s.spin*ta,aa>=s.ta];};
 if(dark){
  // Lights out: black, the EXIT sign, dust in its green light, shards glinting faintly.
  this.clear('#020204');exit();
  this.rect(0,cy,W,1,this.c('#08100c'));
  for(let i=0;i<46;i++){const s=shards[i],[x,y,r,ld]=shardAt(s,a);const tw=this.rand(i*7+Math.floor(t*5))<.25;this.px(x,y,this.c(tw?'#7affb0':ld?'#0c1a12':'#1a3a24'));if(tw&&this.rand(i+Math.floor(t*9))<.4){this.px(x+1,y,this.c('#2a6a40'));this.px(x-1,y,this.c('#2a6a40'));}}
  this.rect(gx-1,96,3,30,this.c('#08100c'));this.rect(gx+1,96,1,30,this.c('#143a22'));this.ellipse(gx,127,20,3,this.c('#060c08'));
  for(let i=0;i<40;i++){const x=(this.rand(i*3)*W+Math.sin(t*.4+i)*10+lt*4)%W,y=(this.rand(i*5)*H-lt*3+H)%H,near=Math.hypot(x-exitX,y-exitY)<70;if(this.d(Math.round(x),Math.round(y))<(near?.8:.3))this.px(x,y,this.c(near?'#3aaa6a':'#1a221e'));}
  return;}
 // Back bar out of focus: shelves of bottles backlit in amber, neon bokeh.
 this.vgrad(0,0,W,cy,['#0a0612','#120a1c','#1a0e26','#24122c']);
 for(const sy of [46,92]){this.glow(160,sy+2,140,'#ffb04a',.16,.12);this.rect(0,sy,W,2,this.c('#4a2a1a'));this.rect(0,sy,W,1,this.c('#c98a4a'));
  for(let i=0;i<22;i++){const bx=6+i*15+(sy>50?7:0)+this.rand(i+sy)*4,bh=18+this.rand(i*3+sy)*14,bw=6+this.rand(i*5+sy)*4,col=['#3a5a3a','#5a2a1a','#6a4a2a','#2a3a5a','#5a1a3a'][i%5];
   this.rect(bx,sy-bh,bw,bh,(x,y)=>this.d(x,y)<.55?this.c(col):0);this.rect(bx+bw/2-1,sy-bh-6,2,6,(x,y)=>this.d(x,y)<.55?this.c(col):0);this.rect(bx+1,sy-bh+2,1,bh-4,(x,y)=>this.d(x,y)<.4?this.c('#ffcf8a'):0);}}
 for(const [x,y,r,col]of [[50,70,30,'#ff3fa4'],[280,60,26,'#3af0ff'],[110,20,18,'#ffe14a'],[230,104,22,'#ff3fa4'],[20,114,16,'#3af0ff']])this.glow(x,y,r,col,.45+k*.1);
 exit();
 // Counter: glossy dark wood, edge highlight in pink.
 this.rect(0,cy,W,H-cy,this.c('#140a14'));this.rect(0,cy,W,1,this.c('#ff8fd0'));
 const liq=['#ffd0ec','#ff5fb4','#d02a8a','#8a1a5a'].map(v=>this.c(v)),glassC=this.c('#e8f4ff'),glassD=this.c('#8ab0d0');
 if(a<0){
  // The glass, whole: cone bowl, pink cocktail, cherry, a crack creeping in on the last beat.
  const top=Math.round(sc(44)-44*(push-1)*0+44)-44,rim=44,bot=92,R=46*push,surf=54+Math.sin(t*20)*k*1.2;
  this.ellipse(gx,126,22*push,4,this.c('#c8d8ec'));this.ellipse(gx,126,20*push,3,this.c('#1a1424'));this.rect(gx-1,bot,3,34,glassD);this.rect(gx,bot,1,34,glassC);
  this.poly([[gx-R,rim],[gx+R,rim],[gx,bot]],(x,y)=>{if(y<surf)return this.d(x,y)<.12?glassD:0;const f=(y-surf)/(bot-surf),lx=(x-gx)/R;if(lx<-.45&&lx>-.6)return this.c('#8ff4ff');if(lx>.4&&lx<.5)return liq[0];return liq[Math.min(3,Math.floor(f*3+this.d(x,y)*.9)+1)];});
  this.ellipse(gx,surf,R*(bot-surf)/(bot-rim),3,(x,y)=>this.d(x,y)<.6?liq[0]:liq[1]);
  this.line(gx-R,rim,gx,bot,glassC);this.line(gx+R,rim,gx,bot,glassD);this.ellipse(gx,rim,R,4,(x,y,dx,dy)=>dx*dx+dy*dy>.7?glassC:0);
  this.line(gx+30,30,gx+8,62,this.c('#d8c8a0'));this.ellipse(gx+14,52,5,5,(x,y,dx,dy)=>dx<-.3&&dy<-.3?this.c('#ff9aa0'):this.c('#d0182a'));this.px(gx+12,50,this.c('#ffffff'));
  if(lt>.5){const cr=Film.ease((lt-.5)/.5);let px0=gx-10,py0=64;for(let i=0;i<7*cr;i++){const nx=px0+(this.rand(i*3)-.5)*12,ny=py0-4-this.rand(i*5)*5;this.line(px0,py0,nx,ny,this.c('#ffffff'));px0=nx;py0=ny;}}
 }else{
  // Shatter: flash, shards with motion trails, a splash of cocktail, the puddle spreading round the broken stem.
  if(a<.06){this.glow(gx,68,70,'#ffffff',.7);this.glow(gx,68,40,'#ffd0ec',.9);}
  const pr=Film.ease(a/.6);this.ellipse(gx,cy+8,10+pr*70,2+pr*9,(x,y)=>this.d(x,y)<.7?liq[2]:liq[3]);this.ellipse(gx-pr*10,cy+6,pr*30,pr*3,(x,y)=>this.d(x,y)<.4?liq[0]:0);
  this.ellipse(gx,126,22,4,this.c('#c8d8ec'));this.ellipse(gx,126,20,3,this.c('#1a1424'));this.rect(gx-1,96,3,30,glassD);this.rect(gx,96,1,30,glassC);this.poly([[gx-5,97],[gx-3,88],[gx,94],[gx+2,86],[gx+5,97]],glassD);this.line(gx-3,88,gx,94,glassC);
  for(let i=0;i<70;i++){const an=-Math.PI*(.1+.8*this.rand(i*3+100)),sp=60+this.rand(i*3+101)*200,vx=Math.cos(an)*sp,vy=Math.sin(an)*sp,ta=Math.min(a,1.2),x=gx+(this.rand(i+102)-.5)*40+vx*ta,y=72+vy*ta+.5*G*ta*ta;
   if(y>cy+12+this.rand(i)*30)continue;this.rect(x,y,2,2,liq[i%3===0?0:1]);if(a<.4)this.line(x,y,x-vx*.02,y-vy*.02,liq[2]);}
  for(const s of shards){const [x,y,r,ld]=shardAt(s,a),sz=ld?s.sz*.6:s.sz,p=[];for(let j=0;j<3;j++){const an=r+j*2.1+(j===2?.6:0);p.push([x+Math.cos(an)*sz,y+Math.sin(an)*sz*(ld?.35:1)]);}
   if(!ld&&a<s.ta){const [px,py]=shardAt(s,Math.max(0,a-.035));this.line(px,py,x,y,this.c('#5a7a9a'));}
   this.poly(p,(xx,yy)=>this.d(xx,yy)<.5?glassC:this.c('#9ac8f0'));this.px(p[0][0],p[0][1],this.c('#ffffff'));}
 }
 this.reflect(cy+1,H,cy,'#100810',t,1.2,.55);
};

// ── A small stage in a spotlight: a jazz trio of flat paper cut-outs moving on the beat; the darkness around is TV static.
F.shotJazz=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,n=bt.n,ph=bt.ph,z=1+.1*Film.ease(lt/5),fy=110,dr=-lt*3;
 const X=x=>160+(x-160)*z+dr,Y=y=>fy+(y-fy)*z,wx=x=>160+(x-160-dr)/z,wy=y=>fy+(y-fy)/z;
 const spot=(x,y)=>{const a=wx(x),b=wy(y);let L=0;if(b<=150){const hw=112*(b+30)/180;L=Math.max(0,1-Math.abs(a-160)/hw)*(.75+.25*(b+30)/180);}
  if(b>130){const e=((a-160)/120)**2+((b-150)/20)**2;L=Math.max(L,(1-e)*1.1);}return Math.min(1,L);};
 // The world of noise: static everywhere the light does not reach.
 const amp=.8+.4*k;this._dc_static(0,0,W,H,t,amp>1?['#05060a','#10121c','#20243a','#3c4462','#6a7498','#a8b0d0']:['#05060a','#0c0e16','#181c2c','#2c3248','#4a5270','#7a84a8'],(x,y)=>{const L=spot(x,y);return L<.08?1:L<.2?(.2-L)/.12:0;});
 const ramp=['#4a2a24','#8a5a3a','#c8925a','#e8c488','#f8e6b8'].map(v=>this.c(v)),wood=['#5a3020','#8a5030','#b87a48','#e0a868'].map(v=>this.c(v));
 this.rect(0,0,W,H,(x,y)=>{const L=spot(x,y);if(L<.12+this.d(x,y)*.1)return 0;const b=wy(y);
  if(b>136&&b<168){const plank=Math.floor((wx(x)+Math.floor(b/6)*17)/34);if(Math.round(b)%6===0)return wood[0];return wood[Math.min(3,Math.floor(L*3.2+this.d(x,y)*.8+(this.rand(plank*7+Math.floor(b/6))<.3?-.4:0)))];}
  if(b>=168)return L>.5?wood[0]:0;return ramp[Math.min(4,Math.floor(L*4.6+this.d(x,y)*.9))];});
 // Dust in the beam.
 for(let i=0;i<40;i++){const x=X(110+this.rand(i)*100+Math.sin(t*.5+i)*6),y=Y(((this.rand(i*3)*150+lt*6)%150)-10);if(spot(x,y)>.3&&this.d(Math.round(x),Math.round(y))<.5)this.px(x,y,this.c('#fff6dc'));}
 // Cut-outs: every part is a flat polygon hinged at a pivot; a hard drop shadow falls on the lit backdrop.
 const S=[],add=(pts,col)=>S.push([pts,this.c(col)]),rot=(ox,oy,a)=>(x,y)=>[ox+x*Math.cos(a)-y*Math.sin(a),oy+x*Math.sin(a)+y*Math.cos(a)],tr=(f,p)=>p.map(([x,y])=>f(x,y)),
  circ=(cx,cy,rx,ry,m=14)=>{const p=[];for(let i=0;i<m;i++){const a=i/m*Math.PI*2;p.push([cx+Math.cos(a)*rx,cy+Math.sin(a)*ry]);}return p;},
  bar=(x0,y0,x1,y1,w0,w1)=>{const dx=x1-x0,dy=y1-y0,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;return [[x0+nx*w0/2,y0+ny*w0/2],[x1+nx*w1/2,y1+ny*w1/2],[x1-nx*w1/2,y1-ny*w1/2],[x0-nx*w0/2,y0-ny*w0/2]];};
 const ink='#16101c',ink2='#241a2c',hit=Math.exp(-ph*7),snap=Film.ease(Math.min(1,ph*5));
 // Double bass player (left): nods, plucks on the beat.
 {const sw=Math.sin(bt.b*Math.PI)*.04,B0=rot(96,150,sw),nod=.14*hit;
  add(tr(B0,bar(-5,0,-4,-42,5,6)),ink);add(tr(B0,bar(6,0,4,-42,5,6)),ink);add(tr(B0,[[-9,1],[-1,1],[-1,-3],[-9,-3]]),ink2);add(tr(B0,[[3,1],[11,1],[11,-3],[3,-3]]),ink2);
  add(tr(B0,[[-9,-40],[9,-40],[11,-74],[-12,-74]]),ink);
  const bassR=rot(...B0(16,-6),-.14),bb=(p)=>tr(bassR,p);
  add(bb(circ(0,-20,15,17)),'#a8501e');add(bb(circ(0,-44,11,12)),'#a8501e');add(bb([[-8,-34],[8,-34],[9,-28],[-9,-28]]),'#a8501e');add(bb(circ(-3,-21,11,13)),'#c8642a');
  add(bb([[-1.5,-6],[1.5,-6],[1.5,-104],[-1.5,-104]]),'#20120c');add(bb(circ(0,-106,3,4,8)),'#20120c');add(bb([[-2,-2],[2,-2],[0,6]]),'#20120c');
  add(bb([[-7,-30],[-6,-30],[-5,-20],[-6,-20]]),'#3a1a0c');add(bb([[6,-30],[7,-30],[6,-20],[5,-20]]),'#3a1a0c');
  const [sx,sy]=B0(4,-70),[hx,hy]=bassR(0,-84);add(bar(sx,sy,(sx+hx)/2+6,(sy+hy)/2+8,5,4),ink);add(bar((sx+hx)/2+6,(sy+hy)/2+8,hx-2,hy,4,3),ink);add(circ(hx-1,hy,3,3,8),'#6a4030');
  const [px,py]=bassR(1,-26),pl=snap*3;add(bar(sx+2,sy+2,px-10,py-8,5,4),ink);add(bar(px-10,py-8,px-1+pl,py+1,4,3),ink);add(circ(px+pl,py+1,3,3,8),'#6a4030');
  const H0=rot(...B0(1,-74),nod);add(tr(H0,[[-3,0],[3,0],[3,-5],[-3,-5]]),ink);add(tr(H0,circ(1,-12,7.5,8.5)),ink);add(tr(H0,[[6,-14],[10,-10],[6,-9]]),ink);
  add(tr(H0,circ(-1,-20,9,3.5)),'#c8303a');add(tr(H0,[[-1,-24],[1,-24],[0,-26]]),'#c8303a');}
 // Drummer (centre, behind the kit): ride on every beat, snare on 2 and 4; the cymbals wobble.
 {const D=(x,y)=>[x,y],bob=hit*1.5;
  add([[156,112],[180,112],[178,86+bob],[158,86+bob]],ink);add(circ(168,78+bob,7.5,8),ink);add(circ(165,77+bob,2,2,6),'#f8e6b8');add(circ(171,77+bob,2,2,6),'#f8e6b8');add([[160,72+bob],[176,72+bob],[175,67+bob],[161,67+bob]],ink2);
  const ride=[198,90],rw=n%1===0?Math.sin(ph*28)*.22*Math.exp(-ph*4):0,stR=Film.ease(Math.min(1,ph*6))*(1-ph),rHand=[192-6*(1-hit),88+10*(1-hit)];
  add(bar(176,92+bob,184,104,5,4),ink);add(bar(184,104,rHand[0],rHand[1],4,3),ink);add(bar(rHand[0],rHand[1],ride[0]-4+(1-hit)*6,ride[1]-1-(1-hit)*12,1.6,1.4),'#e8d0a0');
  const sn=n%2===1,sh2=sn?hit:0,lHand=[150+2*(1-sh2),104-8*(1-sh2)];add(bar(160,92+bob,152,104,5,4),ink);add(bar(152,104,lHand[0],lHand[1],4,3),ink);add(bar(lHand[0],lHand[1],146,108-12*(1-sh2),1.6,1.4),'#e8d0a0');
  add(tr(rot(ride[0],ride[1],-.18+rw),circ(0,0,15,2.4)),'#e8b84a');add([[ride[0]-.8,ride[1]],[ride[0]+.8,ride[1]],[ride[0]+1,150],[ride[0]-1,150]],ink2);
  const hh=n%2===0?hit*2:0;add(circ(134,95-hh,9,1.8),'#e8b84a');add(circ(134,98,9,1.8),'#c8983a');add([[133.4,98],[134.6,98],[134.6,150],[133.4,150]],ink2);
  add(circ(148,110,9,3),'#efe0c0');add([[139,110],[157,110],[157,118],[139,118]],'#8a1a2a');add(circ(190,116,8,2.6),'#efe0c0');add([[182,116],[198,116],[197,134],[183,134]],'#8a1a2a');
  add(circ(168,128,18,18,18),ink2);add(circ(168,128,15.5,15.5,18),'#efe0c0');add(circ(168,128,6,6,12),'#c8303a');add([[150,146],[186,146],[186,150],[150,150]],ink2);}
 // Sax player (right): sways, leans back with the bell up on every downbeat.
 {const bar4=((n%4)+ph),lean=.06+.12*Math.exp(-bar4*2.2),S0=rot(236,150,0),U=rot(236,108,lean+Math.sin(bt.b*Math.PI)*.03);
  add(tr(S0,bar(-5,0,-2,-42,5,6)),ink);add(tr(S0,bar(7,0,4,-42,5,6)),ink);add(tr(S0,[[-12,1],[-3,1],[-3,-3],[-12,-3]]),ink2);add(tr(S0,[[1,1],[10,1],[10,-3],[1,-3]]),ink2);
  add(tr(U,[[-9,0],[10,0],[11,-34],[-10,-34]]),ink);add(tr(U,[[-3,-34],[3,-34],[3,-38],[-3,-38]]),ink);add(tr(U,circ(-1,-46,7.5,8.5)),ink);add(tr(U,[[-7,-48],[-11,-44],[-7,-43]]),ink);
  add(tr(U,[[-12,-53],[10,-53],[10,-55],[-12,-55]]),ink);add(tr(U,[[-7,-55],[6,-55],[5,-62],[-6,-62]]),ink);add(tr(U,[[-7,-56],[6,-56],[6,-58],[-7,-58]]),'#c8303a');
  const sx=tr(U,[[-9,-41],[-14,-37],[-16,-30],[-16,-10],[-15,4],[-20,10],[-26,8],[-28,-2],[-31,-8]]),sax='#e8b84a';
  for(let i=0;i+1<sx.length;i++){const w=i<2?2:i<5?3+i*.5:5+i*.3;add(bar(sx[i][0],sx[i][1],sx[i+1][0],sx[i+1][1],w,w+.5),sax);}
  const bell=sx[sx.length-1];add(tr(rot(bell[0],bell[1],-.6+lean),[[-7,-3],[7,-3],[4,3],[-4,3]]),'#ffd060');
  for(let i=3;i<6;i++)add(circ(sx[i][0]+1.5,sx[i][1],1.2,1.2,6),'#8a5a1a');
  const [s1,s2]=U(-4,-30),[h1,h2]=sx[3],[l1,l2]=U(-2,-24),[g1,g2]=sx[5];add(bar(s1,s2,h1+2,h2-2,4,3),ink);add(bar(l1,l2,g1+3,g2-1,4,3),ink);add(circ(h1+1,h2-1,2.6,2.6,8),'#6a4030');add(circ(g1+2,g2,2.6,2.6,8),'#6a4030');}
 const sp=([x,y])=>[X(x),Y(y)],shc=this.c('#7a4a2e');
 for(const [p]of S)this.poly(p.map(q=>{const [a,b]=sp(q);return [a+4,b+3];}),(x,y)=>spot(x,y)>.14?shc:0);
 for(const [p,col]of S)this.poly(p.map(sp),col);
};

// ── Close-up: a saxophone drawn in curling smoke; the bell exhales a heart that beats once and dissolves.
F._dc_curve=function(pts,step){const d=[];for(let i=0;i+1<pts.length;i++){const p0=pts[Math.max(0,i-1)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(pts.length-1,i+2)];
  for(let j=0;j<10;j++){const u=j/10,u2=u*u,u3=u2*u;d.push([.5*(2*p1[0]+(-p0[0]+p2[0])*u+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*u2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*u3),.5*(2*p1[1]+(-p0[1]+p2[1])*u+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*u2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*u3)]);}}
 d.push(pts[pts.length-1]);let L=0;const acc=[0];for(let i=1;i<d.length;i++){L+=Math.hypot(d[i][0]-d[i-1][0],d[i][1]-d[i-1][1]);acc.push(L);}
 const out=[];let j=0;for(let s=0;s<=L;s+=step){while(j<acc.length-2&&acc[j+1]<s)j++;const f=(s-acc[j])/Math.max(1e-6,acc[j+1]-acc[j]),x=d[j][0]+(d[j+1][0]-d[j][0])*f,y=d[j][1]+(d[j+1][1]-d[j][1])*f,tx=d[j+1][0]-d[j][0],ty=d[j+1][1]-d[j][1],tl=Math.hypot(tx,ty)||1;out.push([x,y,-ty/tl,tx/tl,s/L]);}
 return out;};
F.shotSax=function(lt,t,s){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,ox=-lt*4,oy=lt*2.5,lb=B(71)-s.t0;
 this.vgrad(0,0,W,H,['#020208','#05051a','#0a0a26','#0c0a22']);
 this.glow(170+ox,96+oy,78,'#2a2a70',.55);this.glow(300+ox,30+oy,46,'#ff3fa4',.22);this.glow(20+ox,170+oy,40,'#3af0ff',.18);
 // The player: a dark profile with a pork-pie hat, lips on the mouthpiece; forearms reaching for the keys.
 this.beginLayer();const P=(a)=>a.map(([x,y])=>[x+ox,y+oy]),dk=this.c('#0a0812'),dk2=this.c('#120e1c');
 this.poly(P([[60,20],[84,18],[96,24],[100,34],[100,40],[104,46],[107,52],[104,55],[103,58],[107,61],[106,66],[103,69],[101,75],[96,81],[88,85],[86,96],[86,112],[70,128],[40,146],[10,190],[-20,190],[-20,60],[40,40],[50,26]]),(x,y)=>x-ox>70&&y-oy>60&&y-oy<90&&this.d(x,y)<.3?dk2:dk);
 this.ellipse(98+ox,64+oy,5,6,dk);this.rect(46+ox,22+oy,58,3,dk);this.poly(P([[56,23],[58,7],[92,7],[96,23]]),dk);this.rect(57+ox,17+oy,38,3,this.c('#2a0a18'));
 this.quad(60+ox,170+oy,104+ox,128+oy,22,16,dk2);this.quad(104+ox,128+oy,140+ox,98+oy,16,12,dk);this.quad(70+ox,200+oy,112+ox,166+oy,24,18,dk2);this.quad(112+ox,166+oy,146+ox,134+oy,16,12,dk);
 this.endLayer('#5fe8f0',1);
 // Smoke: a soft body that churns along the instrument, bright braided strands, keys as rings, wisps lifting off.
 const path=this._dc_curve([[106,62],[118,58],[131,60],[141,68],[147,82],[150,100],[152,118],[155,134],[163,146],[176,148],[187,141],[193,127],[197,110],[201,94],[205,82]],.8);
 const wid=u=>u<.18?3+u/.18*3:u<.7?6+(u-.18)/.52*6:u<.9?12+(u-.7)*10:14+((u-.9)/.1)**2*16;
 const c1=this.c('#3a3670'),c2=this.c('#6a64a8'),c3=this.c('#b8b0e8'),c4=this.c('#f4f0ff'),cy2=this.c('#8ff4ff'),pk=this.c('#ffb0e0');
 for(const [x,y,nx,ny,u]of path){const w=wid(u);for(let o=-w/2;o<=w/2;o+=1){const e=1-(2*o/w)**2,sw=.5+.5*Math.sin(u*38-t*2.2+o*.5+Math.sin(u*9+t)*1.5),f=.62*e*(.45+sw*.9),qx=x+ox+nx*o,qy=y+oy+ny*o;if(this.d(Math.round(qx),Math.round(qy))<f)this.px(qx,qy,f>.45?c3:f>.25?c2:c1);}}
 for(let j=0;j<6;j++)for(let i=0;i<path.length;i++){const [x,y,nx,ny,u]=path[i],w=wid(u),o=w/2*.85*Math.sin(u*14+j*1.9+t*(.9+j*.15)),b=.5+.5*Math.sin(u*7-t*1.6+j*2.3);if(b<.35)continue;this.px(x+ox+nx*o,y+oy+ny*o,j===0?cy2:j===5?pk:b>.8?c4:b>.6?c3:c2);}
 for(const u of [.3,.37,.44,.51,.58,.65]){const p=path[Math.floor(u*(path.length-1))],w=wid(u),cx=p[0]+ox-p[2]*w*.35,cy=p[1]+oy-p[3]*w*.35;for(let a=0;a<8;a++)if(this.d(a,Math.floor(t*8))<.7)this.px(cx+Math.cos(a/8*Math.PI*2+t)*2.2,cy+Math.sin(a/8*Math.PI*2+t)*2.2,c3);}
 {const e=path[path.length-1],tx=e[3],ty=-e[2];for(let a=0;a<40;a++){const an=a/40*Math.PI*2,r=16+Math.sin(an*3+t*2)*1.5,qx=e[0]+ox+e[2]*Math.cos(an)*r+tx*Math.sin(an)*r*.3,qy=e[1]+oy+e[3]*Math.cos(an)*r+ty*Math.sin(an)*r*.3;this.px(qx,qy,a%3?c3:c4);}}
 for(let i=0;i<90;i++){const p=path[Math.floor(this.rand(i*3)*(path.length-1))],q=(t*.3+this.rand(i*5))%1,x=p[0]+ox+Math.sin(q*5+i)*6*q+q*8,y=p[1]+oy-q*44;if(this.d(Math.round(x),Math.round(y))<(1-q)*.9)this.px(x,y,q<.3?c3:c2);}
 // Fingers on the keys, in front of the smoke.
 this.beginLayer();for(const [hx,hy,us]of [[140,98,[.33,.38,.43]],[146,134,[.55,.6,.65]]]){this.ellipse(hx+ox,hy+oy,6,5,dk);for(const u of us){const p=path[Math.floor(u*(path.length-1))],w=wid(u);this.quad(hx+ox,hy+oy,p[0]+ox-p[2]*w*.4,p[1]+oy-p[3]*w*.4,4,3,dk);}}this.endLayer('#5fe8f0',1);
 // The heart: exhaled from the bell, it beats once on the bar line, then drifts and comes apart.
 const end=path[path.length-1],em=Film.ease((lt-.3)/1.3),dft=Film.ease((lt-2.8)/1.7),diss=Film.ease((lt-2.9)/1.5);
 if(em>0&&diss<1){const hx=end[0]+(226-end[0])*em+dft*62+Math.sin(lt*1.7)*2+ox,hy=end[1]+(52-end[1])*em-dft*40+oy,pul=Math.exp(-(((lt-lb)/.07)**2))*.34+Math.exp(-(((lt-lb-.2)/.07)**2))*.2,R=(3+13*em)*(1+pul+dft*.25),warm=Math.min(1,pul*4+Math.exp(-Math.max(0,lt-lb-.2)*3)*.6*(lt>lb?1:0));
  const cs=warm>.35?['#7a2a5a','#d04a8a','#ff9ac8','#fff0f6']:['#4a4488','#8a84c8','#c8c0f0','#f4f0ff'],cc=cs.map(v=>this.c(v));
  if(warm>.35)this.glow(hx,hy,R*1.8,'#ff3f7a',.3*warm);
  for(let y=Math.floor(hy-R*1.4);y<=hy+R*1.3;y++)for(let x=Math.floor(hx-R*1.4);x<=hx+R*1.4;x++){const u=(x-hx)/R,v=-(y-hy)/R+.2,a=u*u+v*v-1,f=a*a*a-u*u*v*v*v;if(f>.1)continue;
   const nz=.5+.5*Math.sin(u*5+t*2.4+v*3)*Math.sin(v*6-t*1.8),dn=f<0?.5+.5*nz:(.1-f)*2.5*nz;if(diss>0&&this.rand(((x>>1)*31)^((y>>1)*977))<diss*1.15)continue;
   if(this.d(x,y)<dn*(1-diss*.5)){const lv=f<-.05?(nz>.6?3:2):1;this.px(x,y,cc[Math.min(3,lv+(warm>.6&&nz>.7?1:0))]);}}
  for(let i=0;i<24*em*(1-diss);i++){const u=i/24,x=end[0]+ox+(hx-end[0]-ox)*u+Math.sin(u*9+t*3)*3,y=end[1]+oy+(hy-end[1]-oy)*u;if(this.d(Math.round(x),Math.round(y))<.6)this.px(x,y,c2);}
  if(diss>0)for(let i=0;i<50;i++){const a=this.rand(i)*Math.PI*2,r=R*(.6+diss*1.8*this.rand(i+9)),x=hx+Math.cos(a)*r+diss*10,y=hy+Math.sin(a)*r*.8-diss*14*this.rand(i+3);if(this.d(Math.round(x),Math.round(y))<(1-diss)*.9)this.px(x,y,cc[1+(i%2)]);}}
};

// ── Side tracking: Milton bursts out of the disco and runs; foreground posts whip past; the cadence doubles halfway.
F.shotRunOut=function(lt,t,s){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,P=Film.P,h=56,gy=150,tS=8*P,v1=2*.27*h/P,v2=v1*2;
 const xM=lt<tS?v1*lt:v1*tS+v2*(lt-tS),phase=lt<tS?walkAt(t):walkAt(s.t0+tS)+(lt-tS)/P,sx=52+92*Film.ease(lt/2.2)+14*Film.ease((lt-4)/3),cam=xM-sx+52,spd=lt<tS?v1:v2;
 this.vgrad(0,0,W,gy,['#04040c','#08081c','#10102c','#1a163e','#281e4e']);this.glow(160,gy,150,'#4a2260',.4,.4);
 // Far skyline and mid blocks with neon, at their own speeds.
 for(const [p,top,col,ww,seed]of [[.12,[40,80],'#100f24',1,1],[.4,[56,96],'#16142e',2,2]]){let x=-40-((cam*p)%2000),i=0;const base=Math.floor(cam*p/2000)*97;
  for(;x<W+40;i++){const id=i+base*0,bw=18+this.rand(id*7+seed)*26,tp=top[0]+this.rand(id*3+seed)*(top[1]-top[0]);this.rect(x,tp,bw+1,gy-tp,this.c(col));
   for(let wy=tp+4;wy<gy-6;wy+=ww*3)for(let wx=x+2;wx<x+bw-2;wx+=ww*3)if(this.rand(Math.round(wx+cam*p)*13+wy*7+seed)<.18)this.rect(wx,wy,ww,ww,this.c(this.rand(wx+wy)<.6?'#ffcf7a':'#9fe8ff'));
   if(p>.3&&i%3===1){const cc=['#ff3fa4','#3af0ff','#ffb04a'][i%3===1?(i>>1)%3:0];this.rect(x+bw/2-4,tp+8,8,30,this.c('#0e0b1a'));this.glow(x+bw/2,tp+23,14,cc,.45+k*.2);for(let q=0;q<4;q++)this.rect(x+bw/2-2,tp+11+q*7,4,4,this.c(cc));}
   x+=bw+2+this.rand(id*5+seed)*8;}}
 // Street facades: first the disco (bricks, door bursting open), then shopfronts.
 const fx=x=>x-cam;
 this.rect(fx(-40),70,200,gy-70,(x,y)=>this.c(((y%6===0)||((x+cam+((y/6|0)&1)*7)%14<1))?'#120a16':'#2a1626'));
 this.glow(fx(60),76,60,'#ff3fa4',.3+k*.1,.4);this.rect(fx(10),70,100,10,this.c('#0c0912'));this._dc_neon('DISCO',fx(16),70,4,'#ff3fa4','#ffd0ea');
 const dop=Film.ease(lt/.15);this.rect(fx(36),102,30,48,(x,y)=>{const f=.7+.3*k+this.d(x,y)*.3;return this.c(f>.95?'#ffd0ea':f>.75?'#ff5fb4':'#c02a8a');});
 this.rect(fx(36)+30*dop*.8,102,Math.max(3,30*(1-dop)),48,this.c('#2a0e2a'));if(lt<1.2)this.poly([[fx(36),gy],[fx(66),gy],[fx(110),gy+12],[fx(10),gy+12]],(x,y)=>this.d(x,y)<.4*(1-lt/1.2)?this.c('#ff5fb4'):0);
 for(let i=0;i<40;i++){const wx=200+i*96,x=fx(wx);if(x>W+10)break;if(x<-100)continue;const bw=84,tp=78+this.rand(i)*22;this.rect(x,tp,bw,gy-tp,this.c(i&1?'#1c1a36':'#201d3a'));this.rect(x,tp,bw,2,this.c('#2c2848'));
  for(let wy=tp+6;wy<gy-30;wy+=13)for(let q=0;q<5;q++)if(this.rand(i*31+q+wy)<.4)this.rect(x+6+q*16,wy,8,8,this.c(this.rand(i+q*3+wy)<.7?'#ffcf7a':'#5fd8ff'));
  const aw=['#ff3fa4','#3af0ff','#ffb04a'][i%3];this.rect(x+6,gy-26,bw-12,4,(a,b)=>((a+cam)>>2)&1?this.c(aw):this.c('#1a1426'));this.rect(x+8,gy-22,bw-16,20,this.c('#3a2a30'));this.vgrad(x+9,gy-21,bw-18,18,['#ffe0a0','#e0a058','#a8683a']);this.glow(x+bw/2,gy-6,30,aw,.25);}
 this.rect(0,gy,W,6,(i,j)=>this.c(this.d(i,j)<.15?'#34345a':'#26263e'));this.rect(0,gy+6,W,2,this.c('#4a4a6a'));this.rect(0,gy+8,W,H-gy-8,this.c('#0c0c1e'));
 // Milton: out of the doorway, growing to full size, steps on the beat (then on eighths).
 const em=Film.ease(lt/.35),mh=h*(.86+.14*em),mg=gy+2*em;this.beginLayer();this.person({x:sx,y:mg,h:mh,dir:1,walk:phase,who:'milton',pose:'run'});this.endLayer(lt<.8?'#ff9ad4':'#ffb04a',-1);
 const step=lt<tS?P:P/2,ls=Math.floor((lt<tS?lt:lt-tS)/step),tl=(lt<tS?0:tS)+ls*step,age=lt-tl;
 if(age<.35&&lt>.3){const lx=sx+.27*h-(xM-(tl<tS?v1*tl:v1*tS+v2*(tl-tS)));for(let i=0;i<10;i++){const a=Math.PI*(.15+.7*this.rand(i+ls*13)),sp=30+this.rand(i*3+ls)*50;this.px(lx+Math.cos(a)*sp*age*(i&1?1:-1),gy+2-Math.sin(a)*sp*age+120*age*age,this.c('#c8d8ff'));}}
 this.reflect(gy+8,H,gy+7,'#0a0a1c',t,2,.7);
 // Foreground posts, meters and signs rush by with a smear.
 for(let i=0;i<30;i++){const wx=150+i*130+this.rand(i)*60,x=wx-cam*1.9;if(x<-30||x>W+30)continue;const kind=i%3,sm=Math.min(30,spd*.12),ink=this.c('#07060c');
  for(let g=sm;g>=0;g-=3){const col=g?((this.d(Math.round(x+g),g)<.4)?ink:0):ink;if(!col)continue;
   if(kind===0){this.rect(x+g,40,5,H-40,col);this.rect(x+g-6,40,18,4,col);}else if(kind===1){this.rect(x+g,128,4,H-128,col);this.rect(x+g-3,116,10,14,col);}else{this.rect(x+g,90,3,H-90,col);this.rect(x+g-10,90,24,14,col);}}
  this.rect(x,kind===0?40:kind===1?116:90,1,H,this.c('#ff5fb4'));if(kind===2){this.rect(x-9,91,22,12,this.c('#1a3a6a'));this.text('ALTO',x-7,94,this.c('#e8f0ff'),1,1);}}
 this.rain(t,.9,cam*.6,0,.18+Math.min(.5,spd*.003));
};

// ── Portrait: sweat, panting on the beat, breath in the cold; a neon sign flickers on his face.
F.shotSweat=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,heave=Math.round(Math.sin(bt.ph*Math.PI)*2),ox=60+Math.sin(lt*1.7)*2,oy=-8+heave+Math.cos(lt*2.3)*1.5,S=150;
 const fr=Math.floor(t*14),flick=this.rand(fr*13)<.18,pinkOn=(bt.n&2)===0,neon=flick?null:pinkOn?'#ff3fa4':'#3af0ff';
 this.vgrad(0,0,W,H,['#04040c','#0a0a1e','#120f2c','#1a1434']);
 for(const [bx,by,r,col]of [[276,40,40,'#ff3fa4'],[300,140,34,'#3af0ff'],[14,30,30,'#ffb04a'],[30,150,26,'#3af0ff'],[240,100,18,'#ffe14a']])this.glow(bx-lt*5,by,r,col,col===neon?.75:.38);
 if(neon){this.rect(296-lt*5,0,6,H,(x,y)=>this.d(x,y)<.35?this.c(neon):0);this.glow(299-lt*5,90,44,neon,.4);}
 this.rain(t,.55,lt*14);
 this.beginLayer();
 this.portrait({x:ox,y:oy,S,who:'milton',dir:1,open:bt.ph<.45,sweat:lt*.6,kick:k,rimFront:neon?(pinkOn?'#ffb0e0':'#b0f8ff'):'#6a6a8a'});
 if(neon){const nc=this.c(neon),nr=nc&255,ng=(nc>>8)&255,nb=(nc>>16)&255;this._dc_tint((x,y,r,g,b)=>{const f=Math.max(0,(x-ox-S*.5)/(S*.45));return this.d(x,y)<f*.4?this._dc_rgb((r+nr)>>1,(g+ng)>>1,(b+nb)>>1):0;});}
 this.endLayer(null);
 // Breath vapor out of the mouth on every beat.
 const mx=ox+.86*S,my=oy+.69*S,p=bt.ph;for(let i=0;i<22;i++){const x=mx+4+p*36+this.rand(i)*14,y=my-p*10+(this.rand(i+5)-.5)*(8+p*14);if(this.d(Math.round(x),Math.round(y))<(1-p)*.75)this.px(x,y,this.c(i%4?'#c8d0f0':'#ffffff'));}
 this.rain(t,.3,lt*30);
};

// ── Ground level: his sneakers pound the wet asphalt, splashes on every step, street lights streaking behind.
F._dc_sneaker=function(ax,ay,tilt,back){const P=Film.CAST.milton,c=k=>this.c(P[k]),co=Math.cos(tilt),si=Math.sin(tilt),R=p=>p.map(([x,y])=>[ax+x*co-y*si,ay+x*si+y*co]);
 this.poly(R([[-16,-14],[-10,-24],[8,-22],[26,-12],[38,-8],[40,0],[-18,0]]),(x,y)=>this.d(x,y)<.12?c('shoeShade'):back?c('shoeShade'):c('shoe'));
 this.poly(R([[-18,-4],[40,-4],[40,0],[-18,0]]),this.c('#e8e8f0'));this.poly(R([[-18,0],[40,0],[38,4],[-16,4]]),c('sole'));
 this.poly(R([[-12,-8],[6,-14],[20,-10],[6,-10]]),c('jacket'));this.poly(R([[-18,-14],[-12,-14],[-12,-2],[-18,-2]]),c('yoke'));
 for(let i=0;i<4;i++){const [a,b]=R([[2+i*5,-20+i*2.2]])[0],[a2,b2]=R([[5+i*5,-18+i*2.2]])[0];this.line(a,b,a2,b2,this.c('#4a4a5a'));}};
F.shotRunLow=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,P=Film.P,hz=146,G=160,X=140,Lh=380,stride=Lh*.27,lift=Lh*.11,v=2*stride/P,cam=lt*v,a=walkAt(t)*Math.PI*2;
 this.vgrad(0,0,W,hz,['#05050f','#0a0a20','#141232','#24184a']);
 // Distant street: lights smeared into streaks by the speed.
 for(let i=0;i<34;i++){const p=.1+this.rand(i)*.35,y=40+this.rand(i*3)*96,len=10+p*120,x=((this.rand(i*5)*600-cam*p)%600+600)%600-140,col=['#ffb04a','#ff3fa4','#3af0ff','#ffe14a'][i%4];
  this.rect(x,y,len,1+(p>.3?1:0),(xx,yy)=>this.d(xx,yy)<.6*(1-Math.abs((xx-x)/len-.5)*1.4)?this.c(col):0);this.glow(x+len/2,y,6+p*10,col,.35);}
 for(let i=0;i<9;i++){const x=((i*90-cam*.45)%810+810)%810-60;this.rect(x,hz-70,2,70,this.c('#14122a'));}
 // Wet asphalt rushing under the lens.
 const asp=[this.c('#0c0c1c'),this.c('#14142a'),this.c('#1e1e36'),this.c('#2a2a46')];
 this.rect(0,hz,W,H-hz,(x,y)=>{const z=(y-hz)/(H-hz),sp=.2+z*1.8,u=Math.floor((x+cam*sp)/(3+z*10)),r=this.rand(u*131+y*7);return asp[r<.05?3:r<.2?2:r<.6?1:0];});
 this.reflect(hz,G+2,hz-1,'#0c0c1c',t,1.5,.65);
 // Legs: jeans cropped above the knee, detailed sneakers; heel strike tilts the toe up, push-off tilts it down.
 this.beginLayer();const hipY=G-Lh*.47-Math.abs(Math.sin(a))*8,P2=Film.CAST.milton;
 for(const i of [1,0]){const ai=a+i*Math.PI,lf=Math.max(0,Math.cos(ai))*lift,fx=X+Math.sin(ai)*stride,fy=G-lf,knee=[(X+fx)/2+20+lf*.5,(hipY+fy)/2],col=this.c(i?P2.jeansShade:P2.jeans);
  this.quad(X,hipY,knee[0],knee[1],Lh*.085,Lh*.07,col);this.quad(knee[0],knee[1],fx,fy-26,Lh*.07,Lh*.06,col);this.line(knee[0]-8,knee[1]+4,fx-6,fy-30,this.c(i?'#1c2c52':'#4a68a8'));
  this.rect(fx-14,fy-34,28,6,this.c(i?'#1c2c52':'#25396a'));
  const tilt=lf>0?(Math.sin(ai)>0?-.22*(lf/lift):.35*(lf/lift)):0;this._dc_sneaker(fx-8,fy,tilt,!!i);}
 this.endLayer('#ffb04a',-1);
 // Splash on every landing.
 for(let j=0;j<3;j++){const n=bt.n-j,tl=Film.BEAT0+n*P,age=t-tl;if(age<0||age>.7)continue;const gx=X+stride-8-v*age,cc=this.c('#d8e8ff'),cd=this.c('#8aa0d0');
  this.ellipse(gx,G+2,8+age*90,2+age*10,(x,y,dx,dy)=>Math.abs(dx*dx+dy*dy-1)<.18?cd:0);
  for(let i=0;i<26;i++){const an=Math.PI*(.08+.84*this.rand(i+n*41)),sp=60+this.rand(i*3+n)*170,x=gx+Math.cos(an)*sp*age-v*0,y=G-Math.sin(an)*sp*age+520*age*age;if(y>G+4)continue;const sz=this.rand(i+7)<.2?3:2;this.rect(x,y,sz,sz,i%3?cc:cd);}}
 this.rain(t,.7,cam*.3,0,.35);
};

// ═════════ BASS ONLY, THEN THE FULL STOP ═════════

// ── Medium tracking: her, walking past the warm window of a 24-hour laundromat on a quiet wet street.
F.shotHerWalk=function(lt,t){
 const W=this.W,H=this.H,k=Film.beat(t).kick,h=112,gy=170,v=.64*h,cam=-v*lt,X=196,fx=x=>Math.round(x-cam),fb=150;
 this.vgrad(0,0,W,fb,['#0a0816','#120e22','#181430']);
 // Neighbouring shops: a closed shutter on each side.
 for(const [x0,x1]of [[-420,-80],[200,520]]){this.rect(fx(x0),0,x1-x0,fb,this.c('#1a1628'));this.rect(fx(x0)+10,40,x1-x0-20,fb-40,(x,y)=>this.c(y%4===0?'#100c1a':'#2a2438'));this.rect(fx(x0)+10,36,x1-x0-20,4,this.c('#3a3450'));}
 // The laundromat: sign, big window with washers and dryers in warm light.
 const L0=-80,L1=200,wx0=L0+8,wx1=L1-8,wy0=36,wy1=136;
 this.rect(fx(L0),0,L1-L0,fb,this.c('#20283a'));this.rect(fx(L0),0,L1-L0,30,this.c('#141a28'));
 this.glow(fx(60),15,40,'#5ff4ff',.25);this.text('LAVANDERIA',fx(L0+20),8,this.c('#bff8ff'),2,1);
 this.rect(fx(wx0),wy0,wx1-wx0,wy1-wy0,(x,y)=>{const f=(y-wy0)/(wy1-wy0);return this.c(f<.04?'#fffbe8':this.d(x,y)<f*.9-.1?'#e0b878':'#fff0c8');});
 for(let i=0;i<3;i++){const lx=fx(wx0+20+i*90);this.rect(lx,wy0+3,50,2,this.c('#ffffff'));}
 this.rect(fx(wx0),wy1-12,wx1-wx0,12,(x,y)=>this.c(((Math.floor((x+cam)/8)+Math.floor(y/6))&1)?'#c8b8a0':'#8a7a68'));
 for(let r=0;r<2;r++)for(let i=0;i<8;i++){const mx=fx(wx0+6+i*33),my=r?wy1-46:wy0+10,mw=28,mh=r?34:30;this.rect(mx,my,mw,mh,this.c(r?'#f4f0ea':'#dcd8d4'));this.rect(mx,my,mw,4,this.c('#a8a4b0'));this.rect(mx+mw-6,my+1,3,2,this.c(i%2?'#3aff8a':'#ff4a6a'));
  const cx=mx+mw/2,cy=my+(r?20:18),rr=r?10:9,sp=t*(r?5:3)+i;this.ellipse(cx,cy,rr+1.5,rr+1.5,this.c('#8a8a98'));this.ellipse(cx,cy,rr,rr,(x,y,dx,dy)=>{const a=Math.atan2(dy,dx)+sp,bl=Math.sin(a*2)>.2&&dx*dx+dy*dy>.15;return this.c(bl?['#ff5f8a','#5fa8ff','#ffd04a','#8aff9a'][(i+r)%4]:dx<-.3&&dy<-.3?'#d8f0ff':'#3a4a6a');});}
 for(let i=0;i<4;i++)this.rect(fx(wx0+i*(wx1-wx0)/3)-1,wy0,3,wy1-wy0,this.c('#2a2a3a'));this.rect(fx(wx0),wy0-2,wx1-wx0,3,this.c('#2a2a3a'));this.rect(fx(wx0),wy1,wx1-wx0,3,this.c('#2a2a3a'));
 for(let y=wy0;y<wy1;y++)for(let x=fx(wx0);x<fx(wx1);x++){const u=(x+cam*.4)+y*.7;if(((u%140)+140)%140<10&&this.d(x,y)<.25)this.px(x,y,this.c('#ffffff'));}
 this.rect(fx(150),wy0+8,34,14,this.c('#1a0a18'));this.glow(fx(167),wy0+15,22,'#ff3fa4',.45+k*.15);this.text('24H',fx(156),wy0+11,this.c(k>.6?'#ffd0ea':'#ff5fb4'),2,1);
 this.rect(fx(L0),wy1+3,L1-L0,fb-wy1-3,this.c('#141a28'));
 // Sidewalk with the window's light spilling on it.
 this.rect(0,fb,W,H-fb,(x,y)=>this.c(this.d(x,y)<.1?'#2a2a40':'#1c1c30'));this.rect(0,fb,W,1,this.c('#3a3a58'));
 this.poly([[fx(wx0),fb],[fx(wx1),fb],[fx(wx1)+30,H],[fx(wx0)-30,H]],(x,y)=>this.d(x,y)<.28-(y-fb)/(H-fb)*.18?this.c('#c8985a'):0);
 this.reflect(fb+1,H,fb,'#16162a',t,1.4,.55);
 this.beginLayer();this.person({x:X,y:gy,h,dir:-1,walk:walkAt(t),who:'her'});this.endLayer('#ffd8a0',1);
 // A parking meter slides through the foreground.
 const mx=fx(40)*1.6-200;if(mx>-20&&mx<W+20){this.beginLayer();this.rect(mx,118,5,H-118,this.c('#141220'));this.rect(mx-4,96,13,24,this.c('#1c1a2c'));this.rect(mx-2,100,9,7,this.c('#3a4a5a'));this.endLayer('#ffd8a0',1);}
 this.rain(t,.45,cam);
};

// ── Narrow brick alley: Milton leans on the wall under a caged bulb, catching his breath; steam from a vent; slow push in.
F.shotAlley=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,zc=1+.16*Film.ease(lt/4),fx=130,fy=90,VX=168,VY=70,f=150,GY=1.25,TOP=-3.6,ZE=9;
 const bxW=-.92,byW=-.95,bzW=3.0,buzz=this.rand(Math.floor(t*20))<.04?.4:1;
 const br=[['#1a0e14','#2a141c','#3e1c24','#5a2a2a','#8a4a32'],['#160c12','#24121a','#361a22','#4e2628','#7a4230']].map(a=>a.map(v=>this.c(v))),mort=[this.c('#0c070c'),this.c('#140c10'),this.c('#24161a'),this.c('#3a2420')];
 const fl=['#0a0a14','#121222','#1e1c30','#3a2e3a','#8a6a4a'].map(v=>this.c(v)),endC=['#1a2a4a','#3a2a6a','#ff5fb4','#5ff4ff'].map(v=>this.c(v)),sky=this.c('#05050e');
 const lightAt=(X,Y,Z)=>{const d=(X-bxW)**2+(Y-byW)**2*.8+(Z-bzW)**2;return buzz*1.6/(1+d*2.2)+.12/(1+Z*.2);};
 this.rect(0,0,W,H,(x,y)=>{const px=fx+(x-fx)/zc,py=fy+(y-fy)/zc,dx=px-VX,dy=py-VY;let zw=Infinity,zf=Infinity;
  if(dx!==0){const z=Math.abs(f/dx),Y=dy*z/f;if(Y>=TOP&&Y<=GY)zw=z;}if(dy>0){zf=f*GY/dy;if(Math.abs(dx*zf/f)>1)zf=Infinity;}
  if(zf<zw&&zf<ZE){const X=dx*zf/f,I=lightAt(X,GY,zf),pud=this.rand(Math.floor(X*6)*31+Math.floor(zf*3)*7)<.35;return fl[Math.max(0,Math.min(4,Math.floor(I*(pud?5:3.2)+this.d(x,y)*.9-zf*.05)))];}
  if(zw<ZE){const side=dx<0?0:1,X=side?1:-1,Y=dy*zw/f,u=zw*3.2,vv=Y*7.5,row=Math.floor(vv),off=(row&1)*.5,fu=u+off-Math.floor(u+off),fv=vv-row,I=lightAt(X,Y,zw)*(1-zw/ZE*.6);
   if(fv<.16||fu<.1)return mort[Math.max(0,Math.min(3,Math.floor(I*3+this.d(x,y)*.6)))];const pal=br[(this.rand(row*131+Math.floor(u+off)*7+side)*2)|0];return pal[Math.max(0,Math.min(4,Math.floor(I*4.5+this.d(x,y)*.9)))];}
  if(dy<0&&(zw===Infinity||zw>=ZE)&&Math.abs(dx)<f/ZE&&dy>TOP*f/ZE)return endC[Math.floor(Math.max(0,Math.min(3,(dy-TOP*f/ZE)/(-TOP*f/ZE+GY*f/ZE)*2+this.d(x,y)+(Math.abs(dx)<4?1:0))))];
  if(dy>0)return endC[0];return sky;});
 const S=(X,Y,Z)=>[fx+(VX+X*f/Z-fx)*zc,fy+(VY+Y*f/Z-fy)*zc];
 // Far street glow, pipes, the vent and its steam.
 const [ex,ey]=S(0,0,ZE);this.glow(ex,ey,30*zc,'#ff3fa4',.35);
 for(const [X,Z0,Z1,Y]of [[1,1.2,8,-2.2],[-1,4,8,-2.6]]){const [a,b]=S(X,Y,Z0),[a2,b2]=S(X,Y,Z1);this.line(a,b,a2,b2,this.c('#2a2236'),2);}
 {const [a,b]=S(1,-3.6,2.6),[a2,b2]=S(1,GY,2.6);this.line(a,b,a2,b2,this.c('#241c2e'),Math.max(2,4*zc));this.line(a-1,b,a2-1,b2,this.c('#4a3a4a'));}
 const [vx,vy]=S(1,.4,2.1),vw=18*zc;this.rect(vx-vw,vy-8*zc,vw,14*zc,this.c('#1a1620'));for(let i=0;i<4;i++)this.rect(vx-vw+2,vy-6*zc+i*3.4*zc,vw-4,1,this.c('#3a3444'));
 for(let i=0;i<46;i++){const q=(t*.32+this.rand(i))%1,x=vx-vw/2-q*30-Math.sin(q*6+i)*6,y=vy-q*80*zc,r=(2+q*10)*zc,lit=Math.hypot(x-S(bxW,byW,bzW)[0],y-S(bxW,byW,bzW)[1])<70;
  this.ellipse(x,y,r,r*.8,(xx,yy)=>this.d(xx,yy)<(1-q)*.5?this.c(lit?'#f0d8b8':'#a8a0c0'):0);}
 // Milton against the wall, chest heaving; breath on the beats.
 const [mx,mg]=S(-.8,GY,3.2),h=1.75*f/3.2*zc,heave=bt.ph<.3?1:0;
 this.beginLayer();const o=this.person({x:mx+h*.06,y:mg,h,dir:1,walk:.25,who:'milton',pose:'stand',arms:[[.25,.5],[.1,.3]]});this._dc_shear(mg,-.1);
 if(heave){const b=this.box,L=this.L;for(let y=Math.max(1,b[1]);y<Math.round(mg-h*.55);y++)for(let x=b[0];x<=b[2];x++)L[(y-1)*W+x]=L[y*W+x];}
 this.endLayer('#ffb04a',1);
 if(bt.n%2===0){const p=bt.ph,hx=o.head[0]-(mg-o.head[1])*.1+o.q*.4,hy=o.head[1]+o.q*.3;for(let i=0;i<16;i++){const x=hx+p*22+this.rand(i)*8,y=hy-p*10+(this.rand(i+5)-.5)*(6+p*10);if(this.d(Math.round(x),Math.round(y))<(1-p)*.7)this.px(x,y,this.c('#e8d8c8'));}}
 // The caged bulb on its bracket, warm cone through the rain.
 const [bx,by]=S(bxW,byW,bzW),[wx,wy]=S(-1,byW-.1,bzW);this.line(wx,wy,bx,wy,this.c('#2a2230'),2);this.line(bx,wy,bx,by-4,this.c('#2a2230'));
 this.poly([[bx-3,by],[bx+3,by],[bx+40*zc,mg+6],[bx-30*zc,mg+6]],(x,y)=>this.d(x,y)<.08*buzz?this.c('#ffcf8a'):0);
 this.glow(bx,by,40*zc,'#ffb04a',.5*buzz+k*.05);this.ellipse(bx,by+1,3.5*zc,4.5*zc,this.c(buzz<1?'#8a6a3a':'#fff6d0'));
 for(let i=-1;i<=1;i++)this.line(bx+i*3*zc,by-3*zc,bx+i*3.5*zc,by+5*zc,this.c('#3a3040'));this.line(bx-4*zc,by+1,bx+4*zc,by+1,this.c('#3a3040'));
 this.rain(t,.8,0,0,.08);
 for(let i=0;i<30;i++){const x=bx-30+this.rand(i)*70,y=((this.rand(i*3)*H+t*260)%H);if(y>by&&y<mg)this.line(x,y,x+1,y+6,this.c('#ffcf8a'));}
};

// ── Split screen: him on a street corner, her on a balcony, both looking up — the same moon across the divider. Slow tilt up.
F.shotSameMoon=function(lt,t){
 const W=this.W,H=this.H,tilt=Math.round(46*Film.ease(lt/6)),y=v=>v+tilt,D=159;
 // Left: indigo street corner.
 this.vgrad(0,0,D,H,['#04040e','#080a1e','#0e1430','#16204a','#1c2a56']);
 this.vgrad(D+2,0,W-D-2,H,['#06040c','#0e0818','#1a0e28','#2a1436','#3a1a40']);
 for(let i=0;i<40;i++){const x=this.rand(i*3)*W,yy=this.rand(i*7)*130-40;if(Math.abs(x-D)<2)continue;if(this.rand(i+Math.floor(t*3))<.85)this.px(x,y(yy),this.c(i%3?'#8a8ab0':'#ffffff'));}
 // The moon: one disc, split by the divider; a cloud band drifts across both panels.
 const mx=D+1,my=y(34),mr=24;this.glow(mx,my,60,'#8a7ab0',.45);
 this.ellipse(mx,my,mr,mr,(x,yy,dx,dy)=>{const cr=[[-.4,-.2,.22],[.3,.35,.16],[.15,-.45,.12],[-.1,.5,.1]];for(const [cx,cy,r]of cr)if((dx-cx)**2+(dy-cy)**2<r*r)return this.c('#d0c8e4');return dx<-.55&&dy>-.2?this.c('#c8c0e0'):this.c('#f4eeff');});
 for(let i=0;i<3;i++){const cy=y(30+i*14),cx=((lt*8+i*90)%380)-60;this.ellipse(cx+40,cy,60,3,(x,yy)=>this.d(x,yy)<.35?this.c(x<D?'#1a2048':'#2a1a40'):0);}
 // Left panel: corner building, street sign, lamp, Milton looking up.
 this.rect(0,y(40),46,H,this.c('#181a34'));this.rect(46,y(40),3,H,this.c('#0e1022'));for(let wy=50;wy<160;wy+=18)for(let wx=8;wx<40;wx+=14)this.rect(wx,y(wy),8,10,this.c(this.rand(wx+wy)<.4?'#ffcf7a':'#0c0c1c'));
 this.rect(70,y(110),2,62,this.c('#2a2a44'));this.rect(58,y(108),26,7,this.c('#1a5a3a'));this.text('CALLE',60,y(109),this.c('#e8f6ee'),1,1);
 this.rect(138,y(88),2,84,this.c('#2a2840'));this.rect(132,y(86),12,3,this.c('#3a3654'));this.rect(134,y(89),8,1,this.c('#ffcf8a'));this.glow(138,y(92),20,'#ffb04a',.45);
 this.rect(0,y(172),D,H,this.c('#12122a'));this.rect(0,y(172),D,1,this.c('#3a3a5a'));for(let i=0;i<5;i++)this.rect(10+i*30,y(178),18,3,this.c('#2a2a46'));
 const look=(x,gy,h,dir,who,rim)=>{this.beginLayer();const o=this.person({x,y:gy,h,dir,walk:.3,who,pose:'stand'});const q=o.q,[hx,hy]=o.head;this._dc_rot(hx-q*1.05,hy-q*.95,hx+q*1.05,hy+q*.42,hx-dir*q*.15,hy+q*.42,-dir*.38);this.endLayer(rim,dir);return o;};
 look(100,y(172),74,1,'milton','#9fd8ff');
 // Right panel: her balcony — stucco wall, lit window, wrought-iron rail.
 this.rect(D+2,y(60),W-D-2,H,this.c('#2a1a30'));this.rect(250,y(70),50,74,this.c('#0e0812'));this.vgrad(253,y(73),44,68,['#ffd890','#e0a058','#a8683a']);this.rect(274,y(73),2,68,this.c('#0e0812'));this.glow(275,y(110),40,'#ffb04a',.3);
 this.rect(D+2,y(150),W-D-2,6,this.c('#3a2a3a'));this.rect(D+2,y(150),W-D-2,1,this.c('#6a4a5a'));this.rect(D+2,y(156),W-D-2,H,this.c('#120a16'));
 look(214,y(150),72,-1,'her','#ffd0a0');
 const iron=this.c('#0a060c');this.rect(D+2,y(118),W-D-2,3,iron);for(let x=D+6;x<W;x+=8){this.rect(x,y(118),1,32,iron);if((x>>3)&1)this.ellipse(x+4,y(132),3,4,(xx,yy,dx,dy)=>Math.abs(dx*dx+dy*dy-.8)<.3?iron:0);}
 this.rect(D+8,y(136),12,14,this.c('#5a2a1a'));for(let i=0;i<6;i++)this.ellipse(D+10+i*2,y(132)-this.rand(i)*8,3,4,this.c(i%2?'#2a6a3a':'#3a8a4a'));
 // Divider.
 this.rect(D,0,2,H,this.c('#020206'));this.rect(D-1,0,1,H,this.c('#2a2840'));this.rect(D+2,0,1,H,this.c('#2a2840'));
};

// ── The song stops dead: a black frame, his silhouette frozen mid-step, only the yellow beanie glowing; rain hangs in the air.
F.shotFreeze=function(lt,t){
 const W=this.W,H=this.H,zc=1+.035*lt,fx=150,fy=100,Z=(x,y)=>[fx+(x-fx)*zc,fy+(y-fy)*zc],h=96*zc,[px,gy]=Z(150,150);
 this.clear('#020205');this.vgrad(0,gy-20,W,H-gy+20,['#020205','#04040c','#05050f']);
 const P=Film.CAST.milton,keep=new Set(['beanie','beanieLight','beanieShade','beanieDark'].map(n=>this.c(P[n])));
 this.beginLayer();const o=this.person({x:px,y:gy,h,dir:1,walk:.08,who:'milton'});const [hx,hy]=o.head,bc=[hx,hy-o.q*.35];
  const dk=this.c('#0d0b16'),wm=this.c('#3a2e14');this._dc_tint((x,y,r,g,b)=>{const v=((255<<24)|(b<<16)|(g<<8)|r)>>>0;if(keep.has(v))return 0;return Math.hypot(x-bc[0],y-bc[1])<o.q*1.3&&this.d(x,y)<.4?wm:dk;});
 // Glow first so it sits behind the figure.
 const save=this.L.slice(),box=this.box.slice();this.T=this.buf;this.box=null;this.glow(bc[0],bc[1],38*zc,'#ffd23a',.42);this.glow(bc[0],bc[1],16*zc,'#fff08a',.35);this.L.set(save);this.T=this.L;this.box=box;
 this.endLayer('#3a3458',1);
 // Faint reflection of the beanie on the wet ground.
 this.glow(bc[0],gy+(gy-bc[1])*.35,14*zc,'#a08a2a',.3,.35);
 // Frozen raindrops: dim, warm where the beanie lights them.
 for(let i=0;i<240;i++){const [x,y]=Z(this.rand(i*3)*W,this.rand(i*7)*H),d=Math.hypot(x-bc[0],y-bc[1]);const col=d<34?'#ffe08a':d<70?'#8a7a3a':'#22223a';this.px(x,y,this.c(col));this.px(x+.2,y+1,this.c(d<34?'#c8a84a':d<70?'#4a4220':'#16162a'));}
 // In the last half-second, one faint heartbeat.
 const hb=Math.exp(-(((lt-1.62)/.09)**2));if(hb>.03){const cx=o.sh[0]+o.q*.2,cy=o.sh[1]+h*.08;this.glow(cx,cy,(6+hb*8)*zc,'#ff2a4a',.4*hb);if(hb>.5){this.px(cx,cy,this.c('#ff6a7a'));this.px(cx+1,cy,this.c('#c02a3a'));}}
};
