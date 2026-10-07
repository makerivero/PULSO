'use strict';
// Pixel-art games shared by the visualizer (index.html) and the music-video studio (clip.html).
// ───── ARCADE CRT: a real Galaga-style game played by the music, drawn at 192×144 phosphor dots ─────
class ArcadeGame {
 constructor(){
  this.W=192;this.H=144;this.canvas=document.createElement('canvas');this.canvas.width=this.W;this.canvas.height=this.H;
  this.ctx=this.canvas.getContext('2d');this.image=this.ctx.createImageData(this.W,this.H);this.buf=new Uint32Array(this.image.data.buffer);
  this.seed=20261007;this.hi=20000;this.time=0;this.flap=0;this.form={t:0,sway:0,spread:1};this.kick=0;this.burst=0;this.burstT=0;this.cool=0;this.idle=0;this.sparkHigh=false;this.musicSerial=0;this.fireworks=0;this.burstAge=0;this.beam={t:0,x:96,charge:0,tick:0};
  this.stars=Array.from({length:90},()=>({x:this.rand()*192,y:this.rand()*144,s:.25+this.rand()*1.3,c:this.rand()}));
  this.newGame();
 }
 rand(){this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;return this.seed/4294967296;}
 newGame(){this.score=0;this.lives=3;this.stage=1;this.parts=[];this.beam.charge=0;this.startStage();this.startIntro();}
 startIntro(){this.phase='intro';this.phaseT=0;this.introFlash=0;}
 startStage(){
  this.phase='ready';this.phaseT=0;this.perfect=true;this.enemies=[];this.pb=[];this.eb=[];this.diveTimer=4;this.bonus=0;this.newHi=false;this.beam.t=0;this.burst=0;
  this.player={x:96,alive:true,respawn:0,inv:1.5,target:96,retarget:0};
  let id=0;for(const [row,n,type]of [[0,4,'boss'],[1,8,'fly'],[2,8,'fly'],[3,10,'bee'],[4,10,'bee']])for(let c=0;c<n;c++){const col=(10-n)/2+c,side=c%2?-1:1;this.enemies.push({row,col,type,hp:type==='boss'?2:1,state:'enter',t:-(row*.45+Math.floor(c/2)*.12),x:-20,y:-20,side,id:id++,shots:0});}
 }
 slot(e){return {x:96+((e.col-4.5)*15)*this.form.spread+this.form.sway,y:20+e.row*11+Math.sin(this.form.t*2+e.col*.7)*1.2*this.form.spread};}
 shoot(){if(this.pb.length>=ArcadeGame.maxShots||!this.player.alive||this.beam.t>0)return false;const x=this.player.x,y=this.H-15;this.pb.push({x,y,py:y});this.idle=0;return true;}
 hit(e,dmg=1){e.hp-=dmg;if(e.hp>0){this.explode(e.x,e.y,['C','W'],6,false);return false;}const pts=this.points(e);this.score+=pts;e.state='dead';this.explode(e.x,e.y,e.type==='boss'?['G','P','Y','W']:e.type==='fly'?['R','W','B']:['Y','B','W'],e.type==='boss'?28:18);if(pts>=150)this.parts.push({x:e.x,y:e.y,vx:0,vy:-12,life:1,c:'W',text:String(pts)});return true;}
 // The special beam: a column of light that sweeps toward the densest group of enemies.
 beamColumn(alive){let best=this.player.x,most=0;for(const e of alive){if(e.state==='dead'||e.state==='enter')continue;let n=0;for(const o of alive)if(o.state!=='dead'&&o.state!=='enter'&&Math.abs(o.x-e.x)<6)n+=o.type==='boss'?1.5:1;n-=Math.abs(e.x-this.player.x)/120;if(n>most){most=n;best=e.x;}}return best;}
 fireBeam(){if(!this.player.alive||this.beam.t>0||!['play','ready'].includes(this.phase))return false;Object.assign(this.beam,{t:ArcadeGame.beamTime,x:this.player.x,charge:0,tick:0});this.burst=0;this.pb=[];this.player.retarget=0;return true;}
 enemyShoot(e){const p=this.player;this.eb.push({x:e.x,y:e.y+4,vx:Math.max(-28,Math.min(28,(p.x-e.x)*.35)),vy:70+this.stage*4});}
 explode(x,y,colors,n=18,ring=true){for(let i=0;i<n;i++){const a=this.rand()*Math.PI*2,s=18+this.rand()*60;this.parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.35+this.rand()*.55,c:colors[i%colors.length]});}if(ring)this.parts.push({x,y,vx:0,vy:0,life:.35,c:'W',ring:1});if(this.parts.length>500)this.parts.splice(0,this.parts.length-500);}
 points(e){const dive=e.state==='dive';return e.type==='boss'?(dive?400:150):e.type==='fly'?(dive?160:80):(dive?100:50);}
 launchDive(n){const ready=this.enemies.filter(e=>e.state==='form');for(let k=0;k<n&&ready.length;k++){const e=ready.splice(Math.floor(this.rand()*ready.length),1)[0];e.state='dive';e.t=0;e.ox=e.x;e.oy=e.y;e.dir=e.x<96?-1:1;e.shots=this.stage>2?2:1;}}
 startParty(){this.phase='party';this.phaseT=0;}
 step(dt,a,control){
  dt=Math.max(0,Math.min(.05,dt));this.time+=dt;this.phaseT+=dt;
  const bass=a.bass,mid=a.mid,energy=a.energy,fire=control.fire??1,p=this.player;
  this.form.t+=dt;this.form.sway=Math.sin(this.form.t*.7)*11;this.form.spread=1+.05*Math.sin(this.form.t*1.6)+bass*.07+a.kick*.04;
  const newKick=a.kickSerial!==this.kick;if(newKick){this.kick=a.kickSerial;this.flap^=1;}
  for(const s of this.stars){s.y+=s.s*dt*(14+bass*60+(this.phase==='party'?80:0));if(s.y>this.H){s.y-=this.H;s.x=this.rand()*this.W;}}
  for(let i=this.parts.length-1;i>=0;i--){const q=this.parts[i];q.life-=dt;if(q.life<=0){this.parts.splice(i,1);continue;}q.x+=q.vx*dt;q.y+=q.vy*dt;if(q.grav)q.vy+=40*dt;q.vx*=Math.exp(-dt*1.5);q.vy*=Math.exp(-dt*1.2);}
  if(this.phase==='intro'){this.bass=bass;this.introFlash=Math.max(newKick?1:0,(this.introFlash||0)*Math.exp(-dt*5));if(this.phaseT>=(control.intro??12)){this.startStage();}return;}
  if(this.phase==='party'){
   if(newKick)this.firework(a.kickStrength);
   if(this.phaseT>(control.party??9)){this.stage++;this.startStage();}
   return;
  }
  if(this.phase==='clear'){if(this.phaseT>1.6)this.startParty();this.moveShots(dt);return;}
  if(this.phase==='over'){if(this.phaseT>3)this.newGame();this.moveShots(dt);return;}
  // Formation and attackers.
  for(const e of this.enemies){
   if(e.state==='dead')continue;const s=this.slot(e);e.t+=dt;
   if(e.state==='enter'){
    if(e.t<0){e.x=-30;e.y=-30;continue;}
    const u=Math.min(1,e.t/1.7),S=[e.side<0?-12:204,104],C1=[96,160],C2=[e.side<0?168:24,8],E=[s.x,s.y],v=1-u;
    e.x=v*v*v*S[0]+3*v*v*u*C1[0]+3*v*u*u*C2[0]+u*u*u*E[0];e.y=v*v*v*S[1]+3*v*v*u*C1[1]+3*v*u*u*C2[1]+u*u*u*E[1];if(u>=1)e.state='form';
   }else if(e.state==='form'){e.x=s.x;e.y=s.y;if(this.phase==='play'&&this.rand()<dt*.04*energy*this.stage)this.enemyShoot(e);}
   else if(e.state==='dive'){
    if(e.t<.9){const ang=Math.PI*e.t/.9;e.x=e.ox+e.dir*15*(1-Math.cos(ang));e.y=e.oy-15*Math.sin(ang);}
    else{e.y+=(48+this.stage*4+energy*30)*dt;const dx=p.x-e.x;e.x+=Math.max(-1,Math.min(1,dx/20))*38*dt+Math.sin(e.t*5+e.id)*30*dt;if(e.shots>0&&e.y>28&&e.y<92&&this.rand()<dt*2){this.enemyShoot(e);e.shots--;}if(e.y>this.H+10){e.state='return';e.x=s.x;e.y=-10;}}
   }else if(e.state==='return'){const dx=s.x-e.x,dy=s.y-e.y,d=Math.hypot(dx,dy);if(d<1.5){e.state='form';}else{const sp=Math.min(d,95*dt);e.x+=dx/d*sp;e.y+=dy/d*sp;}}
  }
  const alive=this.enemies.filter(e=>e.state!=='dead');
  if(this.phase==='ready'&&this.phaseT>2.2&&!alive.some(e=>e.state==='enter'))this.phase='play';
  if(this.phase==='play'){
   this.diveTimer-=dt*(.45+energy*1.6)*(control.dive??1)*(1+this.stage*.08);
   if(this.diveTimer<=0){this.launchDive(1+Math.floor(this.rand()*(1+this.stage/2)));this.diveTimer=2.2+this.rand()*2.5;}
   if(a.musicSerial!==this.musicSerial){this.musicSerial=a.musicSerial;this.launchDive(3+Math.min(3,this.stage>>1));}
  }
  // Player: aims at the most useful target, dodges what is falling on it, fires with the music.
  if(p.alive){
   p.inv=Math.max(0,p.inv-dt);p.retarget-=dt;
   const B=this.beam,beamCtl=control.beam??1;
   if(B.t<=0&&beamCtl>0&&this.phase==='play'){B.charge=Math.min(1,B.charge+(dt*(.012+energy*.05)+(newKick?.035*(a.kickStrength??.6):0))*beamCtl);const section=a.musicSerial!==this.beamSerial;if(B.charge>=1&&(newKick||section)||section&&B.charge>=.5)this.fireBeam();}
   this.beamSerial=a.musicSerial;
   if(B.t>0){B.t-=dt;p.inv=Math.max(p.inv,.25);if(p.retarget<=0){p.retarget=.25;p.target=this.beamColumn(alive);}B.tick-=dt;
    if(B.tick<=0){B.tick=.09;for(const e of alive){if(e.state==='dead'||e.state==='enter'&&e.t<0||e.y>this.H-14)continue;if(Math.abs(e.x-p.x)<5)this.hit(e);}for(let i=this.eb.length-1;i>=0;i--)if(Math.abs(this.eb[i].x-p.x)<5)this.eb.splice(i,1);}
    for(let i=0;i<3;i++)this.parts.push({x:p.x+(this.rand()-.5)*6,y:this.rand()*(this.H-16),vx:(this.rand()-.5)*50,vy:(this.rand()-.5)*20,life:.15+this.rand()*.25,c:this.rand()<.5?'C':'W'});if(this.parts.length>500)this.parts.splice(0,this.parts.length-500);}
   else if(p.retarget<=0||newKick){p.retarget=.6;const divers=alive.filter(e=>e.state==='dive'&&e.y<this.H-30),pool=divers.length?divers:alive.filter(e=>e.state!=='enter'||e.t>0);let best=null,score=1e9;for(const e of pool){const c=Math.abs(e.x-p.x)*(e.type==='boss'?.7:1)-(e.state==='dive'?40:0)-e.y*.1;if(c<score){score=c;best=e;}}if(best)p.target=best.x+(this.rand()-.5)*(best.state==='dive'?8:13);}
   let goal=p.target,panic=0;
   for(const b of this.eb){if(b.y>this.H-60&&b.y<this.H-6&&Math.abs(b.x+b.vx*((this.H-12-b.y)/b.vy)-p.x)<9){goal=p.x+(p.x<b.x?-22:22);panic=1;}}
   for(const e of alive){if(e.state==='dive'&&e.y>this.H-48&&Math.abs(e.x-p.x)<13){goal=p.x+(p.x<e.x?-26:26);panic=1;}}
   if(goal<10)goal=p.x+24;if(goal>this.W-10)goal=p.x-24;
   if(B.t>0)goal=p.target;const speed=(B.t>0?45+mid*30:55+mid*120+panic*70)*(control.speed??1),dx=goal-p.x;p.x+=Math.max(-speed*dt,Math.min(speed*dt,dx));p.x=Math.max(8,Math.min(this.W-8,p.x));
   if(this.phase!=='over'){
    if(newKick){this.burst=Math.min(4,1+Math.round(a.kickStrength*fire*1.6));this.burstAge=0;this.burstT=0;}
    this.burstT-=dt;this.burstAge+=dt;if(this.burstAge>.5)this.burst=0;if(this.burst>0&&this.burstT<=0&&this.shoot()){this.burst--;this.burstT=.065;}
    this.cool-=dt;if(a.spark>.42&&!this.sparkHigh&&this.cool<=0&&this.shoot())this.cool=.3/fire;this.sparkHigh=a.spark>(this.sparkHigh?.3:.42);
    this.idle+=dt;if(this.idle>1.2/fire&&alive.length)this.shoot();
   }
  }else{p.respawn-=dt;if(p.respawn<=0){if(this.lives<0){this.phase='over';this.phaseT=0;}else{p.alive=true;p.inv=2;p.x=96;}}}
  this.moveShots(dt);
  // Collisions.
  for(let i=this.pb.length-1;i>=0;i--){const b=this.pb[i];for(const e of alive){if(e.state==='dead'||(e.state==='enter'&&e.t<0))continue;if(Math.abs(b.x-e.x)<5.5&&b.y<e.y+5&&(b.py??b.y)>e.y-5){this.pb.splice(i,1);this.hit(e);break;}}}
  if(p.alive&&p.inv<=0){const py=this.H-12;let hit=false;for(let i=this.eb.length-1;i>=0;i--){const b=this.eb[i];if(Math.abs(b.x-p.x)<4&&Math.abs(b.y-py)<4){this.eb.splice(i,1);hit=true;}}for(const e of alive)if(e.state==='dive'&&Math.abs(e.x-p.x)<7&&Math.abs(e.y-py)<6){hit=true;e.state='dead';this.explode(e.x,e.y,['Y','R','W'],16);}
   if(hit){p.alive=false;p.respawn=1.8;this.lives--;this.perfect=false;this.explode(p.x,py,['W','R','B','Y'],40);}}
  if(this.score>this.hi){this.hi=this.score;this.newHi=true;}
  if(!this.enemies.some(e=>e.state!=='dead')&&(this.phase==='play'||this.phase==='ready')){this.phase='clear';this.beam.t=0;this.phaseT=0;this.bonus=this.perfect?5000:1000*this.stage;this.score+=this.bonus;if(this.score>this.hi){this.hi=this.score;this.newHi=true;}this.pb=[];this.eb=[];}
 }
 moveShots(dt){for(let i=this.pb.length-1;i>=0;i--){const b=this.pb[i];b.py=b.y;b.y-=230*dt;if(b.y<-4)this.pb.splice(i,1);}for(let i=this.eb.length-1;i>=0;i--){const b=this.eb[i];b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.y>this.H+4)this.eb.splice(i,1);}}
 firework(strength=.6){const x=30+this.rand()*132,y=24+this.rand()*60,n=26+Math.round(strength*30),cols=['R','Y','G','C','B','P','W'];const c0=Math.floor(this.rand()*cols.length);for(let i=0;i<n;i++){const ang=i/n*Math.PI*2,s=30+this.rand()*35*(.6+strength);this.parts.push({x,y,vx:Math.cos(ang)*s,vy:Math.sin(ang)*s,life:.7+this.rand()*.6,c:cols[(c0+(i%3))%cols.length],grav:1});}}
 coast(dt){dt=Math.max(0,Math.min(.05,dt));this.time+=dt;this.beam.t=Math.max(0,this.beam.t-dt);this.moveShots(dt);for(const q of this.parts){q.x+=q.vx*dt;q.y+=q.vy*dt;}}
 // ───── Drawing ─────
 colors(palette,theme,sat){
  const base={W:[255,255,255],R:[255,40,50],B:[50,90,255],Y:[255,226,40],G:[40,230,110],P:[190,70,255],C:[40,225,255],O:[255,140,30]};
  const out={};
  for(const [k,v]of Object.entries(base)){let c=v;
   if(theme==='palette'&&k!=='W'){const t={R:0,B:.66,Y:.2,G:.4,P:.8,C:.55,O:.1}[k];c=ColorFlow.sample(palette,t).map(x=>Math.round(Math.min(1,x*1.15)*255));}
   else if(theme==='neon'&&k!=='W'){const h=this.time*.06,cs=Math.cos(h*6.283),sn=Math.sin(h*6.283),m=[.299+.701*cs+.168*sn,.587-.587*cs+.330*sn,.114-.114*cs-.497*sn,.299-.299*cs-.328*sn,.587+.413*cs+.035*sn,.114-.114*cs+.292*sn,.299-.3*cs+1.25*sn,.587-.588*cs-1.05*sn,.114+.886*cs-.203*sn];c=[0,1,2].map(r=>Math.max(0,Math.min(255,Math.round(v[0]*m[r*3]+v[1]*m[r*3+1]+v[2]*m[r*3+2]))));}
   const g=(c[0]*.3+c[1]*.59+c[2]*.11);c=c.map(x=>Math.max(0,Math.min(255,Math.round(g+(x-g)*sat))));
   out[k]=(255<<24)|(c[2]<<16)|(c[1]<<8)|c[0];}
  return out;
 }
 px(x,y,c){x|=0;y|=0;if(x<0||y<0||x>=this.W||y>=this.H)return;this.buf[y*this.W+x]=c;}
 sprite(rows,cx,cy,pal,swap=null){const h=rows.length,w=rows[0].length,x0=Math.round(cx-w/2),y0=Math.round(cy-h/2);for(let j=0;j<h;j++)for(let i=0;i<w;i++){let k=rows[j][i];if(k==='.')continue;if(swap&&swap[k])k=swap[k];this.px(x0+i,y0+j,pal[k]);}}
 text(str,x,y,c,scale=1,wave=0,t=0,outline=false){if(outline)for(const [ox,oy]of [[-1,0],[1,0],[0,-1],[0,1],[1,1]])this.text(str,x+ox,y+oy,0xff000000,scale,wave,t);str=String(str).toUpperCase();let cx=x;for(let n=0;n<str.length;n++){const g=ArcadeGame.font[str[n]];if(g){const oy=wave?Math.round(Math.sin(t*5+n*.7)*wave):0,col=typeof c==='function'?c(n):c;for(let r=0;r<5;r++)for(let k=0;k<3;k++)if(g[r*3+k]==='1')for(let sy=0;sy<scale;sy++)for(let sx=0;sx<scale;sx++)this.px(cx+k*scale+sx,y+oy+r*scale+sy,col);}cx+=4*scale;}}
 textWidth(str,scale=1){return String(str).length*4*scale-scale;}
 draw(palette,control={},saturation=1){
  const pal=this.colors(palette,control.theme??'neon',saturation),buf=this.buf,W=this.W,H=this.H;
  if(this.phase==='party'){this.drawParty(palette,pal,control);this.ctx.putImageData(this.image,0,0);return;}
  if(this.phase==='intro'){this.drawIntro(palette,pal,control);this.ctx.putImageData(this.image,0,0);return;}
  buf.fill(0xff050203);
  for(const s of this.stars){const tw=(Math.sin(this.time*3+s.c*40)>.2);if(!tw)continue;const k=s.c<.3?'B':s.c<.55?'R':s.c<.75?'Y':'W';const c=pal[k];this.px(s.x,s.y,s.s>1?c:((c&0xfefefe)>>>1)|0xff000000);}
  const f=this.flap;
  for(const e of this.enemies){if(e.state==='dead'||(e.state==='enter'&&e.t<0))continue;const spr=e.type==='boss'?ArcadeGame.sprites.boss[f]:e.type==='fly'?ArcadeGame.sprites.fly[f]:ArcadeGame.sprites.bee[f];this.sprite(spr,e.x,e.y,pal,e.type==='boss'&&e.hp<2?{G:'C',P:'B'}:null);}
  for(const b of this.pb){this.px(b.x,b.y,pal.W);this.px(b.x,b.y+1,pal.C);this.px(b.x,b.y+2,pal.C);}
  for(const b of this.eb){this.px(b.x,b.y,pal.W);this.px(b.x,b.y+1,(Math.floor(this.time*12)&1)?pal.R:pal.Y);}
  const p=this.player,B=this.beam,beaming=B.t>0&&p.alive;
  if(beaming){const age=ArcadeGame.beamTime-B.t,grow=Math.min(1,age/.12),fade=Math.min(1,B.t/.3),base=H-17,top=Math.round(base*(1-grow)),fr=Math.floor(this.time*30),w=Math.max(1,Math.round(1+2*fade+(fr&1)*fade)),x0=Math.round(p.x);
   for(let y=top;y<=base;y++){const wob=Math.round(Math.sin(y*.45+this.time*40)*.8*fade);for(let dx=-w-1;dx<=w+1;dx++){const ad=Math.abs(dx);const c=ad===0?pal.W:ad===1?pal.C:ad<=w?pal.B:((y+fr)&3)===0?pal.P:0;if(c)this.px(x0+dx+(ad>1?wob:0),y,c);}}
   for(let a=0;a<12;a++){const r=3+(fr%3)+fade*2;this.px(x0+Math.cos(a/12*6.283)*r,base+Math.sin(a/12*6.283)*r*.6,a&1?pal.C:pal.W);}}
  if(p.alive&&(beaming||p.inv<=0||Math.floor(this.time*12)&1))this.sprite(ArcadeGame.sprites.ship,p.x,H-12,pal);
  for(const q of this.parts){if(q.text){this.text(q.text,q.x-this.textWidth(q.text)/2,q.y-2,pal.C);continue;}if(q.ring){const r=(1-q.life/.35)*9;for(let a=0;a<16;a++)this.px(q.x+Math.cos(a/16*6.283)*r,q.y+Math.sin(a/16*6.283)*r,pal.W);continue;}this.px(q.x,q.y,pal[q.c]||pal.W);}
  // HUD
  if(Math.floor(this.time*2)%2)this.text('1UP',3,1,pal.R);this.text(String(this.score).padStart(6,'0'),17,1,pal.W);
  this.text('HI',W-37,1,pal.R);this.text(String(this.hi).padStart(6,'0'),W-27,1,pal.W);
  for(let i=0;i<Math.max(0,this.lives);i++)this.sprite(ArcadeGame.sprites.life,6+i*7,H-3,pal);
  if((control.beam??1)>0&&this.phase!=='over'){const full=B.charge>=1,bx=W/2-12,len=Math.round(B.charge*28);this.text('RAYO',bx-17,H-6,beaming||full?pal[['R','Y','G','C','B','P'][Math.floor(this.time*12)%6]]:pal.C);for(let i=0;i<28;i++){const c=beaming?((i+Math.floor(this.time*30))%3?pal.C:pal.W):i<len?(full&&Math.floor(this.time*8)&1?pal.W:pal.C):((pal.B&0xfefefe)>>>1)|0xff000000;this.px(bx+i,H-5,c);this.px(bx+i,H-4,c);}}
  for(let i=0;i<Math.min(8,this.stage);i++){this.px(W-4-i*4,H-5,pal.R);this.px(W-4-i*4,H-4,pal.R);this.px(W-3-i*4,H-5,pal.Y);this.px(W-4-i*4,H-3,pal.W);this.px(W-4-i*4,H-2,pal.W);}
  const center=(s,y,c,scale=1,wave=0)=>this.text(s,Math.round((W-this.textWidth(s,scale))/2),y,c,scale,wave,this.time);
  if(this.phase==='ready'&&this.phaseT<2.2){center('STAGE '+this.stage,62,pal.C,2);if(this.phaseT>1)center('READY',78,pal.R);}
  if(this.phase==='clear'){center('STAGE CLEAR',58,n=>pal[['R','Y','G','C','B','P'][(n+Math.floor(this.time*10))%6]],2,2);center((this.perfect?'PERFECT  ':'BONUS  ')+this.bonus,80,pal.W);}
  if(this.phase==='over')center('GAME OVER',66,pal.R,2);
  if(beaming&&ArcadeGame.beamTime-B.t<.7)this.text('MEGA RAYO',Math.round((W-this.textWidth('MEGA RAYO',2))/2),96,n=>pal[['W','C','Y','P'][(n+Math.floor(this.time*16))%4]],2,1,this.time,true);
  this.ctx.putImageData(this.image,0,0);
 }

 static clean(s){return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase().replace(/[^A-Z0-9 \-!:.\/?+#,'()*_=$&]/g,' ');}
 drawIntro(palette,pal,control){
  const W=this.W,H=this.H,t=this.phaseT,len=control.intro??12,buf=this.buf,rainbow=['R','O','Y','G','C','B','P'];
  buf.fill(0xff050203);
  for(const s of this.stars){const c=pal[s.c<.3?'B':s.c<.6?'P':'W'];this.px(s.x,s.y,c);if(s.s>1)this.px(s.x,s.y-1,((c&0xfefefe)>>>1)|0xff000000);}
  // Title: letters drop in one by one, bounce, then ride the bass with a rainbow sweep.
  const title=ArcadeGame.clean(control.title||'PULSO').trim()||'PULSO';let lines=[title];
  if(title.length>9&&title.includes(' ')){const mid=title.length/2;let cut=-1,best=1e9;for(let i=0;i<title.length;i++)if(title[i]===' '&&Math.abs(i-mid)<best){best=Math.abs(i-mid);cut=i;}if(cut>0)lines=[title.slice(0,cut),title.slice(cut+1)];}
  const longest=Math.max(...lines.map(l=>l.length)),scale=Math.max(2,Math.min(6,Math.floor((W-8)/(longest*4)))),lineH=6*scale,top=lines.length>1?8:Math.max(10,30-scale*2);
  let index=0;
  lines.forEach((line,li)=>{const x0=Math.round((W-(line.length*4*scale-scale))/2),y0=top+li*(lineH+2);
   for(let n=0;n<line.length;n++,index++){
    const g=ArcadeGame.font[line[n]];if(!g||line[n]===' ')continue;const appear=index*.12;if(t<appear)continue;
    const k=Math.min(1,(t-appear)/.5),drop=k<1?(1-k)*(1-k)*-70+Math.abs(Math.sin(k*Math.PI*2.5))*(1-k)*-10:0;
    const oy=Math.round(drop+(t>appear+.5?Math.sin(this.time*4+index*.6)*(1+(this.bass||0)*3):0)),x=x0+n*4*scale,y=y0+oy;
    for(let pass=0;pass<2;pass++)for(let r=0;r<5;r++)for(let c=0;c<3;c++)if(g[r*3+c]==='1')for(let sy=0;sy<scale;sy++)for(let sx=0;sx<scale;sx++){
     if(pass===0){this.px(x+c*scale+sx+Math.ceil(scale/3),y+r*scale+sy+Math.ceil(scale/3),0xff1a0612);continue;}
     const row=r*scale+sy,band=rainbow[(Math.floor(row/Math.max(1,scale-1))+Math.floor(this.time*8)+index)%7];let col=pal[band];
     if(sy===0&&r===0||k<1&&Math.floor(t*20)%2)col=pal.W;if((this.introFlash||0)>.5&&(sx+sy)%2===0)col=pal.W;
     this.px(x+c*scale+sx,y+row,col);}
   }});
  const after=top+lines.length*(lineH+2);
  // Subtitle, typed out.
  const sub=ArcadeGame.clean(control.subtitle??'PRESENTA').trim();
  if(sub&&t>1.4){const shown=sub.slice(0,Math.floor((t-1.4)*16));const sx=Math.round((W-this.textWidth(sub))/2);this.text(shown,sx,after+4,pal.C,1,0,0,true);if(shown.length<sub.length&&Math.floor(this.time*8)%2)this.text('_',sx+this.textWidth(shown)+1,after+4,pal.W);}
  // Score advance table.
  const ty=after+16;
  if(t>2.6&&ty+40<H-12){const center=(s,y,c)=>this.text(s,Math.round((W-this.textWidth(s))/2),y,c,1,0,0,true);center('- SCORE ADVANCE TABLE -',ty,pal.Y);
   const rows=[['boss','150','400'],['fly','80','160'],['bee','50','100']];
   rows.forEach(([type,a,b],i)=>{if(t<3.2+i*.5)return;const y=ty+12+i*11,spr=ArcadeGame.sprites[type][Math.floor(this.time*2)%2];this.sprite(spr,48,y+2,pal);this.text(a,60,y,pal.W);this.text('PTS',76,y,pal.W);this.text(b,94,y,pal.C);this.text('EN PICADA',112,y,pal.P);});}
  // Bottom line.
  const bottom=ArcadeGame.clean(control.bottom??'INSERT COIN').trim();
  if(t>len-2.2){if(Math.floor(this.time*6)%2)this.text('PLAYER 1  START',Math.round((W-this.textWidth('PLAYER 1  START'))/2),H-12,n=>pal[rainbow[(n+Math.floor(this.time*10))%7]],1,0,0,true);}
  else if(bottom&&Math.floor(this.time*1.6)%2)this.text(bottom,Math.round((W-this.textWidth(bottom))/2),H-12,pal.R,1,0,0,true);
  if(lines.length===1)this.sprite(ArcadeGame.sprites.ship,96+Math.sin(this.time*.9)*50,H-24,pal);
 }
 drawParty(palette,pal,control){
  const W=this.W,H=this.H,t=this.phaseT,buf=this.buf,len=control.party??9,part=Math.floor(t/(len/3))%3;
  const table=new Uint32Array(16);for(let i=0;i<16;i++){const c=ColorFlow.sample(palette,(i/16+t*.18)%1).map(v=>Math.round(Math.min(1,v*(.28+.5*(i%4)/3))*255));table[i]=(255<<24)|(c[2]<<16)|(c[1]<<8)|c[0];}
  const bayer=ArcadeGame.bayer;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
   const dx=x-96,dy=y-72,r=Math.sqrt(dx*dx+dy*dy)+.5,a=Math.atan2(dy,dx);let v;
   if(part===0)v=(Math.sin(x*.09+t*1.3)+Math.sin(y*.07-t*1.7)+Math.sin((x+y)*.05+t)+Math.sin(r*.16-t*3))*.125+.5;
   else if(part===1){const u=36/r+t*1.6,w=a/Math.PI*8+t*.4;v=((Math.floor(u*2)+Math.floor(w))&1)?.25+(.5+.5*Math.sin(u*3))*.3:.7+.25*Math.sin(w*3.14);v*=Math.min(1,r/14);}
   else{const k=Math.abs(((a/Math.PI*6+t*.5)%2+2)%2-1);v=(Math.sin(r*.22-t*4+k*6)*.5+.5)*.8+Math.sin(k*9+t)*.1+.1;}
   const level=Math.floor(Math.max(0,Math.min(.999,v))*12+bayer[(y&3)*4+(x&3)]/16);buf[y*W+x]=level<4?(level<2?0xff040106:0xff0c0412):table[(level*3+Math.floor(t*6))&15];
  }
  // Synthwave pixel sun with sliced stripes.
  const sr=24+Math.round(Math.sin(t*2)*2),sy=part===1?72:84;
  for(let y=-sr;y<=sr;y++){const yy=sy+y;if(y>0&&((yy+Math.floor(t*10))%6)<Math.min(4,1+y/6))continue;const half=Math.floor(Math.sqrt(sr*sr-y*y));const k=(y+sr)/(2*sr),sc=ColorFlow.sample(palette,(k*.45+t*.05)%1).map(v=>Math.round(Math.min(1,v*1.25)*255)),c=(255<<24)|(sc[2]<<16)|(sc[1]<<8)|sc[0];for(let x=-half;x<=half;x++)this.px(96+x,yy,c);}
  for(const s of this.stars)this.px(s.x,s.y,pal.W);
  // The ship dances a figure eight, leaving a rainbow trail.
  for(let i=12;i>=0;i--){const tt=t-i*.05,x=96+Math.sin(tt*1.7)*58,y=104+Math.sin(tt*3.4)*14;if(i)this.px(x,y+6,pal[['R','O','Y','G','C','B','P'][i%7]]);else this.sprite(ArcadeGame.sprites.ship,x,y,pal);}
  for(const q of this.parts)this.px(q.x,q.y,pal[q.c]||pal.W);
  const center=(s,y,c,scale=1,wave=0)=>this.text(s,Math.round((W-this.textWidth(s,scale))/2),y,c,scale,wave,t,true);
  const rainbow=n=>pal[['R','O','Y','G','C','B','P'][(n+Math.floor(t*12))%7]];
  center('STAGE '+this.stage,10,rainbow,3,3);center('CLEAR!',30,rainbow,3,3);
  if(t%1.2<.9)center(this.newHi?'NEW HI-SCORE '+this.hi:(this.perfect?'PERFECT ':'BONUS ')+this.bonus,128,pal.W);
 }
 snapshot(){return {g:[this.score,this.lives,this.stage,['ready','play','clear','party','over','intro'].indexOf(this.phase),this.phaseT,this.hi,this.perfect?1:0,this.bonus,this.newHi?1:0,this.flap,this.time],f:[this.form.t,this.form.sway,this.form.spread],p:[this.player.x,this.player.alive?1:0,this.player.inv],e:this.enemies.map(e=>[e.x,e.y,['bee','fly','boss'].indexOf(e.type),e.hp,['enter','form','dive','return','dead'].indexOf(e.state),e.t]),bm:[this.beam.t,this.beam.x,this.beam.charge],pb:this.pb.map(b=>[b.x,b.y]),eb:this.eb.map(b=>[b.x,b.y,b.vx,b.vy]),pa:this.parts.slice(-300).map(q=>[q.x,q.y,q.vx,q.vy,q.life,q.c,q.ring?1:0,q.text||''])};}
 restore(s){
  if(!s||!Array.isArray(s.g)||!Array.isArray(s.e))return false;
  [this.score,this.lives,this.stage]=s.g;this.phase=['ready','play','clear','party','over','intro'][s.g[3]]||'play';[this.phaseT,this.hi]=[s.g[4],s.g[5]];this.perfect=!!s.g[6];this.bonus=s.g[7];this.newHi=!!s.g[8];this.flap=s.g[9];this.time=s.g[10];
  [this.form.t,this.form.sway,this.form.spread]=s.f;this.player.x=s.p[0];this.player.alive=!!s.p[1];this.player.inv=s.p[2];
  this.enemies=s.e.map(e=>({x:e[0],y:e[1],type:['bee','fly','boss'][e[2]],hp:e[3],state:['enter','form','dive','return','dead'][e[4]],t:e[5]}));
  if(Array.isArray(s.bm))[this.beam.t,this.beam.x,this.beam.charge]=s.bm;this.pb=s.pb.map(b=>({x:b[0],y:b[1],py:b[1]}));this.eb=s.eb.map(b=>({x:b[0],y:b[1],vx:b[2],vy:b[3]}));
  this.parts=s.pa.map(q=>({x:q[0],y:q[1],vx:q[2],vy:q[3],life:q[4],c:q[5],ring:q[6]?1:0,text:q[7]||undefined}));return true;
 }
}
ArcadeGame.sprites={
 ship:['.....W.....','.....W.....','....WWW....','....WRW....','.R..WWW..R.','.R.WWWWW.R.','.WWWWBWWWW.','WWWWWBWWWWW','WW..WWW..WW'],
 life:['..W..','.WWW.','WWWWW','W.W.W'],
 bee:[['B.......B','.B.....B.','..YYYYY..','.YRYYYRY.','YYYYYYYYY','.B.Y.Y.B.','B..Y.Y..B'],['...B.B...','B..B.B..B','B.YYYYY.B','.YRYYYRY.','YYYYYYYYY','..BY.YB..','...Y.Y...']],
 fly:[['.R.....R.','RRR...RRR','RRWWWWWRR','.RWBWBWR.','..WWWWW..','.R.W.W.R.','R.......R'],['R.......R','RR.....RR','RRWWWWWRR','RRWBWBWRR','..WWWWW..','...W.W...','..R...R..']],
 boss:[['....GGG....','...GGGGG...','..GYGGGYG..','..GGGGGGG..','.PPGGGGGPP.','PPP.GGG.PPP','PP..G.G..PP','P...G.G...P'],['....GGG....','...GGGGG...','..GYGGGYG..','..GGGGGGG..','PPPGGGGGPPP','P.P.GGG.P.P','...PG.GP...','..P.G.G.P..']]
};
ArcadeGame.maxShots=6;ArcadeGame.beamTime=1.6;
ArcadeGame.bayer=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
ArcadeGame.font=(()=>{const d={'0':'111101101101111','1':'010110010010111','2':'111001111100111','3':'111001111001111','4':'101101111001001','5':'111100111001111','6':'111100111101111','7':'111001010010010','8':'111101111101111','9':'111101111001111',A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'011100101101011',H:'101101111101101',I:'111010010010111',J:'001001001101010',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'110101101101101',O:'010101101101010',P:'110101110100100',Q:'010101101110011',R:'110101110101101',S:'011100010001110',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111','-':'000000111000000','!':'010010010000010',':':'000010000010000','.':'000000000000010',' ':'000000000000000','/':'001001010100100','?':'111001011000010','+':'000010111010000','#':'101111101111101',',':'000000000010100',"'":'010010000000000','(':'010100100100010',')':'010001001001010','*':'000101010101000','_':'000000000000111','=':'000111000111000','$':'011110010011110','&':'010101010101011'};return d;})();
window.ArcadeGame=ArcadeGame;

// Pixel trip: a psychedelic pixel-art run inside the same CRT. Two cameras share one world: a side
// scroller over rolling terrain and a chase view from behind on a perspective road. The music drives
// everything: kicks set the stride, ripple the ground and launch rings of light; the spectrum raises
// an aurora; strong hits throw lightning; a drop sends the hero into flips and afterimages and can
// swing the camera around to the other view. Each world keeps a small hand-picked palette.
class PixelTrip {
 constructor(w=192,h=144){
  this.W=w;this.H=h;this.CX=w>>1;this.canvas=document.createElement('canvas');this.canvas.width=this.W;this.canvas.height=this.H;
  this.ctx=this.canvas.getContext('2d');this.image=this.ctx.createImageData(this.W,this.H);this.buf=new Uint32Array(this.image.data.buffer);
  this.tmp=new Uint32Array(this.W*this.H);this.prev=new Uint32Array(this.W*this.H);
  this.sp=new Uint32Array(PixelTrip.SW*PixelTrip.SH);this.sp2=new Uint32Array(PixelTrip.RS*PixelTrip.RS);this.bands=new Float32Array(16);
  this.seed=90210;this.time=0;this.kick=0;this.kickAge=9;this.kickCount=0;this.kickStrength=.6;this.musicSerial=null;this.sparkHigh=false;this.audio=[0,0,0,0];this.pulse=.35;this.elec=1;
  this.stars=Array.from({length:40},()=>[this.rand()*this.W,this.rand()*60,this.rand()]);
  this.clouds=Array.from({length:4},(_,i)=>({x:i*62+this.rand()*30,y:12+this.rand()*34,w:14+this.rand()*16}));
  this.reset();
 }
 rand(){this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;return this.seed/4294967296;}
 hash(n){n=Math.imul(n^0x9e3779b9,0x85ebca6b);n^=n>>>13;n=Math.imul(n,0xc2b2ae35);return ((n^(n>>>16))>>>0)/4294967296;}
 static pack(c){return ((255<<24)|(Math.round(Math.max(0,Math.min(1,c[2]))*255)<<16)|(Math.round(Math.max(0,Math.min(1,c[1]))*255)<<8)|Math.round(Math.max(0,Math.min(1,c[0]))*255))>>>0;}
 static rgb(hex){const n=parseInt(hex.slice(1),16);return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255];}
 static hue(c,h){const cs=Math.cos(h*6.2832),sn=Math.sin(h*6.2832);return [c[0]*(.299+.701*cs+.168*sn)+c[1]*(.587-.587*cs+.330*sn)+c[2]*(.114-.114*cs-.497*sn),c[0]*(.299-.299*cs-.328*sn)+c[1]*(.587+.413*cs+.035*sn)+c[2]*(.114-.114*cs+.292*sn),c[0]*(.299-.3*cs+1.25*sn)+c[1]*(.587-.588*cs-1.05*sn)+c[2]*(.114+.886*cs-.203*sn)];}
 reset(){
  this.phase='intro';this.phaseT=0;this.dist=0;this.z=0;this.speed=20;this.world=0;this.worldT=0;this.view='side';this.viewT=0;this.cam=null;this.curve=0;this.curveTarget=0;
  this.stride=0;this.beatLen=.5;this.lastKick=-9;this.gait=.5;this.hype=0;this.eFast=0;this.eSlow=0;this.dropCool=6;this.timerCount=0;
  this.runner={x:70,y:0,vy:0,rot:0,spin:0,lane:0};this.items=[];this.parts=[];this.props3d=[];this.nextProp=0;this.rings=[];this.bolts=[];this.boltFlash=0;this.flock=null;this.flockCool=5;this.boing=null;
  this.event=null;this.lastEvent='';this.eventCool=10;this.glitchCool=0;this.ripple={t:9,x:this.CX,y:72,amp:0};this.flash=0;this.shake=0;
  this.mate={mode:'none',x:this.W+40,y:0,lane:.5,z:30,vis:0};this.thread=false;
 }
 startIntro(){this.reset();}
 begin(){this.phase='run';this.phaseT=0;this.worldT=0;this.viewT=0;this.ripple={t:0,x:this.CX,y:72,amp:1};this.flash=.45;}
 pickWorld(){const n=PixelTrip.worlds.length;return (this.world+1+Math.floor(this.rand()*(n-1)))%n;}
 newWorld(i){this.world=i??this.pickWorld();this.worldT=0;this.ripple={t:0,x:this.view==='side'?this.runner.x:this.CX,y:this.view==='side'?110:120,amp:1.1};this.flash=.45;this.event=null;this.items.length=0;this.burst(this.runner.x,104,16);}
 // Camera swing: the picture yaws away, the world and the camera change at the midpoint, and it swings back in.
 spin(to,world){if(this.cam||this.phase!=='run')return false;this.cam={t:0,dur:1.3,to:to||(this.view==='side'?'behind':'side'),next:world??this.pickWorld(),dir:this.rand()<.5?-1:1,switched:false};return true;}
 // Story cues: a second hero far ahead or running alongside, and a red thread tied to the hero's hand.
 setStory(o={}){const m=this.mate;if(o.mate&&o.mate!==m.mode){if(m.mode==='none'){m.x=this.W+40;m.z=30;m.vis=0;}m.mode=o.mate;}if('thread' in o)this.thread=!!o.thread;}
 stepMate(dt){
  const m=this.mate,R=this.runner,k=1-Math.exp(-dt*(m.mode==='together'?1.6:1));
  if(this.view==='side'){const tx=m.mode==='together'?R.x+18:m.mode==='far'?this.W-22+Math.sin(this.time*.6)*6:this.W+44;m.x+=(tx-m.x)*k;m.y=m.mode==='together'?R.y:Math.max(0,m.y-dt*80);}
  else{m.lane+=((m.mode==='together'?.5:.25)-m.lane)*k;m.z+=((m.mode==='far'?10+Math.sin(this.time*.4)*2:m.mode==='together'?0:40)-m.z)*(1-Math.exp(-dt*.9));m.y=m.mode==='together'?R.y:0;}
  m.vis=m.mode==='none'?Math.max(0,m.vis-dt*.6):Math.min(1,m.vis+dt);
 }
 // Director cues for scripted videos: change world with a portal, a camera swing or a hard cut.
 goWorld(i,how='portal'){if(how==='spin')return this.spin(this.view,i);if(i===this.world)return false;if(how==='cut'){this.world=i;this.worldT=0;this.items.length=0;return true;}this.newWorld(i);return true;}
 surprise(type){
  if(this.phase!=='run')return false;
  const list=Object.keys(PixelTrip.events).filter(k=>k!==this.lastEvent&&k!=='glitch');type=type||list[Math.floor(this.rand()*list.length)];
  this.event={type,t:0,dur:PixelTrip.events[type].dur};this.lastEvent=type;return true;
 }
 burst(x,y,n){for(let i=0;i<n;i++){const a=this.rand()*Math.PI*2,s=15+this.rand()*50;this.parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-15,life:.35+this.rand()*.5,c:i%4,g:1});}this.trim();}
 dust(x,y){for(let i=0;i<5;i++)this.parts.push({x:x-4+this.rand()*8,y,vx:-15-this.rand()*30,vy:-this.rand()*14,life:.25+this.rand()*.25,c:-1,g:0});this.trim();}
 trim(){if(this.parts.length>260)this.parts.splice(0,this.parts.length-260);}
 bolt(){
  const behind=this.view==='behind',x0=16+this.rand()*160,ty=behind?PixelTrip.HZB+2:92+this.rand()*14,pts=[[x0,-2]];let x=x0,y=-2;
  while(y<ty){y+=3+this.rand()*5;x+=(this.rand()-.5)*10;pts.push([x,Math.min(y,ty)]);}
  const from=pts[1+Math.floor(this.rand()*(pts.length-2))],branch=[[from[0],from[1]]];let bx=from[0],by=from[1];const dir=this.rand()<.5?-1:1;
  for(let i=0;i<4;i++){bx+=dir*(3+this.rand()*5);by+=3+this.rand()*4;branch.push([bx,by]);}
  this.bolts.push({pts,branch,life:.34});this.boltFlash=.22;
  for(let i=0;i<6;i++)this.parts.push({x,y:ty,vx:(this.rand()-.5)*70,vy:-20-this.rand()*40,life:.3+this.rand()*.3,c:2,g:1});
 }
 drop(camMode){
  this.hype=1;for(let i=0;i<Math.round(1+this.elec*1.5);i++)this.bolt();this.burst(this.CX,60,20);
  const R=this.runner;if(this.view==='side'&&R.y<=0){R.vy=120;R.spin=1;}
  if(camMode==='auto'&&this.viewT>8&&this.rand()<.6)this.spin();
 }
 readBands(bars,bass,mid,high,dt){
  for(let i=0;i<16;i++){let v;
   if(bars&&bars.length>=96){v=0;for(let k=0;k<6;k++)v+=bars[i*6+k];v/=6;}else v=i<4?bass:i<10?mid:high;
   const b=this.bands[i];this.bands[i]=v>b?b+(v-b)*(1-Math.exp(-dt*25)):b+(v-b)*(1-Math.exp(-dt*4));}
 }
 heroKind(control){const h=control.hero??'chica';return h==='chico'?'m':h==='alternar'?(this.world%2?'m':'f'):'f';}
 step(dt,a,control){
  dt=Math.max(0,Math.min(.05,dt));this.time+=dt;this.phaseT+=dt;
  const bass=a.bass,mid=a.mid,high=a.high??0,energy=a.energy,R=this.runner,evCtl=control.events??1,camMode=control.camera??'auto',director=!!control.director;this.voice=a.voice??0;
  this.pulse=control.pulse??.35;this.elec=control.electric??1;this.audio=[bass,mid,high,energy];this.readBands(a.bars,bass,mid,high,dt);
  const newKick=a.kickSerial!==this.kick;
  if(newKick){this.kick=a.kickSerial;this.kickAge=0;this.kickCount++;this.kickStrength=a.kickStrength??.6;const iv=this.time-this.lastKick;if(iv>.25&&iv<1.3)this.beatLen+=(iv-this.beatLen)*.3;this.lastKick=this.time;}else this.kickAge+=dt;
  if(this.time-this.lastKick>2.5)this.beatLen+=(.55-this.beatLen)*(1-Math.exp(-dt));
  this.eFast+=(energy-this.eFast)*(1-Math.exp(-dt/.3));this.eSlow+=(energy-this.eSlow)*(1-Math.exp(-dt/4));
  const section=this.musicSerial!==null&&a.musicSerial!==this.musicSerial;this.musicSerial=a.musicSerial;
  for(let i=this.parts.length-1;i>=0;i--){const q=this.parts[i];q.life-=dt;if(q.life<=0){this.parts.splice(i,1);continue;}q.x+=q.vx*dt;q.y+=q.vy*dt;if(q.g)q.vy+=80*dt;}
  for(let i=this.bolts.length-1;i>=0;i--){this.bolts[i].life-=dt;if(this.bolts[i].life<=0)this.bolts.splice(i,1);}
  this.flash=Math.max(0,this.flash-dt*1.8);this.shake*=Math.exp(-dt*10);this.ripple.t+=dt;this.glitchCool-=dt;this.dropCool-=dt;this.boltFlash=Math.max(0,this.boltFlash-dt);this.hype=Math.max(0,this.hype-dt/7);
  this.gait+=(Math.min(1,energy*1.25+this.hype)-this.gait)*(1-Math.exp(-dt*2));
  this.stride+=dt/this.beatLen;if(newKick){const f=this.stride%1;this.stride+=(f>.5?1-f:-f)*.6;}
  if(this.phase==='intro'){if(newKick&&this.kickStrength>.85&&this.elec>0&&this.rand()<.3)this.bolt();if(this.phaseT>=(control.intro??8))this.begin();return;}
  this.worldT+=dt;this.viewT+=dt;
  if(this.cam){const c=this.cam;c.t+=dt;if(!c.switched&&c.t>=c.dur/2){c.switched=true;const m=this.mate;if(m.mode!=='none'){m.z=m.mode==='far'?10:0;m.x=m.mode==='far'?this.W-22:this.runner.x+18;}this.view=c.to;this.viewT=0;this.world=c.next;this.worldT=0;this.items.length=0;this.props3d.length=0;this.nextProp=this.z+1.5;this.rings.length=0;Object.assign(R,{y:0,vy:0,rot:0,spin:0,lane:0});this.event=null;}if(c.t>=c.dur)this.cam=null;}
  const ev=this.event?.type,target=(15+bass*40+energy*26+this.hype*32)*(control.speed??1)*(ev==='rainbow'?1.5:1);
  this.speed+=(target-this.speed)*(1-Math.exp(-dt*2.5));this.dist+=this.speed*dt;this.z+=this.speed*.055*dt;
  if(newKick)this.shake=(1+this.kickStrength*1.4)*this.pulse;
  if(!director&&camMode!=='auto'&&this.view!==camMode&&!this.cam)this.spin(camMode);
  if(this.eFast-this.eSlow>.15&&this.eFast>.5&&this.dropCool<=0){this.drop(director?'none':camMode);this.dropCool=12;}
  if(director){}else if(section&&!this.cam){if(camMode==='auto'&&this.viewT>14&&this.rand()<.5)this.spin();else this.newWorld();}
  else if(this.worldT>(control.world??40)&&!this.cam){this.timerCount++;if(camMode==='auto'&&this.timerCount%2===0)this.spin();else this.newWorld();}
  if(this.view==='side')this.stepSide(dt,a,newKick);else this.stepBehind(dt,a,newKick);
  this.stepMate(dt);
  if(this.voice>.3&&this.rand()<dt*5*this.voice){const side=this.view==='side',x=side?R.x+5:this.CX+R.lane*44+4,y=side?this.groundY(R.x)-R.y-26:this.H-34-R.y;this.parts.push({x,y,vx:side?-12-this.speed*.25:(this.rand()-.5)*16,vy:-16-this.rand()*10,life:1.3,c:-3,g:0});this.trim();}
  if(this.elec>0&&newKick&&this.kickStrength>.72&&energy>.5&&this.rand()<.3*this.elec)this.bolt();
  // Surprise events, paced by the music's energy and kept rare.
  if(this.event){this.event.t+=dt;if(this.event.t>=this.event.dur)this.event=null;}
  this.eventCool-=dt*evCtl*(.5+energy);
  if(evCtl>0&&!this.event&&this.eventCool<=0&&newKick){this.surprise();this.eventCool=this.event.dur+8+this.rand()*10;}
  if(evCtl>0&&newKick&&this.kickStrength>.95&&this.glitchCool<=0&&!this.event&&this.rand()<.2){this.event={type:'glitch',t:0,dur:PixelTrip.events.glitch.dur};this.glitchCool=15;}
  if((ev==='rainbow'||this.hype>.5)&&this.view==='side'&&this.rand()<dt*14)this.parts.push({x:this.W,y:12+this.rand()*80,vx:-220-this.rand()*100,vy:0,life:1,c:-2,g:0});
 }
 groundY(sx){const xw=sx+this.dist,d=Math.abs(sx-this.runner.x)-this.kickAge*190,A=5*this.elec*this.kickStrength*Math.exp(-this.kickAge*3.5);return 110+5*Math.sin(xw*.017)+3*Math.sin(xw*.041+1.7)-A*Math.exp(-d*d/50);}
 sideProp(k){const h=this.hash(k*7+this.world*131);if(h<.3)return null;const sp=PixelTrip.PROP;return {k,x:k*sp-this.dist+(h-.5)*30,s:.75+this.hash(k*13+5)*.5,type:PixelTrip.worlds[this.world].prop};}
 stepSide(dt,a,newKick){
  const R=this.runner,ks=this.kickStrength;
  const tx=(60+this.gait*28+this.hype*16+Math.sin(this.time*.37)*8)*this.W/192;R.x+=(tx-R.x)*(1-Math.exp(-dt*1.2));
  if(newKick&&R.y<=0&&(ks>.82||this.kickCount%8===0&&ks>.45)){R.vy=78+ks*50;if((this.gait>.7||this.hype>.3)&&this.rand()<.45*this.elec)R.spin=1;}
  if(R.y>0||R.vy>0){
   const prevY=R.y;R.vy-=320*dt;R.y+=R.vy*dt;
   // Mushroom caps and flowers are springboards.
   if(R.vy<0){const k0=Math.floor((R.x+this.dist-40)/PixelTrip.PROP);for(let k=k0;k<k0+3;k++){const p=this.sideProp(k);if(!p||(p.type!=='mush'&&p.type!=='flower'))continue;const top=p.type==='mush'?(12+8)*p.s:(20+5)*p.s;if(Math.abs(p.x-R.x)<9*p.s&&prevY>=top&&R.y<top){R.y=top;R.vy=118;this.boing={k,t:0};this.burst(R.x,this.groundY(R.x)-top,10);R.spin=this.elec>0&&this.rand()<.5?1:R.spin;break;}}}
   if(R.y<=0){R.y=0;R.vy=0;R.spin=0;R.rot=0;this.dust(R.x,this.groundY(R.x));}
  }
  if(R.spin){R.rot+=dt*Math.PI*2/.55;if(R.rot>=Math.PI*2){R.rot=0;R.spin=0;}}
  if(this.boing){this.boing.t+=dt;if(this.boing.t>.4)this.boing=null;}
  if(a.spark>.42&&!this.sparkHigh&&this.items.length<5&&this.rand()<.7)this.items.push({x:this.W+6,y:70+this.rand()*28,k:Math.floor(this.rand()*3)});
  this.sparkHigh=a.spark>(this.sparkHigh?.3:.42);
  const ry=this.groundY(R.x)-14-R.y;
  for(let i=this.items.length-1;i>=0;i--){const it=this.items[i];it.x-=this.speed*dt;if(it.x<-8){this.items.splice(i,1);continue;}if(Math.abs(it.x-R.x)<9&&Math.abs(it.y-ry)<15){this.items.splice(i,1);this.burst(it.x,it.y,8);}}
  this.flockCool-=dt;if(!this.flock&&this.flockCool<=0){this.flock={x:this.W+10,y:16+this.rand()*30,t:0};this.flockCool=10+this.rand()*12;}
  if(this.flock){this.flock.t+=dt;this.flock.x-=(18+this.speed*.3)*dt;if(this.flock.x<-50)this.flock=null;}
 }
 stepBehind(dt,a,newKick){
  const R=this.runner,ks=this.kickStrength;
  if(newKick&&this.kickCount%16===0)this.curveTarget=(this.rand()-.5)*2.4;
  this.curve+=(this.curveTarget+Math.sin(this.time*.7)*this.audio[1]*.6-this.curve)*(1-Math.exp(-dt*.7));
  while(this.nextProp<this.z+34){this.props3d.push({z:this.nextProp,X:(this.rand()<.5?-1:1)*(2.1+this.rand()*2.4),k:Math.floor(this.rand()*1e6),s:.8+this.rand()*.5});this.nextProp+=1.4+this.rand()*1.6;}
  for(let i=this.props3d.length-1;i>=0;i--)if(this.props3d[i].z-this.z<.45)this.props3d.splice(i,1);
  if(newKick)this.rings.push({z:this.z+30,c:this.kickCount&1,s:ks});
  for(let i=this.rings.length-1;i>=0;i--)if(this.rings[i].z-this.z<.3)this.rings.splice(i,1);
  if(a.spark>.42&&!this.sparkHigh&&this.items.length<4&&this.rand()<.7)this.items.push({z:this.z+28,X:[-.55,0,.55][Math.floor(this.rand()*3)],k:Math.floor(this.rand()*3)});
  this.sparkHigh=a.spark>(this.sparkHigh?.3:.42);
  let goal=this.mate.mode==='together'?-.3:Math.sin(this.time*.5)*.35;for(const it of this.items){const rz=it.z-this.z;if(rz<12){goal=it.X;break;}}
  R.lane+=(goal-R.lane)*(1-Math.exp(-dt*3));
  for(let i=this.items.length-1;i>=0;i--){const it=this.items[i],rz=it.z-this.z;if(rz<1.1){if(Math.abs(it.X-R.lane)<.35)this.burst(this.CX+R.lane*44,110,10);this.items.splice(i,1);}}
  if(newKick&&R.y<=0&&ks>.85)R.vy=70+ks*40;
  if(R.y>0||R.vy>0){R.vy-=300*dt;R.y+=R.vy*dt;if(R.y<=0){R.y=0;R.vy=0;}}
 }
 coast(dt){dt=Math.max(0,Math.min(.05,dt));this.time+=dt;this.phaseT+=dt;this.kickAge+=dt;this.ripple.t+=dt;this.stride+=dt/this.beatLen;if(this.cam)this.cam.t+=dt;if(this.phase==='run'){this.dist+=this.speed*dt;this.z+=this.speed*.055*dt;}for(const q of this.parts){q.x+=q.vx*dt;q.y+=q.vy*dt;}}
 // ───── Color ─────
 colors(palette,theme,sat){
  const w=PixelTrip.worlds[this.world],h=theme==='acid'?this.time*.04+this.audio[0]*.03:0,tint=theme==='palette'?ColorFlow.sample(palette,(this.time*.02)%1):null;
  const conv=hex=>{let c=PixelTrip.rgb(hex);if(h)c=PixelTrip.hue(c,h);if(tint){const l=c[0]*.3+c[1]*.59+c[2]*.11;c=c.map((v,i)=>v*.35+tint[i]*l*1.1);}const g=c[0]*.3+c[1]*.59+c[2]*.11;return PixelTrip.pack(c.map(v=>g+(v-g)*sat));};
  const fixed=hex=>{const c=PixelTrip.rgb(hex),g=c[0]*.3+c[1]*.59+c[2]*.11;return PixelTrip.pack(c.map(v=>g+(v-g)*sat));};
  const hero=k=>Object.fromEntries(Object.entries(PixelTrip.hero[k]).map(([n,v])=>[n,fixed(v)]));
  this.C={sky:w.sky.map(conv),sun:w.sun.map(conv),far:conv(w.far),near:conv(w.near),ground:w.ground.map(conv),pc:w.pc.map(conv),hero:{m:hero('m'),f:hero('f')},ink:fixed('#1b0f24'),fx:PixelTrip.fx.map(fixed),whale:PixelTrip.whale.map(conv),thread:fixed('#ff2440'),threadGlow:fixed('#ff8a9a')};
 }
 ramp(arr,f,x,y){const i=Math.floor(f+PixelTrip.dither[(x&3)|((y&3)<<2)]);return arr[i<0?0:i>=arr.length?arr.length-1:i];}
 draw(palette,control={},saturation=1){
  this.pulse=control.pulse??.35;this.elec=control.electric??1;this.reduce=!!control.reduce;
  const ev=this.event?.type;this.colors(palette,control.theme??'world',saturation);
  if(this.phase==='intro')this.drawIntro(control);
  else{
   const kind=this.heroKind(control);
   if(this.view==='side')this.drawSide(control,ev,kind);else this.drawBehind(control,ev,kind);
   this.post(ev);
   if(this.cam)this.swing();
  }
  this.ctx.putImageData(this.image,0,0);
 }
 drawSide(control,ev,kind){
  this.drawSky(control,ev,120,46);this.drawAurora(98);
  if(ev==='whale')this.drawWhale();
  if(ev!=='tunnel')this.drawSun(ev==='sun',Math.round(PixelTrip.worlds[this.world].sunX*this.W/192),64,17);
  this.drawClouds(1);if(ev==='eye')this.drawEye();this.drawFlock();
  if(PixelTrip.worlds[this.world].skyline)this.drawSkyline();else this.drawHills();this.drawBolts();this.drawGroundSide();this.drawPropsSide();
  if(ev==='rain')this.drawRain();if(PixelTrip.worlds[this.world].rain)this.drawRainLines();
  this.drawItemsSide();this.drawMateSide(kind);this.drawRunnerSide(kind,ev);this.drawThread();this.drawParts();this.drawTufts();
 }
 drawBehind(control,ev,kind){
  const HZ=PixelTrip.HZB;
  this.drawSky(control,ev,HZ+1,HZ*.55);this.drawAurora(HZ-4);
  if(ev==='whale')this.drawWhale();
  if(ev!=='tunnel')this.drawSun(ev==='sun',Math.round(this.CX-this.curve*22),HZ-6,20);
  this.drawClouds(.6);if(ev==='eye')this.drawEye();
  this.drawHorizon();this.drawBolts();this.drawGroundBehind();this.drawRings(true);this.drawProps3d();this.drawRings(false);this.drawItemsBehind();
  if(ev==='rain')this.drawRain();if(PixelTrip.worlds[this.world].rain)this.drawRainLines();
  if(this.hype>.3||ev==='rainbow')this.drawWarpLines();
  this.drawMateBack(kind);this.drawRunnerBack(kind,ev);this.drawThread();this.drawParts();
 }
 // ───── Sky: dithered gradient bent by slow liquid patterns ─────
 drawSky(control,ev,HZ,cy){
  const W=this.W,CX=this.CX,buf=this.buf,t=this.time,sky=this.C.sky,mid=this.audio[1],warp=(control.warp??1)*(1+this.hype*.8),world=PixelTrip.worlds[this.world];
  const calm=world.calm?.5:1,amp=warp*(1.2+mid*6)*calm,lift=Math.exp(-this.kickAge*6)*.35*this.pulse+(this.reduce?0:this.boltFlash*4),str=(.3+.4*warp*(.3+mid))*(1+this.audio[3]*.4)*(world.calm?.6:1),pat=ev==='tunnel'?6:world.pattern,scroll=this.dist*.04,span=Math.min(HZ,104);
  for(let y=0;y<HZ;y++){
   const flip=(pat&1)&&(y&1)?-1:1,ox=amp*Math.sin(y*.12+t*2.1)*flip,Y=y+warp*1.5*Math.sin(t*1.3+y*.04),base=y/span*4.4-.3+lift;
   for(let x=0;x<W;x++){
    const xs=x+ox,X=xs+scroll;let p;
    switch(pat){
     case 0:{const dx=xs-CX,dy=Y-cy;p=Math.sin(Math.sqrt(dx*dx+dy*dy)*.16-t*1.4);break;}
     case 1:p=Math.sin(X*.055+Math.sin(Y*.09+t)*1.6-t);break;
     case 2:p=Math.sin(X*.07+t*.8)*Math.sin(Y*.11-t*.6)*1.3;break;
     case 3:p=(Math.sin(X*.045+t)+Math.sin(Y*.065-t*1.2)+Math.sin((X+Y)*.035+t*.6))*.45;break;
     case 4:{const dx=xs-CX,dy=Y-cy;p=Math.sin(Math.atan2(dy,dx)*3+Math.sqrt(dx*dx+dy*dy)*.1-t*1.1);break;}
     case 5:p=Math.sin((Math.abs(xs-CX)+Math.abs(Y-cy))*.1-t*1.2);break;
     default:{const dx=xs-CX,dy=Y-cy,r=Math.sqrt(dx*dx+dy*dy),dep=Math.floor(60/(r+3)+t*2.5),seg=Math.floor(Math.atan2(dy,dx)*1.91+t);buf[y*W+x]=this.ramp(sky,(((dep+seg)&1)?3.4:1.6)*Math.min(1,r/34),x,y);continue;}
    }
    buf[y*W+x]=this.ramp(sky,base+p*str,x,y);
   }
  }
  if(world.stars&&ev!=='tunnel')for(const s of this.stars){if(s[1]>HZ-8)continue;const tw=Math.sin(t*2+s[2]*50)+this.audio[2]*.6;if(tw>.3)this.px(s[0],s[1],tw>.85?0xffffffff:sky[4]);}
 }
 // Aurora curtains: each column follows a band of the spectrum, mirrored around the center.
 drawAurora(baseY){
  const calm=PixelTrip.worlds[this.world].calm,W=this.W,C=this.C,cols=this.W>>2,amt=(.55+this.elec*.45)*(1+(this.voice||0)*.5)*(calm?.45:1),off=this.dist*.03+this.time*2;
  for(let i=0;i<cols;i++){const b=this.bands[Math.min(15,Math.floor(Math.abs(i-cols/2+.5)/(cols/2)*16))],h=Math.round((4+b*46*amt)*(1+this.hype*.4));
   const x0=Math.round(((i*4-off)%W+W)%W),col=calm?C.sky[4]:(i>>2)&1?C.pc[5]:C.sun[1];
   for(let y=baseY-h;y<=baseY;y++){const f=(baseY-y)/h;for(let k=0;k<4;k++){const x=(x0+k)%W;if(PixelTrip.dither[(x&3)|((y&3)<<2)]>f*.95+.15)this.px(x,y,f<.25?C.sky[4]:col);}}}
 }
 drawSun(face,cx,cy0,r0){
  if(PixelTrip.worlds[this.world].disco){this.drawDisco(cx,Math.min(cy0-8,this.view==='side'?32:cy0-8),Math.round(r0*.8));return;}
  const w=PixelTrip.worlds[this.world],C=this.C,e=this.event,rise=face?Math.min(1,e.t/1.2,(e.dur-e.t)/1.2):0,cy=Math.round(cy0-rise*20),r=Math.round(r0+this.audio[0]*3*(.4+this.elec*.6)+rise*3),t=this.time,halo=6+this.audio[3]*5+this.hype*4;
  for(let y=cy-r-halo;y<=cy+r+halo;y++)for(let x=cx-r-halo;x<=cx+r+halo;x++){
   const d=Math.hypot(x-cx,y-cy);
   if(d>r+.5){if(d<r+halo&&PixelTrip.dither[(x&3)|((y&3)<<2)]<(1-(d-r)/halo)*.55)this.px(x,y,C.sky[4]);continue;}
   if(w.stripes&&y>cy){const k=(y-cy)/r;if(((y+Math.floor(t*5))%6)<k*3.2)continue;}
   let c=this.ramp(C.sun,(y-cy+r)/(2*r)*2.6,x,y);
   if(w.moon&&(Math.hypot(x-cx+6,y-cy+3)<4||Math.hypot(x-cx-5,y-cy-6)<2.6))c=C.sun[2];
   this.px(x,y,c);
  }
  if(face){
   for(let i=0;i<12;i++){const a=t*.6+i*Math.PI/6;for(let k=r+3;k<r+9+this.audio[0]*6;k++)if(((k+i)&1)===0)this.px(cx+Math.cos(a)*k,cy+Math.sin(a)*k,C.sun[1]);}
   const ink=C.ink,blink=this.kickAge<.09;
   for(const sx of [-6,5]){if(blink)this.rect(cx+sx-1,cy-3,3,1,ink);else this.rect(cx+sx,cy-5,2,4,ink);}
   for(let x=-7;x<=7;x++){const y=Math.round(Math.sqrt(Math.max(0,49-x*x))*.55);this.px(cx+x,cy+3+y,ink);if(Math.abs(x)<6)this.px(cx+x,cy+2+y,ink);}
   this.rect(cx-11,cy+1,3,2,C.pc[3]);this.rect(cx+9,cy+1,3,2,C.pc[3]);
  }
 }
 drawClouds(scale){
  const C=this.C,W=this.W,lift=Math.exp(-this.kickAge*8)*this.elec;
  for(const c of this.clouds){const x=((c.x-this.dist*.12-this.time*3)%(W+70)+W+70)%(W+70)-35,y=Math.round(c.y*scale-lift),w=c.w;
   for(const [ox,oy,r]of [[0,0,w*.5],[-w*.38,2,w*.32],[w*.4,2,w*.3]])for(let j=-Math.ceil(r*.6);j<=2;j++)for(let i=-Math.ceil(r);i<=Math.ceil(r);i++){const dx=i/r,dy=j/(r*.6);if(dx*dx+dy*dy>1)continue;const px=Math.round(x+ox+i),py=y+oy+j;if(py>y+2)continue;this.px(px,py,py<y+oy-r*.25?C.sky[4]:(PixelTrip.dither[(px&3)|((py&3)<<2)]<.5?C.sky[3]:C.sky[4]));}
  }
 }
 drawFlock(){if(!this.flock)return;const f=this.flock,o=this.C.near,flap=this.kickAge<.15||Math.floor(this.time*6)%2;for(let i=0;i<5;i++){const x=Math.round(f.x+Math.abs(i-2)*7+i*2),y=Math.round(f.y+Math.abs(i-2)*4+Math.sin(f.t*3+i)*1.5);if(flap){this.px(x-2,y-1,o);this.px(x-1,y,o);this.px(x,y,o);this.px(x+1,y,o);this.px(x+2,y-1,o);}else{this.px(x-2,y+1,o);this.px(x-1,y,o);this.px(x,y,o);this.px(x+1,y,o);this.px(x+2,y+1,o);}}}
 drawHills(){
  const W=this.W,buf=this.buf,C=this.C,d=this.dist,base=120,b=Math.exp(-this.kickAge*5)*this.elec*1.5;
  for(let x=0;x<W;x++){
   const xf=x+d*.1,top=Math.round(98-(18+8*Math.sin(xf*.021)+5*Math.sin(xf*.047+1.3)+2.5*Math.sin(xf*.13))-b*this.bands[Math.min(15,Math.floor(x*16/W))]*4);
   for(let y=Math.max(0,top);y<base;y++)buf[y*W+x]=y===top?C.sky[3]:(y===top+1&&(x&1))?C.sky[2]:C.far;
   const xn=x+d*.28,topN=Math.round(104-(8+6*Math.sin(xn*.031+2)+3*Math.sin(xn*.077)+1.5*Math.sin(xn*.19)));
   for(let y=Math.max(0,topN);y<base;y++)buf[y*W+x]=y===topN?C.far:C.near;
  }
 }
 drawHorizon(){
  const W=this.W,buf=this.buf,C=this.C,HZ=PixelTrip.HZB,sh=this.curve*30;
  const city=PixelTrip.worlds[this.world].skyline;
  for(let x=0;x<W;x++){const xf=x+sh,bi=Math.floor(xf/7),top=Math.round(city?HZ-(3+this.hash(bi*7)*15):HZ-(5+4*Math.sin(xf*.045)+2*Math.sin(xf*.12+1)));for(let y=Math.max(0,top);y<=HZ;y++)buf[y*W+x]=y===top?C.sky[3]:city&&(Math.floor(xf)%3===1)&&(y%3===1)&&this.hash(bi*31+y)<.3?C.pc[4]:C.far;}
 }
 line(x0,y0,x1,y1,c){const n=Math.max(1,Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0))));for(let i=0;i<=n;i++)this.px(x0+(x1-x0)*i/n,y0+(y1-y0)*i/n,c);}
 drawBolts(){
  const C=this.C;
  for(const b of this.bolts){if(b.life<.3&&Math.floor(b.life*30)%4===3)continue;
   for(const [pts,core,glow]of [[b.branch,C.fx[7],0],[b.pts,0xffffffff,C.fx[4]]])for(let i=1;i<pts.length;i++){const [x0,y0]=pts[i-1],[x1,y1]=pts[i];if(glow){this.line(x0-1,y0,x1-1,y1,glow);this.line(x0+1,y0,x1+1,y1,glow);}this.line(x0,y0,x1,y1,core);}}
 }
 // ───── Shapes ─────
 rect(x,y,w,h,c){x=Math.round(x);y=Math.round(y);for(let j=Math.max(0,y);j<Math.min(this.H,y+h);j++)for(let i=Math.max(0,x);i<Math.min(this.W,x+w);i++)this.buf[j*this.W+i]=c;}
 // Lit from the upper left, quantized to the given tones with ordered dithering; 1px outline.
 orb(cx,cy,rx,ry,tones,outline,clip=null){
  for(let y=Math.floor(cy-ry-1);y<=Math.ceil(cy+ry+1);y++)for(let x=Math.floor(cx-rx-1);x<=Math.ceil(cx+rx+1);x++){
   if(clip&&!clip(x,y))continue;const dx=(x-cx)/rx,dy=(y-cy)/ry,d=dx*dx+dy*dy;
   if(d>1){const ox=(x-cx)/(rx+1),oy=(y-cy)/(ry+1);if(ox*ox+oy*oy<=1&&outline)this.px(x,y,outline);continue;}
   const l=Math.max(0,Math.min(1,-.5*dx-.62*dy+.6*Math.sqrt(1-d)+.15));this.px(x,y,this.ramp(tones,l*(tones.length-.01),x,y));
  }
 }
 bounceOf(k){const b=Math.exp(-this.kickAge*7)*this.elec*.9;return this.boing&&this.boing.k===k?b+Math.sin(this.boing.t*25)*Math.exp(-this.boing.t*6)*1.2:b;}
 drawPropsSide(){const k0=Math.floor((this.dist-60)/PixelTrip.PROP);let prev=null;for(let k=k0-1;k<k0+7;k++){const p=this.sideProp(k);if(!p)continue;const x=Math.round(p.x),base=Math.round(this.groundY(Math.max(0,Math.min(this.W-1,x))))+1;
  if(p.type==='pole'){const tips=this.poleTips(x,base,p.s);if(prev)tips.forEach((t,i)=>this.cable(prev[i],t,i===1?this.C.thread:this.C.pc[0],7+i*2));prev=tips;}
  if(p.x<-40||p.x>this.W+40)continue;this[p.type](x,base,p.s,k,this.bounceOf(k));}}
 drawProps3d(){
  const type=PixelTrip.worlds[this.world].prop,HZ=PixelTrip.HZB,list=this.props3d.slice().sort((a,b)=>b.z-a.z),last={};
  for(const p of list){const Z=p.z-this.z;if(Z<.45||Z>34)continue;const cz=this.curve*Z*Z*.02,x=Math.round(this.CX+(p.X-cz)*64/Z),y=Math.round(HZ+PixelTrip.CAMH/Z),s=1.7/Z*p.s;
   if(type==='pole'){const side=p.X<0?0:1,tips=this.poleTips(x,y,s);if(last[side])tips.forEach((t,i)=>this.cable(last[side][i],t,i===1?this.C.thread:this.C.pc[0],2+s*3));last[side]=tips;}
   if(x<-60||x>this.W+60)continue;if(s<.22){this.px(x,y-1,this.C.pc[2]);this.px(x,y-2,this.C.pc[3]);continue;}this[type](x,y,s,p.k,Math.exp(-this.kickAge*7)*this.elec*.9);}
 }
 mush(x,base,s,k,b){
  const pc=this.C.pc,sh=Math.max(2,Math.round(12*s*(1-b*.2))),top=base-sh,rx=11*s*(1+b*.15),ry=8*s*(1-b*.2),sw=Math.max(1,Math.round(3*s));
  for(let j=top;j<=base;j++)for(let i=-sw;i<=sw;i++)this.px(x+i,j,Math.abs(i)===sw?pc[0]:i>=1?pc[6]:pc[5]);
  this.orb(x,top+1,rx,ry,[pc[1],pc[2],pc[3]],pc[0],(px,py)=>py<=top+1);
  this.rect(x-rx+2,top+2,rx*2-3,1,pc[0]);this.rect(x-rx+3,top+1,rx*2-5,1,pc[1]);
  if(s>.5)for(let i=0;i<4;i++){const a=this.hash(k*31+i),sx=x+(a-.5)*rx*1.3,sy=top-1-this.hash(k*17+i)*ry*.7,r=(1+(i&1))*s;this.orb(sx,sy,r,r*.8,[pc[3],pc[4]],null);}
 }
 eye(x,base,s,k,b){
  const pc=this.C.pc,ph=Math.round(22*s*(1+b*.15)),w=Math.max(1,Math.round(3*s)),tone=[pc[0],pc[3],pc[3],pc[2],pc[2],pc[1],pc[0]];
  for(let j=0;j<ph;j++)for(let i=-w;i<=w;i++)this.px(x+i,base-j,Math.abs(i)===w?pc[0]:j%6===5?pc[1]:tone[Math.round((i+w)/(2*w)*6)]);
  this.eyeball(x,base-ph-5*s,7*s,5.5*s,this.kickAge<.08);
 }
 eyeball(x,y,rx,ry,closed,tones=null,iris=null,lid=null){
  const pc=this.C.pc,ink=this.C.ink;
  this.orb(x,y,rx,ry,tones||[pc[3],pc[4],0xffffffff],ink);
  if(closed){this.orb(x,y,rx,ry,lid||[pc[1],pc[2]],ink);this.rect(x-rx+1,y,rx*2-1,1,ink);return;}
  const rx0=this.view==='side'?this.runner.x:this.CX,tx=rx0-x,ty=110-y,n=Math.hypot(tx,ty)||1,ix=x+tx/n*rx*.3,iy=y+ty/n*ry*.25,ir=Math.max(1.2,ry*.62);
  this.orb(ix,iy,ir,ir,iris||[pc[5],pc[5]],ink);this.orb(ix,iy,ir*.45,ir*.45,[ink],null);this.px(ix-ir*.4,iy-ir*.4,0xffffffff);
 }
 pyramid(x,base,s,k,b){
  const pc=this.C.pc,ph=Math.round(22*s*(1+b*.12)),t=this.time;
  for(let r=0;r<=ph;r++){const y=base-ph+r;for(let i=-r;i<=r;i++){let c=i<0?pc[3]:pc[2];if(r%5===4&&Math.abs(i)<r)c=i<0?pc[2]:pc[1];if(Math.abs(i)===r)c=pc[0];if(r===0)c=pc[4];this.px(x+i,y,c);}}
  if(s>.5){const ey=base-Math.round(ph*.45),glow=Math.exp(-this.kickAge*4);this.orb(x-3*s,ey,3*s,1.8*s,[pc[6],pc[5]],pc[0]);this.px(x-3*s,ey,glow>.5?0xffffffff:pc[0]);}
  if((t*3|0)%7===0)this.px(x-1,base-ph+1,0xffffffff);
 }
 tower(x,base,s,k,b){
  const pc=this.C.pc,w=Math.max(3,Math.round(14*s)),th=Math.round((34+this.hash(k*3)*26)*s*(1+b*.08)),x0=x-(w>>1),t=this.time,e=this.audio[3],band=this.bands[k&15];
  this.rect(x0-1,base-th-1,w+2,th+2,pc[0]);this.rect(x0,base-th,w,th,pc[2]);this.rect(x0,base-th,Math.max(1,2*s),th,pc[3]);this.rect(x0+w-2,base-th,Math.max(1,2*s),th,pc[1]);
  if(s>.45)for(let j=4;j<th-3;j+=4)for(let i=3;i<w-3;i+=3)if(this.hash(k*977+j*31+i+Math.floor(t*.7))<.15+e*.3+band*.4)this.rect(x0+i,base-th+j,2,2,this.hash(k+i*7+j)<.5?pc[5]:pc[6]);
  this.rect(x0+1,base-th+2,w-2,1,pc[5]);
  this.rect(x,base-th-7*s,1,6*s,pc[3]);this.px(x,base-th-8*s,(t*2|0)&1?0xff4040ff:pc[1]);
 }
 crystal(x,base,s,k,b){
  const pc=this.C.pc,glow=.3+this.audio[2]*.7+b*.4;
  const shard=(cx,w,h)=>{const top=base-h;for(let y=top;y<=base;y++){const ww=Math.min(w,Math.round((y-top)*1.1));for(let i=-ww;i<=ww;i++){let c=i<0?pc[3]:pc[2];if(i===0)c=pc[4];if(Math.abs(i)===ww)c=pc[0];else if(Math.abs(i)<ww*.5&&y>top+h*.35&&PixelTrip.dither[((cx+i)&3)|((y&3)<<2)]<glow*.45)c=pc[5];this.px(cx+i,y,c);}}};
  shard(Math.round(x-7*s),Math.max(1,Math.round(3*s)),Math.round(14*s*(1+b*.2)));shard(Math.round(x+7*s),Math.max(1,Math.round(3*s)),Math.round(11*s*(1+b*.25)));shard(x,Math.max(1,Math.round(5*s)),Math.round(26*s*(1+b*.15)));
 }
 flower(x,base,s,k,b){
  const pc=this.C.pc,sh=Math.round(20*s*(1-b*.15)),cy=base-sh,a0=this.time*.6+this.audio[0]*.8,pr=5.5*s*(1+b*.25);
  for(let j=cy;j<=base;j++){this.px(x,j,pc[1]);this.px(x+1,j,pc[0]);}
  if(s>.5)this.orb(x-4*s,base-sh*.45,3*s,1.6*s,[pc[1],pc[6]],pc[0]);
  for(let i=0;i<6;i++){const a=a0+i*Math.PI/3;this.orb(x+Math.cos(a)*pr,cy+Math.sin(a)*pr,3*s,3*s,[pc[2],pc[3]],pc[0]);}
  this.orb(x,cy,3*s,3*s,[pc[5],pc[4]],pc[0]);
 }

 // City worlds: two layers of buildings; the far one has windows that follow the energy and flash on kicks.
 drawSkyline(){
  const W=this.W,buf=this.buf,C=this.C,d=this.dist,e=this.audio[3],lit=this.kickAge<.12;
  for(const [sp,baseY,hmax,col,rim,wins]of [[.08,98,44,C.far,C.sky[3],true],[.22,106,24,C.near,C.far,false]])
   for(let x=0;x<W;x++){const xw=x+d*sp,bi=Math.floor(xw/13),f=xw/13-bi;if(f>.55+this.hash(bi*13+(wins?3:5))*.45)continue;const top=Math.round(baseY-8-this.hash(bi*7+(wins?1:2))*hmax);
    for(let y=Math.max(0,top);y<120;y++){let c=y===top?rim:col;if(wins&&y>top+2&&Math.floor(xw)%3===1&&y%4===2&&this.hash(bi*131+y*7+Math.floor(xw/3)*17+Math.floor(this.time*.5))<.2+e*.3)c=lit?C.pc[6]:C.pc[4];buf[y*W+x]=c;}}
 }
 // A mirror ball: rotating facets, sweeping spotlights and reflections that crawl over the sky.
 drawDisco(cx,cy,r){
  const C=this.C,pc=C.pc,t=this.time,beams=[pc[5],pc[6],C.sky[4],pc[4],pc[5]];
  for(let i=0;i<5;i++){const a=Math.PI*.5+Math.sin(t*.6+i*1.3)*1.15,len=150,col=beams[i],amt=.2*(.5+this.audio[3]+(this.kickAge<.15?.4:0));
   for(let st=r+2;st<len;st++){const x=cx+Math.cos(a)*st,y=cy+Math.sin(a)*st,w=st*.06;for(let k=-w;k<=w;k++){const px=x-Math.sin(a)*k,py=y+Math.cos(a)*k;if(PixelTrip.dither[((px|0)&3)|(((py|0)&3)<<2)]<amt*(1-st/len))this.px(px,py,col);}}}
  this.rect(cx,0,1,Math.max(0,cy-r),C.sky[3]);
  for(let y=-r-1;y<=r+1;y++)for(let x=-r-1;x<=r+1;x++){const d=(x*x+y*y)/(r*r);if(d>1){if((x*x+y*y)<=(r+1)*(r+1))this.px(cx+x,cy+y,C.ink);continue;}
   const fx=Math.floor((x+t*6)/3),fy=Math.floor((y+r)/3),h=this.hash(fx*31+fy*7+Math.floor(t*8));let c=(fx+fy)&1?C.sun[1]:C.sun[2];if(-.5*x/r-.6*y/r>.25)c=C.sun[0];if(h<.08+this.audio[2]*.25)c=0xffffffff;this.px(cx+x,cy+y,c);}
  for(let i=0;i<36;i++){const a=this.hash(i)*6.283+t*.35,rr=18+this.hash(i+50)*130,x=cx+Math.cos(a)*rr*1.4,y=cy+Math.sin(a)*rr*.55;const c=[pc[5],pc[6],0xffffffff][i%3];this.px(x,y,c);if(this.kickAge<.15){this.px(x+1,y,c);this.px(x,y+1,c);}}
 }
 drawRainLines(){const t=this.time,c=this.C.sky[4],H=this.H,W=this.W;for(let i=0;i<70;i++){const sp=150+this.hash(i)*60,y=(this.hash(i+7)*H+t*sp)%(H+12)-6,x=((this.hash(i+3)*W*1.3-y*.35-this.dist*.5)%W+W)%W;for(let k=0;k<4;k++)if(PixelTrip.dither[(((x-k*.35)|0)&3)|((((y+k)|0)&3)<<2)]<.75)this.px(x-k*.35,y+k,c);}}
 lamp(x,base,s,k,b){
  const pc=this.C.pc,h=Math.round(32*s),top=base-h,hx=x+Math.round(5*s),glow=.45+b*.4+this.audio[0]*.25;
  for(let y=top+3;y<=base;y++){const w=(y-top-3)*.42;for(let i=-w;i<=w;i++)if(PixelTrip.dither[((hx+i)&3)|((y&3)<<2)]<glow*.4*(1-(y-top)/(h*1.4)))this.px(hx+i,y,pc[4]);}
  this.rect(x-1,top,3,h+1,pc[0]);this.rect(x,top,1,h,pc[2]);this.rect(x-1,top-1,Math.round(7*s)+1,2,pc[0]);this.rect(x,top-1,Math.round(6*s),1,pc[3]);
  this.rect(hx-2,top+1,5,2,pc[1]);this.rect(hx-1,top+3,3,1,pc[4]);
  for(let j=top+8;j<base-4;j+=9)this.px(x,j,b>.3?pc[6]:pc[5]);
 }
 speaker(x,base,s,k,b){
  const pc=this.C.pc,pump=Math.exp(-this.kickAge*9)*(.5+this.elec*.5),w=Math.max(4,Math.round(14*s)),stack=this.hash(k*5)>.4?2:1;
  for(let n=0;n<stack;n++){const h=Math.max(5,Math.round((n?16:22)*s)),cw=n?w-2:w,x0=x-(cw>>1),y0=base-h-(n?Math.round(22*s):0);
   this.rect(x0-1,y0-1,cw+2,h+2,pc[0]);this.rect(x0,y0,cw,h,pc[2]);this.rect(x0,y0,1,h,pc[3]);this.rect(x0+cw-1,y0,1,h,pc[1]);
   if(s>.35){const r1=Math.max(1,2.4*s),r2=Math.max(1.5,(n?3.5:4.6)*s*(1+pump*.22));this.orb(x,y0+h*.28,r1,r1,[pc[1],pc[3]],pc[0]);this.orb(x,y0+h*.68,r2,r2,[pc[1],pc[2],pc[3]],pc[0]);this.px(x,y0+h*.68,pump>.5?pc[6]:pc[4]);if(pump>.6)this.rect(x0+1,y0+h-2,cw-2,1,pc[5]);}}
 }
 pole(x,base,s,k,b){const pc=this.C.pc,h=Math.round(46*s),top=base-h,a=Math.max(3,Math.round(7*s));this.rect(x-1,top,3,h+1,pc[1]);this.rect(x-1,top,1,h,pc[2]);this.rect(x-a,top+3,a*2+1,2,pc[1]);this.px(x-a,top+2,pc[4]);this.px(x+a,top+2,pc[4]);this.px(x,top-1,pc[4]);}
 poleTips(x,base,s){const h=Math.round(46*s),top=base-h,a=Math.max(3,Math.round(7*s));return [[x-a,top+2],[x,top-1],[x+a,top+2]];}
 cable(a,b,c,sag){const n=Math.max(2,Math.ceil(Math.abs(b[0]-a[0])+Math.abs(b[1]-a[1])));for(let i=0;i<=n;i++){const t=i/n;this.px(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t+sag*4*t*(1-t),c);}}
 // ───── Ground ─────
 drawGroundSide(){
  const W=this.W,H=this.H,buf=this.buf,g=this.C.ground,pc=this.C.pc,d=this.dist,world=PixelTrip.worlds[this.world],neon=world.grid,floor=world.floor,under=Math.floor((this.runner.x+d)/16),stepLit=this.kickAge<.35,disco=[pc[5],pc[6],this.C.sky[4],pc[4]];
  for(let x=0;x<W;x++){const top=Math.round(this.groundY(x)),xw=Math.floor(x+d);
   for(let y=Math.max(0,top);y<H;y++){const k=y-top;let c;
    if(k===0)c=g[0];else if(k<3)c=g[1];
    else{c=this.ramp(g,1.4+Math.min(1,k/34)*3,x,y);
     if(neon){if(k%7===3||xw%16===0)c=g[0];}
     else if(floor==='hopscotch'){const sq=Math.floor(xw/16),inn=xw-sq*16;if(k>=2&&k<=9&&inn>=2&&inn<=13){const edge=inn===2||inn===13||k===2||k===9;if(edge||sq===under&&stepLit)c=sq&1?pc[5]:pc[6];else if(sq===under)c=g[1];}}
     else if(floor==='dance'){if(xw%10===0||k%4===0)c=g[4];else{const h=this.hash(Math.floor(xw/10)*31+(k>>2)*977+this.kickCount*7);if(h<.16+this.audio[3]*.2)c=disco[Math.floor(h*97)%4];}}
     else if(floor==='wet'){if(k%5===2&&this.hash(Math.floor((x+d*(1+k*.012))/9)*7+(k>>2)*131)<.25)c=this.C.sky[3];}
     else if(k%4===2){const u=(x+d*(1+k*.012))/11,tile=Math.floor(u);if(this.hash(tile*7+(k>>2)*131)<.14&&u-tile<.22)c=g[0];}}
    buf[y*W+x]=c;}
   if(!neon&&!floor&&xw%7<2)this.px(x,top-1,g[1]);}
  const R=this.runner,gy=Math.round(this.groundY(R.x))+1,sw=Math.max(2,7-R.y*.12);for(let i=-sw;i<=sw;i++)this.px(R.x+i,gy,g[4]);
 }
 drawGroundBehind(){
  const W=this.W,CX=this.CX,H=this.H,buf=this.buf,g=this.C.ground,pc=this.C.pc,HZ=PixelTrip.HZB,world=PixelTrip.worlds[this.world],floor=world.floor,disco=[pc[5],pc[6],this.C.sky[4],pc[4]],under=Math.floor((this.z+1.4)*.9),neon=world.grid,fogC=this.C.sky[3],kick=this.kickAge<.12;
  for(let y=HZ+1;y<H;y++){const Z=PixelTrip.CAMH/(y-HZ),cz=this.curve*Z*Z*.02,fog=Math.min(1,Z/30),v=Z+this.z,stripe=Math.floor(v*.7)&1,pxw=Z/64;
   for(let x=0;x<W;x++){const X=(x-CX)*pxw+cz,ax=Math.abs(X);let c;
    if(neon){const gx=Math.abs(X-Math.round(X)),gv=(v*.5)%1;c=gx<pxw*1.2||gv<Z*.012?g[0]:stripe?g[3]:g[4];}
    else if(floor==='dance'){const tx=Math.floor(X*1.6),tv=Math.floor(v*1.4);if(X*1.6-tx<pxw*1.6||v*1.4-tv<Z*.015)c=g[4];else{const h=this.hash(tx*31+tv*977+this.kickCount*7);c=h<.16+this.audio[3]*.2?disco[Math.floor(h*97)%4]:g[2];}}
    else if(floor==='hopscotch'&&ax<1){const sq=Math.floor(v*.9),f=v*.9-sq;c=ax>.9?g[0]:g[2];if(ax<.75&&(f<.06||f>.94||ax>.68||sq===under&&this.kickAge<.3&&PixelTrip.dither[(x&3)|((y&3)<<2)]<.35))c=sq&1?pc[5]:pc[6];}
    else if(floor==='wet'&&ax>=1){c=stripe?g[2]:g[3];if(this.hash(Math.floor(X*2)*977+Math.floor(v*1.5))<.12)c=this.C.sky[3];}
    else if(ax<1){c=ax>.9?g[0]:stripe?(kick?g[0]:g[1]):g[2];if(ax<pxw&&(Math.floor(v*1.4)&1))c=g[0];}
    else{c=stripe?g[2]:g[3];if(Z>3&&this.hash(Math.floor(X*3)*977+Math.floor(v*2))<.05)c=g[1];}
    if(PixelTrip.dither[(x&3)|((y&3)<<2)]<fog*fog*.9)c=fogC;
    buf[y*W+x]=c;}}
  const R=this.runner,rx=Math.round(CX+R.lane*44),sw=Math.max(2,6-R.y*.1);for(let i=-sw;i<=sw;i++)this.px(rx+i,H-5,g[4]);
 }
 drawRings(far){
  const HZ=PixelTrip.HZB,C=this.C;
  for(const r of this.rings){const Z=r.z-this.z;if(Z<.35||(far?Z<6:Z>=6))continue;const cz=this.curve*Z*Z*.02,cx=this.CX+(0-cz)*64/Z,gy=HZ+PixelTrip.CAMH/Z,rad=1.35*64/Z,c=r.c?C.pc[5]:C.sun[1],th=Z<2.5?2:1;
   for(let a=0;a<=Math.PI;a+=.6/Math.max(4,rad)){const x=cx+Math.cos(a)*rad*1.15,y=gy-Math.sin(a)*rad;for(let k=0;k<th;k++)this.px(x,y-k,c);if(Z<8&&PixelTrip.dither[((x|0)&3)|(((y|0)&3)<<2)]<.4)this.px(x,y+th,C.sky[4]);}}
 }
 drawItemsBehind(){
  const HZ=PixelTrip.HZB;
  for(const it of this.items){const Z=it.z-this.z;if(Z<.6||Z>30)continue;const cz=this.curve*Z*Z*.02,x=Math.round(this.CX+(it.X-cz)*64/Z),y=Math.round(HZ+PixelTrip.CAMH/Z-26/Z-4);if(Z>9){this.px(x,y,this.C.fx[PixelTrip.itemColors[it.k][Object.keys(PixelTrip.itemColors[it.k])[0]]]);continue;}this.itemSprite(it.k,x,y);}
 }
 drawWarpLines(){for(let i=0;i<16;i++){const a=this.hash(i*13)*Math.PI*2,ph=(this.time*1.6+this.hash(i))%1,r0=20+ph*130,r1=r0+8+ph*18,c=i&1?0xffffffff:this.C.sky[4];for(let r=r0;r<r1;r+=1)this.px(this.CX+Math.cos(a)*r,PixelTrip.HZB+Math.sin(a)*r*.7,c);}}
 drawTufts(){const off=this.dist*1.45,c=this.C.sky[0];for(let k=Math.floor(off/23);k<Math.floor(off/23)+Math.ceil(this.W/23)+1;k++){const h=this.hash(k*91+3);if(h<.5)continue;const x=Math.round(k*23-off),n=3+Math.floor(h*4);for(let i=0;i<n;i++){const bh=4+Math.round(this.hash(k*5+i)*(h>.85?13:7)),bx=x+i*2;for(let j=0;j<bh;j++)this.px(bx+(j>bh-3?1:0),this.H-1-j,c);}}}
 // ───── Hero: a skeleton rig rasterized into a sprite, rotated for flips, then outlined ─────
 put(x,y,c){x=Math.round(x);y=Math.round(y);if(x>=0&&y>=0&&x<PixelTrip.SW&&y<PixelTrip.SH)this.sp[y*PixelTrip.SW+x]=c;}
 limb(x0,y0,x1,y1,c,w=2){const n=Math.ceil(Math.hypot(x1-x0,y1-y0)*2)+1;for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,y=y0+(y1-y0)*i/n;for(let k=0;k<w;k++)this.put(x+k,y,c);}}
 head(rows,H,ox,oy){const lit=this.kickAge<.1||(this.voice||0)>.45&&(this.time*8|0)%2;rows.forEach((row,j)=>{for(let i=0;i<row.length;i++){const ch=row[i];if(ch!=='.')this.put(ox+i,oy+j,ch==='P'&&lit?H.cupLit:H[PixelTrip.headKey[ch]]);}});}
 rigSide(kind){
  const SH=PixelTrip.SH,H=this.C.hero[kind],R=this.runner,air=R.y>0,a=this.stride*Math.PI,t=this.time,gait=this.gait;
  const swing=2.5+gait*3,lift=1.5+gait*2.5,armS=2+gait*3,lean=Math.round(gait*1.4),bob=air?0:(Math.abs(Math.sin(a))>.6?-1:0),dance=!air&&gait<.3&&this.kickAge<.18;
  this.sp.fill(0);const hip=[12,19+bob],sh=[12+lean,12+bob];
  const leg=(i,front)=>{let foot,knee;if(air){foot=front?[16,24]:[9,26];knee=front?[16,20]:[11,23];}else{const ai=a+i*Math.PI,l=Math.max(0,-Math.sin(ai))*lift;foot=[12+Math.cos(ai)*swing,SH-2-l];knee=[(hip[0]+foot[0])/2+2,(hip[1]+foot[1])/2-.5];}
   const c=front?H.pants:H.pantsShade,sc=front?H.shoe:H.shoeShade;this.limb(hip[0],hip[1],knee[0],knee[1],c);this.limb(knee[0],knee[1],foot[0],foot[1],c);for(let k=-1;k<3;k++)this.put(foot[0]+k,foot[1],sc);this.put(foot[0]+2,foot[1]-1,sc);};
  const arm=(i,front)=>{let hand;if(air||dance)hand=front?[sh[0]+5,sh[1]-5]:[sh[0]-5,sh[1]-4];else{const ai=a+i*Math.PI;hand=[sh[0]-Math.cos(ai)*armS,sh[1]+5-Math.max(0,Math.cos(ai))*1.5];}
   const el=[(sh[0]+hand[0])/2-.5,(sh[1]+hand[1])/2+1];this.limb(sh[0],sh[1],el[0],el[1],front?H.top:H.topShade);this.limb(el[0],el[1],hand[0],hand[1],front?H.top:H.topShade);this.put(hand[0],hand[1],H.skin);this.put(hand[0]+1,hand[1],H.skin);};
  const sf=Math.min(1,this.speed/70);
  if(kind==='m'){const len=Math.min(13,6+this.speed/9);for(let k=1;k<=len;k++){const y=11+bob+Math.sin(t*10-k*.7)*k*.16+k*.1*(1-sf);this.put(10+lean-k,y,(k>>1)&1?H.accShade:H.acc);if(k<len)this.put(10+lean-k,y+1,H.accShade);}}
  else for(let k=1;k<=10;k++){const x=9+lean-k*(.55+sf*.45),y=3+bob+k*(.75-sf*.5)+Math.sin(t*11-k*.8)*k*.12;this.put(x,y,k>6?H.hairShade:H.hair);if(k<8)this.put(x,y+1,H.hairShade);}
  leg(1,false);arm(1,false);
  for(let y=11;y<=19;y++){const ox=Math.round(lean*(19-y)/8);for(let x=9;x<=15;x++){if((y===11||y===19)&&(x===9||x===15))continue;this.put(x+ox,y+bob,x<=10?H.topLight:x>=14?H.topShade:H.top);}}
  this.head(PixelTrip.heads[kind].side,H,8+lean,1+bob);
  if(kind==='f')this.put(9+lean,3+bob,H.acc);
  leg(0,true);arm(0,true);
 }
 rigBack(kind){
  const SH=PixelTrip.SH,H=this.C.hero[kind],R=this.runner,air=R.y>0,a=this.stride*Math.PI,t=this.time,gait=this.gait,lift=3+gait*4,bob=air?0:(Math.abs(Math.sin(a))>.6?-1:0);
  this.sp.fill(0);const hipY=19+bob;
  const legs=[0,1].map(i=>{const hx=i?14:10,ai=a+i*Math.PI,l=air?4:Math.max(0,-Math.sin(ai))*lift;return {hx,l,i};}).sort((p,q)=>q.l-p.l);
  for(const {hx,l,i}of legs){const fx=hx+(i?.5:-.5),fy=SH-2-l*1.15,ky=hipY+5-l*.2,kx=hx+(i?1:-1)*(l>2?1:0);this.limb(hx,hipY,kx,ky,l>2?H.pantsShade:H.pants);this.limb(kx,ky,fx,fy,l>2?H.pantsShade:H.pants);for(let k=-1;k<2;k++)this.put(fx+k,fy,l>2?H.shoeShade:H.shoe);}
  for(const i of [0,1]){const s=i?17:7,ai=a+i*Math.PI,hy=air?6:17-Math.cos(ai)*3*(.4+gait),hx=air?(i?20:4):s+(i?1:-1)*1.5,el=[s+(i?2:-2),air?9:15];this.limb(s,12+bob,el[0],el[1]+bob,H.topShade);this.limb(el[0],el[1]+bob,hx,hy+bob,H.top);this.put(hx,hy+bob,H.skin);this.put(hx+1,hy+bob,H.skin);}
  for(let y=11;y<=19;y++)for(let x=8;x<=16;x++){if((y===11||y===19)&&(x===8||x===16))continue;this.put(x,y+bob,x<=9?H.topShade:x>=15?H.topShade:x===12&&y>12?H.topShade:H.top);}
  if(kind==='m'){for(const side of [-1,1])for(let k=1;k<=7;k++)this.put(12+side*(1+k*.6+Math.sin(t*9-k*.7+side)*k*.15),10+bob+k*.55,(k>>1)&1?H.accShade:H.acc);}
  this.head(PixelTrip.heads[kind].back,H,7,1+bob);
  if(kind==='f'){const sw=Math.sin(a)*1.6;this.put(12,3+bob,H.acc);this.put(13,3+bob,H.acc);for(let k=1;k<=9;k++){const x=12+sw*k*.25+Math.sin(t*6-k*.7)*k*.08;this.put(x,4+bob+k,k>6?H.hairShade:H.hair);this.put(x+1,4+bob+k,H.hairShade);}}
 }
 blitHero(sx,sy,rot,ghost){
  const SW=PixelTrip.SW,SH=PixelTrip.SH,RS=PixelTrip.RS,h=RS>>1,sp=this.sp,s2=this.sp2,c=Math.cos(rot),s=Math.sin(rot);
  s2.fill(0);for(let j=0;j<RS;j++)for(let i=0;i<RS;i++){const dx=i-h,dy=j-h,lx=Math.round(12+dx*c+dy*s),ly=Math.round(17-dx*s+dy*c);if(lx>=0&&ly>=0&&lx<SW&&ly<SH)s2[j*RS+i]=sp[ly*SW+lx];}
  const x0=Math.round(sx)-h,y0=Math.round(sy)-h,ink=this.C.ink,at=(i,j)=>i>=0&&j>=0&&i<RS&&j<RS?s2[j*RS+i]:0;
  if(ghost>0)for(let g=3;g>=1;g--){const col=this.C.fx[[4,5,0][g-1]],off=Math.round(-g*7*ghost);for(let j=0;j<RS;j++)for(let i=0;i<RS;i++)if(s2[j*RS+i]&&PixelTrip.dither[((i+off)&3)|((j&3)<<2)]>=g*.22)this.px(x0+i+off,y0+j,col);}
  for(let j=-1;j<=RS;j++)for(let i=-1;i<=RS;i++){if(at(i,j))continue;if(at(i-1,j)||at(i+1,j)||at(i,j-1)||at(i,j+1))this.px(x0+i,y0+j,ink);}
  for(let j=0;j<RS;j++)for(let i=0;i<RS;i++){const v=s2[j*RS+i];if(v)this.px(x0+i,y0+j,v);}
 }

 // The second hero is drawn with the same rig, half a stride out of phase.
 withMate(fn){const R=this.runner,st=this.stride,m=this.mate;this.runner={x:m.x,y:m.y,vy:0,rot:0,spin:0,lane:m.lane};this.stride=st+.5;try{fn();}finally{this.runner=R;this.stride=st;}}
 drawMateSide(kind){const m=this.mate;if(m.vis<=0||m.x>this.W+16)return;const feet=this.groundY(Math.max(0,Math.min(this.W-1,m.x)))-m.y;this.withMate(()=>{this.rigSide(kind==='m'?'f':'m');this.blitHero(m.x,feet-11,0,0);});}
 drawMateBack(kind){
  const m=this.mate;if(m.vis<=0)return;const k2=kind==='m'?'f':'m';
  if(m.z<1.2){this.withMate(()=>{this.rigBack(k2);this.blitHero(this.CX+m.lane*44,this.H-6-11-m.y,0,0);});return;}
  if(m.z>30)return;const Z=m.z+1,cz=this.curve*Z*Z*.02,x=Math.round(this.CX+(m.lane-cz)*64/Z),y=Math.round(PixelTrip.HZB+PixelTrip.CAMH/Z),H=this.C.hero[k2],ink=this.C.ink,step=Math.floor(this.stride*2)&1;
  this.rect(x-3,y-10,7,11,ink);this.rect(x-2,y-10,5,3,H.hair);this.px(x-2,y-8,H.cup);this.px(x+2,y-8,H.cup);this.rect(x-2,y-7,5,3,H.top);this.rect(x-1,y-4,1,3+(step?0:-1),H.pants);this.rect(x+1,y-4,1,3+(step?-1:0),H.pants);
  if(k2==='f')this.rect(x,y-7,1,3,H.hairShade);
 }
 drawThread(){
  if(!this.thread)return;const R=this.runner,m=this.mate,c=this.C.thread,g=this.C.threadGlow,side=this.view==='side';let x0,y0,x1,y1;
  if(side){const feet=this.groundY(R.x)-R.y;x0=R.x+5;y0=feet-12;if(m.vis>.5&&m.x<this.W+8){x1=m.x-5;y1=this.groundY(Math.max(0,Math.min(this.W-1,m.x)))-m.y-12;}else{x1=this.W+6;y1=feet-34+Math.sin(this.time*1.3)*5;}}
  else{x0=this.CX+R.lane*44+6;y0=this.H-18-R.y;if(m.vis>.3&&m.z<1.2){x1=this.CX+m.lane*44-6;y1=this.H-18-m.y;}else if(m.vis>.3&&m.z<=30){const Z=m.z+1,cz=this.curve*Z*Z*.02;x1=this.CX+(m.lane-cz)*64/Z;y1=PixelTrip.HZB+PixelTrip.CAMH/Z-6;}else{x1=this.CX-this.curve*22;y1=PixelTrip.HZB+3;}}
  const sag=(side?5:2)+Math.sin(this.time*2.1)*2,lit=this.kickAge<.12,n=Math.ceil(Math.hypot(x1-x0,y1-y0))+2;
  for(let i=0;i<=n;i++){const t=i/n,x=x0+(x1-x0)*t,y=y0+(y1-y0)*t+sag*4*t*(1-t)+Math.sin(t*9-this.time*4)*1.1*t;this.px(x,y,c);if(lit||PixelTrip.dither[((x|0)&3)|(((y|0)&3)<<2)]<.3)this.px(x,y-1,g);}
 }
 drawRunnerSide(kind,ev){
  const R=this.runner,feet=this.groundY(R.x)-R.y,ghost=Math.max(this.hype,ev==='rainbow'?.8:0,this.gait>.85?.4:0);
  this.rigSide(kind);
  if(ev==='rainbow'){const fx=this.C.fx,y0=Math.round(feet-17);for(let x=0;x<R.x-4;x++){const o=((x+Math.floor(this.dist))>>2)&1;for(let i=0;i<6;i++){this.px(x,y0+i*2+o,fx[i]);this.px(x,y0+i*2+1+o,fx[i]);}}}
  this.blitHero(R.x,feet-11,R.rot,ghost);
 }
 drawRunnerBack(kind,ev){const R=this.runner;this.rigBack(kind);this.blitHero(this.CX+R.lane*44,this.H-6-11-R.y,0,0);}
 itemSprite(k,x,y){const sp=PixelTrip.items[k],pal=PixelTrip.itemColors[k],ink=this.C.ink;for(let j=0;j<7;j++)for(let i=0;i<7;i++){const ch=sp[j][i];if(ch!=='.')this.px(x-3+i,y-3+j,ch==='o'?ink:this.C.fx[pal[ch]]);}
  if(((this.time*2+x*.05)%1)<.15){this.px(x+3,y-4,0xffffffff);this.px(x+4,y-5,0xffffffff);this.px(x+2,y-5,0xffffffff);this.px(x+3,y-6,0xffffffff);}}
 drawItemsSide(){for(const it of this.items)this.itemSprite(it.k,Math.round(it.x),Math.round(it.y+Math.sin(this.time*4+it.x*.1)*2));}
 drawParts(){const fx=this.C.fx;for(const q of this.parts){if(q.c===-3){const c=fx[(Math.round(q.x)>>3)&1?5:2],x=Math.round(q.x),y=Math.round(q.y);this.px(x+1,y,c);this.px(x+1,y+1,c);this.px(x+1,y+2,c);this.px(x,y+3,c);this.px(x+1,y+3,c);this.px(x+2,y,c);continue;}if(q.c===-2){for(let k=0;k<6;k++)this.px(q.x+k,q.y,k<3?0xffffffff:0xff9090a0);continue;}this.px(q.x,q.y,q.c===-1?this.C.ground[1]:fx[q.c===0?2:q.c===1?4:q.c===2?6:7]);}}
 drawRain(){const t=this.time,C=this.C;for(let i=0;i<26;i++){const sp=16+this.hash(i)*18,y=(this.hash(i+99)*this.H+t*sp)%(this.H+8)-4,x=((this.hash(i)*this.W+Math.sin(t*1.5+i)*6-this.dist*.15)%this.W+this.W)%this.W,c=i%3===0?0xffffffff:i%3===1?C.sun[0]:C.pc[4];
  this.px(x,y,c);if((t*3+i)%2<1.4){this.px(x-1,y,c);this.px(x+1,y,c);this.px(x,y-1,c);this.px(x,y+1,c);}}}
 drawWhale(){
  const e=this.event,x=Math.round(this.W+38-e.t*22),y=Math.round(34+Math.sin(e.t*1.1)*4),W=this.C.whale,o=this.C.ink,tail=Math.round(Math.sin(this.time*3)*3);
  for(let i=0;i<14;i++){const ty=y-1+Math.round(tail*i/14);this.rect(x+24+i,ty-1-(i>9?(i-9):0),1,3+(i>9?(i-9)*2:0),i>11?W[2]:W[1]);}
  this.orb(x,y,26,9,[W[0],W[1],W[2]],o);
  for(let i=-18;i<=16;i+=3)this.rect(x+i,y+4,2,1,W[3]);this.rect(x-20,y+3,36,1,W[3]);
  this.orb(x-6,y+8,5,2,[W[0],W[1]],o);this.orb(x-17,y-2,1.6,1.6,[0xffffffff],o);
  for(let i=0;i<3;i++){const h=(this.time*16+i*4)%10;this.px(x-9+i*2-1,y-11-h,0xffd8f0ff);}
 }
 drawEye(){const e=this.event,k=Math.min(1,e.t/.6,(e.dur-e.t)/.6);if(k<=.05)return;const x=Math.round((this.view==='behind'?150:PixelTrip.worlds[this.world].sunX>96?58:136)*this.W/192),y=34,rx=20*k,ry=11*k;
  for(let i=-2;i<=2;i++)this.rect(x+i*7,y-ry-4+Math.abs(i),1,3,this.C.ink);this.eyeball(x,y,rx,ry,this.kickAge<.1,[this.C.fx[7],this.C.fx[6],this.C.fx[6]],[this.C.fx[0],this.C.fx[1]],[this.C.sky[2],this.C.sky[3]]);}
 post(ev){
  const W=this.W,H=this.H,buf=this.buf,tmp=this.tmp;
  if(ev==='mirror')for(let y=0;y<H;y++)for(let x=this.CX;x<W;x++)buf[y*W+x]=buf[y*W+W-1-x];
  const rp=this.ripple,rippling=rp.t<1.4,offy=Math.round(this.shake*Math.cos(this.kickAge*40));
  if(rippling||offy){tmp.set(buf);const R=rp.t*170,A=rp.amp*4*(1-rp.t/1.4);
   for(let y=0;y<H;y++)for(let x=0;x<W;x++){let sx=x,sy=y-offy;if(rippling){const dx=x-rp.x,dy=y-rp.y,r=Math.sqrt(dx*dx+dy*dy)||1,w=r-R;if(w>-16&&w<16){const d=A*Math.sin(w*.4)*(1-Math.abs(w)/16);sx+=dx/r*d;sy+=dy/r*d;}}
    sx=Math.max(0,Math.min(W-1,Math.round(sx)));sy=Math.max(0,Math.min(H-1,Math.round(sy)));buf[y*W+x]=tmp[sy*W+sx];}}
  if(ev==='glitch'){tmp.set(buf);const f=Math.floor(this.time*16);for(let y=0;y<H;y++){if(this.hash((y>>2)+f*977)>.25)continue;const sh=Math.round((this.hash((y>>2)*3+f)-.5)*20);for(let x=0;x<W;x++){const c=tmp[y*W+((x+sh)%W+W)%W];buf[y*W+x]=(c&0xff00ff00)|((c&0xff)<<16)|((c>>>16)&0xff);}}}
  if(this.flash>.05&&!this.reduce){const lim=this.flash>.3?1:3;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(((x^y)&lim)===0){const c=buf[y*W+x];buf[y*W+x]=(((c&0xfefefe)>>>1)+0x7f7f7f)|0xff000000;}}
 }
 // The camera yaws away with a slight roll and zoom, smeared with the previous frame.
 swing(){
  const c=this.cam,W=this.W,CX=this.CX,H=this.H,buf=this.buf,tmp=this.tmp,prev=this.prev,p=Math.min(1,c.t/c.dur),half=p<.5,a=(half?p*2:(p-1)*2)*Math.PI/2*c.dir;
  if(!c.primed){prev.set(buf);c.primed=true;}
  const cosA=Math.max(.06,Math.cos(a)),k=Math.sin(a)*.6,roll=Math.sin(p*Math.PI)*.35*c.dir,zoom=1+Math.sin(p*Math.PI)*.5,cr=Math.cos(roll),sr=Math.sin(roll),bg=this.C.sky[0];
  tmp.set(buf);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const dx=x-CX,dy=y-72;let rx=(dx*cr+dy*sr)/zoom,ry=(-dx*sr+dy*cr)/zoom;const sx=Math.round(CX+rx/cosA),sy=Math.round(72+ry/(1+k*rx/96));
   const v=sx>=0&&sy>=0&&sx<W&&sy<H?tmp[sy*W+sx]:bg,o=prev[y*W+x];buf[y*W+x]=(((v&0xfefefe)>>>1)+((o&0xfefefe)>>>1)|0xff000000)>>>0;}
  prev.set(buf);
 }
 drawIntro(control){
  const W=this.W,CX=this.CX,H=this.H,buf=this.buf,t=this.phaseT,len=control.intro??8,C=this.C;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const dx=x-CX,dy=y-60,p=Math.sin(Math.sqrt(dx*dx+dy*dy)*.12-this.time*.9)*.35;buf[y*W+x]=this.ramp(C.sky,y/H*2.6+p+(this.reduce?0:this.boltFlash*3),x,y);}
  this.drawAurora(H-1);
  for(const s of this.stars){const tw=Math.sin(this.time*2+s[2]*50);if(tw>.2)this.px(s[0],s[1]*1.3,tw>.8?0xffffffff:C.sky[4]);}
  this.drawBolts();
  // Title: letters drop in one by one, lit with the world's sun ramp, outlined and shadowed.
  const title=ArcadeGame.clean(control.title||'PULSO').trim()||'PULSO';let lines=[title];
  if(title.length>9&&title.includes(' ')){const mid=title.length/2;let cut=-1,best=1e9;for(let i=0;i<title.length;i++)if(title[i]===' '&&Math.abs(i-mid)<best){best=Math.abs(i-mid);cut=i;}if(cut>0)lines=[title.slice(0,cut),title.slice(cut+1)];}
  const longest=Math.max(...lines.map(l=>l.length)),scale=Math.max(2,Math.min(6,Math.floor((W-12)/(longest*4)))),lineH=6*scale,top=lines.length>1?18:Math.max(20,42-scale*3);let index=0;
  const ink=C.ink,ramp=[C.sun[0],C.sun[0],C.sun[1],C.sun[2]];
  lines.forEach((line,li)=>{const x0=Math.round((W-(line.length*4*scale-scale))/2),y0=top+li*(lineH+3);
   for(let n=0;n<line.length;n++,index++){const g=ArcadeGame.font[line[n]];if(!g||line[n]===' ')continue;const appear=.2+index*.09;if(t<appear)continue;
    const k=Math.min(1,(t-appear)/.5),oy=Math.round(k<1?-(1-k)*(1-k)*60:Math.sin(this.time*2.4+index*.55)*(1+this.audio[0]*2*this.pulse)),x=x0+n*4*scale,y=y0+oy;
    for(let pass=0;pass<3;pass++)for(let r=0;r<5;r++)for(let c=0;c<3;c++){if(g[r*3+c]!=='1')continue;const bx=x+c*scale,by=y+r*scale;
     if(pass===0)this.rect(bx+1,by+2,scale+1,scale+1,C.sky[0]);else if(pass===1)this.rect(bx-1,by-1,scale+2,scale+2,ink);
     else for(let sy=0;sy<scale;sy++)for(let sx=0;sx<scale;sx++)this.px(bx+sx,by+sy,this.ramp(ramp,(r*scale+sy)/(5*scale)*3.99,bx+sx,by+sy));}}});
  const after=top+lines.length*(lineH+3),center=(s,y,c)=>this.text(s,Math.round((W-this.textWidth(s))/2),y,c,1,0,0,true);
  const sub=ArcadeGame.clean(control.subtitle??'PRESENTA').trim();
  if(sub&&t>1.3){const shown=sub.slice(0,Math.floor((t-1.3)*14)),sw=this.textWidth(sub),sx=Math.round((W-sw)/2);this.text(shown,sx,after+6,0xffffffff,1,0,0,true);if(shown.length===sub.length){this.rect(sx-14,after+8,9,1,C.sky[4]);this.rect(sx+sw+5,after+8,9,1,C.sky[4]);}}
  const bottom=ArcadeGame.clean(control.bottom??'UN VIAJE PSICODELICO').trim();
  if(bottom&&t>2.6&&Math.floor(this.time*1.6)%2)center(bottom,H-20,C.sun[1]);
  // The last stretch dives through the glass into the world.
  const dive=Math.max(0,1-(len-t)/1.4);
  if(dive>0){const tmp=this.tmp,z=1+dive*dive*6;tmp.set(buf);for(let y=0;y<H;y++)for(let x=0;x<W;x++)buf[y*W+x]=tmp[Math.round(72+(y-72)/z)*W+Math.round(CX+(x-CX)/z)];
   for(let i=0;i<4;i++){const f=((i/4+this.time*1.2)%1)**2,hw=Math.round(4+f*120*dive),hh=Math.round(hw*.75),c=C.sky[2+(i&1)*2];this.rect(CX-hw,72-hh,hw*2,1,c);this.rect(CX-hw,72+hh,hw*2,1,c);this.rect(CX-hw,72-hh,1,hh*2,c);this.rect(CX+hw,72-hh,1,hh*2+1,c);}
   if(dive>.85)this.flash=Math.max(this.flash,(dive-.85)*3);}
  if(this.flash>.05&&!this.reduce)this.post(null);
 }
 snapshot(){
  const nums=['time','phaseT','dist','z','speed','world','worldT','viewT','stride','beatLen','gait','hype','kickAge','kickStrength','flash','shake','boltFlash','curve'];
  return {n:Object.fromEntries(nums.map(k=>[k,this[k]])),phase:this.phase,view:this.view,a:this.audio.slice(),b:Array.from(this.bands),r:{...this.runner},cam:this.cam?{...this.cam}:null,e:this.event?{...this.event}:null,rp:{...this.ripple},
   it:this.items.map(i=>({...i})),p3:this.props3d.map(p=>({...p})),rg:this.rings.map(r=>({...r})),bo:this.bolts.map(b=>({life:b.life,pts:b.pts,branch:b.branch})),fl:this.flock?{...this.flock}:null,mate:{...this.mate},thread:this.thread,pa:this.parts.slice(-150).map(q=>[q.x,q.y,q.vx,q.vy,q.life,q.c,q.g])};
 }
 restore(s){
  if(!s||typeof s.n!=='object'||!Array.isArray(s.pa)||!Array.isArray(s.it))return false;
  for(const [k,v]of Object.entries(s.n))if(Number.isFinite(v)&&k in this)this[k]=v;
  this.world=Math.max(0,Math.min(PixelTrip.worlds.length-1,this.world|0));this.phase=s.phase==='intro'?'intro':'run';this.view=s.view==='behind'?'behind':'side';
  if(Array.isArray(s.a)&&s.a.length===4)this.audio=s.a.slice();if(Array.isArray(s.b)&&s.b.length===16)this.bands.set(s.b);
  const num=o=>o&&typeof o==='object'&&Object.values(o).every(v=>typeof v!=='number'||Number.isFinite(v));
  if(num(s.r))Object.assign(this.runner,s.r);this.cam=num(s.cam)&&(s.cam.to==='side'||s.cam.to==='behind')?{...s.cam}:null;
  this.event=s.e&&PixelTrip.events[s.e.type]?{...s.e}:null;if(num(s.rp))Object.assign(this.ripple,s.rp);
  this.items=s.it.filter(num);this.props3d=(s.p3||[]).filter(num);this.rings=(s.rg||[]).filter(num);this.bolts=(s.bo||[]).filter(b=>Array.isArray(b.pts)&&Array.isArray(b.branch));this.flock=num(s.fl)?{...s.fl}:null;if(num(s.mate)&&['none','far','together'].includes(s.mate.mode))this.mate={...s.mate};this.thread=!!s.thread;
  this.parts=s.pa.map(q=>({x:q[0],y:q[1],vx:q[2],vy:q[3],life:q[4],c:q[5],g:q[6]}));return true;
 }
}
for(const k of ['px','text','textWidth'])PixelTrip.prototype[k]=ArcadeGame.prototype[k];
PixelTrip.HZB=58;PixelTrip.CAMH=80;PixelTrip.PROP=74;PixelTrip.SW=26;PixelTrip.SH=30;PixelTrip.RS=44;
PixelTrip.dither=ArcadeGame.bayer.map(v=>(v+.5)/16);
// Palettes: sky top→horizon, sun light→dark, far and near hills, ground edge→deep, props (outline, dark, mid, light, highlight, accent, accent 2).
PixelTrip.worlds=[
 {pattern:0,prop:'mush',sunX:140,sky:['#140a26','#2b1248','#5a1f6b','#a83a7a','#f27a8a'],sun:['#fff1c2','#ffc46b','#ff7a5c'],far:'#4b1d63',near:'#2a1240',ground:['#a6f0a0','#4fb07a','#2b6b5e','#183c42','#0e2230'],pc:['#2a0f24','#9e1f45','#e8455d','#ff8f8f','#fff0dc','#f2e3c9','#b9a38a']},
 {pattern:1,prop:'eye',sunX:52,moon:true,stars:true,sky:['#06141f','#0b2c3a','#145259','#2a8a7a','#9be3b0'],sun:['#ffffff','#d6f5ff','#8fd3e8'],far:'#0f3d48',near:'#082630',ground:['#ffe08a','#d99a4e','#9a5a3a','#5c3330','#2e1a24'],pc:['#160c26','#4a3a8a','#7f6ad0','#c2b0ff','#f4eeff','#ff4f8a','#1b0b1f']},
 {pattern:2,prop:'pyramid',sunX:130,sky:['#200a33','#5a1650','#a8325e','#e8604f','#ffb35c'],sun:['#fffbe0','#ffe066','#ffa040'],far:'#8a2a5a',near:'#4f1640',ground:['#ffe9a8','#ffc46b','#e08a4a','#a8503a','#5c2a33'],pc:['#2a0f1f','#8a4a2a','#d9893a','#ffd27a','#fff4c8','#3af0d0','#0f3a3a']},
 {pattern:3,prop:'tower',sunX:96,stripes:true,stars:true,grid:true,sky:['#05030f','#120630','#2a0a52','#5c0f6e','#c41f7a'],sun:['#ffe45c','#ff8a3a','#ff2a7a'],far:'#1e0a3d',near:'#0e0520',ground:['#ff4fd8','#3a1060','#1c0838','#120526','#08020f'],pc:['#05020c','#140a2e','#22124a','#3a2470','#ffffff','#3af0ff','#ffd23a']},
 {pattern:4,prop:'crystal',sunX:146,moon:true,stars:true,sky:['#070b24','#12205a','#2a4a94','#5a8ad0','#b8e8ff'],sun:['#ffffff','#e8f4ff','#a8c8ff'],far:'#22306b',near:'#141b45',ground:['#d8fbff','#7fd0ee','#3a8ac2','#22508a','#122a55'],pc:['#100a2a','#5a2a8a','#c45ab8','#ff9ae0','#ffffff','#5af0e0','#1f6a8a']},
 {pattern:5,prop:'flower',sunX:60,sky:['#120a2a','#241a52','#4a3a94','#9a5ac8','#ff9ad0'],sun:['#fffbe8','#fff0a0','#ffc46b'],far:'#3a2a7a',near:'#1f1645',ground:['#c8ff7a','#6ad06a','#2a9a6a','#1a5a50','#0f2f35'],pc:['#1a0a20','#2a7a4a','#ff5aa0','#ffb0d0','#fff4b0','#ffd23a','#5ac87a']},
 {pattern:1,prop:'lamp',sunX:150,moon:true,stars:true,skyline:true,floor:'hopscotch',sky:['#060716','#0e1030','#1c1a4a','#3a1f66','#7a2a8a'],sun:['#f4f0ff','#d0c8f0','#9a90c8'],far:'#16163a',near:'#0b0b22',ground:['#6a78a8','#2c3454','#1e2440','#151a30','#0a0e1c'],pc:['#06060f','#20243a','#3a4060','#6a7298','#fff3c4','#ff3fa4','#3af0ff']},
 {pattern:4,prop:'speaker',sunX:96,disco:true,skyline:true,floor:'dance',sky:['#07020e','#14041f','#2a0838','#4a0a52','#8a1a6a'],sun:['#ffffff','#c8c8e0','#7a7a9a'],far:'#1a0626',near:'#0c0314',ground:['#ff3fa4','#2a0a3a','#1a0626','#120420','#080210'],pc:['#030205','#14101c','#241c30','#3a2e4a','#d8d0ff','#ff3fa4','#ffd23a']},
 {pattern:3,prop:'pole',sunX:60,calm:true,rain:true,floor:'wet',sky:['#14161f','#262a38','#3c4252','#5c6272','#8a8e98'],sun:['#f0e6d8','#c8beb4','#9a928c'],far:'#2a2e3a',near:'#1a1d26',ground:['#7a8090','#3a3f4c','#2a2e38','#1e212a','#121419'],pc:['#0e0f14','#3a2c24','#5a4434','#7a6450','#d8dce4','#ff2440','#9aa0aa']}];
