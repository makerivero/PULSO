'use strict';
// Bendito error — shot list and scenes. Times are bar lines of the song (120 BPM, bars of 4 beats).
const B=i=>Film.bar(i);
const SHOTS=[
 {t0:0,t1:B(2),fn:'shotTitle'},
 {t0:B(2),t1:B(4),fn:'shotCity'},
 {t0:B(4),t1:B(5),fn:'shotPuddle'},
 {t0:B(5),t1:B(6),fn:'shotZipper'},
 {t0:B(6),t1:B(8),fn:'shotCloseUp'},
 {t0:B(8),t1:B(12),fn:'shotBridge'},
 {t0:B(12),t1:B(14),fn:'shotPlanks'},
 {t0:B(14),t1:B(16),fn:'shotLowAngle'}];
const F=Film.prototype;
const NIGHT=['#05050f','#090a1c','#11122c','#1b1840','#2a2052','#3a2a62'];
const walkAt=t=>((t-Film.BEAT0)/Film.P)/2+.25;

// ── Title card: the name drops in letter by letter; the author's name types in underneath.
F.shotTitle=function(lt,t){
 const W=this.W,H=this.H;this.vgrad(0,0,W,H,['#04040c','#07071a','#0d0c26','#171236','#241a46']);
 this.glow(160,196,190,'#4a1f5a',.55,.35);this.glow(60,200,90,'#1f3a5a',.4,.4);
 this.rain(t,.45);
 const ink=this.c('#120a18'),ramp=['#fff1c2','#fff1c2','#ffc46b','#ff7a5c'],shadow=this.c('#05040c');
 const lines=['BENDITO','ERROR'],s=7;let idx=0;
 lines.forEach((ln,li)=>{const x0=Math.round((W-this.textW(ln,s,1))/2),y0=24+li*44;
  for(let n=0;n<ln.length;n++,idx++){const g=ArcadeGame.font[ln[n]],appear=.5+idx*.14;if(lt<appear)continue;const k=Math.min(1,(lt-appear)/.45),drop=Math.round(k<1?-(1-k)*(1-k)*70:0),x=x0+n*4*s,y=y0+drop;
   for(let pass=0;pass<3;pass++)for(let r=0;r<5;r++)for(let q=0;q<3;q++){if(g[r*3+q]!=='1')continue;const bx=x+q*s,by=y+r*s;
    if(pass===0)this.rect(bx+2,by+3,s,s,shadow);else if(pass===1)this.rect(bx-1,by-1,s+2,s+2,ink);
    else this.rect(bx,by,s,s,(i,j)=>{const f=(r*s+(j-by))/(5*s)*3.99;return this.c(ramp[Math.min(3,Math.floor(f+this.d(i,j)))]);});}}});
 const name='MILTON VALENZUELA',shown=name.slice(0,Math.max(0,Math.floor((lt-2.6)*12)));
 if(shown){const w=this.textW(name,2,2),x=Math.round((W-w)/2);this.rect(x-14,136,8,1,this.c('#ff3fa4'));this.rect(x+w+6,136,8,1,this.c('#ff3fa4'));this.text(shown,x,132,this.c('#e8f6ff'),2,2);}
};

