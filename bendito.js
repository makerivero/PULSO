'use strict';
// Bendito error — shot list and scenes. Times are bar lines of the song (120 BPM, bars of 4 beats).
const B=i=>Film.bar(i);
const Bb=(i,beats)=>Film.bar(i)+beats*Film.P;
const FILM_END=374.1;
// Cuts follow the lyric timing measured from the full mix: a line's shot starts on the bar (or the beat) where it is sung.
const SHOTS=[
 // Intro
 {t0:0,t1:B(2),fn:'shotTitle'},
 {t0:B(2),t1:B(4),fn:'shotCity'},
 {t0:B(4),t1:B(5),fn:'shotPuddle'},
 {t0:B(5),t1:B(6),fn:'shotZipper'},
 {t0:B(6),t1:B(8),fn:'shotCloseUp'},
 // Verse 1 — 17.8 «Un puente no se sostiene de hierro» · 21.5 «se sostiene de las ganas de cruzarlo»
 {t0:B(8),t1:B(10),fn:'shotBridge'},
 {t0:B(10),t1:B(11),fn:'shotPlanks'},
 {t0:B(11),t1:Bb(12,-1),fn:'shotLowAngle'},
 // 25.5 «Rayuela de neón en el asfalto frío» · 29.3 «donde el azar es un animal que no sabe de olvido»
 {t0:Bb(12,-1),t1:Bb(14,-1),fn:'shotHopscotch'},
 {t0:Bb(14,-1),t1:B(16),fn:'shotDiceRoll'},
 {t0:B(16),t1:B(17),fn:'shotDiceEyes'},
 // 36.0 «Caminamos sin buscarnos, pero sabiendo / que el encuentro es un dibujo que el viento va escribiendo»
 {t0:B(17),t1:B(19),fn:'shotSplitWalk'},
 {t0:B(19),t1:B(21),fn:'shotWindMap'},
 // Instrumental: her, and him disconnected
 {t0:B(21),t1:B(22),fn:'shotHerIntro'},
 {t0:B(22),t1:B(23),fn:'shotPhone'},
 {t0:B(23),t1:B(24),fn:'shotLost'},
 // Pre-chorus — 50.0 «No me des la mano, dame tu pulso» · 54 «el tiempo es un reloj de arena en falso curso»
 {t0:B(24),t1:B(26),fn:'shotHands'},
 {t0:B(26),t1:B(28),fn:'shotHourglass'},
 // ~58 «Saltamos los cuadros, perdemos la cuenta» · ~64 «la noche es un pasaje que el ritmo inventa»
 {t0:B(28),t1:B(30),fn:'shotPanels'},
 {t0:B(30),t1:B(32),fn:'shotCountLost'},
 {t0:B(32),t1:B(34),fn:'shotPassage'},
 {t0:B(34),t1:B(36),fn:'shotPassageSide'},
 // Build into the chorus: one detail per bar
 {t0:B(36),t1:B(37),fn:'shotEyeCU'},
 {t0:B(37),t1:B(38),fn:'shotFeetRun'},
 {t0:B(38),t1:B(39),fn:'shotPhonesCU'},
 {t0:B(39),t1:B(40),fn:'shotRunFast'},
 // Chorus — 82 «Baila el azar, canta el vacío» · 87 «en este laberinto que ya no es mío» · 94 «Siente el motor, la sangre, el gancho» · 104.5 «el universo cabe en este rancho»
 {t0:B(40),t1:B(42),fn:'shotDiceDance'},
 {t0:B(42),t1:B(46),fn:'shotMaze'},
 {t0:B(46),t1:B(48),fn:'shotHeart'},
 {t0:B(48),t1:B(51),fn:'shotStreetDance'},
 {t0:B(51),t1:B(54),fn:'shotRancho'},
 {t0:B(54),t1:B(56),fn:'shotLedWall'},
 // Break (no bass): disconnected, the city goes dark, the discotheque
 {t0:B(56),t1:B(58),fn:'shotNoSignal'},
 {t0:B(58),t1:B(60),fn:'shotLightsOut'},
 {t0:B(60),t1:Bb(63,1),fn:'shotDiscoDoor'},
 // Verse 2 — 128.8 «Instrucciones para llorar en la discoteca» · 132.9 «se rompe el cristal, la luz se queda seca»
 {t0:Bb(63,1),t1:Bb(65,2),fn:'shotDiscoFloor'},
 {t0:Bb(65,2),t1:Bb(67,1),fn:'shotGlass'},
 // 137.0 «Somos figuras de jazz en un mundo de ruido» · 141.7 «un saxofón de humo, un latido perdido»
 {t0:Bb(67,1),t1:Bb(69,3),fn:'shotJazz'},
 {t0:Bb(69,3),t1:B(72),fn:'shotSax'},
 // 146.1 «Corres por la inercia de no ser estático, el sudor es el lenguaje de lo pragmático»
 {t0:B(72),t1:B(76),fn:'shotRunOut'},
 {t0:B(76),t1:B(78),fn:'shotSweat'},
 {t0:B(78),t1:B(80),fn:'shotRunLow'},
 // Bass only, then the full stop at 2:56
 {t0:B(80),t1:B(82),fn:'shotHerWalk'},
 {t0:B(82),t1:B(84),fn:'shotAlley'},
 {t0:B(84),t1:B(87),fn:'shotSameMoon'},
 {t0:B(87),t1:B(88),fn:'shotFreeze'},
 // Instrumental groove — MTV montage of parallel lives
 {t0:B(88),t1:B(90),fn:'shotRoofDance'},
 {t0:B(90),t1:B(92),fn:'shotWindowDance'},
 {t0:B(92),t1:B(94),fn:'shotSubway'},
 {t0:B(94),t1:B(96),fn:'shotScreens'},
 {t0:B(96),t1:B(100),fn:'shotArcade'},
 {t0:B(100),t1:B(104),fn:'shotSigns'},
 {t0:B(104),t1:B(108),fn:'shotHerRoof'},
 {t0:B(108),t1:B(112),fn:'shotRoofCables'},
 // Bridge — 226 «¿Ves ese hilo rojo entre los cables?» · 230.3 «No somos libres, somos responsables» · 235.6 «de la belleza de este error…» · 239.4 «de este bendito error…»
 {t0:B(112),t1:B(114),fn:'shotCablesSky'},
 {t0:B(114),t1:Bb(117,-1),fn:'shotPinky'},
 {t0:Bb(117,-1),t1:Bb(119,-1),fn:'shotThreadTrack'},
 {t0:Bb(119,-1),t1:B(120),fn:'shotSmile'},
 // Final chorus
 {t0:B(120),t1:B(122),fn:'shotRoofRun'},
 {t0:B(122),t1:B(124),fn:'shotHerRun'},
 {t0:B(124),t1:B(126),fn:'shotMazeThread'},
 {t0:B(126),t1:B(128),fn:'shotRanchoBoth'},
 // Guitar & synth solo
 {t0:B(128),t1:B(132),fn:'shotKeytarWide'},
 {t0:B(132),t1:B(134),fn:'shotKeys'},
 {t0:B(134),t1:B(136),fn:'shotHerBridgeRun'},
 {t0:B(136),t1:B(140),fn:'shotKeytarLasers'},
 {t0:B(140),t1:B(142),fn:'shotBeanieNod'},
 {t0:B(142),t1:B(144),fn:'shotLeap'},
 {t0:B(144),t1:B(148),fn:'shotConverge'},
 {t0:B(148),t1:B(152),fn:'shotBridgeApproach'},
 // Outro voice — 305.8 «Vinimos a buscarnos sin saberlo…» · 313.8 «Vinimos a buscarnos…»
 {t0:B(152),t1:B(156),fn:'shotMeet'},
 {t0:B(156),t1:B(160),fn:'shotFaces'},
 // Outro: walking together, the camera rises to the sky, the title returns
 {t0:B(160),t1:B(164),fn:'shotTogether'},
 {t0:B(164),t1:B(168),fn:'shotTogetherLow'},
 {t0:B(168),t1:B(176),fn:'shotSkyTilt'},
 {t0:B(176),t1:FILM_END,fn:'shotEndTitle'}];
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
 const S=120,ox=94-lt*3,oy=24+(bt.ph<.12?1:0),U=(u,v)=>[ox+u*S,oy+v*S];
 this.portrait({x:ox,y:oy,S,who:'milton',dir:1,blink:lt>2.55&&lt<2.68,kick:k});
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

