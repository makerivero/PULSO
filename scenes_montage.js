'use strict';
// Montage (178–242 s): the instrumental groove — an MTV cut of their parallel lives — and the bridge, where the red thread
// shows up among the power cables. Helpers use the _mt_ prefix.

// ───── Helpers ─────
// Fast dithered vertical gradient written straight into the target (only use outside a character layer).
F._mt_grad=function(y0,y1,cols,ox=0,span=0,x0=0,x1=this.W){
 const W=this.W,T=this.T,h=span||(y1-y0),cs=cols.map(c=>this.c(c)),n=cs.length-1;
 for(let y=Math.max(0,Math.floor(y0));y<Math.min(this.H,y1);y++){const f=(y-y0+ox)/h*n;
  for(let x=Math.max(0,x0);x<Math.min(W,x1);x++){const k=Math.floor(f+this.d(x,y));T[y*W+x]=cs[k<0?0:k>n?n:k];}}
};
F._mt_stars=function(n,seed,yMax,ox=0,oy=0,t=0){const W=this.W+40;
 for(let i=0;i<n;i++){const x=((this.rand(seed+i*3)*W-ox)%W+W)%W-20,y=this.rand(seed+i*7)*yMax-oy,b=this.rand(seed+i*11);
  if(this.rand(seed+i*13+Math.floor(t*3+b*5))<.12)continue;this.px(x,y,this.c(b<.15?'#e8e4ff':b<.5?'#8a86b8':'#4e4c7a'));if(b<.04){this.px(x-1,y,this.c('#6a66a0'));this.px(x+1,y,this.c('#6a66a0'));}}
};
// One parallax layer of city blocks with lit windows. o: {par, base, seed, sp, w:[min,max], h:[min,max], cols:[a,b], lit, warm,
//  win:[ww,wh,gx,gy], pulse (LED crowns that flash by beat group), spires}
F._mt_blocks=function(camX,o,t){
 const W=this.W,bt=Film.beat(t),sp=o.sp,off=camX*o.par,i0=Math.floor((off-80)/sp),i1=Math.ceil((off+W+80)/sp);
 const [ww,wh,gx,gy]=o.win||[2,2,4,4],warm=this.c(o.warm||'#ffcf7a'),cool=this.c('#9fe8ff'),dim=this.c(o.dimWin||'#2a2448');
 for(let i=i0;i<=i1;i++){const r=k=>this.rand(o.seed+i*131+k*17),bw=Math.round(o.w[0]+r(1)*(o.w[1]-o.w[0])),bh=Math.round(o.h[0]+r(2)*(o.h[1]-o.h[0]));
  const x=Math.round(i*sp-off+(r(3)-.5)*sp*.5),top=o.base-bh,col=this.c(r(4)<.5?o.cols[0]:o.cols[1]);
  this.rect(x,top,bw,bh+2,col);if(o.edge)this.rect(x,top,1,bh,this.c(o.edge));
  if(o.spires&&r(6)<.35){const sx=x+Math.round(bw/2);this.rect(sx,top-8-r(7)*10,1,12+r(7)*10,col);if((bt.n+i)%2===0)this.px(sx,top-8-r(7)*10,this.c('#ff3a4a'));}
  const grp=((i%4)+4)%4,on=o.pulse&&grp===bt.n%4?bt.kick:0;
  for(let wy=top+3;wy<o.base-gy+1;wy+=gy)for(let wx=x+2;wx<=x+bw-2-ww;wx+=gx){const h=this.rand(o.seed*7+i*977+(wy-top)*13+(wx-x)*7);
   if(h<o.lit)this.rect(wx,wy,ww,wh,h<o.lit*.3?cool:warm);else if(on>.15&&h<o.lit+.35)this.rect(wx,wy,ww,wh,this.c(on>.6?'#ffe9c0':'#c08a4a'));else if(o.dimWin&&h>.85)this.rect(wx,wy,ww,wh,dim);}
  if(o.pulse){const led=this.c(grp&1?'#3af0ff':'#ff3fa4');if(on>.08){this.rect(x,top,bw,1,led);if(on>.4){this.rect(x,top+1,bw,1,led);this.glow(x+bw/2,top,bw*.7,grp&1?'#3af0ff':'#ff3fa4',on*.5,.5);}}else this.rect(x,top,bw,1,this.c(grp&1?'#1a4a5a':'#4a1a4a'));}}
};
// Recolor everything in the current character layer to one flat color (a backlit silhouette).
F._mt_flat=function(col){const b=this.box;if(!b||b[2]<0)return;const L=this.L,W=this.W,v=this.c(col);for(let y=Math.max(0,b[1]);y<=Math.min(this.H-1,b[3]);y++)for(let x=Math.max(0,b[0]);x<=Math.min(W-1,b[2]);x++)if(L[y*W+x])L[y*W+x]=v;};
// Darken/tint every pixel of the current layer: c' = c·f + tint (backlit figures, phone-lit faces).
F._mt_shade=function(f,tint='#000000',fn=null){const b=this.box;if(!b||b[2]<0)return;const L=this.L,W=this.W,tc=this.c(tint),tr=tc&255,tg=(tc>>8)&255,tb=(tc>>16)&255;
 for(let y=Math.max(0,b[1]);y<=Math.min(this.H-1,b[3]);y++)for(let x=Math.max(0,b[0]);x<=Math.min(W-1,b[2]);x++){const v=L[y*W+x];if(!v)continue;const ff=fn?fn(x,y):f;
  const r=Math.min(255,(v&255)*ff+tr),g=Math.min(255,((v>>8)&255)*ff+tg),bb=Math.min(255,((v>>16)&255)*ff+tb);L[y*W+x]=((255<<24)|(bb<<16)|(g<<8)|r)>>>0;}};
// Long hair flipping out behind her head on the beat (drawn into the current layer after person()).
F._mt_hairFlip=function(o,dir,swing,col='#6b3f22'){const [hx,hy]=o.head,q=o.q,s=dir,c=this.c(col);
 this.poly([[hx-s*q*.1,hy-q*.62],[hx-s*q*.62,hy-q*.3],[hx-s*q*(.8+swing*1.1),hy+q*(.5-swing*.5)],[hx-s*q*(.9+swing*1.5),hy+q*(1.25-swing*.9)],[hx-s*q*(.5+swing*.6),hy+q*(1.4-swing*.3)],[hx-s*q*.3,hy+q*.8]],c);};
// Erase the current layer outside a rectangle (to show a figure only through a window).
F._mt_clip=function(x0,y0,x1,y1){const b=this.box;if(!b||b[2]<0)return;const L=this.L,W=this.W,fn=typeof x0==='function'?x0:null;for(let y=Math.max(0,b[1]);y<=Math.min(this.H-1,b[3]);y++)for(let x=Math.max(0,b[0]);x<=Math.min(W-1,b[2]);x++)if(fn?!fn(x,y):(x<x0||x>=x1||y<y0||y>=y1))L[y*W+x]=0;};
// A sagging power cable (parabolic catenary) of width w.
F._mt_cable=function(x0,y0,x1,y1,sag,col,w=1){const c=typeof col==='number'?col:this.c(col),n=Math.max(2,Math.ceil(Math.abs(x1-x0)+Math.abs(y1-y0)));let px=x0,py=y0;
 for(let i=1;i<=n;i++){const f=i/n,x=x0+(x1-x0)*f,y=y0+(y1-y0)*f+4*sag*f*(1-f);if(w<=1)this.px(x,y,c);else this.rect(x-w/2,y-w/2,w,w,c);px=x;py=y;}};
// Neon tube lettering built on the 3×5 font: lit cells are joined into strokes, drawn as glow + colored tube + hot core.
F._mt_neon=function(str,x,y,s,col,core,glowAmt=.45,skip=null,tw=0,halo=null){
 str=String(str).toUpperCase();const segs=[];let cx=x;
 [...str].forEach((ch,ci)=>{const g=ArcadeGame.font[ch];if(g&&ch!==' '&&!(skip&&skip(ci))){const on=(r,q)=>r>=0&&r<5&&q>=0&&q<3&&g[r*3+q]==='1',P=(r,q)=>[cx+q*s+s/2,y+r*s+s/2];
  for(let r=0;r<5;r++)for(let q=0;q<3;q++){if(!on(r,q))continue;let any=false;
   if(on(r,q+1)){segs.push([...P(r,q),...P(r,q+1)]);any=true;}if(on(r+1,q)){segs.push([...P(r,q),...P(r+1,q)]);any=true;}
   for(const d of [-1,1])if(on(r+1,q+d)&&!on(r+1,q)&&!on(r,q+d)){segs.push([...P(r,q),...P(r+1,q+d)]);any=true;}
   if(!any&&!on(r-1,q)&&!on(r,q-1)&&!on(r-1,q-1)&&!on(r-1,q+1))segs.push([...P(r,q),...P(r,q)]);}}
  cx+=4*s;});
 this._mt_tubes(segs,s,col,core,glowAmt,tw,halo);
};
// Draw tube segments [[x0,y0,x1,y1],...] as neon: a dithered halo, colored glass and a white-hot core.
F._mt_tubes=function(segs,s,col,core,glowAmt=.45,tw=0,halo=null){
 tw=tw||Math.max(2,Math.round(s*.45));const cc=this.c(col),hc=this.c(core),W=this.W,T=this.T;
 if(glowAmt>0){const hl=this.c(halo||col);for(const [a,b,c2,d]of segs)this.line(a,b,c2,d,(x,y)=>this.d(x,y)<glowAmt?hl:T[y*W+x],tw+4);}
 for(const [a,b,c2,d]of segs)this.line(a,b,c2,d,cc,tw);
 for(const [a,b,c2,d]of segs)this.line(a-.5,b-.5,c2-.5,d-.5,hc,Math.max(1,Math.round(tw*.4)));
};
// Wet-floor mirror limited to a box; mask(x,y) picks the puddles. Rows below `axis` show the rows above it, rippled and darkened.
F._mt_mirror=function(x0,x1,y0,y1,axis,base,t,strength=.55,mask=null){
 const W=this.W,H=this.H,b=this.T,bc=this.c(base);
 for(let y=Math.max(0,y0);y<Math.min(H,y1);y++){const f=(y-y0)/Math.max(1,y1-y0),sy=Math.round(2*axis-y+Math.sin(y*.9+t*3)*.6);if(sy<0||sy>=H)continue;
  for(let x=Math.max(0,Math.floor(x0));x<Math.min(W,x1);x++){if(mask&&!mask(x,y))continue;const ox=Math.max(0,Math.min(W-1,Math.round(x+Math.sin(y*.55+t*4+x*.02)*(.6+f)))),src=b[sy*W+ox];
   b[y*W+x]=this.d(x,y)<strength*(1-f*.5)?((((src&0xfefefe)>>>1)+((src&0xfcfcfc)>>>2)+((bc&0xfcfcfc)>>>2))|0xff000000)>>>0:bc;}}
};
// Rooftop water tank on a steel stand. x = left edge of the barrel, gy = roof level. part: 'legs' | 'barrel' | undefined (both).
F._mt_tank=function(x,gy,w,bh,lh,part){
 const wood=this.c('#221a2c'),wood2=this.c('#18121f'),hoop=this.c('#3a3050'),steel=this.c('#120f1a'),top=gy-lh-bh;
 if(part!=='barrel'){for(const lx of [x+2,x+w*.5-1,x+w-4]){this.rect(lx,gy-lh,3,lh,steel);}
  for(let k=0;k<2;k++){const ly=gy-lh+k*lh/2;this.line(x+3,ly,x+w-3,ly+lh/2,steel,1);this.line(x+w-3,ly,x+3,ly+lh/2,steel,1);}
  for(let r=top+4;r<gy-2;r+=3)this.rect(x+w-1,r,4,1,steel);this.rect(x+w+2,top+2,1,gy-top-2,steel);}
 if(part==='legs')return;
 this.rect(x-2,gy-lh-2,w+4,3,steel);
 this.rect(x,top,w,bh,(i,j)=>((i-x)%4===0)?wood2:(i-x>w*.62&&this.d(i,j)<.35?this.c('#30243c'):wood));
 for(let k=1;k<5;k++)this.rect(x-1,top+Math.round(bh*k/5),w+2,1,hoop);
 this.poly([[x-3,top+1],[x+w/2,top-w*.38],[x+w+3,top+1]],(i,j)=>i>x+w/2&&this.d(i,j)<.3?this.c('#2c2238'):this.c('#1c1526'));
 this.rect(x+w/2-1,top-w*.38-4,2,4,steel);
};
// TV antenna mast with a blinking beacon.
F._mt_antenna=function(x,gy,h,t,col='#1c1828'){const c=this.c(col),bt=Film.beat(t),top=gy-h;
 this.rect(x,top,2,h,c);this.line(x+1,top+h*.25,x-h*.28,gy,c);this.line(x+1,top+h*.25,x+h*.3,gy,c);
 for(let k=0;k<4;k++){const y=top+6+k*7,w=14-k*2;this.rect(x-w/2+1,y,w,1,c);for(let q=0;q<w;q+=3)this.px(x-w/2+1+q,y+1,c);}
 const on=bt.n%2===0?bt.kick:0;this.rect(x,top-2,2,2,this.c(on>.3?'#ff6a6a':'#7a1a24'));if(on>.2)this.glow(x+1,top-1,8,'#ff3a4a',on*.7);
};
F._mt_chimney=function(x,gy,w,h,col='#1e1a2c'){this.rect(x,gy-h,w,h,(i,j)=>((j-gy)%4===0||((i-x+(Math.floor((j-gy)/4)&1)*2)%5===0))?this.c('#16131f'):this.c(col));this.rect(x-1,gy-h,w+2,3,this.c('#2a2438'));};