// ── Establishing shot: tilt down from the neon signs to the wet street where Milton walks.
F.city=function(camY,t,walkX){
 const W=this.W,H=this.H,k=Film.beat(t).kick,y=v=>v-camY;
 const sky=['#05050f','#0a0a20','#141432','#221a46','#332256'];
 this.rect(0,0,W,H,(i,j)=>{const v=(j+camY)/240*4;return this.c(sky[Math.max(0,Math.min(4,Math.floor(v+this.d(i,j))))]);});
 this.glow(160,y(230),200,'#5a2a6a',.5,.5);
 // Far blocks between the two towers.
 for(let i=0;i<9;i++){const bx=80+i*18,top=150+this.rand(i*3)*60,bw=18;this.rect(bx,y(top),bw,H,this.c(i&1?'#121128':'#16152e'));for(let wy=top+6;wy<360;wy+=7)for(let wx=bx+3;wx<bx+bw-3;wx+=5)if(this.rand(i*977+wy*7+wx)<.22)this.rect(wx,y(wy),2,3,this.c(this.rand(wx+wy)<.6?'#ffcf7a':'#9fe8ff'));}
 // Left tower with a vertical HOTEL sign; right tower with fire escapes and a BAR sign.
 const facade=(x0,x1,top,base,col,pier)=>{this.rect(x0,y(top),x1-x0,H,this.c(col));for(let px=x0+6;px<x1;px+=24)this.rect(px,y(top),3,H,this.c(pier));for(let wy=top+10;wy<350;wy+=16)for(let wx=x0+10;wx<x1-8;wx+=12){const lit=this.rand(wx*31+wy*17)<.35;this.rect(wx,y(wy),7,9,this.c(lit?(this.rand(wx+wy*3)<.7?'#ffcf7a':'#ffe9b0'):'#0b0a18'));if(lit)this.rect(wx,y(wy)+7,7,2,this.c('#c98a4a'));}};
 facade(0,96,30,420,'#191730','#100f22');facade(226,320,8,420,'#1c1a35','#121128');
 for(let fy=60;fy<330;fy+=40){this.rect(226,y(fy),40,2,this.c('#2c2846'));this.line(228,y(fy),262,y(fy+40),this.c('#2c2846'));for(let r=0;r<40;r+=4)this.px(228+r*.85,y(fy+r),this.c('#3a3458'));}
 const flick=n=>this.rand(Math.floor(t*12)*31+n)<.06;
 // HOTEL: vertical sign, one letter fizzles now and then.
 this.rect(84,y(104),20,92,this.c('#0e0b1a'));this.rect(84,y(104),20,1,this.c('#2a2238'));
 [...'HOTEL'].forEach((ch,i)=>{if(i===2&&flick(1))return;this.glow(94,y(114+i*17),12,'#ff3fa4',.35+k*.25);this.text(ch,89,y(108+i*17),this.c(k>.6?'#ffd0ea':'#ff5fb4'),3,0);});
 // BAR with an arrow, cyan.
 this.rect(240,y(246),58,22,this.c('#0e0b1a'));this.glow(268,y(257),26,'#3af0ff',.3+k*.25,.6);this.text('BAR',246,y(250),this.c(k>.6?'#d8fdff':'#5ff4ff'),3,1);this.rect(287,y(255),6,3,this.c('#5ff4ff'));this.px(292,y(254),this.c('#5ff4ff'));this.px(292,y(258),this.c('#5ff4ff'));
 if(!flick(2)){this.glow(41,y(305),12,'#ffe14a',.35);this.text('24H',30,y(301),this.c('#ffe14a'),2,1);}
 // Street: lamp, sidewalk, wet asphalt mirroring the signs.
 const curb=366;this.rect(0,y(330),W,H,this.c('#14132a'));
 this.rect(0,y(curb-8),W,9,(i,j)=>this.c(this.d(i,j)<.15?'#3a3a5a':'#2a2a44'));this.rect(0,y(curb+1),W,2,this.c('#4a4a6a'));
 const wet=y(curb+3);
 this.rect(195,y(282),3,curb-282,this.c('#2a2840'));this.rect(189,y(280),14,4,this.c('#3a3654'));this.rect(191,y(284),10,2,this.c('#ffcf8a'));
 this.poly([[191,y(286)],[201,y(286)],[226,y(curb)],[166,y(curb)]],(i,j)=>this.d(i,j)<.1*(1-(j-y(286))/(curb-286)*.5)?this.c('#ffb04a'):0);this.glow(196,y(curb-4),36,'#ffb04a',.5,.3);
 if(walkX!==undefined)this.drawMilton(walkX,y(curb),34,walkAt(t),'#ff3fa4',-1);
 if(wet<H)this.reflect(wet,H,wet-3,'#0c0c20',t,2.2,.75);
 this.rain(t,1,0,camY);
};
F.drawMilton=function(x,gy,h,walk,rim,side,who='milton'){this.beginLayer();this.person({x,y:gy,h,dir:1,walk,who});this.endLayer(rim,side);};
F.shotCity=function(lt,t){this.city(Film.ease(lt/3.6)*240,t,60+lt*22);};