// ── Overhead: a neon hopscotch painted on cold wet asphalt; he hops one square per beat.
F._hopLayout=function(){
 // Squares along x: [x0, y0, w, h, label]; doubles stack vertically.
 const q=46,cy=92,L=[];let x=60;
 const single=n=>{L.push([x,cy-q/2,q,q,String(n)]);x+=q;},double=(a,b)=>{L.push([x,cy-q,q,q,String(a)]);L.push([x,cy,q,q,String(b)]);x+=q;};
 single(1);single(2);single(3);double(4,5);single(6);double(7,8);L.push([x,cy-q,q*1.3,q*2,'CIELO']);return L;
};
F._asphalt=function(ox,oy,t,base='#15142a'){
 const W=this.W,H=this.H;
 this.rect(0,0,W,H,(x,y)=>{const wx=x+ox,wy=y+oy,n=this.rand((wx*73856093)^(wy*19349663));return this.c(n<.05?'#2a2944':n<.12?'#1c1b34':base);});
};
F._puddleRings=function(t,ox,amt){
 for(let i=0;i<amt;i++){const ph=(t*1.3+this.rand(i*11))%1,cx=((this.rand(i*7)*420-ox*.0)%420+420)%420-50,cy=this.rand(i*5)*this.H,r=2+ph*9;
  if(this.d(Math.round(cx),Math.round(cy))<1-ph)this.ellipse(cx,cy,r,r*.7,(x,y,dx,dy)=>Math.abs(dx*dx+dy*dy-1)<.25&&this.d(x,y)<(1-ph)*.8?this.c('#5a5f90'):0);}
};
F.shotHopscotch=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),L=this._hopLayout();
 // Landing spots per beat: 1,2,3,(4|5),6,(7|8),CIELO, then he turns.
 const sp=n=>{const sq=L.find(q=>q[4]===n);return [sq[0]+sq[2]/2,92];},spots=[sp('1'),sp('2'),sp('3'),[sp('4')[0],92],sp('6'),[sp('7')[0],92],[sp('CIELO')[0]+10,92],[sp('CIELO')[0]+10,92]];
 const b0=Math.round((t-lt-Film.BEAT0)/Film.P),k=Math.max(0,bt.b-b0),i=Math.min(spots.length-2,Math.floor(k)),f=Math.min(1,k-i);
 const air=Film.ease(Math.min(1,f/.55)),A=spots[i],Bp=spots[Math.min(spots.length-1,i+1)],hx=A[0]+(Bp[0]-A[0])*air,hy=A[1],lift=Math.sin(Math.min(1,f/.55)*Math.PI)*(i>=6?0:1);
 const camX=Math.max(0,Math.min(250,hx-120));
 this._asphalt(camX,0,t);
 // Wet sheen bands drifting across, and the painted hopscotch with neon tubes.
 for(let y=0;y<H;y++){const w=Math.sin(y*.07+t*.4);if(w>.92)for(let x=0;x<W;x++)if(this.d(x,y)<.25)this.px(x,y,this.c('#24254a'));}
 const lit=(idx)=>{const sq=L[idx];const cx=sq[0]+sq[2]/2;return Math.abs(cx-hx)<sq[2]/2&&f>.5?Math.exp(-(f-.55)*3):0;};
 L.forEach((sq,idx)=>{const [x0,y0,w,h,lab]=sq,x=x0-camX,g=lit(idx),col=idx%2?'#3af0ff':'#ff3fa4',hot=idx%2?'#d8fdff':'#ffd0ea';
  if(lab==='CIELO'){this.ellipse(x,y0+h/2,w,h/2,(px,py,dx)=>dx<0?0:this.d(px,py)<.12+g*.3?this.c(col):0);this.ellipse(x,y0+h/2,w,h/2,(px,py,dx,dy)=>dx>=0&&dx*dx+dy*dy>.86?this.c(g>.3?hot:'#ffe14a'):0);this.text('CIELO',x+8,y0+h/2-5,this.c('#ffe14a'),2,1);this.glow(x+w*.4,y0+h/2,40,'#ffe14a',.25+g*.3);return;}
  if(g>.02)this.rect(x+1,y0+1,w-2,h-2,(px,py)=>this.d(px,py)<g*.5?this.c(col):0);
  this.glow(x+w/2,y0+h/2,26,col,.22+g*.35+bt.kick*.08);
  const edge=this.c(g>.3?hot:col);this.rect(x,y0,w,2,edge);this.rect(x,y0+h-2,w,2,edge);this.rect(x,y0,2,h,edge);this.rect(x+w-2,y0,2,h,edge);
  this.text(lab,x+w/2-this.textW(lab,2,1)/2,y0+h/2-5,this.c(g>.3?'#ffffff':hot),2,1);});
 // Curb and sidewalk along the top, a lamp's pool of light, a manhole cover — world-anchored so the pan reads.
 this.rect(0,0,W,22,(x,y)=>this.c(((x+camX)>>3)+(y>>3)&1?'#24223c':'#201e36'));this.rect(0,22,W,3,this.c('#3a3858'));this.rect(0,25,W,2,this.c('#0c0b18'));
 for(const lx of [150,420]){const x=lx-camX;this.ellipse(x,12,4,4,this.c('#3a3654'));this.glow(x,30,70,'#ffb04a',.22,.7);}
 {const mx=330-camX,my=150;this.ellipse(mx,my,15,15,this.c('#1e1d34'));this.ellipse(mx,my,15,15,(x,y,dx,dy)=>dx*dx+dy*dy>.8||((x+y)&3)===0?this.c('#2c2b48'):0);}
 for(const [px,py,rx,ry]of [[250,40,26,7],[470,160,30,8]]){const x=px-camX;this.ellipse(x,py,rx,ry,(xx,yy,dx)=>this.c(this.d(xx,yy)<.3?'#2a2f5a':'#1a1c3c'));this.ellipse(x-rx*.3,py,rx*.3,ry*.4,(xx,yy)=>this.d(xx,yy)<.5?this.c('#ff3fa4'):0);}
 // Puddle rings from the rain hitting the asphalt.
 this._puddleRings(t,camX,26);
 // His shadow on the ground, then him from above (bigger in the air: closer to the lens).
 const sx=hx-camX,r=15+lift*5;this.ellipse(sx+lift*8,hy+lift*10,16,12,(x,y)=>this.d(x,y)<.55?this.c('#0a0916'):0);
 this.beginLayer();this.personTop({x:sx,y:hy,r,ang:i>=6&&f>.5?Math.PI*Math.min(1,(f-.5)*2):0,walk:f*.5+i*.5,who:'milton'});this.endLayer(bt.kick>.5?'#ffd0ea':'#ff8fd0',1);
 this.rain(t,.35,camX,0,.05);
};
// A die in 3D: rotated cube, perspective, shaded faces, glowing pips. faces opposite sum 7.
F._die=function(cx,cy,sz,rx,ry,rz,base,shade,pipCol,noOne){
 const rot=([x,y,z])=>{let a=Math.cos(rz),b=Math.sin(rz);[x,y]=[x*a-y*b,x*b+y*a];a=Math.cos(ry);b=Math.sin(ry);[x,z]=[x*a+z*b,-x*b+z*a];a=Math.cos(rx);b=Math.sin(rx);[y,z]=[y*a-z*b,y*b+z*a];return [x,y,z];};
 const prj=([x,y,z])=>{const f=4/(4+z);return [cx+x*sz*f,cy+y*sz*f,f];};
 const PIPS={1:[[0,0]],2:[[-.5,-.5],[.5,.5]],3:[[-.5,-.5],[0,0],[.5,.5]],4:[[-.5,-.5],[.5,-.5],[-.5,.5],[.5,.5]],5:[[-.5,-.5],[.5,-.5],[0,0],[-.5,.5],[.5,.5]],6:[[-.5,-.6],[.5,-.6],[-.5,0],[.5,0],[-.5,.6],[.5,.6]]};
 const faces=[[2,-1,1],[2,1,6],[0,1,3],[0,-1,4],[1,-1,2],[1,1,5]],light=[-.4,-.7,-.6],out=[];out.noOne=arguments[9];
 for(const [ax,sg,val]of faces){const n=[0,0,0];n[ax]=sg;const rn=rot(n);if(rn[2]>=-.02)continue;
  const P3=(u,v)=>{const p=[0,0,0];p[ax]=sg;p[(ax+1)%3]=u;p[(ax+2)%3]=v;return prj(rot(p));};
  const corners=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([u,v])=>P3(u*.92,v*.92)),rim=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([u,v])=>P3(u,v));
  const lum=Math.max(0,-(rn[0]*light[0]+rn[1]*light[1]+rn[2]*light[2]));
  this.poly(rim,this.c(shade));this.poly(corners,(x,y)=>this.d(x,y)<lum*1.1?this.c(base):this.c(shade));
  if(val===1){const [fx,fy]=P3(0,0);out.c1=[fx,fy,-rn[2]];}
  if(pipCol)for(const [u,v]of PIPS[val]){if(val===1&&out.noOne)continue;const [px,py,f]=P3(u*.62,v*.62),r=Math.max(1,sz*f*.17*Math.sqrt(-rn[2]));this.ellipse(px,py,r,r*Math.max(.35,-rn[2]),this.c(pipCol));if(r>2)this.px(px-r*.3,py-r*.3,this.c('#ffffff'));}
  out.push(val);}
 return out;
};
// ── Low, at street level: two neon dice tumble down the hopscotch toward the lens, bouncing on the beat.
F.shotDiceRoll=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),dur=Film.bar(16)-(Film.bar(14)-Film.P),u=Math.min(1,lt/dur),hz=64;
 this.vgrad(0,0,W,hz,['#06061a','#0d0b28','#1a1240','#2a1a50']);
 for(let i=0;i<10;i++){const bx=(i*41+lt*6)%360-20;this.glow(bx,hz-8-this.rand(i)*30,10+this.rand(i+1)*12,['#ff3fa4','#3af0ff','#ffb04a','#ffe14a'][i%4],.55);}
 // Ground in perspective: asphalt rows get bigger toward the lens; the hopscotch lines converge to the horizon.
 for(let y=hz;y<H;y++){const z=(y-hz)/(H-hz),zz=1/(z+.04);for(let x=0;x<W;x++){const wx=(x-160)*zz*.06,wy=zz*3+lt*14,n=this.rand((Math.floor(wx*8)*7919)^(Math.floor(wy*8)*104729));this.px(x,y,this.c(n<.05?'#2a2944':n<.12?'#1b1a33':z<.15?'#100f22':'#15142a'));}}
 const lines=[-1.6,-.5,.5,1.6];for(const lx of lines)for(let y=hz+1;y<H;y++){const z=(y-hz)/(H-hz),x=160+lx*z*190;this.px(x,y,this.c(Math.abs(lx)>1?'#3af0ff':'#ff3fa4'));if(z>.4)this.px(x+1,y,this.c(Math.abs(lx)>1?'#3af0ff':'#ff3fa4'));}
 for(let k=0;k<8;k++){const wz=((k*3-lt*14)%24+24)%24,z=3/(wz+1.2)-.1;if(z<0||z>1)continue;const y=hz+z*(H-hz),x0=160-1.6*z*190,x1=160+1.6*z*190;this.rect(x0,y,x1-x0,Math.max(1,z*3),this.c(k%2?'#3af0ff':'#ff3fa4'));}
 this.reflect(hz+1,hz+40,hz,'#0e0d22',t,1.6,.45);
 // The dice: far → near, a bounce per beat, spinning.
 const dice=[[-.6,'#ff4fae','#8a1a5a','#fff0fa',0],[.55,'#4af0ff','#126a7a','#f0ffff',1.7]];
 for(const [side,base,shade,pip,ph]of dice){const z=.12+u*.78,bx=160+side*z*120+Math.sin(lt*1.3+ph)*6,bounce=Math.abs(Math.sin(bt.b*Math.PI))*(1-u*.6)*34*z,gy=hz+z*(H-hz),sz=10+z*30;
  this.ellipse(bx,gy,sz*1.1,sz*.28,(x,y)=>this.d(x,y)<.6?this.c('#08070f'):0);this.glow(bx,gy,sz*1.6,base,.3,.3);
  this._die(bx,gy-sz-bounce,sz,lt*2.4+ph,lt*3.1+ph*2,lt*1.2,base,shade,pip);}
 this.rain(t,.6,lt*10);
};
// ── Close-up: the dice settle showing one pip each — two eyes of an animal in the dark. They blink.
F.shotDiceEyes=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),push=lt*4;
 this.vgrad(0,0,W,H,['#04040c','#07071a','#0b0a22','#100c28']);
 this.glow(160,150,170,'#2a0f3a',.4,.4);
 // Faint hopscotch neon in the wet ground behind.
 this.rect(0,124,W,H-124,(x,y)=>this.c(this.rand(x*13+y*71)<.05?'#1f1e38':'#0c0b1c'));
 this.rect(0,124,W,1,this.c('#3a1a4a'));
 const ex=[112-push,208+push],sz=46+push*1.5,blinkAt=1.25;
 ex.forEach((x,i)=>{const base=i?'#3ae8ff':'#ff4fae',shade=i?'#0f5a6a':'#7a1650';
  this.ellipse(x,124,sz*1.05,sz*.2,(px,py)=>this.d(px,py)<.65?this.c('#050409'):0);
  // Cube seen almost straight on, slightly from above; its single pip is an eye.
  const f1=this._die(x,124-sz*.82,sz*.78,.6,(i?-.2:.2)+Math.sin(lt*.6)*.03,0,base,shade,'#120814',true).c1||[x,100];
  const cy=f1[1],bl=Math.abs(lt-blinkAt)<.09||Math.abs(lt-blinkAt-.25)<.06?.15:1,r=sz*.2;
  this.glow(x,cy,r*3.4,i?'#9af8ff':'#ffd27a',.55+bt.kick*.2);
  this.ellipse(x,cy,r,r*bl,(px,py,dx,dy)=>{const d=dx*dx+dy*dy;return d<.16?this.c('#08040a'):this.c(d<.45?'#fff6c0':'#ffb43a');});
  if(bl>.5){this.rect(x-r*.45,cy-r*.5,2,2,this.c('#ffffff'));}
  });
 this.rain(t,.35,lt*6);
};