// ───── Instrumental groove ─────
// Wide on a rooftop: Milton dances in front of a neon billboard; the skyline behind flashes like a VU meter on the beat.
F.shotRoofDance=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,camX=Film.ease(lt/4)*44-12,roof=136,gy=164;
 this._mt_grad(0,roof,NIGHT.slice(0,5).concat(['#4a2a6a']));
 this._mt_stars(70,11,80,camX*.05,0,t);
 this.glow(150-camX*.1,roof+4,160,'#7a2a7a',.3+k*.1,.3);
 this._mt_blocks(camX,{par:.1,base:roof-4,seed:3,sp:12,w:[9,15],h:[14,50],cols:['#1a1840','#1e1b46'],lit:.1,win:[1,1,3,3],spires:true},t);
 this._mt_blocks(camX,{par:.22,base:roof-1,seed:9,sp:27,w:[16,24],h:[16,52],cols:['#100f2a','#131230'],lit:.22,win:[2,2,4,5],pulse:true},t);
 // Billboard on its scaffold, behind the parapet.
 const bx=170-camX*.8,by=26,bw=128,bh=58,st=this.c('#120f1a');
 for(const lx of [bx+14,bx+bw-18]){this.rect(lx,by+bh,4,roof-by-bh,st);this.line(lx+2,by+bh+4,lx+(lx<bx+60?26:-22),roof,st,2);}
 this.rect(bx-6,by+bh+8,bw+12,3,st);for(let q=0;q<bw+12;q+=4)this.rect(bx-6+q,by+bh+3,1,5,st);this.rect(bx-6,by+bh+3,bw+12,1,st);
 this.glow(bx+bw/2,by+bh/2,92,'#ff3fa4',.22+k*.16,.6);
 this.rect(bx,by,bw,bh,(i,j)=>this.c(this.d(i,j)<.06?'#2a1438':'#170a22'));
 const pink=k>.55?'#ffd0ea':'#ff7ac4',cyan=k>.55?'#f0ffff':'#b8fbff';
 this._mt_tubes([[bx+3,by+3,bx+bw-4,by+3],[bx+bw-4,by+3,bx+bw-4,by+bh-4],[bx+bw-4,by+bh-4,bx+3,by+bh-4],[bx+3,by+bh-4,bx+3,by+3]],3,'#ff3fa4',pink,.3+k*.2,2,'#6a1850');
 this._mt_neon('BAILA',bx+Math.round((bw-this.textW('BAILA',6,1))/2),by+14,6,'#3af0ff',cyan,.35+k*.25,null,3,'#155a6a');
 for(let s2=0;s2<3;s2++){const sx=bx+22+s2*40;this.rect(sx,by+bh+4,6,3,this.c('#2a2438'));this.poly([[sx+1,by+bh+4],[sx+5,by+bh+4],[sx+16,by+bh-8],[sx-10,by+bh-8]],(i,j)=>this.d(i,j)<.16?this.c('#ffe9c0'):0);}
 // Parapet: brick ledge with a coping stone.
 const cx=Math.round(camX);
 this.rect(0,roof-6,W,9,(i,j)=>{const row=Math.floor((j-roof+6)/3),u=i+cx+(row&1)*3;return this.c(j<roof-4?'#2e2840':(u%6===0||(j-roof+6)%3===0)?'#17131f':'#221c30');});
 this.rect(0,roof-7,W,1,this.c('#4e4468'));
 // Roof surface: gravel, then puddles that mirror the billboard and the city.
 this.rect(0,roof+3,W,H-roof-3,(i,j)=>this.c(this.rand(((i+cx)*7)^(j*131))<.06?'#2a2640':'#17152c'));
 const pud=[[150,166,70,6],[20,172,40,5],[262,158,46,4],[100,176,90,5]],mask=(x,y)=>{const wx=x+camX;for(const [px,py,rx,ry]of pud){const dx=(wx-px)/rx,dy=(y-py)/ry;if(dx*dx+dy*dy<1-this.d(x,y)*.25)return true;}return false;};
 this._mt_mirror(0,W,roof+3,H,roof+2,'#100e22',t,.6,mask);
 for(let y=roof+4;y<H;y++)for(let x=0;x<W;x++){const dx=(x-bx-bw/2)/110;if(dx*dx<1&&this.d(x,y)<(1-dx*dx)*(.16+k*.2)*(1-(y-roof)/60)&&mask(x,y))this.px(x,y,this.c(((x>>2)+y)&1?'#ff5fb4':'#3af0ff'));}
 // Water tank (left) and antenna, rim-lit by the billboard.
 const tx=14-camX*1.05;this._mt_tank(tx,gy-8,46,44,44,'legs');this.beginLayer();this._mt_tank(tx,gy-8,46,44,44,'barrel');this.endLayer('#ff6fc0',1);
 this._mt_antenna(98-camX,gy-14,96,t,'#120f1a');
 // Milton dances; he turns around every bar.
 const turn=Math.floor(bt.n/4)%2?-1:1,mx=142-camX*.95;
 this.beginLayer();this.person({x:mx,y:gy,h:78,dir:turn,pose:'dance',beat:bt.ph,who:'milton'});this.endLayer(k>.5?'#ffd0ea':'#ff8fd0',1);
 this._mt_mirror(mx-40,mx+40,gy+1,H,gy,'#100e22',t,.65,mask);
 // Foreground turbine vent in silhouette, faster than the roof.
 const vx=286-camX*1.5,dk=this.c('#07060c');this.rect(vx,150,20,H-150,dk);this.ellipse(vx+10,146,13,9,dk);this.rect(vx-2,138,24,2,dk);this.rect(vx+9,132,2,6,dk);
 for(let f=0;f<5;f++)this.px(vx+2+f*4,141+(f&1),this.c('#3a2a48'));this.rect(vx+1,150,1,H-150,this.c('#5a2050'));
 this.rain(t,.3,camX);
};