// ── Detail: sneakers on the beat; the third step lands in a puddle full of neon.
F.shotPuddle=function(lt,t){
 const W=this.W,H=this.H,beats=lt/Film.P,hz=92;
 this.vgrad(0,0,W,hz,['#06061a','#0e0c2a','#1a1438','#2a1a46']);
 for(const [bx,by,r,col]of [[60,50,26,'#ff3fa4'],[120,30,16,'#ffb04a'],[190,58,30,'#3af0ff'],[262,40,20,'#ff3fa4'],[300,70,24,'#ffe14a'],[30,80,18,'#3af0ff']])this.glow(bx,by,r,col,.75);
 this.rect(0,hz,W,H-hz,(i,j)=>{const z=(j-hz)/(H-hz);return this.c(this.rand(i*7+j*131)<.04+z*.03?'#2c2c46':z<.15?'#16162c':'#121226');});
 // Puddle: a mirror of the bokeh with ripples.
 const pcx=180,pcy=146,prx=105,pry=22,sp=(beats-2)*Film.P;
 this.ellipse(pcx,pcy,prx,pry,(x,y,dx,dy)=>{let w=0;if(sp>0){const r=Math.hypot(dx,dy*1)*prx,front=sp*160;w=Math.sin((r-front)*.35)*Math.exp(-Math.abs(r-front)*.05)*3*Math.exp(-sp*2);}
  const mx=x+w,base=this.d(x,y)<.2?'#1a1838':'#0b0b1c';for(const [bx,r,col]of [[60,26,'#ff3fa4'],[120,16,'#ffb04a'],[190,30,'#3af0ff'],[262,20,'#ff3fa4'],[300,24,'#ffe14a']]){const dd=Math.abs(mx-bx)/r;if(dd<1&&this.d(x,y)<(1-dd)*.7*(1-Math.abs(dy)*.5))return this.c(col);}return this.c(base);});
 this.ellipse(pcx,pcy,prx,pry,(x,y,dx,dy)=>dx*dx+dy*dy>.9?this.c('#3a3a5c'):0);
 if(sp>0&&sp<.9){for(let r=0;r<2;r++){const rr=(sp-r*.15)*150;if(rr>0)this.ellipse(pcx,pcy,rr,rr*.2,(x,y,dx,dy)=>Math.abs(dx*dx+dy*dy-1)<.08&&(x-pcx)**2/(prx*prx)+(y-pcy)**2/(pry*pry)<1?this.c('#9fa8e0'):0);}
  for(let i=0;i<26;i++){const a=Math.PI*(.1+.8*this.rand(i)),v=60+this.rand(i+9)*120,x=pcx-10+Math.cos(a)*v*sp*(this.rand(i+3)<.5?1:-1),y=pcy-8-Math.sin(a)*v*sp+260*sp*sp;if(y<pcy+4)this.rect(x,y,2,2,this.c(i%3?'#d8e0ff':'#ff8fd0'));}}
 // Feet: landings at every beat, each foot every two beats.
 const xs=k=>-40+k*110;
 const foot=(F0)=>{let k=F0;while(k+2<=beats)k+=2;const since=beats-k;let x,lift=0,tilt=0;
  if(since<.6){x=xs(k);}else{const u=Film.ease((since-.6)/1.4);x=xs(k)+(xs(k+2)-xs(k))*u;lift=Math.sin(u*Math.PI)*38;tilt=Math.sin(u*Math.PI)*.18;}
  this.shoe(x,pcy+6-lift,tilt,F0===1);};
 foot(1);foot(0);
 this.rain(t,.7);
};
F.shoe=function(x,gy,tilt,back){
 const P=Film.CAST.milton,c=k=>this.c(P[k]),L=70,Hh=24,rot=(px,py)=>[x+(px-x)*Math.cos(tilt)-(py-gy)*Math.sin(tilt),gy+(px-x)*Math.sin(tilt)+(py-gy)*Math.cos(tilt)],R=pts=>pts.map(([a,b])=>rot(a,b));
 this.beginLayer();
 this.poly(R([[x-26,gy-Hh-2],[x+2,gy-Hh-6],[x+4,-60],[x-30,-60]]),(i,j)=>this.d(i,j)<.12?c('jeansShade'):c('jeans'));
 this.poly(R([[x-28,gy-Hh-1],[x+5,gy-Hh-6],[x+6,gy-Hh+1],[x-28,gy-Hh+5]]),c('jeansShade'));
 this.poly(R([[x-30,gy-4],[x-30,gy-Hh+4],[x-22,gy-Hh],[x+6,gy-Hh+2],[x+26,gy-12],[x+40,gy-8],[x+40,gy-4]]),(i,j)=>j<gy-Hh*.55+((i-x)*.2)?c('shoe'):c('shoeShade'));
 this.poly(R([[x-31,gy-5],[x+41,gy-5],[x+41,gy-1],[x-31,gy-1]]),this.c('#e8e8f0'));this.poly(R([[x-31,gy-1],[x+41,gy-1],[x+40,gy+2],[x-30,gy+2]]),c('sole'));
 for(let i=0;i<5;i++){const [a,b]=rot(x-14+i*6,gy-Hh+4+i*1.6),[a2,b2]=rot(x-10+i*6,gy-Hh+6+i*1.6);this.line(a,b,a2,b2,this.c('#4a4a5a'));}
 const [s1,s2]=rot(x-24,gy-9),[s3,s4]=rot(x+18,gy-13);this.line(s1,s2,s3,s4,c('jacket'),2);
 const [h1,h2]=rot(x-30,gy-Hh+4);this.rect(h1,h2,4,8,c('yoke'));
 this.endLayer('#ff8fd0',-1);if(back){}
};