// Split screen helper: draw the left frame, keep its left half, draw the right frame, restore the left half; divider line.
F._split=function(drawL,drawR,div=160){
 const W=this.W,H=this.H;drawL();const keep=new Uint32Array(W*H);keep.set(this.buf);drawR();
 for(let y=0;y<H;y++){const o=y*W;for(let x=0;x<div;x++)this.buf[o+x]=keep[o+x];}
 this.rect(div-1,0,2,H,this.c('#05040a'));
};
// A row of shopfronts with small neon signs, sidewalk and wet street; camX scrolls (parallax handled by caller).
F._storefronts=function(camX,t,neon,seed,gy){
 const W=this.W,H=this.H,k=Film.beat(t).kick,names=['CAFE','BAR','LIBROS','FOTO','24H','PIZZA','DISCOS','HOTEL','KIOSCO','CINE'];
 this.vgrad(0,0,W,gy-60,['#05050f','#0a0a20','#141432','#1e1a40']);
 // Far skyline.
 for(let i=-1;i<14;i++){const bx=Math.round(i*28-((camX*.2)%28)),id=Math.floor(camX*.2/28)+i,top=10+this.rand(id*7+seed)*30;this.rect(bx,top,26,gy,this.c('#11102a'));for(let wy=top+4;wy<gy-60;wy+=6)for(let wx=bx+3;wx<bx+23;wx+=5)if(this.rand(id*131+wy*7+wx+seed)<.18)this.px(wx,wy,this.c('#ffcf7a'));}
 // Facades.
 const fw=74;for(let i=-1;i<6;i++){const id=Math.floor(camX/fw)+i,x=Math.round(id*fw-camX),r=this.rand(id*13+seed),col=['#1d1a36','#221b3a','#1a2038','#251c34'][Math.floor(r*4)],top=gy-96;
  this.rect(x,top,fw,96,this.c(col));this.rect(x,top,fw,2,this.c('#2e2a4a'));this.rect(x+fw-2,top,2,96,this.c('#14122a'));
  for(let wx=x+8;wx<x+fw-12;wx+=18)this.rect(wx,top+8,10,12,this.c(this.rand(id*7+wx+seed)<.4?'#ffcf7a':'#0b0a18'));
  // Shop window with a warm or cool interior, an awning and the neon name.
  const win=this.rand(id+seed*3)<.5?'#ffcf7a':'#9fe8ff';this.rect(x+8,gy-44,fw-26,30,(xx,yy)=>this.d(xx,yy)<.35?this.c(win):this.c('#3a2a2a'));this.rect(x+8,gy-44,fw-26,2,this.c('#14121e'));
  for(let j=0;j<3;j++)this.rect(x+14+j*14,gy-24-this.rand(id*5+j)*10,8,12+this.rand(id+j)*8,this.c('#1a1424'));
  this.rect(x+fw-16,gy-40,10,40,this.c('#0e0c18'));this.rect(x+fw-14,gy-38,6,36,this.c('#16131f'));
  for(let a=0;a<fw-22;a+=6)this.rect(x+6+a,gy-52,6,6,this.c((a/6)&1?neon[0]:'#e8e0f0'));
  const nm=names[Math.floor(this.rand(id*29+seed)*names.length)],nc=neon[(id&1)],tw=this.textW(nm,1,1);this.glow(x+fw/2,gy-62,22,nc,.35+k*.25);this.text(nm,x+fw/2-tw/2,gy-64,this.c(k>.6?'#ffffff':nc),1,1);}
 // Sidewalk, curb, wet street with reflections.
 this.rect(0,gy,W,8,(xx,yy)=>this.c(((xx+Math.round(camX))>>4)&1?'#2a2844':'#262440'));this.rect(0,gy+8,W,2,this.c('#4a4868'));
 this.reflect(gy+10,H,gy+9,'#0b0b1e',t,2,.6);
};
// ── Split screen: two people walking toward each other in two different streets, not looking for each other.
F.shotSplitWalk=function(lt,t){
 const h=92,gy=150,w=walkAt(t),speed=h*.32;
 this._split(()=>{this._storefronts(lt*speed+40,t,['#ff3fa4','#ffb04a'],3,gy);this.drawMilton(92+lt*3,gy,h,w,'#ff8fd0',1);this.rain(t,.5,lt*10);},
  ()=>{this._storefronts(-lt*speed+900,t,['#3af0ff','#9a7aff'],11,gy);this.beginLayer();this.person({x:232-lt*3,y:gy,h:h*.97,dir:-1,walk:w+.5,who:'her'});this.endLayer('#5fe8f0',-1);this.rain(t,.5,-lt*10);});
};
// ── Overhead map: the wind writes both their routes through the city; the lines meet at the bridge.
F.shotWindMap=function(lt,t){
 const W=this.W,H=this.H,dur=Film.bar(21)-Film.bar(19),u=Math.min(1,lt/dur),z=1+u*.18,cx=160,cy=90,bt=Film.beat(t);
 const S=(x,y)=>[cx+(x-cx)*z,cy+(y-cy)*z];
 this.clear('#0a0a18');
 // City blocks with rooftop details; streets with lamp dots; the river cuts across with the bridge.
 const blk=46,st=12;
 for(let by=-2;by<6;by++)for(let bx=-2;bx<9;bx++){const x0=bx*(blk+st)+6,y0=by*(blk+st)-4,[a,b]=S(x0,y0),w=blk*z,r=this.rand(bx*31+by*17);
  this.rect(a,b,w,w,this.c(r<.33?'#1c1a34':r<.66?'#201d3a':'#181730'));this.rect(a,b,w,1,this.c('#2c2a4a'));
  for(let k=0;k<4;k++){const ux=this.rand(bx*7+by*3+k)*(blk-10),uy=this.rand(bx*3+by*11+k)*(blk-10),[p,q]=S(x0+ux+3,y0+uy+3);if(k===0)this.ellipse(p+3*z,q+3*z,4*z,4*z,this.c('#2a2844'));else this.rect(p,q,5*z,4*z,this.c(k===1?'#26243e':'#14132a'));}
  if(r>.8){const [p,q]=S(x0+blk/2,y0+blk/2);this.glow(p,q,10*z,'#ff3fa4',.35);}}
 for(let i=-2;i<9;i++)for(let j=-2;j<6;j++){const [p,q]=S(i*(blk+st)+6+blk+st/2,j*(blk+st)-4+blk+st/2);this.px(p,q,this.c('#ffcf7a'));if(bt.kick>.6)this.glow(p,q,5,'#ffb04a',.4);}
 // River: a diagonal band with ripples, under the bridge.
 const riv=(x)=>130+(x-160)*.35;
 this.rect(0,0,W,H,(x,y)=>{const wx=cx+(x-cx)/z,wy=cy+(y-cy)/z,d=wy-riv(wx);if(Math.abs(d)>13)return 0;if(Math.abs(d)>11.5)return this.c('#2a2848');const r=Math.sin(wx*.45+t*2.5)*Math.sin(wy*.8-t*1.7);return this.c(r>.6&&this.d(x,y)<.6?'#4a5aa0':this.rand(Math.floor(wx)*31+Math.floor(wy)*7)<.006?'#ffcf7a':'#0e1440');});
 {const [p,q]=S(230,riv(230)),hl=17*z,hw=5*z;this.rect(p-hw,q-hl,hw*2,hl*2,this.c('#2a2440'));for(let yy=-hl;yy<hl;yy+=4)this.line(p-hw,q+yy,p+hw,q+yy+4,this.c('#5e5384'));this.rect(p-hw,q-hl,1,hl*2,this.c('#7a6fa0'));this.rect(p+hw-1,q-hl,1,hl*2,this.c('#7a6fa0'));for(let k=0;k<4;k++){this.px(p-hw-1,q-hl+4+k*9*z,this.c('#ffb04a'));this.px(p+hw,q-hl+8+k*9*z,this.c('#ffb04a'));}}
 // Routes: polylines along streets, drawn up to the wind's progress.
 const R1=[[20,93],[70,93],[70,35],[186,35],[186,151],[226,151]],R2=[[310,209],[302,209],[302,93],[244,93],[244,151],[234,151]];
 const trail=(R,col,head,prog)=>{let L=0;const seg=[];for(let i=1;i<R.length;i++){const l=Math.hypot(R[i][0]-R[i-1][0],R[i][1]-R[i-1][1]);seg.push(l);L+=l;}let rem=L*prog,pt=R[0];
  for(let i=1;i<R.length&&rem>0;i++){const f=Math.min(1,rem/seg[i-1]),a=R[i-1],b=[R[i-1][0]+(R[i][0]-R[i-1][0])*f,R[i-1][1]+(R[i][1]-R[i-1][1])*f];const [x0,y0]=S(...a),[x1,y1]=S(...b);this.line(x0,y0,x1,y1,this.c(col),2);rem-=seg[i-1];pt=b;}
  const [hx,hy]=S(...pt);this.glow(hx,hy,12,col,.6);this.ellipse(hx,hy,3,3,this.c(head));return [hx,hy];};
 const pr=Film.ease(Math.min(1,u*1.12)),a=trail(R1,'#ffd23a','#fff6c0',pr),b=trail(R2,'#ff3a5a','#ffd0d8',pr);
 if(pr>=1){const [p,q]=S(230,151),r=((lt-dur*.9)*40)%30;this.ellipse(p,q,r,r,(x,y,dx,dy)=>Math.abs(dx*dx+dy*dy-1)<.12?this.c('#ffffff'):0);}
 // The wind: long pale streaks blowing across, the ones near the routes brighter.
 for(let i=0;i<60;i++){const sp=60+this.rand(i)*90,x=((this.rand(i*3)*400+t*sp)%400)-40,y=(this.rand(i*7)*220-20+x*.12)%200,len=6+this.rand(i*5)*16;for(let q=0;q<len;q++)if(this.d(Math.round(x+q),Math.round(y+q*.12))<.55*(1-q/len))this.px(x+q,y+q*.12,this.c(i%5?'#8a8ec0':'#e0e4ff'));}
};
// ── Her: close-up through the glass of a bus stop, raindrops on the pane.
F.shotHerIntro=function(lt,t){
 const W=this.W,H=this.H,k=Film.beat(t).kick,S=112+lt*3;
 this.vgrad(0,0,W,H,['#05050f','#0a0b22','#121434','#1a1640']);
 for(const [bx,by,r,col]of [[40,40,30,'#3af0ff'],[90,130,24,'#ff3fa4'],[150,30,20,'#ffb04a'],[30,150,26,'#9a7aff'],[300,160,22,'#3af0ff']])this.glow(bx+lt*4,by,r,col,.6);
 this.portrait({x:292,y:22,S,who:'her',dir:-1,blink:lt>1.3&&lt<1.42,kick:k,rimFront:'#7af4ff',rimBack:'#ff8fd0'});
 // Raindrops on the glass in front: round lenses with a highlight, some running down.
 for(let i=0;i<46;i++){const x=this.rand(i*7)*W,run=i%4===0?((lt*30+this.rand(i)*90)%200):0,y=(this.rand(i*13)*H+run)%H,r=1+this.rand(i*5)*2.2;
  this.ellipse(x,y,r,r*1.2,(px,py,dx,dy)=>dx*dx+dy*dy>.6?(dy>0&&this.d(px,py)<.6?this.c('#9fb0e0'):0):dy<-.2&&dx<0?this.c('#e8f4ff'):0);if(run)for(let q=1;q<8;q++)if(this.d(Math.round(x),Math.round(y-q*2))<.4)this.px(x,y-q*2,this.c('#4a5a8a'));}
 this.rect(0,0,W,3,this.c('#2a2840'));this.rect(0,H-6,W,6,this.c('#1c1a30'));this.text('PARADA',8,H-5,this.c('#5a5878'),1,1);
};
// ── Him: looking down at the phone; its cold light from below.
F.shotPhone=function(lt,t){
 const W=this.W,H=this.H,k=Film.beat(t).kick;
 this.vgrad(0,0,W,H,['#04040c','#08081c','#0e0c26','#141030']);
 for(const [bx,by,r,col]of [[260,40,30,'#ff3fa4'],[300,120,22,'#ffb04a'],[220,150,18,'#3af0ff']])this.glow(bx-lt*3,by,r,col,.5);
 this.portrait({x:40+lt*2,y:26,S:116,who:'milton',dir:1,look:1.5,kick:k,rimFront:'#bfe8ff',rimBack:'#ff8fd0'});
 // The phone at the bottom edge and its glow on his chin.
 const px=196,py=150;this.glow(px,py-20,60,'#8fd8ff',.45);
 this.poly([[px-30,H],[px-18,py-6],[px+30,py-14],[px+38,H]],this.c('#14141f'));this.poly([[px-25,H],[px-15,py-2],[px+26,py-9],[px+33,H]],(x,y)=>this.d(x,y)<.15?this.c('#ffffff'):this.c('#9fe0ff'));
 for(let i=0;i<4;i++){const bh=3+i*3,bx=px-10+i*5,by=py+16-bh;this.rect(bx,by,3,bh,this.c('#5a8ab8'));this.rect(bx+1,by+1,1,bh-2,this.c('#c8ecff'));}this.line(px+10,py+4,px+16,py+10,this.c('#ff3a5a'),2);this.line(px+16,py+4,px+10,py+10,this.c('#ff3a5a'),2);
 this.rain(t,.3,lt*8);
};
// ── Wide: a street corner; the signs point everywhere; he turns one way, then the other.
F.shotLost=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),gy=150,push=lt*3;
 this.vgrad(0,0,W,gy,['#05050f','#0a0a20','#141432','#221a46']);
 for(let i=0;i<7;i++){const bx=i*48-10,top=30+this.rand(i*5)*40;this.rect(bx,top,44,gy-top,this.c(i&1?'#14132c':'#181632'));for(let wy=top+6;wy<gy-20;wy+=9)for(let wx=bx+5;wx<bx+40;wx+=8)if(this.rand(i*91+wy*3+wx)<.25)this.rect(wx,wy,3,4,this.c('#ffcf7a'));}
 this.rect(0,gy,W,H-gy,this.c('#14132a'));for(let i=0;i<8;i++)this.rect(60+i*26,gy+10,14,H-gy-10,this.c('#d8dce8'));
 this.reflect(gy+1,H,gy,'#0b0b1e',t,2,.55);for(let i=0;i<8;i++)this.rect(60+i*26,gy+12,14,3,this.c('#8a8ea8'));
 // Signpost with arrows in every direction; a traffic light that turns green on the third beat.
 const sx=200;this.rect(sx,gy-92,3,92,this.c('#3a3658'));
 const arrow=(y,dir,txt,col)=>{const x0=dir>0?sx+3:sx-44;this.rect(x0,y,41,9,this.c(col));const tip=dir>0?x0+41:x0-1;this.poly([[tip,y-2],[tip+dir*6,y+4.5],[tip,y+11]],this.c(col));this.text(txt,x0+4,y+2,this.c('#14121e'),1,1);};
 arrow(gy-88,1,'NORTE','#e8e0f0');arrow(gy-76,-1,'SUR','#ffe14a');arrow(gy-64,1,'ESTE','#3af0ff');arrow(gy-52,-1,'OESTE','#ff3fa4');
 const tl=50;this.rect(tl,gy-80,3,80,this.c('#2a2840'));this.rect(tl-5,gy-100,13,26,this.c('#1a1828'));const green=bt.n%4>=2;
 this.ellipse(tl+1.5,gy-94,3,3,this.c(green?'#3a1010':'#ff3a3a'));this.ellipse(tl+1.5,gy-82,3,3,this.c(green?'#3aff8a':'#103a20'));this.glow(tl+1.5,green?gy-82:gy-94,16,green?'#3aff8a':'#ff3a3a',.5);
 // He looks right, left, right — lost.
 const dir=[1,-1,1,-1][bt.n%4];this.beginLayer();this.person({x:150-push,y:gy+4,h:64,dir,pose:'stand',walk:lt,who:'milton'});this.endLayer('#ff8fd0',dir);
 // A car's headlights sweep across on the downbeat.
 const cp=(bt.b%4)/4;if(cp<.5){const x=-60+cp*2*440;this.glow(x,gy+14,40,'#fff6c0',.5,.35);}
 this.rain(t,.6);
};