// Exterior of an apartment block: a grid of small lives; the camera pushes in on one warm window where her silhouette dances.
F.shotWindowDance=function(lt,t){
 const W=this.W,H=this.H,T=this.T,bt=Film.beat(t),k=bt.kick,e=Film.ease(lt/4.3),z=Math.exp(e*Math.log(3)),
  tx=201,ty=99,cx=160+(tx-160)*e,cy=90+(ty-90)*e,S=(x,y)=>[(x-cx)*z+160,(y-cy)*z+90],roofY=14;
 const C=h=>this.c(h),brick=C('#2a1a30'),brick2=C('#24162a'),brickL=C('#36223a'),mortar=C('#1a1020'),stone=C('#4a3c5c'),stoneD=C('#2e2440'),sky=['#06061a','#0c0b26','#16123a'];
 // Window lives: 0 lamp + reader, 1 TV, 2 blinds, 3 kitchen, 4 LED room, 5 dark, 6 plants; 9 is hers.
 const MAP=[[2,4,1,6,5,3],[5,0,4,9,3,1],[0,1,3,6,5,4]],kind=(i,j)=>MAP[j]&&MAP[j][i]!==undefined?MAP[j][i]:5;
 const tvc=C(['#2a5aff','#4a8aff','#1a3ab0','#8ac0ff','#5a7aff'][Math.floor(this.rand(bt.n*3+Math.floor(bt.ph*3))*5)]);
 for(let y=0;y<H;y++){const wy=(y-90)/z+cy;for(let x=0;x<W;x++){const wx=(x-160)/z+cx;let v;
  if(wy<roofY){const f=Math.max(0,(wy+30)/44);v=C(sky[Math.min(2,Math.floor(f*2.99+this.d(x,y)*.8))]);if(wx>250&&wx<282&&wy>-14+(wx-250)*.1)v=C('#0a0814');}
  else{const i=Math.floor((wx-4)/56),j=Math.floor((wy-22)/50),lx=wx-(18+i*56),ly=wy-(30+j*50);
   if(lx>=0&&lx<30&&ly>=0&&ly<34){const kd=kind(i,j),u=lx/30,q=ly/34,dd=this.d(x,y);
    if(kd===9){const g=1-Math.hypot(u-.72,q-.3)*1.1;v=C(g+dd*.25>.62?'#ffd89a':g+dd*.25>.38?'#f0a85a':g+dd*.2>.1?'#c86a3a':'#8a3a2a');
     if(u<.13||u>.88)v=C(dd<.5?'#ffe6c0':'#e8b080');
     const sp=Math.floor(t*1.5);for(let m=0;m<5;m++){const mx=((this.rand(m+sp*7)*30+t*7*(m%2?1:-1))%30+30)%30,my=this.rand(m*3+sp)*30;if(Math.abs(lx-mx)<.9&&Math.abs(ly-my)<.9)v=C('#fff6e0');}}
    else if(kd===0){const g=Math.hypot(u-.24,q-.32);v=C(g<.2+dd*.1?'#ffc070':g<.45+dd*.15?'#c87a40':'#7a3e2a');
     if(u>.14&&u<.34&&q>.2&&q<.36&&Math.abs(u-.24)<.06+(q-.2)*.4)v=C('#fff0b0');if(Math.abs(u-.24)<.025&&q>.36)v=C('#2a1810');
     if((u>.56&&u<.96&&q>.62)||Math.hypot((u-.74)/.1,(q-.46)/.1)<1||(u>.6&&u<.88&&q>.54))v=C('#2a1410');if(u>.5&&u<.64&&q>.5&&q<.62)v=C('#e8d8b0');}
    else if(kd===1){const g=Math.hypot(u-.15,q-.5);v=g<.5+dd*.3?tvc:C('#121a50');if(q>.6&&u>.3&&u<.95)v=C('#0a0c1a');if(Math.hypot((u-.62)/.09,(q-.55)/.11)<1)v=C('#0a0c1a');}
    else if(kd===2){v=C((ly%3)<1.2?'#1a1626':(q<.5?'#8a6a4a':'#5a4436'));}
    else if(kd===3){v=C(q<.15?'#2a3a3a':dd<.85?'#c8f0d8':'#e8fff0');if(q>.1&&q<.45&&(Math.abs(u-.3)<.06||Math.abs(u-.7)<.06))v=C('#2a3a34');if(q>.72)v=C('#3a4a48');}
    else if(kd===4){v=C(u<.35||u>.65?(dd<.4?'#ff5fb4':'#a02a7a'):'#3a1450');}
    else if(kd===6){v=C(dd<.3?'#2a4a3a':'#1a2a2a');for(const [a,b,r]of [[.2,.7,.22],[.5,.55,.18],[.8,.75,.2],[.35,.3,.12],[.7,.3,.14]])if(Math.hypot(u-a,(q-b)*.8+Math.sin(u*30)*.03)<r)v=C(dd<.2?'#3a6a3a':'#0e1a12');}
    else v=C(dd<.08?'#1c1830':'#0e0c1a');}
   else if(lx>=-3&&lx<33&&ly>=-5&&ly<0)v=ly<-4?stoneD:stone;
   else if(lx>=-3&&lx<33&&ly>=34&&ly<37)v=ly<35?C('#5a4c70'):stoneD;
   else{const row=Math.floor(wy/3),bx2=Math.floor((wx+(row&1)*3.5)/7);
    v=(wy-row*3<.6||(wx+(row&1)*3.5)-bx2*7<.7)?mortar:(this.rand(row*311+bx2*17)<.2?brick2:this.rand(row*97+bx2*7)<.12?brickL:brick);}}
  T[y*W+x]=v;}}
 {const [a,b]=S(0,roofY),[a2]=S(320,roofY);this.rect(a,b-2*z,a2-a,3*z,stone);this.rect(a,b+z,a2-a,Math.max(1,z),stoneD);}
 // Props: AC units, a drying towel, a drainpipe.
 const R=(x,y,w,h,c)=>{const [a,b]=S(x,y);this.rect(a,b,Math.max(1,w*z),Math.max(1,h*z),typeof c==='string'?C(c):c);};
 R(10,roofY,3,200,'#1e1828');for(let y=roofY+10;y<200;y+=24)R(9,y,5,2,'#2a2238');
 for(const [i,j]of [[0,0],[2,1],[5,0],[1,2],[4,2]]){const x0=18+i*56,y0=30+j*50;R(x0+6,y0+38,18,9,'#3a3a4c');R(x0+6,y0+38,18,1,'#5a5a70');for(let g=0;g<4;g++)R(x0+8+g*4,y0+41,2,4,'#222232');R(x0+5,y0+40,1,7,'#1a1a26');}
 {const x0=18+4*56,y0=30;R(x0+4,y0+36,22,1,'#5a4c70');R(x0+8,y0+37,8,10,'#d0507a');R(x0+18,y0+37,5,7,'#e8e8f0');}
 // Warm spill around her window.
 {const [a,b]=S(201,97);this.glow(a,b,30*z,'#ffb04a',.16+k*.1,.9);}
 // Her window: her silhouette dancing inside, then the sash bars and a window box over her.
 const [wx0,wy0]=S(186,80),[wx1,wy1]=S(216,114);
 this.beginLayer();const [px,py]=S(206,128),ph=Math.floor(bt.n/4)%2?-1:1;const MV=[[[2.0,.5],[.4,-1.4]],[[1.7,-.9],[-2.5,0]],[[1.5,.1],[-.4,-.9]],[[1.7,-.9],[-2.5,0]]],mv=MV[((bt.n%4)+4)%4],o=this.person({x:px,y:py,h:40*z,dir:ph,pose:'dance',beat:bt.ph,who:'her',arms:mv});this._mt_hairFlip(o,ph,k*.9);this._mt_shade(.22,'#1a0806');this._mt_clip(Math.ceil(wx0),Math.ceil(wy0),Math.floor(wx1),Math.floor(wy1));this.endLayer(k>.5?'#fff0c8':'#ffc070',ph,'#2a1018');
 R(200.5,80,2,34,'#3a2626');R(186,95,30,2,'#3a2626');R(186,95,30,.6,'#7a5a4a');
 for(let p=0;p<5;p++){R(188+p*6,110,4,4,'#7a3a24');R(187+p*6,107,6,3,p&1?'#1e3a20':'#2a4a24');R(189+p*6,106,2,1.5,p&1?'#ff5fb4':'#ffe14a');}
 // A power cable in the foreground crosses the frame.
 const fy=24-e*44;this._mt_cable(-10,fy,330,fy+18,22,'#05040a',2);
 this.rain(t,.55,0,0);
};

// Side view of an elevated train at night: the camera rides along; Milton in one car, her in the next — they don't know.
F.shotSubway=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,C=h=>this.c(h),V=320,run=t*V,rail=162;
 const X0=Math.round(30-Film.ease(lt/4.2)*250),bob=i=>((bt.n+i)%2===0&&bt.ph<.15)?1:0,CW=262,GAP=12;
 this._mt_grad(0,rail,['#06061a','#0b0a24','#141236','#22184a','#3a2458']);
 this._mt_stars(30,23,40,0,0,t);
 this._mt_blocks(t*30,{par:1,base:60,seed:41,sp:16,w:[12,20],h:[20,60],cols:['#16153a','#1a1840'],lit:.14,win:[1,1,3,3],spires:true},t);
 this._mt_blocks(t*120,{par:1,base:80,seed:47,sp:40,w:[30,42],h:[30,74],cols:['#0e0d22','#110f28'],lit:.3,win:[3,2,6,5]},t);
 // Elevated structure: rails, riveted girder, lattice and the street far below (all moving at train speed).
 const off=((run%40)+40)%40,off2=((run%120)+120)%120;
 this.rect(0,rail+4,W,H-rail-4,C('#08070f'));
 for(let x=-off2-120;x<W+120;x+=120){this.line(x,rail+16,x+60,H+30,C('#1a1628'),3);this.line(x+120,rail+16,x+60,H+30,C('#1a1628'),3);}
 this.rect(0,rail,W,3,C('#4a4660'));this.rect(0,rail,W,1,C('#a8a4c8'));
 this.rect(0,rail+3,W,12,(x,y)=>((x+off|0)%40<2||y===rail+3)?C('#100e1c'):(this.d(x,y)<.1?C('#2a2640'):C('#1e1a30')));
 for(let x=-off;x<W;x+=10)this.px(x,rail+7,C('#5a5478'));this.rect(0,rail+15,W,1,C('#2a2640'));
 // Cars: steel body with a neon livery stripe.
 const car=(cx,id)=>{const top=38+bob(id);
  this.rect(cx,top+8,CW,112,(x,y)=>this.d(x,y)<.06?C('#363a56'):C('#2c3048'));this.rect(cx+4,top,CW-8,9,C('#3a3e5a'));this.rect(cx+12,top-3,CW-24,3,C('#22263a'));
  this.rect(cx+40,top-6,30,4,C('#1a1c2c'));this.rect(cx+CW-70,top-6,30,4,C('#1a1c2c'));
  this.rect(cx,top+8,CW,1,C('#9aa0c0'));this.rect(cx,top+80,CW,5,C('#ff3fa4'));this.rect(cx,top+85,CW,2,C('#3af0ff'));this.rect(cx,top+114,CW,6,C('#14162a'));
  for(let x=cx+4;x<cx+CW-2;x+=6){this.px(x,top+76,C('#4a4e6a'));this.px(x,top+92,C('#4a4e6a'));}
  for(let r=0;r<3;r++)for(let x=cx+3;x<cx+CW-3;x+=3)this.px(x,top+98+r*5,C('#262a40'));
  this.text(id?'2':'1',cx+CW-20,top+92,C('#e8ecf4'),2,1);
  return top;};
 const tops=[car(X0,0),car(X0+CW+GAP,1)];
 this.rect(X0+CW-2,tops[0]+16,GAP+4,92,(x,y)=>C((y&1)?'#14141f':'#22222e'));this.rect(X0+CW,tops[0]+108,GAP,8,C('#3a3a4a'));
 // Window bays: through the lit car we see the far-side windows with the city racing by.
 const bays=[[10,46],[64,46],[120,30],[160,46],[214,40]],wins=[];
 for(let c2=0;c2<2;c2++)for(const [bx,bw]of bays){const x0=X0+c2*(CW+GAP)+bx,y0=tops[c2]+22,door=bw===30,y1=y0+(door?84:46);wins.push([x0,y0,x0+bw,y1,door]);
  this.rect(x0,y0,bw,y1-y0,(x,y)=>{const f=(y-y0)/46;if(f<.08)return C('#f8fff0');if(y<y0+30&&y>y0+6&&((x-x0)%46)>4&&((x-x0)%46)<42){const sx=x+run*.35,h=this.rand((sx/9|0)*7+((y-y0)/5|0)*131);return C(h<.12?(h<.05?'#ffcf7a':'#9fe8ff'):h<.5?'#141a30':'#1a2240');}return C(this.d(x,y)<.8-f*.35?'#cfe8d8':'#9ab8b0');});
  if(!door){for(let q=7;q<bw;q+=11){this.line(x0+q,y0+4,x0+q,y0+10,C('#6a7a80'));this.rect(x0+q-2,y0+10,4,4,C('#3a4a50'));this.px(x0+q,y0+11,C('#cfe8d8'));this.px(x0+q-1,y0+11,C('#cfe8d8'));}
   this.rect(x0,y1-12,bw,12,C('#2a5a8a'));this.rect(x0,y1-12,bw,1,C('#6aaadc'));for(let q=0;q<bw;q+=12)this.rect(x0+q,y1-12,1,12,C('#1a3a5a'));}
  else{this.rect(x0+bw/2-1,y0,2,y1-y0,C('#3a4048'));this.rect(x0+3,y0+44,bw-6,1,C('#3a4048'));}
  this.rect(x0+(bw>>1)-1,y0,2,46-12,C('#c8d0d8'));this.rect(x0+(bw>>1)-1,y0,1,46-12,C('#ffffff'));}
 // Riders, seen only through the glass.
 const inside=(x,y)=>{for(const w of wins)if(x>=w[0]&&x<w[2]&&y>=w[1]&&y<w[3])return true;return false;};
 const nod=bt.ph<.2?1:0,mx=X0+184,hx=X0+CW+GAP+90;
 this.beginLayer();this.person({x:mx,y:tops[0]+112+nod,h:86,dir:1,pose:'stand',walk:lt*.3,who:'milton',arms:[[.35,.5],[2.7,-.15]]});this._mt_clip(inside);this.endLayer('#ffffff',-1);
 this.beginLayer();const o=this.person({x:hx,y:tops[1]+112,h:82,dir:1,pose:'stand',walk:lt*.3+1,who:'her',arms:[[.55,1.7],[.15,1.8]]});
 this.rect(o.hands[0][0]-1,o.hands[0][1]-9,6,10,C('#1a1a26'));this.rect(o.hands[0][0],o.hands[0][1]-8,4,8,C('#9fe8ff'));this._mt_clip(inside);this.endLayer('#ffffff',-1);
 // Passing light sliding across the glass.
 const ref=((t*260)%460)-70;
 for(const [a,b,c3,d]of wins)for(let y=b;y<d;y++)for(let x=a;x<c3;x++){const u=x-ref+(y-b)*.7;if(u>0&&u<12&&this.d(x,y)<.3)this.px(x,y,C('#ffffff'));}
 for(const [a,b,c3,d]of wins){this.rect(a-1,b-1,c3-a+2,1,C('#14162a'));this.rect(a-1,b,1,d-b,C('#14162a'));this.rect(c3,b,1,d-b,C('#6a70a0'));this.rect(a-1,d,c3-a+2,1,C('#6a70a0'));}
 // Bogies, spinning wheels, and sparks off the third rail on the beat.
 for(let c2=0;c2<2;c2++)for(const bx of [30,196]){const x=X0+c2*(CW+GAP)+bx,y=tops[c2]+120;this.rect(x-6,y,44,6,C('#0c0c16'));this.rect(x-2,y+6,36,3,C('#14141f'));
  for(const wx of [x+4,x+28]){this.ellipse(wx,rail-5,6,6,C('#16161f'));const a=run*.15;this.line(wx,rail-5,wx+Math.cos(a)*4,rail-5+Math.sin(a)*4,C('#5a5a6a'));this.px(wx,rail-5,C('#8a8a9a'));}
  const burst=((bt.n+c2*2+(bx>100?1:0))%3===0)?k:0;
  if(burst>.05){this.glow(x+16,rail+2,30,'#8ac8ff',burst*.8);this.rect(x+10,rail-1,12,3,C('#ffffff'));for(let i=0;i<30;i++){const a=this.rand(i+bt.n*31+bx),age=bt.ph*Film.P*1.6,sx=x+16-age*(90+a*200),sy=rail+1-age*(30+this.rand(i*3)*90)+age*age*300;this.line(sx,sy,sx+3+a*4,sy-1,C(i%3?'#ffe9a0':'#ffffff'));this.px(sx+5,sy-1,C('#ffb04a'));}}}
 // A signal post whips past in the foreground.
 {const px=W+60-((t*1100)%1500);if(px>-40&&px<W+40){this.rect(px,0,14,H,(x,y)=>C(this.d(x,y)<.85?'#05040a':'#14111f'));this.rect(px-6,0,6,H,(x,y)=>this.d(x,y)<.4?C('#05040a'):this.T[y*W+x]);this.rect(px+14,0,6,H,(x,y)=>this.d(x,y)<.4?C('#05040a'):this.T[y*W+x]);this.rect(px+3,40,8,10,C(bt.n%2?'#ff3a4a':'#3aff6a'));}}
 this.rain(t,.4,t*200,0,-1.4);
};