// ── Detail: the zipper of the 80s jacket goes up.
F.shotZipper=function(lt,t){
 const W=this.W,H=this.H,P=Film.CAST.milton,c=k=>this.c(P[k]),pull=176-Film.ease(lt/1.7)*150,zx=160,k=Film.beat(t).kick;
 this.rect(0,0,W,H,(i,j)=>{const band=(i*.6+j)-40;let col=band<0?P.yoke:(band<10&&band>=6?P.stripe:P.jacket);if(band>=10&&i>zx)col=P.jacketShade;const sheen=Math.sin((i+j*.4)*.05+t*.6);if(sheen>.85&&this.d(i,j)<.5)col=band<0?'#ff8fd0':'#8ff4ea';return this.c(col);});
 // Open part above the slider shows the shirt underneath.
 for(let y=0;y<pull;y++){const gap=Math.min(36,(pull-y)*.22);this.rect(zx-gap,y,gap*2,1,this.c(this.d(zx,y)<.1?'#2a1f38':'#1a1424'));
  for(const sd of [-1,1]){const ex=zx+sd*gap;this.px(ex,y,this.c((y&1)?'#e8ecf4':'#8a90a4'));this.px(ex+sd,y,this.c('#5a6074'));}}
 for(let y=Math.round(pull);y<H;y++)for(let i=-2;i<=2;i++)this.px(zx+i,y,this.c(((y+i)&1)?'#d8dce8':'#7a8094'));
 // Slider, tab and the hand pinching it.
 this.rect(zx-6,pull-4,12,10,this.c('#9aa0b4'));this.rect(zx-5,pull-3,10,2,this.c('#e8ecf4'));this.rect(zx-2,pull+6,5,14,this.c('#b8bcd0'));this.rect(zx-1,pull+7,1,12,this.c('#f0f2f8'));
 this.beginLayer();
 const hy=pull+12;
 this.quad(zx+88,hy+22,W+40,hy+58,40,46,c('sleeve'));this.quad(zx+70,hy+14,zx+92,hy+26,30,34,c('cuff'));
 this.poly([[zx+70,hy-6],[zx+40,hy-12],[zx+22,hy-6],[zx+18,hy+8],[zx+30,hy+22],[zx+62,hy+30],[zx+76,hy+20]],(x,y)=>y>hy+16?c('skinShade'):c('skin'));
 for(let i=0;i<3;i++){const fy=hy+2+i*7;this.quad(zx+26,fy,zx+12,fy+3,9,8,i?c('skinShade'):c('skin'));this.ellipse(zx+11,fy+3,4,4,i?c('skinShade'):c('skin'));}
 this.quad(zx+34,hy-8,zx+8,hy-4,10,8,c('skin'));this.ellipse(zx+6,hy-4,5,4,c('skin'));this.rect(zx+3,hy-7,4,2,this.c('#ffe6d8'));
 for(let i=0;i<3;i++)this.rect(zx+44+i*8,hy-9,1,3,c('skinDark'));this.line(zx+22,hy-1,zx+34,hy-2,c('skinDark'));
 this.endLayer(k>.5?'#ffd0ea':'#ff8fd0',-1);
 for(let i=0;i<14;i++){const x=this.rand(i*7)*W,y=(this.rand(i*3)*H+t*20*(i%3))%H;this.px(x,y,this.c('#e8fbff'));this.px(x,y+1,this.c('#8fb8c8'));}
};