PixelTrip.hero={
 m:{skin:'#ffd0a6',skinShade:'#e3957a',hair:'#3a2466',hairLight:'#5a3a8a',hairShade:'#2a1848',band:'#e8e8f4',cup:'#ff4f7a',cupLit:'#ffd0e0',eye:'#1b0f24',lips:'#e3957a',topLight:'#ffc35a',top:'#ff8a2e',topShade:'#c94a2e',pants:'#4256c4',pantsShade:'#283286',shoe:'#f4f4ff',shoeShade:'#a8a8c8',acc:'#3af0d0',accShade:'#1f9e94'},
 f:{skin:'#c98a5e',skinShade:'#9e6240',hair:'#ff4fa0',hairLight:'#ff9ad0',hairShade:'#b8287a',band:'#f4f4ff',cup:'#3af0d0',cupLit:'#c8fff8',eye:'#1b0f24',lips:'#ff5a7a',topLight:'#b8a0ff',top:'#7a5aff',topShade:'#4a32b0',pants:'#2a2050',pantsShade:'#1a1438',shoe:'#ffe14a',shoeShade:'#c8a020',acc:'#ffe14a',accShade:'#c8a020'}};
PixelTrip.heads={
 m:{side:['...BBBH...','.HBHHHHHH.','HHBHHHHHHH','HPPPHSSSSS','HPPPSSSESS','HPPPSSSESS','HHPHSSSSSs','.HHHSSSSs.','..HsSSSs..'],back:['...BBBB...','..HBHHBH..','.HHHHHHHH.','PHHHHHHHHP','PHHHHHHHHP','PHHHHHHHHP','.HHHHHHHH.','..sHHHHs..','...sSSs...']},
 f:{side:['...BBBHH..','.HBHHHHHHH','HHBHHHHHHH','HPPPHHHSSS','HPPPSSSEES','HPPPSSSESS','HHPHSSSSSs','.HHHSSSMs.','..HsSSSs..'],back:['...BBBB...','..HBhhBH..','.HHHhhHHH.','PHHHHHHHHP','PHHHHHHHHP','PHHHHHHHHP','.HHHHHHHH.','..HHHHHH..','...sSSs...']}};
PixelTrip.headKey={H:'hair',h:'hairLight',B:'band',P:'cup',S:'skin',s:'skinShade',E:'eye',M:'lips'};
// Shared effect colors: rainbow (0-5), sparkle white and soft violet.
PixelTrip.fx=['#ff4f5a','#ffa03a','#ffe04a','#5ae07a','#4ab0ff','#9a6aff','#ffffff','#d8c8ff'];
PixelTrip.whale=['#1b2a5a','#2f4a9a','#5a8ad8','#a8d0ff'];
PixelTrip.items=[['...o...','..oLo..','.oLLMo.','oLLMMDo','.oMMDo.','..oDo..','...o...'],['.......','..ooo..','.oYYYo.','oYoYoYo','oYYYYYo','.oYoYo.','..ooo..'],['...oo..','...oNo.','...oNNo','...oo..','.oNo...','oNNo...','.oo....']];
PixelTrip.itemColors=[{L:6,M:4,D:5},{Y:2},{N:0}];
PixelTrip.events={sun:{dur:10},eye:{dur:9},rain:{dur:9},mirror:{dur:6},tunnel:{dur:7},rainbow:{dur:7},whale:{dur:12},glitch:{dur:1}};
window.PixelTrip=PixelTrip;