// Relight the current layer with a cold light from below at (px,py); pixels on the wrong side of the split are erased.
F._mt_phoneLight=function(px,py,dir,flick,keep){const W=this.W,H=this.H,b=this.box,Lb=this.L;if(!b||b[2]<0)return;
 for(let y=Math.max(0,b[1]);y<=Math.min(H-1,b[3]);y++)for(let x=Math.max(0,b[0]);x<=Math.min(W-1,b[2]);x++){const v=Lb[y*W+x];if(!v)continue;
  if(!keep(x)){Lb[y*W+x]=0;continue;}
  const r=v&255,g=(v>>8)&255,bb=(v>>16)&255,lum=(r*.4+g*.45+bb*.15)/255,dx=(x-px)*dir,dy=y-py,dist=Math.hypot(dx*.75,dy)/120;
  let lf=Math.max(0,1-dist);lf=lf*lf*flick*1.5;lf=Math.min(1.2,Math.floor(lf*4+this.d(x,y))/4);
  const R2=Math.min(255,r*(.26+lf*.1)+60*lum*lf),G2=Math.min(255,g*(.24+lf*.18)+150*lum*lf+4),B2=Math.min(255,bb*.3+235*lum*lf+20);
  Lb[y*W+x]=((255<<24)|((B2|0)<<16)|((G2|0)<<8)|(R2|0))>>>0;}};
// Split screen: his close-up faces right, hers faces left, both lit cold blue from the phones they hold low.
// They lift their eyes on the second bar — almost looking at each other across the divider.
F.shotScreens=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,C=h=>this.c(h),mid=160,push=Film.ease(lt/4);
 const flick=.8+k*.2-(this.rand(Math.floor(t*14))<.07?.3:0);
 const side=(L,R,dir)=>{
  this._mt_grad(0,H,dir>0?['#03040c','#060c20','#0a1430']:['#08030c','#140820','#1e0a2c'],0,0,L,R);
  for(let i=0;i<6;i++){const r=10+this.rand(i*3+dir)*14,span=R-L-2*r,bx=L+r+((this.rand(i*7+dir*3)*span+lt*5*dir)%span+span)%span,by=16+this.rand(i*5+dir)*120;
   this.glow(bx,by,r,dir>0?(i%3?'#3af0ff':'#2a6aff'):(i%3?'#ff3fa4':'#a03aff'),.4);}
  const S=112+push*8,ox=dir>0?20-push*3:300+push*3,oy=12-push*3,up=dir>0?lt>=2:lt>=2.5,look=up?-.3:.9;
  const px=ox+dir*S*1.07,py=oy+S*1.2,keep=x=>dir>0?x<mid-2:x>mid+2,who=dir>0?'milton':'her',P=Film.CAST[who];
  const screen=['#9fe8ff','#c8f4ff','#6ac8ff','#e8fbff'][((bt.n+(dir>0?0:2))%4+4)%4];
  this.beginLayer();
  this.portrait({x:ox,y:oy,S,who,dir,look,blink:(dir>0&&lt>1.4&&lt<1.52)||(dir<0&&lt>3.3&&lt<3.42),kick:k,rimFront:'#bff6ff',rimBack:dir>0?'#2a6aff':'#a03aff'});
  this._mt_phoneLight(px,py-14,dir,flick,keep);this.endLayer('#9fe8ff',dir);
  // Forearm, hand and phone in their own outlined layer.
  this.beginLayer();
  this.quad(px-dir*40,H+16,px-dir*4,py+12,30,24,C(P.sleeve));this.rect(Math.min(px-dir*10,px-dir*22),py+18,12,6,C(P.cuff));
  this.ellipse(px-dir*2,py+8,11,10,C(P.skin));
  for(let f=0;f<3;f++)this.ellipse(px+dir*9,py-6+f*6,3.5,3,C(P.skin));
  this._mt_phoneLight(px,py-14,dir,flick,keep);
  const pw=17,ph2=30,x0=Math.round(px-pw/2),y0=Math.round(py-ph2+4);
  this.rect(x0,y0,pw,ph2,C('#14141e'));this.rect(x0,y0,pw,1,C('#3a3a4a'));
  this.endLayer('#9fe8ff',dir);
  // The screen, tilted toward the face, with chat bubbles that jump on the beat; a thumb over its edge.
  const sx0=x0+(dir>0?2:1),sy0=y0+2,sw=pw-3,sh=ph2-4;
  this.rect(sx0,sy0,sw,sh,C(flick>.72?screen:'#4a8ac0'));
  const sc=((bt.n%6)+6)%6;for(let m=0;m<5;m++){const me=(m+sc)%2,my=sy0+2+m*5;this.rect(sx0+(me?sw-10:2),my,8,3,C(me?'#ff8fd0':'#ffffff'));}
  this.rect(x0+(dir>0?-2:pw-3),y0+14,5,7,C(P.skinShade));this.rect(x0+(dir>0?-2:pw-3),y0+14,5,1,C('#ffe6d8'));
  this.glow(px,y0+6,36,'#6ac8ff',.3*flick,1.1);
  if(dir>0)this.rect(mid-2,0,W-mid+2,0,0);
 };
 side(0,mid-2,1);
 // Her half is drawn second; repaint the seam so nothing of hers leaks into his half.
 side(mid+2,W,-1);
 this.rain(t,.2,lt*10);
 this.rect(mid-2,0,4,H,C('#05040a'));this.rect(mid,0,1,H,C(k>.6?'#ffffff':'#7a80a0'));
};

// Parallelogram A→B extruded by e; fn(u along e, v along A→B, x, y) → color (0 = skip).
F._mt_para=function(A,B,e,fn){const bx=B[0]-A[0],by=B[1]-A[1],det=bx*e[1]-by*e[0]||1e-6;
 this.poly([A,B,[B[0]+e[0],B[1]+e[1]],[A[0]+e[0],A[1]+e[1]]],typeof fn==='function'?(x,y)=>{const px=x+.5-A[0],py=y+.5-A[1],v=(px*e[1]-py*e[0])/det,u=(bx*py-by*px)/det;return fn(Math.max(0,Math.min(1,u)),Math.max(0,Math.min(1,v)),x,y);}:fn);};