// ── Close-up: Milton in profile, yellow beanie and headphones, neon on his face.
F.shotCloseUp=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,P=Film.CAST.milton,c=k2=>this.c(P[k2]);
 this.vgrad(0,0,W,H,['#05050f','#0b0a20','#141230','#1c1638']);
 for(const [bx,by,r,col,sp]of [[40,40,34,'#3af0ff',.4],[90,120,22,'#ffb04a',.3],[255,36,40,'#ff3fa4',.5],[300,130,30,'#3af0ff',.2],[20,150,26,'#ff3fa4',.3],[230,150,18,'#ffe14a',.2]])this.glow(bx-lt*sp*6,by,r,col,.65);
 this.rain(t,.5,lt*8);
 const S=120,ox=94-lt*3,oy=24+(bt.ph<.12?1:0),U=(u,v)=>[ox+u*S,oy+v*S],pts=a=>a.map(([u,v])=>U(u,v));
 // Neck and jacket collar.
 this.poly(pts([[.50,.78],[.72,.86],[.78,1.4],[.40,1.4]]),(x,y)=>x<ox+.58*S?c('skinShade'):c('skin'));
 this.poly(pts([[.18,1.02],[.40,.93],[.62,.98],[.86,.92],[.98,1.0],[1.1,1.5],[.1,1.5]]),(x,y)=>{const u=(x-ox)/S,v=(y-oy)/S;if(v>1.18)return c('yoke');if(Math.abs(v-1.14)<.012)return c('stripe');return u>.62?c('jacket'):c('jacketShade');});
 this.line(...U(.86,.93),...U(.92,1.4),this.c('#d8dce8'),2);
 // Head.
 const face=[[.45,.00],[.62,.02],[.74,.08],[.80,.18],[.82,.30],[.83,.38],[.86,.44],[.90,.53],[.93,.58],[.89,.61],[.86,.63],[.87,.66],[.85,.68],[.865,.71],[.83,.74],[.81,.79],[.80,.85],[.72,.90],[.58,.88],[.50,.80],[.40,.74],[.30,.64],[.22,.46],[.24,.25],[.32,.08]];
 this.poly(pts(face),(x,y)=>{const u=(x-ox)/S,v=(y-oy)/S;if(u<.52)return this.d(x,y)<.5?c('skinShade'):c('skinDark');if(u<.6)return this.d(x,y)<.5?c('skin'):c('skinShade');return c('skin');});
 // Rim light from the pink neon in front, cyan from behind.
 for(let i=0;i<face.length;i++){const [a,b]=U(...face[i]),[a2,b2]=U(...face[(i+1)%face.length]);const front=face[i][0]>.78;if(front)this.line(a,b,a2,b2,this.c(k>.5?'#ffd0ea':'#ff8fd0'));else if(face[i][0]<.3)this.line(a,b,a2,b2,this.c('#5fe8f0'));}
 // Eye, brow, nostril, lips.
 const blink=lt>2.55&&lt<2.68;const [ex,ey]=U(.775,.405);
 if(blink)this.rect(ex-3,ey,7,1,this.c('#7a4a3a'));else{this.rect(ex-3,ey-1,7,3,this.c('#f4ecec'));this.rect(ex+1,ey-1,3,3,this.c('#3a2418'));this.px(ex+2,ey-1,this.c('#ffffff'));this.rect(ex-4,ey-2,8,1,this.c('#6a3a2a'));}
 this.rect(...U(.73,.355),12,2,this.c('#5a3420'));this.rect(...U(.865,.595),2,1,this.c('#9a5a48'));this.rect(...U(.82,.69),5,1,this.c('#b06a5a'));
 // Hair at the nape and sideburn.
 this.poly(pts([[.22,.46],[.34,.50],[.36,.66],[.27,.62]]),(x,y)=>this.d(x,y)<.3?this.c('#6a4430'):c('hair'));
 // Beanie: knit body, folded brim with ribs; no pompom.
 const beanie=[[.18,.54],[.15,.32],[.22,.12],[.38,-.03],[.58,-.05],[.74,.02],[.84,.14],[.885,.27],[.875,.355],[.60,.38],[.38,.45]];
 this.poly(pts(beanie),(x,y)=>{const u=(x-ox)/S,v=(y-oy)/S,brimTop=.255+(.86-u)*.17;if(v>brimTop){const rib=(Math.floor(x)+Math.floor(y*.15))%3;return rib===0?c('beanieDark'):u>.7?c('beanie'):c('beanieShade');}
  const knit=((Math.floor(y/3)&1)?(x&3)===0:(x&3)===2)&&this.d(x,y)<.6;if(knit)return c('beanieShade');return u>.66?(this.d(x,y)<.35?c('beanieLight'):c('beanie')):u<.3?c('beanieShade'):c('beanie');});
 for(let i=0;i<beanie.length;i++){if(beanie[i][0]<.6)continue;const [a,b]=U(...beanie[i]),[a2,b2]=U(...beanie[(i+1)%beanie.length]);if(beanie[(i+1)%beanie.length][0]>.6)this.line(a,b,a2,b2,this.c('#fff6c0'));}
 // Headphones: band over the beanie, cup over the ear.
 for(let s=0;s<=1;s+=.02){const u=.43+Math.sin(s*1.4)*.1,v=.36-s*.42;const [a,b]=U(u,v);this.rect(a-1,b-1,4,4,c('phones'));if(s>.15)this.px(a+1,b-1,c('phonesLight'));}
 const [cx,cy]=U(.42,.50);this.ellipse(cx,cy,13,16,(x,y,dx,dy)=>dx*dx+dy*dy>.75?this.c('#14141f'):dx>.2&&dy<-.1?c('phonesLight'):c('phones'));this.ellipse(cx+2,cy-1,5,6,this.c('#3a3a52'));
 // Breath in the cold, on the second beat of each bar.
 if(bt.n%4===1){const p=bt.ph;const [mx,my]=U(.9,.69);for(let i=0;i<14;i++){const x=mx+p*30+this.rand(i)*12,y=my-p*8+(this.rand(i+5)-.5)*10;if(this.d(Math.round(x),Math.round(y))<(1-p)*.7)this.px(x,y,this.c('#c8d0f0'));}}
 this.rain(t,.25,lt*20);
};