// A hand reaching in from one side: sleeve, cuff, palm and extended fingers. dir 1 reaches right.
F._hand=function(x,y,s,dir,who,open=1){
 const P=Film.CAST[who],c=k=>this.c(P[k]),X=(u)=>x+dir*u*s,Y=(v)=>y+v*s;
 this.quad(X(-3.2),Y(.5),X(-1.2),Y(.1),s*1.25,s*1.05,c('sleeve'));this.quad(X(-1.3),Y(.12),X(-.9),Y(.05),s*1.0,s*.95,c('cuff'));
 this.poly([[X(-.95),Y(-.42)],[X(-.1),Y(-.5)],[X(.25),Y(-.3)],[X(.3),Y(.32)],[X(-.2),Y(.5)],[X(-.95),Y(.45)]],(px,py)=>py>Y(.25)?c('skinShade'):c('skin'));
 for(let i=0;i<4;i++){const fy=-.36+i*.24,len=(i===0||i===3?.7:.85)*open+.25;this.quad(X(.2),Y(fy),X(.2+len),Y(fy+.03*i),s*.22,s*.19,i%2?c('skinShade'):c('skin'));}
 this.quad(X(-.3),Y(-.45),X(.2),Y(-.8),s*.26,s*.22,c('skin'));
 for(let i=0;i<3;i++)this.px(X(.02),Y(-.24+i*.24),c('skinDark'));
};
// ── Close-up: two hands almost touching; between them, a pulse line that beats on the kick.
F.shotHands=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,dur=Film.bar(26)-Film.bar(24),u=lt/dur,gap=64-u*26;
 this.vgrad(0,0,W,H,['#05040e','#0a0820','#120c2c','#1a1034']);
 for(const [bx,by,r,col]of [[40,30,34,'#ff3fa4'],[280,40,30,'#3af0ff'],[160,160,40,'#9a7aff'],[60,150,22,'#ffb04a'],[260,150,26,'#ff3fa4']])this.glow(bx+Math.sin(lt*.4+bx)*6,by,r,col,.45);
 this.beginLayer();this._hand(160-gap/2-36,94,32,1,'milton');this.endLayer('#ff8fd0',-1);
 this.beginLayer();this._hand(160+gap/2+36,88,30,-1,'her');this.endLayer('#7af4ff',1);
 // The pulse: an ECG trace between the fingertips, scrolling; its spike lands on every beat.
 const x0=160-gap/2+4,x1=160+gap/2-4,amp=16+k*10;let py=null;
 for(let x=Math.floor(x0);x<=x1;x++){const ph=((x-x0)/(x1-x0+1)+lt*1.0)%1,yy=90+(Math.abs(ph-.5)<.04?-amp*(1-Math.abs(ph-.5)/.04):Math.abs(ph-.58)<.03?amp*.5:0);
  if(py!==null)this.line(x-1,py,x,yy,this.c(k>.4?'#ffffff':'#ff5a7a'));py=yy;this.glow(x,yy,4,'#ff3a5a',.15);}
 this.glow(160,90,30+k*20,'#ff3a5a',.25+k*.35);
};
// ── The hourglass with sand running upward: time on a false course.
F.shotHourglass=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,dur=Film.bar(28)-Film.bar(26),u=lt/dur,S=1+u*.12,cx=160,cy=92;
 this.vgrad(0,0,W,H,['#05040e','#0b0820','#140e2c','#0a0718']);
 // Clock rings turning backwards behind it.
 for(const [r,sp,col]of [[78,-.4,'#2a2050'],[104,.25,'#221a44'],[60,-.8,'#3a2a62']]){const R=r*S;for(let a=0;a<60;a++){const ang=a/60*Math.PI*2+lt*sp,x=cx+Math.cos(ang)*R,y=cy+Math.sin(ang)*R;this.rect(x,y,a%5?1:3,a%5?1:3,this.c(col));}}
 this.glow(cx,cy,80,'#ffb04a',.1+k*.08);
 const X=v=>cx+v*S,Y=v=>cy+v*S,bulb=(top)=>{const sg=top?-1:1;const pts=[];for(let i=0;i<=20;i++){const a=i/20,y=sg*(4+a*52),w=4+Math.sin(Math.min(1,a*1.15)*Math.PI*.5)*30*(a<.85?1:1-(a-.85)*2.5);pts.push([X(w),Y(y)]);}for(let i=20;i>=0;i--){const a=i/20,y=sg*(4+a*52),w=4+Math.sin(Math.min(1,a*1.15)*Math.PI*.5)*30*(a<.85?1:1-(a-.85)*2.5);pts.push([X(-w),Y(y)]);}return pts;};
 const sandTop=Math.min(1,.15+u*.85),sandBot=1-u*.85;
 for(const top of [true,false]){const pts=bulb(top);this.poly(pts,(x,y)=>this.d(x,y)<.18?this.c('#3a3a6a'):this.c('#141432'));
  // Sand: bottom bulb empties from its floor up; the top bulb fills from its ceiling down — upside-down physics.
  const lvl=top?Y(-56+sandTop*48):Y(56-sandBot*48);
  this.poly(pts,(x,y)=>top?(y<lvl?this.c(this.d(x,y)<.3?'#ffe9a0':'#e8b04a'):0):(y>lvl?this.c(this.d(x,y)<.3?'#ffe9a0':'#e8b04a'):0));
  this.poly(pts,(x,y)=>{const dx=x-cx;return Math.abs(dx)<2&&false?0:0;});}
 // The thin stream rising through the neck, grains floating up.
 for(let y=Y(48);y>Y(-50);y--)if(this.d(cx,Math.round(y+lt*60))<.7)this.px(cx,y,this.c('#ffe9a0'));
 for(let i=0;i<30;i++){const ph=(lt*.8+this.rand(i))%1,x=cx+(this.rand(i*3)-.5)*30*S*ph,y=Y(48)-ph*100*S;if(y>Y(-56))this.px(x,y,this.c('#ffd27a'));}
 // Glass highlights and the wooden frame with brass caps.
 for(const sg of [-1,1]){this.line(X(-18),Y(sg*40),X(-24),Y(sg*18),this.c('#c8d8ff'));}
 this.rect(X(-42),Y(-66),84*S,8*S,this.c('#5a3418'));this.rect(X(-42),Y(-66),84*S,2,this.c('#8a5a2a'));this.rect(X(-42),Y(58),84*S,8*S,this.c('#5a3418'));this.rect(X(-42),Y(58),84*S,2,this.c('#8a5a2a'));
 for(const sx of [-38,34])this.rect(X(sx),Y(-58),4*S,116*S,(x,y)=>this.c(this.d(x,y)<.3?'#8a5a2a':'#5a3418'));
 this.rect(X(-46),Y(-68),92*S,2,this.c('#ffcf7a'));this.rect(X(-46),Y(66),92*S,2,this.c('#ffcf7a'));
};