// Tiny attract-mode games for the cabinet screens (u across, g top→bottom, both 0..1).
F._mt_game=function(kind,u,g,t,x,y){const C=h=>this.c(h),bt=Film.beat(t);
 if(kind==='galaga'){
  // Logical 14×24 playfield so the sprites stay crisp at tiny sizes.
  const gx=Math.floor(u*14),gy=Math.floor(g*24),sw=Math.round(Math.sin(t*2));
  if(gy===3||gy===6||gy===8){const row=gy===3?0:gy===6?1:2,c0=gx-1-sw;if(c0>=0&&c0<12&&(c0%3)<2){const id=Math.floor(c0/3);if(this.rand(row*7+id+Math.floor(t/2)*13)>.2)return C(row===0?((c0%3)?'#3aff8a':'#3a8aff'):row===1?((c0%3)?'#ff3a4a':'#ffffff'):((c0%3)?'#ffe14a':'#3a8aff'));}}
  const beamOn=(bt.n%8)<5,bxc=7+sw;if(beamOn&&gy>=5&&gy<=16){const w=(gy-4)*.42;if(Math.abs(gx+.5-bxc)<=w&&((gy+Math.floor(t*8))%2===0))return C(((gy+Math.floor(t*8))%4)?'#3af0ff':'#2a6aff');}
  const shipX=7+Math.round(Math.sin(t*2.6)*4);if(gy===21&&Math.abs(gx-shipX)<=1)return C(gx===shipX?'#ff3a4a':'#ffffff');if(gy===20&&gx===shipX)return C('#ffffff');
  for(let b2=0;b2<3;b2++){const by=Math.floor(19-((t*2+b2*.33)%1)*16),bx=7+Math.round(Math.sin((t-b2*.15)*2.6)*4);if(gy===by&&gx===bx)return C('#ffffff');}
  if(bt.kick>.45&&Math.abs(gx-4)<=1&&Math.abs(gy-7)<=1&&(gx+gy)%2===0)return C(bt.kick>.75?'#ffffff':'#ffb04a');
  return this.rand(gx*31+Math.floor(gy-t*6+1000)*7)<.04?C('#6a6a9a'):C('#05050c');}
 if(kind==='maze'){const gx=Math.floor(u*7),gy=Math.floor(g*12),fu=u*7-gx,fg=g*12-gy;
  const wall=(this.rand(gx*13+gy*7)<.3&&gy%2===0)||gx===0||gx===6||gy===0||gy===11;
  const pm=(t*1.5)%1,pacx=1+Math.floor(t*3)%5,ghost=1+Math.floor(t*2+3)%5;
  if(gy===5&&gx===pacx)return C('#ffe14a');if(gy===7&&gx===ghost)return C(bt.n%2?'#ff3fa4':'#ffffff');
  if(wall)return C(fu<.3||fg<.3?'#3af0ff':'#1a4aff');return (fu>.4&&fu<.6&&fg>.4&&fg<.6&&gy%2)?C('#ffd0a0'):C('#06061a');}
 // Generic attract mode: color bars and a bouncing logo.
 const ph=(u*3+g*2+t*.8+kind.length)%1;return C(g<.3?(ph<.5?'#ff3fa4':'#ffb04a'):g<.7?(Math.abs(u-.5-Math.sin(t*2+kind.length)*.3)<.15&&Math.abs(g-.5)<.08?'#ffffff':'#1a1440'):(ph<.5?'#3af0ff':'#2a6aff'));
};
// Upright arcade cabinet in profile with its front strip seen in perspective. fx = front-bottom x, face ±1, e = depth vector.
F._mt_cab=function(fx,gy,Hc,D,face,e,game,t,o={}){
 const C=h=>this.c(h),k=Film.beat(t).kick,f=face,P=(a,b)=>[fx+f*a*Hc,gy+b*Hc];
 const prof=[[0,0],[0,-.4],[.06,-.42],[.1,-.47],[0,-.52],[-.04,-.53],[-.14,-.79],[-.14,-.81],[.02,-.83],[.03,-1],[-D,-1],[-D,0]];
 const show=Math.sign(e[0])===f;
 if(show){
  this.glow(...P(.04,-.66),Hc*.3,o.glow||'#3af0ff',.18+k*.08);
  const segs=[[0,1,'#100c1c'],[1,2,'#0a0812'],[2,3,o.panel||'#2a1a4a'],[3,4,'#1a1430'],[4,5,'#0a0812'],[5,6,'screen'],[6,7,'#0a0812'],[7,8,'#0a0812'],[8,9,'marquee']];
  for(const [a,b,col]of segs){const A=P(...prof[a]),B=P(...prof[b]);
   if(col==='screen')this._mt_para(A,B,e,(u,v,x,y)=>{if(u<.06||u>.94||v<.04||v>.96)return C('#05040a');return this._mt_game(game,(u-.06)/.88,1-(v-.04)/.92,t,x,y);});
   else if(col==='marquee')this._mt_para(A,B,e,(u,v,x,y)=>C(Math.abs(v-.5)<.18&&Math.abs(u-.5)<.38?(this.d(x,y)<.5?'#ffffff':o.mq2||'#ffe14a'):(this.d(x,y)<.25?'#ffffff':o.mq||'#ff3fa4')));
   else this._mt_para(A,B,e,C(col));}
 // Coin slots and the joystick + buttons on the panel.
  const cs=P(0,-.22);this.rect(cs[0]+e[0]*.35-1,cs[1]+e[1]*.35,2,3,C(k>.5?'#ffd0a0':'#ff7a3a'));this.rect(cs[0]+e[0]*.65-1,cs[1]+e[1]*.65,2,3,C(k>.5?'#ffd0a0':'#ff7a3a'));
  const pa=P(.1,-.47),pb=P(0,-.52),pp=(s,w)=>[pa[0]+(pb[0]-pa[0])*w+e[0]*s,pa[1]+(pb[1]-pa[1])*w+e[1]*s];
  const [jx,jy]=pp(.3,.5),wig=(o.wiggle||0);this.line(jx,jy,jx+wig*2,jy-5,C('#2a2a3a'));this.rect(jx+wig*2-1,jy-7,3,3,C('#ff3a4a'));this.px(jx+wig*2-1,jy-7,C('#ffb0b0'));
  for(const [s,col]of [[.6,'#ffe14a'],[.75,'#3af0ff']]){const [bx,by]=pp(s,.5);this.rect(bx-1,by-1,2,2,C(col));}
  }
 else{const A=P(-D,0),B=P(-D,-1);this._mt_para(A,B,e,C('#0c0a16'));}
 // Top and the near side panel with its T-molding and side art.
 this._mt_para(P(.02,-1),P(-D,-1),e,C('#16121f'));
 const pts=prof.map(([a,b])=>P(a,b));
 this.poly(pts,(x,y)=>{const a=f*(x-fx)/Hc,b=(y-gy)/Hc,st=a*1.2+b*.9;if(b<-.5&&b>-.84&&a>-.2&&this.d(x,y)<.18*(1-(-.04-a)*4))return C(o.glow||'#3af0ff');if(Math.abs(st+.55)<.05)return C(o.mq||'#ff3fa4');if(Math.abs(st+.68)<.025)return C(o.mq2||'#ffe14a');return C(this.d(x,y)<.1?'#221a36':'#181228');});
 for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];this.line(a[0],a[1],b[0],b[1],C(o.trim||'#ffe14a'));}
 this.line(...P(-D,0),...P(0,0),C('#05040a'));
};
// Small cabinet seen from the front (back row against the wall).
F._mt_cabFront=function(x,gy,w,h,game,t,col){const C=c=>this.c(c),k=Film.beat(t).kick;
 this.rect(x,gy-h,w,h,C('#140f22'));this.rect(x,gy-h,1,h,C(col));this.rect(x+w-1,gy-h,1,h,C(col));
 this.rect(x+2,gy-h+2,w-4,h*.12,(i,j)=>C(this.d(i,j)<.3?'#ffffff':col));
 const sx=x+3,sy=gy-h+h*.18,sw=w-6,sh=h*.3;this.rect(sx,sy,sw,sh,(i,j)=>this._mt_game(game,(i-sx)/sw,(j-sy)/sh,t,i,j));
 this.rect(x+1,gy-h*.48,w-2,h*.08,C('#2a1a4a'));this.rect(x+w*.3,gy-h*.47,2,2,C('#ff3a4a'));this.rect(x+w*.6,gy-h*.47,2,2,C('#ffe14a'));
 this.rect(x+w*.4,gy-h*.3,w*.2,3,C(k>.5?'#ffd0a0':'#ff7a3a'));this.glow(x+w/2,sy+sh/2,w*.9,'#6a4aff',.2);
};

// Inside a neon arcade: he plays a Galaga-like shooter facing one way; down the row she plays a maze game facing the other —
// back to back. The camera trucks along the row from him to her over two bars.
F.shotArcade=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,C=h=>this.c(h),camX=Film.ease(lt/8)*264,gy=172,wall=146;
 const sxF=X=>X-camX+10,sxB=X=>X-camX*.72+10;
 // Back wall: panels, a zigzag neon tube, the ARCADE sign.
 this.rect(0,0,W,wall+4,(x,y)=>{const wx=x+camX*.72;return C(((wx|0)%40<2)?'#0e0a1a':y<14?'#0a0814':this.d(x,y)<.08?'#1c1430':'#150f26');});
 const zz=[];for(let i=-1;i<12;i++){const x=i*30-((camX*.72)%30);zz.push([x,58+(i&1)*10,x+30,58+((i+1)&1)*10]);}
 this._mt_tubes(zz,4,'#3af0ff',k>.6?'#ffffff':'#c8fbff',.25+k*.2,2,'#0a3a4a');
 const ax=sxB(250)-this.textW('ARCADE',5,1)/2;this._mt_neon('ARCADE',ax,22,5,'#ff3fa4',k>.55?'#ffffff':'#ffc0e0',.3+k*.25,i=>i===2&&this.rand(Math.floor(t*10))<.15,2,'#5a1440');
 for(let i=0;i<6;i++){const x=sxB(-40+i*120);this.rect(x,0,24,4,C('#2a2238'));this.poly([[x+2,4],[x+22,4],[x+40,wall],[x-16,wall]],(a,b)=>this.d(a,b)<.05?C('#3a2a58'):0);}
 for(const [y,col,core]of [[5,'#ff3fa4','#ffd0ea'],[10,'#3af0ff','#d8fdff']]){this.rect(0,y-2,W,5,(x,yy)=>this.d(x,yy)<.3+k*.2?C(col):this.T[yy*W+x]);this.rect(0,y,W,1,C(core));}
 // Back row of cabinets against the wall.
 const games=['attr','maze','galaga','bars','attr2','maze','x'];
 for(let i=0;i<7;i++){const X=150+i*36,x=sxB(X);if(x<-40||x>W+10)continue;this._mt_cabFront(x,wall+4,28,86,games[i],t+i,['#ff3fa4','#3af0ff','#ffe14a','#a03aff'][i%4]);}
 // Carpet: the classic cosmic pattern, in depth.
 for(let y=wall+4;y<H;y++){const f=(y-wall)/(H-wall),par=.72+f*.5,ox=camX*par;for(let x=0;x<W;x++){const wx=x+ox,tx=Math.floor(wx/9),ty=Math.floor((y-wall)/4+f*2),h=this.rand(tx*131+ty*17);
  let v=this.d(x,y)<.12?'#14103a':'#0c0a26';if(h<.07){const fx=wx-tx*9;if(fx<2+f*2)v=h<.025?'#ff3fa4':h<.05?'#3af0ff':'#ffe14a';}this.T[y*W+x]=C(v);}}
 // His cabinet (faces right) and hers (faces left), each turning in perspective as the camera passes.
 const cab=(X,face,game,o)=>{const sx=sxF(X),ex=Math.max(-18,Math.min(18,(160-sx)*.2));this._mt_cab(sx,gy,128,.34,face,[ex,-5],game,t,o);return sx;};
 const wig=bt.ph<.5?(bt.n%2?1:-1):0;
 const mcx=cab(70,1,'galaga',{glow:'#3af0ff',wiggle:wig});
 const hcx=cab(432,-1,'maze',{glow:'#ff3fa4',mq:'#3af0ff',mq2:'#ffffff',trim:'#ff3fa4',panel:'#1a2a4a',wiggle:-wig});
 // Players: arms on the controls, heads nodding on the beat; screen light on their faces.
 const nod=bt.ph<.2?1:0;
 this.beginLayer();this.person({x:sxF(112),y:gy,h:116,dir:-1,pose:'stand',walk:lt*.2,who:'milton',arms:[[.95+wig*.06,.75],[.75,1.0]]});this.endLayer(k>.5?'#d8fdff':'#3af0ff',-1);
 this.glow(sxF(112)-24,gy-104+nod,16,'#3af0ff',.25+k*.1);
 this.beginLayer();this.person({x:sxF(384),y:gy+nod,h:110,dir:1,pose:'stand',walk:lt*.2+.5,who:'her',arms:[[.95-wig*.06,.75],[.75,1.0]]});this.endLayer(k>.5?'#ffd0ea':'#ff3fa4',1);
 this.glow(sxF(384)+22,gy-98,16,'#ff3fa4',.25+k*.1);
 // A foreground pillar sweeps across mid-move, between them.
 const fx=330-camX*1.5;if(fx>-40&&fx<W+40){this.rect(fx,0,26,H,C('#05040a'));this.rect(fx+25,0,1,H,C('#3a1a4a'));this.rect(fx+11,20,4,120,C(k>.5?'#ffd0ea':'#ff3fa4'));this.rect(fx+12,20,2,120,C('#ffe0f0'));}
};

// Wet brick wall seen close, with neon light spilling on it. ox/oy pan the wall; lights: [[x,y,r,litColor,amt],...] in screen space.
F._mt_wall=function(ox,oy,lights,base=['#1c1424','#221a2c','#120c18','#2a2034']){
 const W=this.W,H=this.H,T=this.T,b0=this.c(base[0]),b1=this.c(base[1]),mo=this.c(base[2]),hi=this.c(base[3]),Ls=lights.map(([x,y,r,c,a])=>[x,y,r,this.c(c),a]);
 for(let y=0;y<H;y++){const wy=y+oy,row=Math.floor(wy/7),fy=wy-row*7;for(let x=0;x<W;x++){const wx=x+ox+(row&1)*9,col=Math.floor(wx/18),fx=wx-col*18;
  let v=(fy<1||fx<1)?mo:(this.rand(row*53+col*7)<.3?b1:b0);if(fy===1&&fx>1&&this.d(x,y)<.35)v=hi;
  const dd=this.d(x,y);for(const [lx,ly,r,c,a]of Ls){const q=Math.hypot(x-lx,(y-ly)*1.2)/r;if(q<1&&dd<(1-q)*(1-q)*a*(fy<1||fx<1?.4:1)){v=c;break;}}
  T[y*W+x]=v;}}
};
// Polyline helper → tube segments.
F._mt_path=function(pts){const s=[];for(let i=0;i+1<pts.length;i++)s.push([...pts[i],...pts[i+1]]);return s;};