// ── Wide: the iron bridge; Milton crosses behind the lattice, the city reflected in the river.
F.shotBridge=function(lt,t){
 const W=this.W,H=this.H,camX=22*lt,deck=124,top=46,k=Film.beat(t).kick;
 this.vgrad(0,0,W,deck,['#05050f','#0a0a22','#141236','#22184a','#30205a']);
 this.ellipse(262,30,14,14,(x,y,dx,dy)=>dx<-.4&&dy<.3?this.c('#c8c0e0'):this.c('#f0eaff'));this.glow(262,30,46,'#8a7ab0',.4);this.rect(255,25,4,3,this.c('#d8d0ec'));this.rect(266,34,3,2,this.c('#d8d0ec'));
 for(let i=-2;i<26;i++){const bx=Math.round(i*15-camX*.12),bw=11+this.rand(i*5)*8,tp=54+this.rand(i*3)*44;this.rect(bx,tp,bw,deck-tp,this.c(i&1?'#100f26':'#15142e'));for(let wy=tp+4;wy<deck-4;wy+=5)for(let wx=bx+2;wx<bx+bw-2;wx+=4)if(this.rand(i*977+wy*7+wx)<.2)this.px(wx,wy,this.c(this.rand(wx*3+wy)<.6?'#ffcf7a':'#9fe8ff'));if(i%5===2)this.glow(bx+bw/2,tp+8,8,'#ff3fa4',.5+k*.3);}
 const panel=52,off=((camX%panel)+panel)%panel,iron=this.c('#2a2440'),hi=this.c('#5e5384'),rivet=this.c('#7a6fa0');
 // Back lattice (far side of the bridge), dim.
 for(let i=-1;i<9;i++){const x=Math.round(i*panel-off+20);this.line(x,top+6,x+panel,deck-4,this.c('#1c1830'),2);this.line(x+panel,top+6,x,deck-4,this.c('#1c1830'),2);}
 this.rect(0,top+4,W,3,this.c('#1c1830'));
 // Deck and lamps.
 this.rect(0,deck,W,10,this.c('#1c1830'));this.rect(0,deck,W,1,this.c('#4a4068'));this.rect(0,deck+8,W,2,this.c('#0e0b18'));
 for(let i=-1;i<9;i++){const x=Math.round(i*panel-off),id=Math.floor((camX+i*panel)/panel);if(((id%2)+2)%2===0){this.rect(x+24,deck-40,2,40,iron);this.rect(x+20,deck-42,10,3,this.c('#3a3456'));this.rect(x+21,deck-39,8,1,this.c('#ffcf8a'));this.glow(x+25,deck-36,26,'#ffb04a',.45+k*.15);this.glow(x+25,deck,22,'#ffb04a',.45,.22);}}
 this.drawMilton(96+lt*4,deck,46,walkAt(t),'#ffb04a',1);
 // Front lattice over him: chords, posts, X braces and rivets.
 this.rect(0,top,W,6,iron);this.rect(0,top,W,1,hi);this.rect(0,top+5,W,1,this.c('#14101e'));this.rect(0,deck-8,W,6,iron);this.rect(0,deck-8,W,1,hi);
 for(let i=-1;i<9;i++){const x=Math.round(i*panel-off);this.rect(x-2,top,5,deck-top-2,iron);this.rect(x-2,top,1,deck-top-2,hi);this.line(x+2,top+6,x+panel-2,deck-8,iron,3);this.line(x+panel-2,top+6,x+2,deck-8,iron,3);
  for(let r=top+9;r<deck-10;r+=8)this.px(x,r,rivet);for(let r=4;r<panel;r+=10){this.px(x+r,top+2,rivet);this.px(x+r,deck-6,rivet);}}
 this.reflect(deck+10,H,deck+9,'#07071a',t,2.4,.65);
 this.rain(t,.6,camX);
};