// ── Three comic panels: he jumps from one frame into the next on the beat; the panel numbers lose count.
F.shotPanels=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),b0=Math.round((t-lt-Film.BEAT0)/Film.P),k=bt.b-b0,gut=6,pw=(W-gut*4)/3,ph=H-gut*2;
 this.clear('#05040a');
 const pal=[['#2a0a2a','#5a1450','#ff3fa4'],['#06222a','#0e4a5a','#3af0ff'],['#2a1606','#5a3410','#ffb04a']];
 // Where he is: panel index by beat; jumps on beats 2 and 6 (arc across the gutter).
 // Walk across a panel, jump the gutter on beats 2 and 6, land, keep walking.
 const pxOf=i=>gut+i*(pw+gut)+pw*.5,keys=[[0,pxOf(0)-26,0],[1.5,pxOf(0)+8,0],[2.4,pxOf(1)-18,1],[5.5,pxOf(1)+14,0],[6.4,pxOf(2)-18,1],[9,pxOf(2)+14,0]];
 let px=keys[0][1],air=0;for(let j=1;j<keys.length;j++){const [ka,xa]=keys[j-1],[kb,xb,jump]=keys[j];if(k>=ka&&k<kb){const f=(k-ka)/(kb-ka);px=xa+(xb-xa)*f;if(jump)air=Math.sin(f*Math.PI);break;}if(k>=kb)px=xb;}
 const scramble=k>4;
 for(let i=0;i<3;i++){const x=gut+i*(pw+gut),[d,m,n]=pal[i];
  this.vgrad(x,gut,pw,ph,[d,m]);
  // Halftone dots and speed lines, comic style.
  this.rect(x,gut,pw,ph,(xx,yy)=>((xx+yy)%6===0&&(yy%6===0)&&this.d(xx,yy)<.6)?this.c(n):0);
  for(let r=0;r<10;r++){const a=r/10*Math.PI*2+i,cxp=x+pw/2,cyp=gut+ph*.45;this.line(cxp+Math.cos(a)*30,cyp+Math.sin(a)*30,cxp+Math.cos(a)*90,cyp+Math.sin(a)*90,this.c(m));}
  this.rect(x,gut+ph-24,pw,24,this.c(d));this.rect(x,gut+ph-24,pw,1,this.c(n));
  const num=scramble?String(Math.floor(this.rand(Math.floor(t*12)*7+i)*99)):String(i+1);this.rect(x+3,gut+3,this.textW(num,2,1)+6,14,this.c('#f4ecd8'));this.text(num,x+6,gut+5,this.c('#14101e'),2,1);
  this.rect(x,gut,pw,1,this.c('#f4ecd8'));this.rect(x,gut+ph-1,pw,1,this.c('#f4ecd8'));this.rect(x,gut,1,ph,this.c('#f4ecd8'));this.rect(x+pw-1,gut,1,ph,this.c('#f4ecd8'));}
 // Him: running in the panel, flying over the gutter (drawn over it — breaking the frame).
 const gy=gut+ph-24;this.beginLayer();this.person({x:px,y:gy-air*40,h:84,dir:1,walk:air>0?.12:walkAt(t),pose:air>0?'run':'walk',who:'milton'});this.endLayer('#ffffff',1);
 if(air>0)for(let i=0;i<6;i++)this.line(px-30-i*6,gy-60-air*40+i*7,px-60-i*6,gy-60-air*40+i*7,this.c('#f4ecd8'));
};
// ── Overhead: the hopscotch never ends and its numbers spin like a slot machine — losing count.
F.shotCountLost=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),camX=lt*46,q=46,cy=92;
 this._asphalt(camX,0,t,'#121126');
 const b0=Math.round((t-lt-Film.BEAT0)/Film.P),k=bt.b-b0,step=Math.floor(k),f=k-step;
 for(let i=-1;i<9;i++){const id=Math.floor(camX/q)+i,x=Math.round(id*q-camX),dbl=((id%3)+3)%3===2,col=(id&1)?'#3af0ff':'#ff3fa4',hot=(id&1)?'#d8fdff':'#ffd0ea';
  const cells=dbl?[[cy-q],[cy]]:[[cy-q/2]];
  for(const [y0]of cells){const spin=Math.floor(t*14+id*3+y0)%10,n=String(this.rand(id*13+y0+Math.floor(t*10))<.5?spin:Math.floor(this.rand(id*7+Math.floor(t*6))*99));
   this.glow(x+q/2,y0+q/2,24,col,.2+bt.kick*.1);this.rect(x,y0,q,2,this.c(col));this.rect(x,y0+q-2,q,2,this.c(col));this.rect(x,y0,2,q,this.c(col));this.rect(x+q-2,y0,2,q,this.c(col));
   this.text(n,x+q/2-this.textW(n,2,1)/2,y0+q/2-5,this.c(hot),2,1);
   // Ghost of the right number, glitching underneath.
   if(this.rand(Math.floor(t*8)+id)<.3)this.text(String(id),x+q/2-this.textW(String(id),2,1)/2+2,y0+q/2-3,this.c('#5a5878'),2,1);}}
 this._puddleRings(t,camX,20);
 // He hops forward, then sideways, losing the pattern; shadow below.
 const hx=130+Math.sin(step*1.7)*10,hy=cy+Math.sin(step*2.3)*18,lift=Math.sin(Math.min(1,f/.55)*Math.PI),r=15+lift*5;
 this.ellipse(hx+lift*8,hy+lift*10,16,12,(x,y)=>this.d(x,y)<.55?this.c('#0a0916'):0);
 this.beginLayer();this.personTop({x:hx,y:hy,r,ang:Math.sin(step*1.3)*.8,walk:f*.5+step*.5,who:'milton'});this.endLayer(bt.kick>.5?'#ffd0ea':'#ff8fd0',1);
 this.rain(t,.35,camX,0,.05);
};