// Four neon details, a hard cut on every bar: BAR with an arrow, a half-broken heart, a 24H pharmacy cross, a vertical HOTEL.
F.shotSigns=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,C=h=>this.c(h),bar=Film.P*4,i=Math.min(3,Math.floor(lt/bar)),l=lt-i*bar,u=l/bar;
 const fl=n=>this.rand(Math.floor(t*14)*31+n);
 if(i===0){
  // BAR — cyan letters, a pink arrow that chases down toward the door on the beat.
  const x0=Math.round(84-u*26),y0=Math.round(30+u*6),s=12,tw=this.textW('BAR',s,1);
  this._mt_wall(u*26,-u*6,[[x0+tw/2,y0+30,150,'#1a6a7a',.7+k*.3],[x0+tw+14,y0+96,80,'#7a1a5a',.6]]);
  this.rect(x0-10,y0-8,tw+20,s*5+16,C('#0a0810'));this.rect(x0-10,y0-8,tw+20,1,C('#2a2238'));for(const bx of [x0-6,x0+tw+4])for(const by of [y0-4,y0+s*5+4])this.rect(bx,by,2,2,C('#4a4058'));
  this._mt_neon('BAR',x0,y0,s,'#3af0ff',k>.5?'#ffffff':'#c8fbff',.4+k*.3,null,4,'#0f5a6a');
  const ax=x0+tw+16,pts=[[x0-4,y0+s*5+22],[ax,y0+s*5+22],[ax,y0+s*5+66]],seg=this._mt_path(pts),lit=(bt.n%4)+1;
  this._mt_tubes(seg,8,'#ff3fa4',k>.5?'#ffffff':'#ffc0e0',.35+k*.2,3,'#5a1440');
  for(let c=0;c<4;c++){const yy=y0+s*5+48+c*6,on=c<lit;this._mt_tubes([[ax-12+c*0,yy,ax,yy+10],[ax,yy+10,ax+12,yy]],8,on?'#ff3fa4':'#4a1a34',on?(k>.5&&c===lit-1?'#ffffff':'#ffc0e0'):'#6a2a4a',on?.3:0,3,'#5a1440');}
 }else if(i===1){
  // A neon heart: the left half burns steady, the right half stutters and sparks.
  this._mt_wall(-u*10,u*14,[[160,92,170,'#6a1a4a',.75+k*.25]]);
  const r=58+u*12,cx=160,cy=94-u*4,on=fl(1)>.35&&!(fl(2)<.2&&bt.ph>.5),heart=(sc)=>{const L=[],R=[];for(let a=0;a<=64;a++){const th=a/64*Math.PI*2,hx=16*Math.pow(Math.sin(th),3),hy=-(13*Math.cos(th)-5*Math.cos(2*th)-2*Math.cos(3*th)-Math.cos(4*th));(a<=32?R:L).push([cx+hx*r*sc/17,cy+hy*r*sc/17-r*.12]);}return [L,R];};
  this.rect(cx-r*1.05,cy-r*.95,r*2.1,r*1.95,C('#0a0810'));
  for(const [sc,col,core,hal]of [[1,'#ff3fa4','#ffd0ea','#5a1440'],[.78,'#ff2a3a','#ffb0b0','#5a1018']]){const [L,R]=heart(sc);
   this._mt_tubes(this._mt_path(L),9,col,k>.55?'#ffffff':core,.4+k*.25,4,hal);
   if(on)this._mt_tubes(this._mt_path(R),9,col,core,.25,4,hal);else{this._mt_tubes(this._mt_path(R),9,'#3a1828','#5a2a3a',0,4);}}
  if(!on){const [sx,sy]=[cx+r*.62,cy-r*.62];for(let q=0;q<8;q++){const a=this.rand(q+Math.floor(t*20)),d=this.rand(q*3+Math.floor(t*20))*12;this.px(sx+Math.cos(a*6.28)*d,sy+Math.sin(a*6.28)*d,C(q%2?'#ffffff':'#ffe14a'));}this.glow(sx,sy,10,'#ffe9a0',.5);}
  for(const [a,b]of [[cx-r*.5,cy-r*.72],[cx+r*.5,cy-r*.72],[cx,cy+r*.7]])this.rect(a-1,b-1,3,3,C('#8a8098'));
 }else if(i===2){
  // FARMACIA 24H: a green cross whose rings chase outward on the beat; the camera tilts down to the hours.
  const ty=-u*26,cx=150+u*8,cy=70+ty;
  this._mt_wall(-u*8,-ty,[[cx,cy,140,'#1a6a3a',.75+k*.25],[cx,cy+86,90,'#1a5a3a',.5]]);
  this.rect(cx-90,cy-62,6,8,C('#2a2438'));this.rect(cx-90,cy-58,40,3,C('#3a3448'));this.line(cx-88,cy-50,cx-52,cy-58,C('#3a3448'),2);
  this.rect(cx-52,cy-56,104,104,C('#0a0c10'));this.rect(cx-52,cy-56,104,1,C('#2a3438'));
  const ring=(m)=>{const a=10+m*9,b=30+m*9;return [[cx-a,cy-b],[cx+a,cy-b],[cx+a,cy-a],[cx+b,cy-a],[cx+b,cy+a],[cx+a,cy+a],[cx+a,cy+b],[cx-a,cy+b],[cx-a,cy+a],[cx-b,cy+a],[cx-b,cy-a],[cx-a,cy-a],[cx-a,cy-b]];};
  const ph=Math.floor(bt.ph*3);
  this.poly(ring(0).slice(0,12),(x,y)=>this.d(x,y)<.5+k*.4?C('#3aff6a'):C('#1aa040'));
  for(let m=1;m<3;m++){const on=ph>=m-1||k>.6;this._mt_tubes(this._mt_path(ring(m)),6,on?'#3aff6a':'#164a24',on?(k>.5?'#ffffff':'#c8ffd8'):'#1f5a30',on?.3:0,3,'#0f4a20');}
  this.text('FARMACIA',cx-this.textW('FARMACIA',2,1)/2,cy+60,C('#e8fff0'),2,1);
  this._mt_neon('24H',cx-this.textW('24H',8,1)/2,cy+78,8,'#3aff6a',k>.5?'#ffffff':'#c8ffd8',.35+k*.2,null,3,'#0f4a20');
 }else{
  // HOTEL, vertical: the camera tilts down the sign; chaser bulbs run around it; the T fizzles.
  const ty=-Film.ease(u)*82,bx=134+u*4,by=12+ty,bw=52,bh=262;
  this._mt_wall(u*6,-ty*.9,[[bx+bw/2,90,130,'#6a1a4a',.7+k*.3]]);
  this.rect(bx-36,by+30,36,4,C('#2a2438'));this.rect(bx-36,by+bh-40,36,4,C('#2a2438'));
  this.rect(bx,by,bw,bh,C('#0c0812'));this.rect(bx,by,1,bh,C('#3a2a48'));this.rect(bx+bw-1,by,1,bh,C('#1a1220'));
  for(let q=0;q<(bw+bh)*2/8;q++){const p=q*8;let x,y;if(p<bw){x=bx+p;y=by+3;}else if(p<bw+bh){x=bx+bw-4;y=by+(p-bw);}else if(p<bw*2+bh){x=bx+bw-(p-bw-bh);y=by+bh-4;}else{x=bx+3;y=by+bh-(p-bw*2-bh);}
   const on=(q+bt.n)%3===0;this.rect(x-1,y-1,3,3,C(on?(k>.5?'#ffffff':'#ffe14a'):'#5a4a20'));if(on)this.glow(x,y,5,'#ffe14a',.4);}
  [...'HOTEL'].forEach((ch,n)=>{const off=n===2&&fl(5)<.35;this._mt_neon(ch,bx+bw/2-12-4,by+16+n*48,9,off?'#3a1828':'#ff3fa4',off?'#5a2a3a':(k>.55?'#ffffff':'#ffc0e0'),off?0:.35+k*.25,null,4,'#5a1440');});
 }
 this.rain(t,.75,i*40,0);
 // Drops sliding off the bottom of the signs catch the light.
 for(let q=0;q<10;q++){const x=this.rand(q*7+i)*W,y=((t*90+this.rand(q*3)*H)%H);this.rect(x,y,1,2,C('#e8f0ff'));}
};

// Utility pole with a crossarm and insulators; returns the insulator tips for stringing cables.
F._mt_pole=function(x,gy,top,arm=26,col='#0a0812'){const c=this.c(col),ins=this.c('#5a6a8a'),pts=[];
 this.rect(x-2,top,4,gy-top,c);for(const [yy,w]of [[top+6,arm],[top+18,arm*.75]]){this.rect(x-w,yy,w*2,3,c);for(const s of [-1,-.5,.5,1]){const ix=x+s*w*.9;this.rect(ix-1,yy-4,2,4,ins);this.px(ix-1,yy-4,this.c('#9ab0d0'));pts.push([ix,yy-4]);}}
 this.rect(x+3,top+30,6,9,c);return pts;};
// The city far below a rooftop: blocks with dense lights and a glow of streets.
F._mt_cityBelow=function(base,t,ox=0){
 this.glow(160,base,170,'#5a2a6a',.35,.25);
 this._mt_blocks(ox*.2,{par:1,base:base,seed:61,sp:11,w:[8,14],h:[6,30],cols:['#17153a','#1b1842'],lit:.22,win:[1,1,2,3]},t);
 this._mt_blocks(ox*.4,{par:1,base:base+10,seed:67,sp:24,w:[16,26],h:[6,26],cols:['#0f0e26','#121130'],lit:.3,win:[2,1,4,3],pulse:false},t);
 for(let i=0;i<40;i++){const x=((this.rand(i*9)*360-ox*.5)%360+360)%360-20,y=base+4+this.rand(i*5)*8;this.px(x,y,this.c(i%3?'#ffcf7a':'#ffffff'));}
};

// Her on a rooftop at night: power cables cross above; a faint red thread hangs among them. She notices and reaches up. Slow tilt up.
F.shotHerRoof=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,C=h=>this.c(h),tilt=Film.ease(lt/8)*30,Y=y=>y+tilt,roof=Y(146),gy=Y(170);
 this._mt_grad(0,roof,['#05050f','#090a1c','#11122c','#1b1840','#2a2052','#3a2a62'],-tilt,170);
 this._mt_stars(60,71,120,0,-tilt,t);
 this.ellipse(70,Y(26),11,11,(x,y,dx,dy)=>dx<-.4&&dy<.3?C('#c8c0e0'):C('#f0eaff'));this.glow(70,Y(26),30,'#8a7ab0',.22);
 this._mt_cityBelow(Y(132),t,lt*3);
 // Parapet and roof.
 this.rect(0,roof-5,W,8,(x,y)=>C(y<roof-3?'#2e2840':(x%7===0||(y-roof)%3===0)?'#17131f':'#221c30'));this.rect(0,roof-6,W,1,C('#4e4468'));
 this.rect(0,roof+3,W,H,(x,y)=>C(this.rand(x*7^y*131)<.05?'#2a2640':'#16142a'));
 // Rooftop door hut and a satellite dish, rim-lit by the moon.
 this.rect(250,Y(108),56,Y(172)-Y(108),C('#120f1c'));this.rect(246,Y(104),64,5,C('#1c1828'));this.rect(262,Y(126),18,46,C('#0a0812'));this.rect(264,Y(128),14,3,C('#ffcf7a'));this.glow(271,Y(130),14,'#ffb04a',.35);
 this.ellipse(26,Y(150),12,7,C('#14111f'));this.line(26,Y(150),34,Y(140),C('#2a2438'));this.rect(24,Y(156),4,16,C('#0a0812'));
 // Pole and cables crossing the sky above her.
 const ins=this._mt_pole(222,roof+2,Y(14),30);
 const cab=C('#05040a'),cables=[];
 ins.forEach((p,n)=>{const ex=-20,ey=Y(-14)+n*11,sag=10+n*3;this._mt_cable(p[0],p[1],ex,ey,sag,cab,n<4?2:1);this._mt_cable(p[0],p[1],W+20,Y(40)+n*6,sag*.5,cab,n<4?2:1);cables.push([p[0],p[1],ex,ey,sag]);});
 this._mt_cable(-20,Y(52),W+20,Y(-8),14,cab,1);
 // The red thread hangs from the lowest cable, swaying; it brightens when she reaches.
 const reach=Film.ease((lt-3.9)/2.2),o2=cables[6],f=.2,ax=o2[0]+(o2[2]-o2[0])*f,ay=o2[1]+(o2[3]-o2[1])*f+4*o2[4]*f*(1-f);
 const hx=128,sway=Math.sin(t*1.3)*5+Math.sin(t*3.1)*2,tipY=ay+30+reach*10,tipX=ax+sway-reach*6;
 const gl=.25+reach*.5+k*.15*reach;this.glow(tipX,tipY,14+reach*12,'#ff2a3a',.2+reach*.35);
 this.redThread(ax,ay,tipX,tipY,2,t,gl,1.5);
 // Her: standing, looking out — then reaching up for the thread.
 const sw=.1+reach*2.35;
 this.beginLayer();const o=this.person({x:hx,y:gy,h:88,dir:1,pose:reach>0?'reach':'stand',walk:lt*.3,who:'her',arms:[[sw,.12+.1*(1-reach)],[.1,.25]]});this.endLayer(reach>.3?'#ff8a9a':'#c8c0f0',reach>.3?1:-1);
 if(reach>.1)this.glow(o.hands[0][0],o.hands[0][1],10,'#ff2a3a',.3*reach);
 this.rain(t,.3,0,-tilt);
};