// ── Medium: each step lights the plank under his foot.
F.shotPlanks=function(lt,t){
 const W=this.W,H=this.H,h=124,gy=166,speed=h*.32*2,camX=lt*speed,X=140,bt=Film.beat(t);
 this.vgrad(0,0,W,H,['#05050f','#0c0b24','#171338','#1f1840']);
 for(let i=0;i<9;i++){const bx=((i*47-camX*.12)%380+380)%380-30,by=30+this.rand(i)*60;this.glow(bx,by,16+this.rand(i+3)*14,['#ff3fa4','#3af0ff','#ffb04a'][i%3],.55);}
 // Railing behind him at his depth.
 const rail=this.c('#2a2440'),hi=this.c('#5a4f7a');
 for(const ry of [96,118,140])this.rect(0,ry,W,3,rail),this.rect(0,ry,W,1,hi);
 for(let i=-1;i<10;i++){const x=Math.round(i*44-(camX%44));this.rect(x,92,4,gy-92,rail);this.rect(x,92,1,gy-92,hi);}
 // Deck boards; a board glows where a foot lands.
 const bw=14,lands=[];for(let n=Math.floor((t-lt-Film.BEAT0)/Film.P)-1;n<=bt.n;n++){const tl=Film.BEAT0+n*Film.P;if(tl>t)continue;const camL=Math.max(0,tl-(t-lt))*speed,fx=X+h*.16;lands.push([Math.floor((camL+fx)/bw),tl]);}
 for(let i=-1;i<W/bw+2;i++){const id=Math.floor(camX/bw)+i,x=Math.round(id*bw-camX);let g=0;for(const [bid,tl]of lands)if(bid===id)g=Math.max(g,Math.exp(-(t-tl)*1.6));
  this.rect(x,gy,bw-1,H-gy,(a,b)=>this.d(a,b)<g*.9?this.c(g>.6?'#ffe9b0':'#ffb04a'):this.c(b-gy<2?'#4a3a3a':'#2a2028'));this.rect(x+bw-1,gy,1,H-gy,this.c('#120c14'));if(g>.05)this.glow(x+bw/2,gy,26,'#ffb04a',g*.6,.4);}
 this.drawMilton(X,gy,h,walkAt(t),'#ffb04a',1);
 this.rain(t,.7,camX*.5);
};