// ── The night is a passage: a tunnel of neon arches rushing past; he walks into it, seen from behind.
F.shotPassage=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,vx=160,vy=78,pr=(x,y,z)=>[vx+x*70/z,vy+y*70/z];
 this.vgrad(0,0,W,H,['#05040e','#0c0820','#160c2c','#0c0818']);
 // The far exit: a bright portal.
 this.glow(vx,vy+6,46,'#ffd0ea',.5);this.rect(vx-6,vy-10,12,26,this.c('#ffe6f4'));
 // Floor tiles in perspective.
 for(let y=vy+12;y<H;y++){const z=140/(y-vy),wz=z+lt*3.2;for(let x=0;x<W;x++){const X=(x-vx)*z/70,tile=(Math.floor(X*1.2)+Math.floor(wz*1.2))&1;this.px(x,y,this.c(tile?'#1c1834':'#141028'));}}
 const N=14,sp=1.8,off=(lt*3.2)%sp;
 for(let i=N-1;i>=0;i--){const z=.9+i*sp-off;if(z<.6)continue;const id=Math.round((lt*3.2+z)/sp),col=(id&1)?'#ff3fa4':'#3af0ff',lit=((id%4)+4)%4===bt.n%4,w=Math.max(1,3.2/z);
  const C=this.c(lit?'#ffffff':col);
  // Pillars and the round top of each arch, plus a light pool on the floor.
  const [l0,b0]=pr(-3,2,z),[l1,b1]=pr(-3,-1.6,z),[r0]=pr(3,2,z);this.rect(l0-w/2,b1,w,b0-b1,C);this.rect(r0-w/2,b1,w,b0-b1,C);
  let prev=null;for(let a=0;a<=24;a++){const th=Math.PI+a/24*Math.PI,[x,y]=pr(Math.cos(th)*3,-1.6+Math.sin(th)*2.6,z);if(prev)this.line(prev[0],prev[1],x,y,C,w);prev=[x,y];}
  if(z<9){const [fx,fy]=pr(0,2,z);this.glow(fx,fy,70/z*2.4,col,(lit?.5:.22)*(1-z/9),.25);if(lit)this.glow((l0+r0)/2,b1,70/z*2,col,.25*(1-z/9));}}
 // Him from behind, walking into the light.
 this.beginLayer();this.personBack({x:160,y:166,h:84,walk:walkAt(t),who:'milton'});this.endLayer(k>.5?'#ffd0ea':'#ff8fd0',1);
};
// ── Inside the passage, tracking alongside: shutters with tags, a lit kiosk, columns whipping past in front.
F.shotPassageSide=function(lt,t){
 const W=this.W,H=this.H,bt=Film.beat(t),k=bt.kick,gy=150,speed=80*.32,camX=lt*speed;
 this.clear('#0c0a1a');
 // Ceiling with neon tubes that flicker in a beat pattern.
 this.rect(0,0,W,26,this.c('#100c20'));for(let i=-1;i<6;i++){const x=Math.round(i*70-(camX%70)),id=Math.floor(camX/70)+i,on=((id+bt.n)%3)!==0;this.rect(x+10,14,46,3,this.c(on?((id&1)?'#ff8fd0':'#9ff8ff'):'#2a2440'));if(on)this.glow(x+33,16,40,(id&1)?'#ff3fa4':'#3af0ff',.3+k*.15,.6);}
 // Back wall: shutters and a kiosk.
 const fw=86;for(let i=-1;i<5;i++){const id=Math.floor(camX/fw)+i,x=Math.round(id*fw-camX),kiosk=((id%4)+4)%4===1;
  this.rect(x,30,fw,gy-30,this.c('#191530'));this.rect(x,30,4,gy-30,this.c('#221d3c'));
  if(kiosk){this.rect(x+10,52,fw-20,gy-60,(xx,yy)=>this.c(this.d(xx,yy)<.25?'#ffe9b0':'#ffcf7a'));for(let r=0;r<4;r++)for(let q=0;q<6;q++)this.rect(x+14+q*10,58+r*16,7,10,this.c(['#ff3fa4','#3af0ff','#ffe14a','#9a7aff'][(q+r+id)&3]));this.glow(x+fw/2,gy-30,60,'#ffb04a',.3);this.text('KIOSCO',x+fw/2-this.textW('KIOSCO',1,1)/2,40,this.c('#ffe14a'),1,1);}
  else{for(let yy=46;yy<gy;yy+=3)this.rect(x+8,yy,fw-16,2,this.c(yy%6?'#3a3656':'#2c2844'));
   const tag=['AMOR','ERROR','PULSO','AZAR','NOCHE'][((id%5)+5)%5],tc=['#ff3fa4','#3af0ff','#ffe14a','#9a7aff'][((id%4)+4)%4];this.text(tag,x+14,88,(r,q)=>this.c(r<2?tc:'#ffffff'),2,1);}}
 // Floor tiles mirror the wall.
 this.rect(0,gy,W,H-gy,(xx,yy)=>this.c(((xx+Math.round(camX))>>3)+(yy>>3)&1?'#1c1834':'#151129'));
 this.drawMilton(126,gy,80,walkAt(t),'#ff8fd0',1);
 this.reflect(gy+1,H,gy,'#100c22',t,1.2,.55);
 // Foreground arch columns, much closer, sliding fast.
 const cw=140;for(let i=-1;i<4;i++){const x=Math.round(i*cw-((camX*2.4)%cw)),id=Math.floor(camX*2.4/cw)+i;this.rect(x,0,18,H,this.c('#07060e'));this.rect(x+17,0,2,H,this.c((id&1)?'#ff3fa4':'#3af0ff'));this.glow(x+18,H/2,30,(id&1)?'#ff3fa4':'#3af0ff',.15+k*.1);}
};
window.SHOTS=SHOTS;