// Wide: Milton alone on another rooftop; black cables cross the sky between the buildings. The camera tilts up from him to the cables.
F.shotRoofCables=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,C=h=>this.c(h),cam=180-Film.ease(lt/7.6)*180,Y=y=>y-cam;
 this._mt_grad(0,H,['#05050f','#090a1c','#11122c','#1b1840','#2a2052','#3a2a62'],cam,360);
 this._mt_stars(110,83,360,0,cam,t);
 this._mt_cityBelow(Y(312),t,0);
 // Tall neighbours at both edges.
 const tower=(x0,x1,top,col)=>{this.rect(x0,Y(top),x1-x0,360,C(col));for(let wy=top+8;wy<360;wy+=12)for(let wx=x0+5;wx<x1-6;wx+=10){const lit=this.rand(wx*31+wy*17)<.3;this.rect(wx,Y(wy),5,7,C(lit?(this.rand(wx+wy)<.7?'#ffcf7a':'#9fe8ff'):'#0b0a18'));}this.rect(x0,Y(top),x1-x0,3,C('#2a2440'));};
 tower(-10,58,60,'#141228');tower(268,330,96,'#16142c');
 this.rect(58,Y(70),3,290,C('#0a0814'));
 // His roof.
 const roof=Y(322);this.rect(0,roof-4,W,6,C('#2e2840'));this.rect(0,roof-5,W,1,C('#4e4468'));this.rect(0,roof+2,W,H,C('#14122a'));
 this._mt_tank(206,roof,30,30,24);
 // Cables: strung from the towers' brackets and a pole on his roof, crossing the sky.
 const ins=this._mt_pole(120,roof,Y(150),28),cab=C('#05040a');
 const L=[[58,90],[58,104],[58,130],[58,170]],R=[[268,120],[268,136],[268,160],[268,206]];
 L.forEach(([x,y],n)=>this._mt_cable(x,Y(y),R[n][0],Y(R[n][1]),18+n*6,cab,2));
 ins.forEach((p,n)=>{this._mt_cable(p[0],p[1],-20,Y(40+n*22),14,cab,n<4?2:1);this._mt_cable(p[0],p[1],W+20,Y(30+n*16),16,cab,n<4?2:1);});
 this._mt_cable(-20,Y(20),W+20,Y(60),30,cab,1);this._mt_cable(-20,Y(52),W+20,Y(10),26,cab,1);
 for(const [x,y]of [[58,90],[58,130],[268,120],[268,160]]){this.rect(x-2,Y(y)-1,4,3,C('#3a4458'));}
 // A faint red glint already hangs among the cables.
 if(lt>5)this.redThread(30,Y(58),300,Y(44),20,t,.1*Film.ease((lt-5)/2.6),1);
 // Milton, small, looking up; nodding on the beat.
 this.beginLayer();this.person({x:150,y:roof+(bt.ph<.15?1:0),h:40,dir:1,pose:'stand',walk:lt*.3,who:'milton'});this.endLayer('#c8c0f0',-1);
 this.rain(t,.35,0,cam);
};

// ───── Bridge ─────
// Worm's-eye straight up: black cables criss-cross the sky between leaning towers; birds perch on the wires;
// one red thread among them glows and shivers with the bass. The view slowly rotates.
F.shotCablesSky=function(lt,t){
 const W=this.W,H=this.H,T=this.T,bt=Film.beat(t),k=bt.kick,C=h=>this.c(h),a=.2+lt*.045,z=1+lt*.025,ca=Math.cos(a),sa=Math.sin(a);
 const R=(x,y)=>[160+(x*ca-y*sa)*z,90+(x*sa+y*ca)*z];
 // Sky: dark zenith, city glow toward the edges.
 const sky=['#05050f','#090a1c','#11122c','#1b1840','#2a2052','#3a2a62'].map(C);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const r=1.6+Math.hypot(x-160,(y-90)*1.3)/190*4;const q=Math.floor(r+this.d(x,y)*.9);T[y*W+x]=sky[q>5?5:q];}
 for(let i=0;i<70;i++){const [x,y]=R((this.rand(i*3)-.5)*360,(this.rand(i*7)-.5)*300);if(this.rand(i+Math.floor(t*3))<.9)this.px(x,y,C(this.rand(i*11)<.2?'#e8e4ff':'#6a66a0'));}
 // Towers leaning in from the corners (their tops converge on the zenith), windows in rows.
 const ia=1/z,inv=(x,y)=>{const dx=(x-160)*ia,dy=(y-90)*ia;return [dx*ca+dy*sa,-dx*sa+dy*ca];};
 const tw=(pts,col,seed)=>{this.poly(pts.map(([x,y])=>R(x,y)),(x,y)=>{const [wx,wy]=inv(x,y),gx=Math.floor(wx/9),gy=Math.floor(wy/9);
  if(((wx-gx*9)<4)&&((wy-gy*9)<4)){const h=this.rand(gx*131+gy*17+seed);if(h<.22)return C(h<.15?'#ffcf7a':'#9fe8ff');if(h<.5)return C('#1a1834');}return C(col);});
  const P=pts.map(([x,y])=>R(x,y));this.line(P[1][0],P[1][1],P[2][0],P[2][1],C('#3a2a5a'),1);};
 tw([[-300,-220],[-56,-220],[-66,-48],[-300,-70]],'#0a0918',1);tw([[300,-220],[62,-220],[74,-56],[300,-44]],'#0c0a1c',2);
 tw([[-300,220],[-48,220],[-62,62],[-300,36]],'#0a0918',3);tw([[300,220],[56,220],[48,76],[300,64]],'#0c0a1c',4);
 // Two utility poles seen from below: shafts converge, crossarms with insulators.
 const ink=C('#030208'),insC=C('#8a9aba');
 for(const [px,py,ex,ey]of [[-170,170,-30,30],[170,-170,34,-34]]){const [a1,b1]=R(px,py),[a2,b2]=R(ex,ey);this.line(a1,b1,a2,b2,ink,9);
  const l=Math.hypot(a2-a1,b2-b1),ux=-(b2-b1)/l,uy=(a2-a1)/l;this.line(a2-ux*30,b2-uy*30,a2+ux*30,b2+uy*30,ink,4);
  for(const q of [-26,-12,12,26]){const ix=a2+ux*q,iy=b2+uy*q;this.rect(ix-2,iy-2,5,5,insC);this.px(ix-1,iy-2,C('#d8e4ff'));}}
 // Cables: rotated together; birds sit on some.
 const L=[[-300,-58,300,-18,3],[-300,-34,300,8,3],[-300,40,300,22,2],[-300,64,300,52,2],[-60,-260,-20,260,2],[30,-260,72,260,2],[-300,-120,300,110,1],[-300,140,300,-90,1],[-300,-90,300,-70,1]];
 const bird=(x,y,dx,dy,fl)=>{let nx=-dy,ny=dx;if(ny>0){nx=-nx;ny=-ny;}const B=(u,v)=>[x+(dx*u+nx*v)*1.8,y+(dy*u+ny*v)*1.8];
  for(const [u,v]of [[0,1],[1,1],[-1,1],[-2,1],[0,2],[1,2],[-1,2],[2,2],[0,3],[1,3],[-1,3],[2,3],[2,4],[3,4],[-3,1],[-4,0],[0,0]]){const [p,q]=B(u,v);this.rect(p-1,q-1,2,2,ink);}
  for(const [u,v]of [[-1,4],[0,4],[1,4],[3,5],[2,5]]){const [p,q]=B(u,v);this.rect(p-.5,q-.5,1,1,C('#6a5a9a'));}
  const [ex2,ey2]=B(fl?3:2,4);this.px(ex2,ey2,C('#ffcf7a'));};
 L.forEach(([x0,y0,x1,y1,w],n)=>{const [a1,b1]=R(x0,y0),[a2,b2]=R(x1,y1);this.line(a1,b1,a2,b2,ink,w);
  if(n<4&&n!==1){const l=Math.hypot(a2-a1,b2-b1),dx=(a2-a1)/l,dy=(b2-b1)/l;for(let m=0;m<3;m++){const f=.22+this.rand(n*7+m)*.56;bird(a1+(a2-a1)*f,b1+(b2-b1)*f,dx,dy,(bt.n+m)%4===0);}}});
 // The red thread: a standing wave that jumps with each kick.
 const [r1,s1]=R(-300,-6),[r2,s2]=R(300,36),len=Math.hypot(r2-r1,s2-s1),nx=-(s2-s1)/len,ny=(r2-r1)/len,amp=1+k*6;
 for(let i=0;i<=len;i++){const f=i/len,w=Math.sin(f*Math.PI*5)*Math.sin(t*38)*amp*Math.sin(f*Math.PI),x=r1+(r2-r1)*f+nx*w,y=s1+(s2-s1)*f+ny*w;
  if(i%2===0)for(let q=-4;q<=4;q++)if(q&&this.d(Math.round(x+nx*q),Math.round(y+ny*q))<(.35+k*.3)*(1-Math.abs(q)/5))this.px(x+nx*q,y+ny*q,C('#a0142a'));
  this.px(x,y,C(k>.5?'#ffd0d0':'#ff2a3a'));if(k>.3)this.px(x+nx,y+ny,C('#ff6a6a'));}
 this.rain(t,.25,0,0,0);
};