// ── Low angle: looking up through the lattice — the two side trusses lean in, braces cross the sky.
F.shotLowAngle=function(lt,t){
 // Worm's-eye: the lens sits on the deck, he strides over it against the moon and the converging iron.
 const W=this.W,H=this.H,k=Film.beat(t).kick,vx=150+Math.sin(lt*.5)*8,vy=-170+lt*5,gy=H+4,X=124,h=150;
 this.vgrad(0,0,W,H,['#2a2058','#1c1644','#120f30','#0a0a22']);
 const mx=158,my=44;this.glow(mx,my,80,'#8a7ab0',.5);this.ellipse(mx,my,28,28,(x,y,dx,dy)=>dx<-.45&&dy<.3?this.c('#c8c0e0'):this.c('#f6f0ff'));this.rect(mx-10,my-6,6,4,this.c('#dcd4f0'));this.rect(mx+8,my+9,4,3,this.c('#dcd4f0'));
 const iron=this.c('#1c1630'),hi=this.c('#6a5f8a'),rivet=this.c('#8a7fb0');
 const P=(x,y,z)=>[vx+(x-vx)/z,vy+(y-vy)/z];
 for(const sx of [-60,W+60]){const inner=sx<0?70:W-70;
  for(let z=1;z<9;z+=.8){const [a,b]=P(sx,H+40,z),[a2,b2]=P(inner,H+40,z),[c1,c2]=P(sx,H+40,z+.8),[d1,d2]=P(inner,H+40,z+.8),w=Math.max(1,7/z);
   this.line(a,b,c1,c2,iron,w);this.line(a2,b2,d1,d2,iron,w*.8);this.line(a,b,d1,d2,iron,Math.max(1,w*.6));this.line(a2,b2,c1,c2,iron,Math.max(1,w*.6));this.line(a,b,a2,b2,iron,Math.max(1,w*.7));
   if(z<4)for(let r=0;r<5;r++){const f=r/5;this.px(a+(a2-a)*f,b+(b2-b)*f-w/2,rivet);}
   this.line(a2,b2-w/2,d1,d2-w/2,hi);}}
 const sc=(lt*.7)%1;
 for(let s=0;s<6;s++){const z=1.4+(s-sc)*1.2;if(z<1.15)continue;const [l1,l2]=P(70,H+40,z),[r1,r2]=P(W-70,H+40,z),w=Math.max(1,8/z);this.line(l1,l2,r1,r2,iron,w);this.line(l1,l2-w/2,r1,r2-w/2,hi);const [m1,m2]=P(W/2,H+40,z+.6);this.line(l1,l2,m1,m2,iron,Math.max(1,w*.5));this.line(r1,r2,m1,m2,iron,Math.max(1,w*.5));}
 // Deck lamp at the left edge throws warm light up his side.
 this.rect(18,H-60,4,60,iron);this.rect(13,H-63,14,3,this.c('#3a3456'));this.rect(14,H-60,12,1,this.c('#ffcf8a'));this.glow(20,H-60,44,"#ffb04a",.3+k*.12);
 // Him, towering: keystoned so the head recedes and the sneakers loom.
 this.beginLayer();this.person({x:X,y:gy,h,dir:1,walk:walkAt(t),who:'milton'});this.keystone(X,gy,.26);this.endLayer('#d8d0ff',1);
 // Deck edge right at the lens.
 this.rect(0,H-7,W,7,(x,y)=>this.c(y>H-3?'#120c14':this.d(x,y)<.25?'#4a3a3a':'#2a2028'));this.glow(X,H-4,40,'#ffb04a',.25*k,.3);
 for(let i=0;i<70;i++){const a=this.rand(i)*Math.PI*2,ph=(t*1.1+this.rand(i+7))%1,r0=ph*190,len=3+ph*14,cx=vx,cy=H*.3;for(let q=0;q<len;q++){const x=cx+Math.cos(a)*(r0+q),y=cy+Math.sin(a)*(r0+q)*.9;if(this.d(Math.round(x),Math.round(y))<.4+ph*.4)this.px(x,y,this.c(ph>.6?'#e0e4ff':'#8a8ec0'));}}
};
window.SHOTS=SHOTS;