// Close-up: Milton's hand, the red thread knotted on his pinky; it tugs on the beat and he slowly closes his fist.
F.shotPinky=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,P=Film.CAST.milton,C=h=>this.c(P[h]||h),cl=Film.ease((lt-1)/3.8)*.9,tug=k*(bt.n%2?1:.6);
 this._mt_grad(0,H,['#05040e','#0a0a20','#141232','#1c1440']);
 for(let i=0;i<9;i++){const x=(this.rand(i*7)*380-lt*(4+i))%380-30,y=this.rand(i*5)*170,r=14+this.rand(i*3)*20;this.glow(x,y,r,['#ff3fa4','#3af0ff','#ffb04a','#a03aff'][i%4],.45);}
 const ox=146,oy=104+Math.round(cl*6);
 this.beginLayer();
 // Sleeve and cuff from the bottom of frame.
 this.quad(ox+6,oy+70,ox+30,H+40,62,80,C('sleeve'));this.quad(ox+2,oy+58,ox+10,oy+80,54,60,C('cuff'));this.rect(ox-24,oy+64,52,2,C('jacketShade'));
 // Back of the hand.
 this.poly([[ox-30,oy+58],[ox-38,oy+10],[ox-34,oy-8],[ox+36,oy-8+4],[ox+40,oy+20],[ox+30,oy+60]],(x,y)=>x>ox+22&&this.d(x,y)<.5?C('skinShade'):C('skin'));
 for(let q=0;q<4;q++)this.line(ox-20+q*15,oy+6,ox-12+q*11,oy+44,C('skinShade'));
 // Fingers: index → pinky. They shorten and darken as they curl away.
 const F2=[[-28,48,15],[-10,54,16],[8,50,15],[26,40,12]],tips=[];
 F2.forEach(([fx,L,w],n)=>{const bx=ox+fx+(n===3?tug*2:0),by=oy-6+(n===3?6:0),len=L*(1-cl*.78)+(n===3?-tug*2:0),tx=bx+(n-1.5)*3*(1-cl)+(n===3?tug*3:0),ty=by-len;
  this.quad(bx,by,tx,ty,w,w-2,cl>.55?C('skinShade'):C('skin'));
  if(cl<.6){this.rect(tx-w/2+3,ty-w/2+2,w-6,Math.max(2,6-cl*6),C('#f8dcc8'));this.rect(tx-w/2+3,ty-w/2+2,w-6,1,C('#ffffff'));}
  const kx=bx,ky=by-len*.5;this.line(kx-w/2+3,ky,kx+w/2-3,ky,C('skinDark'));
  this.ellipse(bx,by+2,w/2,4,C(cl>.4?'#ffe0cc':'skin'));tips.push([bx,by,tx,ty,w]);});
 // Thumb swings in over the fist.
 const thx=ox-44+cl*30,thy=oy+4+cl*14;this.quad(ox-28,oy+42,thx,thy,17,14,C('skin'));this.rect(thx-5,thy-6,9,5,C('#f8dcc8'));
 this.endLayer(k>.5?'#ffd0d0':'#ff8a9a',1);
 // Knot on the pinky, and the thread running off frame, pulled taut on each beat.
 const [bx,by,tx,ty,w]=tips[3],kx=bx+(tx-bx)*.3,ky=by+(ty-by)*.3;
 this.redThread(kx+w/2,ky,W+20,18,(1-tug)*22+6,t,.5+tug*.4,1+(1-tug));
 this.rect(kx-w/2,ky-1,w+1,3,C('#ff2a3a'));this.rect(kx-w/2,ky-1,w+1,1,C('#ff9a9a'));
 this.ellipse(kx+w/2+2,ky-3,3,2,C('#ff2a3a'));this.ellipse(kx+w/2+2,ky+3,3,2,C('#d01a2a'));this.rect(kx+w/2,ky,3,2,C('#ff9a9a'));
 this.glow(kx+w/2,ky,20,'#ff2a3a',.3+tug*.3);
 for(let i=0;i<16;i++){const x=this.rand(i*7)*W,y=(this.rand(i*3)*H+t*28*(1+i%3))%H;this.px(x,y,C('#e8fbff'));this.px(x,y+1,C('#8fb8c8'));}
};

// Distant iron truss bridge (same look as shotBridge: purple lattice, sodium lamps), deck at y, from x0 to x1.
F._mt_farBridge=function(x0,x1,deck,t,hgt=22){
 const C=h=>this.c(h),k=Film.beat(t).kick,iron=C('#4a4068'),hi=C('#7a6fa0'),top=deck-hgt,pan=18;
 this.rect(x0,top,x1-x0,2,iron);this.rect(x0,top,x1-x0,1,hi);this.rect(x0-10,deck,x1-x0+20,3,C('#2a2440'));this.rect(x0-10,deck,x1-x0+20,1,hi);
 for(let x=x0;x<=x1;x+=pan){this.rect(x,top,1,hgt,iron);if(x+pan<=x1){this.line(x,top+2,x+pan,deck-1,iron);this.line(x+pan,top+2,x,deck-1,iron);}}
 for(let x=x0+9;x<x1;x+=36){this.rect(x,deck-8,1,8,C('#3a3456'));this.px(x,deck-9,C('#ffcf8a'));this.glow(x,deck-8,9,'#ffb04a',.5+k*.2);}
 for(let x=x0+30;x<x1;x+=60){this.rect(x-2,deck+3,4,14,C('#1a1628'));}
};
// Fast tracking shot along the taut red thread over the rooftops; at the end it leads to the iron bridge across the river.
F.shotThreadTrack=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,C=h=>this.c(h),e=lt+lt*lt*.06,far=e*34,mid=e*130,near=e*300,hz=128;
 this._mt_grad(0,hz,['#05050f','#090a1c','#11122c','#1b1840','#2a2052','#3a2a62']);
 this._mt_stars(50,91,100,far*.3,0,t);
 this.ellipse(286-far*.2,30,10,10,(x,y,dx,dy)=>dx<-.4&&dy<.3?C('#c8c0e0'):C('#f0eaff'));this.glow(286-far*.2,30,30,'#8a7ab0',.25);
 // River and the far bank.
 this._mt_grad(hz,H,['#1a1640','#100e2a','#080818']);
 const edge=300-far;
 for(let i=0;i<40;i++){const x=Math.round(i*12-far*.7+(this.rand(i)*6)),bw=8+this.rand(i*3)*10,h=10+this.rand(i*5)*16;if(x>W)break;this.rect(x,hz-h,bw,h,C('#15143a'));for(let q=0;q<4;q++)if(this.rand(i*9+q)<.6)this.px(x+2+this.rand(i+q*3)*(bw-4),hz-h+3+this.rand(i*7+q)*(h-5),C('#ffcf7a'));}
 for(let i=0;i<30;i++){const X=i*14,x=Math.round(X-far),h=20+this.rand(i*13)*42,bw=12+this.rand(i*7)*6;if(X>300)break;this.rect(x,hz-h,bw,h+2,C(i&1?'#141230':'#17153a'));for(let wy=hz-h+3;wy<hz-2;wy+=4)for(let wx=x+2;wx<x+bw-2;wx+=3)if(this.rand(i*977+wy*7+wx*3+Math.round(far)*0)<.2)this.px(wx,wy,C('#ffcf7a'));}
 const bx0=330-far,bx1=560-far;this._mt_farBridge(bx0,bx1,hz-4,t,24);
 this._mt_mirror(Math.max(0,edge),W,hz+1,H,hz,'#0a0a1e',t,.6);
 // Mid rooftops with lit windows (end before the river).
 for(let i=0;i<40;i++){const X=i*34,x=Math.round(X-mid),bw=26+this.rand(i*3+1)*12,top=96+this.rand(i*5+1)*30;if(X>700)break;if(x>W||x+bw<0)continue;
  this.rect(x,top,bw,H-top,C(i&1?'#0e0d22':'#110f28'));this.rect(x,top,bw,1,C('#2a2448'));for(let wy=top+5;wy<H;wy+=6)for(let wx=x+3;wx<x+bw-3;wx+=5)if(this.rand(i*131+wy*7+wx*3-Math.round(x)*3)<.25)this.rect(wx,wy,2,2,C('#ffcf7a'));
  if(this.rand(i*17)<.4){this._mt_tank(x+6,top,12,12,8);}}
 // The thread: taut from the lens to the bridge's top chord, humming on the beat.
 const tx=bx0+40,ty=hz-28;
 this.redThread(-10,58,tx,ty,2,t,.55+k*.3,1+k*2);
 this.glow(tx,ty,12,'#ff2a3a',.4+k*.3);
 // Near rooftops whip past in silhouette: antennas, water tanks, chimneys.
 const ink=C('#06050c');
 for(let i=0;i<60;i++){const X=i*58,x=Math.round(X-near),r=this.rand(i*29+3),top=136+r*20;if(X>1330)break;if(x>W+40||x+70<-40)continue;
  this.rect(x,top,60,H-top,ink);this.rect(x,top,60,1,C('#3a2a4a'));
  if(r<.33){this.rect(x+24,top-80,2,80,ink);for(let q=0;q<4;q++)this.rect(x+16+q,top-74+q*9,18-q*2,2,ink);this.rect(x+24,top-82,2,2,C(bt.n%2?'#ff3a4a':'#5a1a24'));}
  else if(r<.66){this.rect(x+12,top-20,4,20,ink);this.rect(x+30,top-20,4,20,ink);this.rect(x+8,top-48,30,28,ink);this.poly([[x+6,top-48],[x+23,top-60],[x+40,top-48]],ink);this.rect(x+38,top-48,1,28,C('#5a2a5a'));}
  else{this.rect(x+10,top-26,12,26,ink);this.rect(x+8,top-28,16,3,ink);this.rect(x+40,top-16,10,16,ink);}}
 // Speed streaks.
 for(let i=0;i<14;i++){const y=this.rand(i*7)*H,x=((this.rand(i*3)*W*2-t*900)%(W*2)+W*2)%(W*2)-W/2,l=20+this.rand(i)*40;this.rect(x,y,l,1,C(i%3?'#3a3a6a':'#8a8ac0'));}
 this.rain(t,.4,t*300,0,-1.6);
};

// Close-up: Milton looks up and slowly smiles; the thread's red light on his face, rain sparkling red.
F.shotSmile=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,C=h=>this.c(h),S=118+lt*3,ox=78-lt*2,oy=30-lt;
 this.vgrad(0,0,W,H,['#05040e','#0c0820','#1a0c2a','#240c2c']);
 for(const [bx,by,r,col]of [[260,40,34,'#ff2a3a'],[30,60,20,'#3af0ff'],[300,140,26,'#ff3fa4'],[60,150,18,'#a03aff'],[210,120,16,'#ffb04a']])this.glow(bx-lt*4,by,r,col,.55);
 // The thread runs across the top of frame, glowing.
 this.redThread(150,-6,W+10,52,6,t,.7+k*.3,1.5);this.glow(250,26,40,'#ff2a3a',.3+k*.15);
 this.beginLayer();
 this.portrait({x:ox,y:oy,S,who:'milton',dir:1,look:-1,smile:lt>.95?1:0,blink:lt>1.9&&lt<2.0,kick:k,rimFront:k>.5?'#ffd0d0':'#ff6a7a',rimBack:'#5fe8f0'});
 // Red light from above-front warms the face and the beanie.
 const b=this.box,L=this.L;
 for(let y=Math.max(0,b[1]);y<=Math.min(H-1,b[3]);y++)for(let x=Math.max(0,b[0]);x<=Math.min(W-1,b[2]);x++){const v=L[y*W+x];if(!v)continue;const q=Math.hypot(x-240,(y-10)*1.2)/180;if(q<1&&this.d(x,y)<(1-q)*.8){const r=v&255,g=(v>>8)&255,bb=(v>>16)&255;L[y*W+x]=((255<<24)|((bb*.55|0)<<16)|((g*.6|0)<<8)|Math.min(255,r*.9+70))>>>0;}}
 this.endLayer();
 // Rain sparkles, some caught red.
 for(let i=0;i<30;i++){const x=this.rand(i*7)*W,y=(this.rand(i*3)*H+t*60*(1+i%3))%H,red=x>150&&y<100;this.px(x,y,C(red?'#ffb0b0':'#e8fbff'));this.px(x,y+1,C(red?'#ff3a4a':'#8fb8c8'));}
 this.rain(t,.25,lt*6);
};
