'use strict';
// ===== Сцены: загрузка, титул, кат-сцены, карта, игра, финал, поворот, главный цикл =====
const SC={};
Object.assign(G,{scene:'load',arg:null,t0:0,auditReq:0,_aud:null,_fps:[],heroes:[],acc:0,kind:false});
function go(name,arg){GEN++;stopTalk();G.scene=name;G.arg=arg;G.t0=T;UI=[];TAPS=[];PS.length=0;
 if(!SC[name].world)LV=null;try{SC[name].enter&&SC[name].enter(arg)}catch(e){console.error(e)}}
G.go=go;
function bgXY(px,py){const v=vis();const s=Math.max(v.w/1280,v.h/720);const w=1280*s,h=720*s;return[v.x0+(v.w-w)/2+px*s,v.y0+(v.h-h)/2+py*s,s]}
// фон с привязкой нарисованной земли к линии gy дизайна (герои стоят на земле на любом экране)
function bgG(n,gy){const v=vis(),b=IM['bg_'+n];const s=Math.max(v.w/1280,v.h/720);const w=1280*s,h=720*s;const x0=v.x0+(v.w-w)/2;
 let y0=gy-gy*s;y0=clamp(y0,v.y0+v.h-h,v.y0);if(okI(b))X.drawImage(b,x0,y0,w,h);else{X.fillStyle='#1a1530';X.fillRect(v.x0,v.y0,v.w,v.h)}G.bgm={n,x0,y0,s};return{x0,y0,s}}
// камера кат-сцены: точка фона (fx,fy) в центре, зум, без полос
function camBg(n,z,fx,fy,shx,shy){const v=vis(),b=IM['bg_'+n];const s=Math.max(v.w/1280,v.h/720)*z;const w=1280*s,h=720*s;
 const x0=clamp(v.x0+v.w/2-fx*s,v.x0+v.w-w,v.x0)+(shx||0),y0=clamp(v.y0+v.h/2-fy*s,v.y0+v.h-h,v.y0)+(shy||0);if(okI(b))X.drawImage(b,x0,y0,w,h);G.bgm={n,x0,y0,s};return{x0,y0,s}}
// ---- где можно стоять: пол каждого фона (координаты рисунка 1280x720), замерено по сетке ----
const FLOOR={c1:(x,y)=>y>=595&&y<=715,c2:(x,y)=>(x<=500||x>=755)&&y>=430&&y<=505,c3:(x,y)=>y>=600&&y<=715,c4:(x,y)=>y>=575&&y<=715,
 boss:(x,y)=>((x-640)/545)**2+((y-610)/40)**2<1,fin:(x,y)=>y>=595&&y<=715,title:(x,y)=>y>=595&&y<=715,map:()=>true};
function feetOK(x,gy,o){if(o.air)return'air';for(const s of G.surf||[])if(x>=s[0]&&x<=s[1]&&Math.abs(gy-s[2])<=14)return'surf';const b=G.bgm;if(!b)return'nobg';const f=FLOOR[b.n];if(!f)return'BAD';return f((x-b.x0)/b.s,(gy-b.y0)/b.s)?'floor':'BAD'}
function hero(n,x,gy,h,o){o=o||{};const br=o.still?1:1+.012*Math.sin(T*2.4+(o.ph||0));const ar=aspect(n);const hh=h*br;
 if(!o.noSh){const sy=o.shY==null?gy:o.shY,k=o.air?.55:1;X.save();X.globalAlpha=(o.a==null?1:o.a)*.38*k;X.fillStyle='#0a0618';X.beginPath();X.ellipse(x,sy-2,h*ar*.3*k,h*.028,0,0,7);X.fill();X.restore()}
 spr(n,x,gy,hh,{ax:.5,ay:1,flip:o.flip,blink:BLINKS.includes(n)?(o.seed||5):0,a:o.a});
 if(HEARTP[n]&&pzHeart()){const q=HEARTP[n];const w=hh*ar;glowHeart(x+(q[0]-.5)*w*(o.flip?-1:1),gy-hh*(1-q[1]),hh*q[2],o.a)}
 if(G.feetMon&&!AUD){const f=feetOK(x,gy,o||{});if(f==='BAD'){const key=n+'@'+G.scene+(LV?LV.idx:'');G.feetBad[key]=(G.feetBad[key]||0)+1}}
 if(AUD){const m=X.getTransform(),k=m.a/DPR;G.heroes.push({n,x:(m.e/DPR)+x*k,w:hh*ar*k,h:hh*k,ar,feet:(m.f/DPR)+gy*k,fl:feetOK(x,gy,o),sc:G.scene})}}
// сердечко Пазлика (дыра в груди на спрайтах: центр x/w, y/h, ширина/h)
const HEARTP={p_wave:[.49,.528,.15],p_jump:[.495,.54,.155],p_idle:[.552,.532,.152]};
function pzHeart(){return !!(SV.done&&SV.done[5])||!!G.heartBack}
function heartPath(cx,cy,w){const h=w*.9,t=cy-h*.42;X.beginPath();X.moveTo(cx,cy+h*.5);X.bezierCurveTo(cx-w*.62,cy+h*.02,cx-w*.55,t-h*.25,cx-w*.25,t-h*.08);X.bezierCurveTo(cx-w*.1,t-h*.02,cx,t+h*.08,cx,t+h*.16);X.bezierCurveTo(cx,t+h*.08,cx+w*.1,t-h*.02,cx+w*.25,t-h*.08);X.bezierCurveTo(cx+w*.55,t-h*.25,cx+w*.62,cy+h*.02,cx,cy+h*.5);X.closePath()}
function glowHeart(cx,cy,w,a){const pu=1+.06*Math.sin(T*5);w*=pu;X.save();if(a!=null)X.globalAlpha=a;
 X.globalCompositeOperation='lighter';const g=X.createRadialGradient(cx,cy,w*.1,cx,cy,w*1.05);g.addColorStop(0,'rgba(255,150,170,.45)');g.addColorStop(1,'rgba(255,80,120,0)');X.fillStyle=g;X.beginPath();X.arc(cx,cy,w*1.05,0,7);X.fill();
 X.globalCompositeOperation='source-over';const f=X.createLinearGradient(cx,cy-w*.5,cx,cy+w*.5);f.addColorStop(0,'#ff8fae');f.addColorStop(1,'#e0204f');X.fillStyle=f;X.shadowColor='#ff5080';X.shadowBlur=w*.5;heartPath(cx,cy,w);X.fill();
 X.shadowBlur=0;X.lineWidth=Math.max(2,w*.06);X.strokeStyle='#fff0f4';X.stroke();X.fillStyle='rgba(255,255,255,.7)';X.beginPath();X.ellipse(cx-w*.22,cy-w*.18,w*.1,w*.06,-.6,0,7);X.fill();X.restore()}
function plate(t,x,y,w,h,size,o){o=o||{};X.save();X.fillStyle=o.bg||'rgba(30,22,64,.9)';rr(x-w/2,y-h/2,w,h,Math.min(22,h/2));X.fill();X.lineWidth=4;X.strokeStyle=o.bd||'#d8c2ff';X.stroke();X.restore();
 textIn(t,x,y+1,w-h*.5,h*.72,size,o.col||'#fff6dc',{f:o.f||FONT,st:'#1a0e30',lw:5,id:o.id||'plate',min:14})}
function drawParticlesIf(){stepParticles();drawParticles()}
function hand(x,y,slide){const k=slide?0:Math.abs(Math.sin(T*5))*8;X.save();X.translate(x,y+k);X.rotate(-.35);X.fillStyle='#fff6dc';X.strokeStyle='#3a1a06';X.lineWidth=4;X.lineJoin='round';
 X.beginPath();X.moveTo(-8,-34);X.quadraticCurveTo(0,-44,8,-34);X.lineTo(8,-8);X.lineTo(22,-4);X.quadraticCurveTo(30,4,26,20);X.lineTo(20,34);X.lineTo(-12,34);X.lineTo(-20,10);X.quadraticCurveTo(-24,0,-14,-2);X.lineTo(-8,4);X.closePath();X.fill();X.stroke();X.restore()}
function houseIcon(r){X.fillStyle='#fff6dc';X.beginPath();X.moveTo(0,-r*.5);X.lineTo(r*.5,-r*.02);X.lineTo(r*.34,-r*.02);X.lineTo(r*.34,r*.42);X.lineTo(-r*.34,r*.42);X.lineTo(-r*.34,-r*.02);X.lineTo(-r*.5,-r*.02);X.closePath();X.fill();X.fillStyle='#3a2a7a';X.fillRect(-r*.1,r*.12,r*.2,r*.3)}
function lockIcon(x,y,r){X.save();X.translate(x,y);X.fillStyle='#d8cfe0';X.strokeStyle='#2a2040';X.lineWidth=3;rr(-r*.7,-r*.15,r*1.4,r*1.05,r*.2);X.fill();X.stroke();X.beginPath();X.arc(0,-r*.15,r*.45,Math.PI,0);X.lineWidth=r*.22;X.strokeStyle='#d8cfe0';X.stroke();X.restore()}
function stars(n){const v=vis();X.save();X.globalCompositeOperation='lighter';for(let i=0;i<n;i++){const x=v.x0+((i*397.3)%1)*0+((i*137.5)%v.w),y=v.y0+((i*71.3)%(v.h*.6));X.globalAlpha=.3+.3*Math.sin(T*2+i);X.fillStyle='#fff';X.beginPath();X.arc(x,y,1.5+(i%3),0,7);X.fill()}X.restore()}
// ---- загрузка ----
SC.load={draw(){const v=vis();X.fillStyle='#1a1530';X.fillRect(v.x0,v.y0,v.w,v.h);const k=NIMG?NLOAD/NIMG:0;
  rr(640-260,420,520,34,17);X.fillStyle='#0e0a20';X.fill();X.strokeStyle='#d8c2ff';X.lineWidth=4;X.stroke();rr(640-254,426,Math.max(22,508*k),22,11);X.fillStyle='#ffe08a';X.fill();
  X.save();X.translate(640,300);X.rotate(Math.sin(T*2)*.3);if(okI(IM.moonfrag))X.drawImage(IM.moonfrag,-70,-70,140,140);X.restore();
  if(NLOAD>=NIMG&&T>.4&&document.fonts.status!=='loading')go('title')}};
// ---- титул ----
SC.title={enter(){music('title')},
 draw(){const v=vis();const g=bgG('title',690);stars(0);const gy=Math.min(690,v.y0+v.h-10);const hh=Math.min(v.h*.55,gy-safeT()-170);
  const zx=Math.min(1040,safeR()-hh*.25);hero('z_idle',zx,gy,hh,{seed:3});const ph=hh*.45;const jp=T%2.8,jumping=jp<.6;const hop=jumping?Math.sin(jp/.6*Math.PI)*ph*.3:0;hero(jumping?'p_jump':'p_wave',zx-hh*.55,gy-hop,ph,{seed:7,air:hop>1,shY:gy});
  X.save();X.globalCompositeOperation='lighter';const r=60+8*Math.sin(T*2);const gg=X.createRadialGradient(640,safeT()+96,10,640,safeT()+96,420);gg.addColorStop(0,'rgba(120,90,220,.35)');gg.addColorStop(1,'rgba(0,0,0,0)');X.fillStyle=gg;X.fillRect(v.x0,v.y0,v.w,v.h*.5);X.restore();
  textIn('Злата и Расколотая Луна',640,safeT()+92,Math.min(980,v.w*.7),140,108,'#fff3d6',{f:FONT,st:'#1a0e40',lw:13,id:'logo'});
  textIn('уравнения «часть — целое»',640,safeT()+188,Math.min(640,v.w*.46),56,44,'#ffe28a',{f:FONT,st:'#1a0e40',lw:7,id:'logo2'})},
 ui(){boardBtn('play',640,safeB()-90,360,'Играть',()=>{ac();SFX.click();goFS&&goFS();if(!SV.intro)go('cs','intro');else go('map')},{pulse:1})}};
// ---- кат-сцены: кадры с камерой, герои стоят на земле фона, реплики не обрываются ----
const A=(n,x,gy,h,o)=>Object.assign({n,x,gy,h},o||{});
const CS={
 intro:{music:'cs',shots:[
  {bg:'fin',k:'i1',z:[1,1.12],f:[[640,300],[640,240]],fx:'glow',gx:640,gy0:150},
  {bg:'cs_crack',k:'i2',z:[1,1.25],f:[[640,360],[900,250]],fx:'crack',at:1.2},
  {bg:'cs_crack',k:'i3',z:[1.7,1.85],f:[[900,330],[900,300]],fx:'evil'},
  {bg:'map',k:'i4',z:[1.05,1.25],f:[[640,400],[260,520]],fx:'shards',actors:[A('p_scared',240,585,130,{shake:1})]},
  {bg:'c1',k:'i5',z:[1.12,1.02],f:[[700,420],[640,400]],actors:[A('l_weak',900,640,440,{talk:'l_talk',who:'luna'}),A('z_idle',420,640,360,{talk:'z_talk',who:'zlata'}),A('p_scared',560,640,160)],fx:'ribbon'},
  {bg:'c1',k:'i6',z:[1.02,1.15],f:[[640,410],[820,410]],actors:[A('l_weak',900,640,440,{talk:'l_talk',who:'luna'}),A('z_idle',420,640,360,{talk:'z_talk',who:'zlata'}),A('p_scared',560,640,160)]},
  {bg:'c1',k:'i7',z:[1.2,1.32],f:[[460,440],[440,430]],actors:[A('l_idle',900,640,440),A('z_cheer',420,640,360,{talk:'z_talk',who:'zlata'}),A('p_scared',560,640,160)]},
  {bg:'c1',k:'i8',z:[1.5,1.6],f:[[560,500],[560,505]],actors:[A('l_idle',900,640,440),A('z_idle',420,640,360),A('p_scared',570,640,170,{talk:'p_wave',who:'pazl'})]}],
  next(){SV.intro=1;save();go('map')}},
 fall:{music:'cs',shots:[
  {bg:'cs_fall',k:'f_1',z:[1,1.2],f:[[900,220],[700,330]],fx:'drift'},
  {bg:'cs_fall',k:'f_2',z:[1.25,1.5],f:[[600,360],[545,370]],fx:'drift'},
  {bg:'boss',k:'f_3',z:[1.35,1.2],f:[[1000,420],[900,415]],actors:[A('r_proud',1010,620,410,{who:'rask'}),A('z_idle',330,620,330),A('p_scared',470,620,150)],fx:'evil'},
  {bg:'boss',k:'f_4',z:[1.1,1.3],f:[[700,420],[880,420]],actors:[A('r_proud',1010,620,410,{heart:1}),A('z_idle',330,620,330),A('p_scared',470,620,150,{talk:'p_wave',who:'pazl'})]}],
  next(){go('map')}},
 heart:{music:'cs',shots:[
  {bg:'cs_heart',k:'h_1',z:[1.1,1.3],f:[[640,380],[780,360]],fx:'glow',gx:500,gy0:375},
  {bg:'cs_heart',k:'h_2',z:[1.3,1.55],f:[[600,380],[480,370]],fx:'glow',gx:500,gy0:375},
  {bg:'cs_heart',k:'h_3',z:[1.4,1.05],f:[[640,150],[640,330]],fx:'glow',gx:640,gy0:100}],
  next(){go('play',7)}},
 whole:{music:'win',shots:[
  {bg:'cs_whole',k:'w_1',z:[1.3,1.1],f:[[660,200],[640,330]],fx:'lanterns'},
  {bg:'cs_whole',k:'w_2',z:[1.4,1.55],f:[[560,400],[560,380]],fx:'lanterns'},
  {bg:'cs_whole',k:'w_3',z:[1.55,1.7],f:[[640,380],[640,360]],fx:'lanterns'},
  {bg:'cs_whole',k:'w_4',z:[1.5,1.65],f:[[1000,470],[1020,480]],fx:'lanterns'},
  {bg:'cs_whole',k:'w_5',z:[1.15,1],f:[[800,400],[640,360]],fx:'lanterns'}],
  next(){go('fin')}}};
SC.cs={enter(id){const c=CS[id];const st=this.st={id,c,i:0,t0:T,crack:-1,dur:3};music(c.music||'cs');if(id==='whole'||id==='heart')G.kind=true;if(id==='whole')G.heartBack=G.heartBack||T;
  run(async()=>{await wait(350);for(let i=0;i<c.shots.length;i++){const s=c.shots[i];st.i=i;st.t0=T;st.dur=lineDur(s.k);if(s.fx==='crack')setTimeout(()=>{if(this.st===st){st.crack=T;SFX.crack();SFX.quake&&SFX.quake();addShake(1);FX.flash=.8;FX.flashC='#e8d0ff';vib([60,40,120])}},(s.at||1)*1000);
    if(s.fx==='evil'&&i>0)SFX.roar&&SFX.roar();await say(s.k);await wait(350)}c.next()})},
 draw(){const st=this.st,s=st.c.shots[st.i];const k=clamp((T-st.t0)/Math.max(2,st.dur),0,1),e=ease(k);const sh=FX.shake*14;FX.shake=Math.max(0,FX.shake-DT*1.2);
  const z=lerp(s.z[0],s.z[1],e),fx=lerp(s.f[0][0],s.f[1][0],e),fy=lerp(s.f[0][1],s.f[1][1],e);const v=vis();X.fillStyle='#000';X.fillRect(v.x0,v.y0,v.w,v.h);
  const c=camBg(s.bg,z,fx,fy,(Math.random()-.5)*sh,(Math.random()-.5)*sh);
  csFx(s,c,st);
  if(st.id==='whole'){const k=1;if(k>0)glowHeart(c.x0+1021*c.s,c.y0+524*c.s,50*c.s*(.4+.6*k),k)}
  for(const a of s.actors||[]){const tk=talk&&a.who&&talk.who===a.who;const n=tk&&a.talk?a.talk:a.n;let x=c.x0+a.x*c.s,y=c.y0+a.gy*c.s;if(a.shake)x+=Math.sin(T*30)*3;hero(n,x,y,a.h*c.s,{seed:a.x%9,ph:a.x});
   if(a.heart){X.save();X.globalCompositeOperation='lighter';const hx=x-a.h*c.s*.02,hy=y-a.h*c.s*.66;const g=X.createRadialGradient(hx,hy,2,hx,hy,60*c.s);g.addColorStop(0,'rgba(255,220,120,.95)');g.addColorStop(1,'rgba(255,160,40,0)');X.fillStyle=g;X.beginPath();X.arc(hx,hy,(50+8*Math.sin(T*6))*c.s,0,7);X.fill();X.restore()}}
  // киношные полосы-виньетка (не чёрные поля: рисунок под ними)
  const vg=X.createRadialGradient(640,360,Math.min(v.w,v.h)*.35,640,360,Math.max(v.w,v.h)*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,20,.45)');X.fillStyle=vg;X.fillRect(v.x0,v.y0,v.w,v.h);
  if(st.i===0){const fi=clamp((T-st.t0)/.6,0,1);if(fi<1){X.fillStyle=`rgba(0,0,0,${1-fi})`;X.fillRect(v.x0,v.y0,v.w,v.h)}}
  if(FX.flash>0){X.globalAlpha=clamp(FX.flash,0,1);X.fillStyle=FX.flashC;X.fillRect(v.x0,v.y0,v.w,v.h);X.globalAlpha=1;FX.flash-=DT*1.6}
  drawTalk();drawParticlesIf()},
 ui(){const st=this.st;boardBtn('next',safeR()-120,safeB()-50,220,'Дальше',()=>{SFX.click();skipTalk&&skipTalk()},{size:44});
  roundBtn('skip',safeL()+44,safeB()-44,76,r=>{X.fillStyle='#fff6dc';for(const d of [-.35,.05]){X.beginPath();X.moveTo(r*d,-r*.38);X.lineTo(r*(d+.4),0);X.lineTo(r*d,r*.38);X.fill()}},()=>{SFX.click();hardStop();st.c.next()},{c1:'#7a5ad0',c2:'#3a2a7a'});
  textIn('Пропустить',safeL()+44+44+70,safeB()-44,130,34,26,'#fff6dc',{f:BODY,st:'#1a0e30',lw:5,id:'skiplab'})}};
function lineDur(k){const v=typeof VOICE!=='undefined'&&VOICE[k];if(v&&v[1])return v[1];const l=LINES[k];return l?Math.max(2,l.t.length*.07):3}
function csFx(s,c,st){const v=vis();
 if(s.fx==='glow'){const x=c.x0+s.gx*c.s,y=c.y0+s.gy0*c.s;X.save();X.globalCompositeOperation='lighter';const g=X.createRadialGradient(x,y,4,x,y,180*c.s);g.addColorStop(0,`rgba(255,230,170,${.35+.15*Math.sin(T*3)})`);g.addColorStop(1,'rgba(255,200,120,0)');X.fillStyle=g;X.fillRect(x-200*c.s,y-200*c.s,400*c.s,400*c.s);X.restore()}
 if(s.fx==='crack'&&st.crack>0){const k=clamp((T-st.crack)/.5,0,1);const cx=c.x0+925*c.s,cy=c.y0+150*c.s;X.save();X.strokeStyle='rgba(240,220,255,.95)';X.lineWidth=5;X.shadowColor='#b080ff';X.shadowBlur=20;
  for(let i=0;i<7;i++){let a=i/7*Math.PI*2+.3,x=cx,y=cy;X.beginPath();X.moveTo(x,y);for(let j=0;j<5*k;j++){a+=Math.sin(i*7+j*3)*.5;x+=Math.cos(a)*30*c.s;y+=Math.sin(a)*30*c.s;X.lineTo(x,y)}X.stroke()}X.restore();
  if(Math.random()<.3)burst(cx+rnd(-80,80),cy+rnd(-60,60),3,'spark',280,.8)}
 if(s.fx==='evil'){X.save();X.globalCompositeOperation='lighter';X.fillStyle=`rgba(120,40,200,${.10+.06*Math.sin(T*5)})`;X.fillRect(v.x0,v.y0,v.w,v.h);X.restore();if(Math.random()<.2)burst(rnd(v.x0,v.x0+v.w),v.y0+v.h,2,'spark',280,.6)}
 if(s.fx==='shards'||s.fx==='drift'){for(let i=0;i<14;i++){const t=(T*.12+i*.071)%1;const x=v.x0+((i*0.37)%1)*v.w+Math.sin(T+i)*30,y=s.fx==='drift'?v.y0+t*v.h:v.y0+v.h-t*v.h;spr('shard',x,y,26+(i%4)*8,{rot:T+i,a:.75})}}
 if(s.fx==='lanterns'){if(Math.random()<.08)burst(rnd(v.x0,v.x0+v.w),v.y0+v.h,6,'conf')}
 if(s.fx==='ribbon'){X.save();X.globalCompositeOperation='lighter';X.strokeStyle='rgba(180,220,255,.6)';X.lineWidth=6*c.s;X.beginPath();const ax=c.x0+820*c.s,ay=c.y0+380*c.s,bx=c.x0+470*c.s,by=c.y0+400*c.s;X.moveTo(ax,ay);X.quadraticCurveTo((ax+bx)/2,ay-120*c.s+Math.sin(T*3)*20,bx,by);X.stroke();X.restore()}}
// ---- карта ----
const MAPN=[[230,575],[525,470],[650,250],[930,530],[980,250],[1110,150]];const BAKE=[100,420];
const isOpen=i=>i===0||!!SV.done[i-1];
SC.map={enter(){music('title');run(async()=>{await wait(350);if(NSH()>=5&&!SV.bakeSaid){SV.bakeSaid=1;save();await say('m_bonus')}else if(SV.done[4]&&!SV.done[5])await say('m_boss');else await say('m1')})},
 draw(){bgCover('map');let cur=SV.done.slice(0,6).findIndex(d=>!d);if(cur<0)cur=5;
  for(let i=0;i<5;i++){if(!SV.done[i])continue;const [ax,ay]=bgXY(...MAPN[i]),[bx,by]=bgXY(...MAPN[i+1]);X.save();X.setLineDash([12,10]);X.strokeStyle='rgba(255,236,160,.8)';X.lineWidth=6;X.beginPath();X.moveTo(ax,ay-50);X.lineTo(bx,by-50);X.stroke();X.restore()}
  MAPN.forEach((n,i)=>{const [x,y]=bgXY(n[0],n[1]);const open=isOpen(i),done=SV.done[i];const d=i===5?108:92,ny=y+Math.sin(T*2+i)*4-50;
   mapNode('n'+i,x,ny,d,i===5?'★':String(i+1),open,()=>{if(!open){sayNow('m_lock');SFX.bad();return}SFX.click();go('play',i)},open&&!done);
   if(done)spr('medal',x+d*.45,ny-d*.38,d*.5,{rot:Math.sin(T*2+i)*.1});
   if(i<5&&SV.shards[i])spr('shard',x-d*.48,ny-d*.36,d*.42,{rot:Math.sin(T+i)*.3});
   const pw=i===5?230:210;plate(LVNAME[i],clamp(x,safeL()+pw/2+6,safeR()-pw/2-6),clamp(ny+d/2+26,0,safeB()-26),pw,44,28,{id:'mapname'})});
  {const [x,y]=bgXY(...MAPN[cur]);const side=x>900?-1:1;hero('z_idle',x+side*88,y+24,140,{seed:2});hero('p_idle',x+side*140,y+24,70,{seed:7,ph:1})}
  if(NSH()>=5){const [x,y]=bgXY(...BAKE);UI.push({id:'bake',x,y:y-40,w:150,h:150,fn:()=>{SFX.click();go('play',6)}});const k=1+Math.sin(T*4)*.05;spr('pie',x,y-50,110*k,{});plate('Пекарня',x,y+22,160,42,28,{id:'bakebtn'})}
  const x0=safeR()-230,y0=safeB()-40;X.fillStyle='rgba(30,22,64,.85)';rr(x0-32,y0-32,262,64,32);X.fill();X.strokeStyle='#d8c2ff';X.lineWidth=3;X.stroke();
  for(let i=0;i<5;i++)spr('shard',x0+i*49,y0,SV.shards[i]?50:36,{a:SV.shards[i]?1:.35,rot:SV.shards[i]?Math.sin(T+i)*.3:0});
  if(SV.fin)spr('medal',safeR()-40,y0-80,80,{rot:Math.sin(T*1.5)*.08});
  drawTalk()},
 ui(){roundBtn('home',safeL()+44,safeT()+44,80,r=>houseIcon(r),()=>{SFX.click();hardStop();go('title')})}};
function mapNode(id,x,y,d,t,open,fn,pulse){UI.push({id,x,y,w:d,h:d,fn});const k=1+(pulse?Math.sin(T*5)*.06:0);X.save();X.translate(x,y);X.scale(k,k);
 const g=X.createRadialGradient(0,-d*.15,d*.1,0,0,d*.5);g.addColorStop(0,open?'#b49aff':'#7a7488');g.addColorStop(1,open?'#4a2a9a':'#3a3448');X.fillStyle=g;X.strokeStyle=open?'#fff0b8':'#a8a0b0';X.lineWidth=6;X.beginPath();X.arc(0,0,d/2,0,7);X.fill();X.stroke();
 if(pulse){X.strokeStyle='rgba(255,240,170,'+(.45+.3*Math.sin(T*5))+')';X.lineWidth=5;X.beginPath();X.arc(0,0,d/2+10,0,7);X.stroke()}X.restore();
 if(open)txt(t,x,y+3,d*.6,'#fff6dc',{f:NUM,st:'#1a0e40',lw:8,box:[x-d*.45,y-d*.45,x+d*.45,y+d*.45],id:'node',kind:'num'});else lockIcon(x,y,d*.36)}
// ---- игра ----
SC.play={world:1,enter(i){FX.shake=0;FX.slow=1;FX.flash=0;LEVELS[i]();music(LV.music||'level');G.acc=0;LV.titleT=T;LV.idxArg=i},
 update(dt){const L=LV;if(!L)return;
  TAPS=TAPS.filter(t=>{if(shardHit(t.x,t.y,70)){const p=PTR.get(t.id);if(p)p.own='ui';gotShard();return false}return true});
  barsInput();G.acc+=dt*FX.slow;let n=0;while(G.acc>=1/60&&n<4){barsStep(1/60);G.acc-=1/60;n++}if(n>=4)G.acc=0;if(!LV)return;
  eventsStep();shardStep(dt);guardStep(dt);walkStep(dt);flyStep();L.step&&L.step(dt);
  FX.slow=Math.min(1,FX.slow+dt*1.4);FX.shake=Math.max(0,FX.shake-dt*2.2)},
 draw(){const L=LV;const sh=FX.shake*12,shx=(Math.random()-.5)*sh,shy=(Math.random()-.5)*sh;X.setTransform(S*DPR,0,0,S*DPR,(OX+shx*S)*DPR,(OY+shy*S)*DPR);
  const v=vis();if(L.idx===4||L.bgCover)bgCover(L.bg,Math.sin(T*.2)*0,0,1);else bgG(L.bg,L.gy);
  if(L.idx===4)skyFx(L);
  if(L.drawBack)L.drawBack();
  if(L.rk)rDraw(L);
  if(L.rask)raskPeek(L);
  if(L.cradle)drawCradle(L.cradle);
  TAGQ=[];TAGOB=[];X.globalAlpha=L.gA;for(const s of L.sockets)drawSocket(s);X.globalAlpha=1;
  for(const g of L.guards){X.globalAlpha=L.gA;if(!g.noGolem)drawGolem(g,{h:L.idx===4?200:250});drawGuard(g);X.globalAlpha=1}
  if(L.idx===4){const y=430+Math.sin(T*1.3)*10+(L.whaleHit>T?Math.sin(T*40)*6:0),wh=300,ww=wh*aspect('whale'),wx=Math.max(270,safeL()+250),wb=y+170;spr('whale',wx,wb,wh,{ax:.5,ay:1});
   // спина кита (замер по рисунку: 23.5% высоты от верха в районе 55..88% ширины) — герои стоят на ней
   L.gy=wb-wh+wh*.235+4;L.zx=wx-ww/2+ww*.63;L.wx=wx;L.wy=wb-wh*.5;G.surf.push([wx-ww/2+ww*.55,wx-ww/2+ww*.9,L.gy])}
  drawHeroes(L);if(L.drawFront)L.drawFront();
  drawPieces();drawFly();drawRibbon(L);drawTrails();drawShard();drawParticlesIf();flushTags();
  drawCount(L);drawGuide(L);
  if(FX.flash>0){X.globalAlpha=clamp(FX.flash,0,1);X.fillStyle=FX.flashC;X.fillRect(v.x0,v.y0,v.w,v.h);X.globalAlpha=1;FX.flash-=DT*1.8}},
 hud(){drawHUD()}};
function skyFx(L){const v=vis();X.save();X.strokeStyle='rgba(255,255,255,.35)';X.lineWidth=3;for(let i=0;i<12;i++){const x=v.x0+v.w-((T*700+i*233)%(v.w+300)),y=v.y0+((i*97)%v.h);X.beginPath();X.moveTo(x,y);X.lineTo(x+90+i*5,y);X.stroke()}X.restore();
 for(const s of L.sockets){X.save();X.fillStyle='rgba(255,255,255,.75)';const w=s.n*BS+60;X.beginPath();X.ellipse(s.cx,s.cy+52,w/2,26,0,0,7);X.fill();X.restore()}}
function raskPeek(L){const r=L.rask;const k=r.out?1-clamp((T-r.out)/.6,0,1):ease(clamp((T-r.t0)/.6,0,1));const x=lerp(safeR()+200,Math.min(1080,safeR()-120),k);
 X.save();X.globalAlpha=k;X.globalCompositeOperation='lighter';X.fillStyle='rgba(150,60,255,.25)';X.beginPath();X.arc(x,L.gy-200,220,0,7);X.fill();X.restore();X.globalAlpha=k;hero(talk&&talk.who==='rask'?'r_attack':'r_proud',x,L.gy,400,{flip:false});X.globalAlpha=1}
// ---- HUD ----
const PORT={zlata:['z_talk',120,5,150],pazl:['p_wave',80,20,230],luna:['l_talk',90,10,150],rask:['r_proud',70,0,150],raskk:['r_kind',70,0,150]};
function drawHUD(){const L=LV;const busy=!!talk;const t=L.task;
 const titleOn=T-L.titleT<3&&!busy;const showB=t&&t.vals&&!busy&&!titleOn&&(!t.solved||(L.hudFlash&&T-L.hudFlash<1.6));
 if(showB)drawTaskBoard(t.vals,640,safeT()+44,!!t.solved,t.ans,t.bake?null:t.cap||defCap(t.vals));
 if(L.checks&&L.checks.length){const n=L.checks.length;L.checks.forEach((c,i)=>{const y=(busy?safeT()+170:safeT()+130)+i*70;plate('✓  '+c,640,y,Math.min(470,vis().w*.5),60,42,{f:NUM,col:'#d8ffb0',bd:'#9fe870',id:'chk'})})}
 if(L.idx<5){const x0=safeR()-58,y0=safeT()+40;X.fillStyle='rgba(30,22,64,.82)';rr(x0-62,y0-30,120,60,30);X.fill();X.strokeStyle='#d8c2ff';X.lineWidth=3;X.stroke();spr('shard',x0-30,y0,46,{rot:Math.sin(T)*.3});
  txt(NSH()+'/5',x0+16,y0+2,32,'#ffe28a',{f:NUM,st:'#1a0e30',lw:6,box:[x0-10,y0-30,x0+58,y0+30],id:'shards',kind:'num'})}
 if(L.pie&&L.tEnd){const left=Math.max(0,Math.ceil(L.tEnd-T));const x0=safeR()-90,y0=safeT()+40;X.fillStyle='rgba(30,22,64,.82)';rr(x0-80,y0-30,160,60,30);X.fill();X.strokeStyle='#ffd27a';X.lineWidth=3;X.stroke();
  spr('pie',x0-48,y0,46,{});txt(String(L.score),x0-6,y0+2,34,'#fff',{f:NUM,st:'#1a0e30',lw:6,box:[x0-24,y0-28,x0+14,y0+28],id:'score',kind:'num'});txt(left+'с',x0+48,y0+2,30,left<10?'#ff9a7a':'#ffe28a',{f:NUM,st:'#1a0e30',lw:6,box:[x0+20,y0-28,x0+78,y0+28],id:'timer',kind:'num'})}
 const tk=T-L.titleT;if(tk<3&&!busy){X.globalAlpha=clamp(Math.min(tk*3,(3-tk)*2),0,1);plate((L.idx<5?(L.idx+1)+'. ':'')+(LV.idxArg===7?'Сердце Луны':LVNAME[L.idx]),640,safeT()+44,520,70,46,{id:'lvtitle'});X.globalAlpha=1}
 drawTalk();
 roundBtn('home',safeL()+42,safeT()+42,76,r=>houseIcon(r),()=>{SFX.click();hardStop();go('map')});
 if(busy&&L.cur<0||busy&&!L.task)boardBtn('next',safeR()-110,safeB()-46,200,'Дальше',()=>{SFX.click();skipTalk&&skipTalk()},{size:40})}
// подпись под табличкой: что значит «?»
function defCap(v){if(!v||!v.includes('x'))return null;if(v[1]==='−'&&v[0]==='x')return'x — целое спряталось';if(v[1]==='−')return'x — сколько убрали';return'x — сколько не хватает'}
// картинка «целое и части»: сверху целое, снизу две части
function pwOf(v){if(v[1]==='+'&&v[3]==='=')return{W:v[4],a:v[0],b:v[2]};if(v[1]==='='&&v[3]==='+')return{W:v[0],a:v[2],b:v[4]};
 if(v[1]==='−'&&v[3]==='=')return{W:v[0],a:v[4],b:v[2],rm:1};return null}
function pwBox(x,y,w,h,val,unk,hue,rm){X.save();if(rm)X.globalAlpha*=.6;rr(x,y,w,h,Math.min(12,h/2));X.fillStyle=unk?'rgba(255,224,102,.22)':`hsl(${hue},65%,58%)`;X.fill();
 if(unk||rm){X.setLineDash([6,4]);X.strokeStyle=unk?'#ffe066':'#fff';X.lineWidth=3;X.stroke();X.setLineDash([])}else{X.strokeStyle='rgba(20,10,40,.7)';X.lineWidth=2.5;X.stroke()}
 txt(unk?'x':String(val),x+w/2,y+h/2+1,h*.86,unk?'#ffe066':'#fff',{f:NUM,st:'#1a0f3a',lw:5,box:[x,y,x+w,y+h],id:'pw',kind:'num'});X.restore()}
function drawTaskBoard(vals,cx,cy,solved,ans,cap){const n=vals.length;const ts=Math.min(68,(Math.min(760,vis().w-420))/n-10);const gap=10;const D=pwOf(vals);const dw=D?210:0;
 const w=n*ts+(n-1)*gap+30+(D?dw+18:0),h=ts+22;X.save();
 X.fillStyle=solved?'rgba(40,80,20,.92)':'rgba(30,22,64,.9)';rr(cx-w/2,cy-h/2,w,h,18);X.fill();X.strokeStyle=solved?'#b8ff7a':'#d8c2ff';X.lineWidth=4;X.stroke();
 if(D){const x0=cx-w/2+14,rh=(h-24)/2,y0=cy-h/2+9,nv=z=>z==='x'?ans:z;const W=nv(D.W),A=nv(D.a),B=nv(D.b);const uk=z=>z==='x'&&!solved;
  pwBox(x0,y0,dw,rh,W,uk(D.W),44);const wa=clamp(dw*A/(A+B),48,dw-48);pwBox(x0,y0+rh+6,wa-3,rh,A,uk(D.a),208);pwBox(x0+wa+3,y0+rh+6,dw-wa-3,rh,B,uk(D.b),D.rm?300:330,D.rm);
  X.strokeStyle='rgba(216,194,255,.5)';X.lineWidth=2;X.beginPath();X.moveTo(x0+dw+9,cy-h/2+8);X.lineTo(x0+dw+9,cy+h/2-8);X.stroke()}
 const tx0=cx-w/2+15+(D?dw+18:0);
 for(let i=0;i<n;i++){let v=vals[i];const x=tx0+ts/2+i*(ts+gap),q=v==='x';if(q&&solved&&ans!=null)v=ans;X.fillStyle=q?(solved?'#d8ffb0':'rgba(255,224,102,.25)'):'#fffaf0';rr(x-ts/2,cy-ts/2,ts,ts,ts*.18);X.fill();if(q&&!solved){X.setLineDash([5,4]);X.strokeStyle='#ffe066';X.lineWidth=3;X.stroke();X.setLineDash([])}
  const col=q&&!solved?'#ffe066':'#1d1030',stc=q&&!solved?'#2a1206':'#fff';
  if(typeof v==='number'||v==='x')txt(String(v),x,cy+2,ts*.82,col,{f:NUM,st:stc,lw:5,box:[x-ts/2,cy-ts/2,x+ts/2,cy+ts/2],id:'board',kind:'num'});else valDraw(v,x,cy,ts,{col,st:stc,box:[x-ts/2,cy-ts/2,x+ts/2,cy+ts/2],id:'board'})}X.restore();
 if(cap&&!solved){X.save();X.font=`30px ${BODY}`;const cw=Math.min(vis().w*.6,X.measureText(cap).width+60);X.restore();plate(cap,cx,cy+h/2+30,cw,46,30,{id:'cap'})}}
function drawTalk(){if(!talk)return;const v=vis();const l=LINES[talk.k];if(!l)return;const who=talk.who==='rask'&&G.kind?'raskk':talk.who;
 const bw=Math.min(920,v.w-2*110-20),bx=640,bh=118,by=safeT()+8+bh/2;const k=ease(clamp((T-talk.t0)/.18,0,1));X.save();X.globalAlpha=k;
 X.fillStyle='rgba(255,250,240,.96)';rr(bx-bw/2,by-bh/2,bw,bh,26);X.fill();X.lineWidth=4;X.strokeStyle=who.startsWith('rask')?'#7a4ab0':who==='luna'?'#c0a040':who==='pazl'?'#e89a2a':who==='zlata'?'#2a7ac0':'#6a5a8a';X.stroke();
 const P=PORT[who];const pr=bh*.42;const px=bx-bw/2+pr+14;
 if(P&&okI(IM[P[0]])){X.save();X.beginPath();X.arc(px,by,pr,0,7);X.fillStyle='#e8e0ff';X.fill();X.clip();X.drawImage((okI(IM[P[0]+'_b'])&&blinkK(13))?IM[P[0]+'_b']:IM[P[0]],P[1],P[2],P[3],P[3],px-pr,by-pr,pr*2,pr*2);X.restore();X.beginPath();X.arc(px,by,pr,0,7);X.lineWidth=3;X.stroke()}
 else{X.save();X.translate(px,by);X.rotate(Math.sin(T)*.2);if(okI(IM.moonfrag))X.drawImage(IM.moonfrag,-pr,-pr,pr*2,pr*2);X.restore()}
 const tx0=px+pr+16,tw=bx+bw/2-18-tx0;textIn(l.t,tx0+tw/2,by,tw,bh-20,36,'#1e1430',{f:BODY,st:0,id:'talk',min:18});X.restore()}
// ---- финал ----
SC.fin={enter(){music('win');G.kind=true;const st=this.st={med:-1};
  run(async()=>{await wait(500);st.med=T;SFX.fanfare();vib([30,60,30]);const v=vis();for(let i=0;i<6;i++)setTimeout(()=>burst(v.x0+v.w*(.1+i*.16),v.y0+50,45,'conf'),i*150);
   SV.done[5]=1;SV.fin=1;save();await say('w_6');st.end=T})},
 draw(){const v=vis();const st=this.st;bgG('fin',640);const gy=Math.min(640,v.y0+v.h-8);const hh=Math.min(v.h*.46,gy-safeT()-150);const cx=640;
  hero(talk&&talk.who==='luna'?'l_talk':'l_idle',cx-hh*1.25,gy,hh*1.1,{ph:1});hero('r_kind',cx+hh*1.15,gy,hh*1.15,{ph:2});
  hero(talk&&talk.who==='zlata'?'z_talk':'z_cheer',cx-hh*.3,gy,hh,{seed:4});const jp=T%3.4,jumping=jp<.55;const hop=jumping?Math.sin(jp/.55*Math.PI)*hh*.1:0;hero(jumping?'p_jump':'p_wave',cx+hh*.4,gy-hop,hh*.48,{seed:7,still:jumping,air:hop>1,shY:gy});
  if(st.med>0){const k=ease(clamp((T-st.med)/.8,0,1));const mh=Math.min(230,v.h*.33)*k;spr('medal',cx,safeT()+(talk?140:110)+mh/2+Math.sin(T*2)*5,mh,{rot:Math.sin(T*1.5)*.05});
   if(!talk)textIn('Мастер частей и целого',640,safeT()+52,Math.min(820,v.w*.62),84,66,'#ffe9a8',{f:FONT,st:'#1a0e40',lw:10,id:'mtitle'})}
  drawTalk();drawParticlesIf();if(Math.random()<.03&&st.med>0)burst(rnd(v.x0,v.x0+v.w),v.y0+30,20,'conf')},
 ui(){if(this.st.end&&!talk)boardBtn('tomap',safeR()-130,safeB()-56,250,'На карту',()=>{G.kind=false;go('map')},{pulse:1});else if(talk)boardBtn('next',safeR()-110,safeB()-46,200,'Дальше',()=>{SFX.click();skipTalk&&skipTalk()},{size:40})}};
// ---- поворот экрана ----
function drawRotate(){X.setTransform(DPR,0,0,DPR,0,0);const b=IM.bg_rotate;if(okI(b)){const s=Math.max(W/b.naturalWidth,H/b.naturalHeight);X.drawImage(b,(W-b.naturalWidth*s)/2,(H-b.naturalHeight*s)/2,b.naturalWidth*s,b.naturalHeight*s)}else{X.fillStyle='#1a1530';X.fillRect(0,0,W,H)}
 const w=Math.min(W*.86,520),h=Math.min(110,H*.13),x=W/2,y=H*.86;X.fillStyle='rgba(30,22,64,.9)';rr(x-w/2,y-h/2,w,h,22);X.fill();X.strokeStyle='#d8c2ff';X.lineWidth=4;X.stroke();
 textIn('Поверни телефон боком',x,y,w-40,h*.7,46,'#fff6dc',{f:FONT,st:'#1a0e30',lw:5,id:'rot'})}
// ---- главный цикл ----
let _last=performance.now();
function frame(now){requestAnimationFrame(frame);let dt=Math.min(.05,(now-_last)/1000);_last=now;DT=dt;G._fps.push(now);while(G._fps.length&&now-G._fps[0]>2000)G._fps.shift();T+=dt;
 G.surf=[];G.bgm=null;
 if(G.auditReq){AUD={t:[]};G.heroes=[]}
 try{
  if(PORTRAIT()){TAPS=[];drawRotate()}
  else{const sc=SC[G.scene];X.setTransform(S*DPR,0,0,S*DPR,OX*DPR,OY*DPR);
   TAPS=TAPS.filter(t=>{const b=hitUI(t.x,t.y);if(b){const p=PTR.get(t.id);if(p)p.own='ui';b.fn&&b.fn();return false}return true});
   if(SC[G.scene]!==sc){UI=[]}
   else{if(!sc.world)TAPS=[];
    sc.update&&sc.update(dt);musTick();UI=[];
    if(sc.world){if(LV){sc.draw();X.setTransform(S*DPR,0,0,S*DPR,OX*DPR,OY*DPR);sc.hud()}}
    else{sc.draw&&sc.draw();sc.ui&&sc.ui()}}}
 }catch(e){console.error(e)}
 if(AUD){G._aud=AUD;AUD=null;G.auditReq=0}}
requestAnimationFrame(frame);
// ---- тестовый стенд ----
G.btns=()=>UI.map(b=>({id:b.id,x:b.x,y:b.y,dis:!!b.dis}));
G.pg=(x,y)=>({x:x*S+OX,y:y*S+OY});
G.fps=()=>{const f=G._fps;return f.length>1?Math.round((f.length-1)*1000/(f[f.length-1]-f[0])):0};
window.__T={
 st(){const L=LV;const b={scene:G.scene,arg:G.arg,talk:talk&&talk.k,cs:G.scene==='cs'?SC.cs.st.i:null};if(!L)return b;
  return Object.assign(b,{idx:L.idx,cur:L.cur,task:L.task?{vals:L.task.vals,ans:L.task.ans,solved:!!L.task.solved}:null,tasks:L.tasks.map(t=>!!t.solved),won:L.won,score:L.score,shard:L.shard?{on:!!L.shard.on,x:L.shard.x,y:L.shard.y,got:!!L.shard.got}:null,mark:L.mark})},
 pieces(){return LV?LV.pieces.map(p=>{const q=pos(p);return{id:p.id,n:p.n,x:q.x,y:q.y,a:q.a,locked:p.locked,sock:!!p.sock,held:p.held!=null,guard:p.hist&&p.hist.guard,decoy:!!p.decoy}}):[]},
 socks(){return LV?LV.sockets.map(s=>{const r=sockRect(s);return Object.assign({cx:s.cx,cy:s.cy,n:s.n,fill:!!s.fill,need:s.need,temp:!!s.temp},r)}):[]},
 guards(){return LV?LV.guards.map(g=>({id:g.id,x:g.x,gy:g.gy,n:g.n,b:g.b,done:!!g.done})):[]},
 ends(id){const p=LV.pieces.find(p=>p.id===id);return p?ends(p):null},
 x(){const L=LV;if(!L)return null;return{bk:L.bk&&{x:L.bk.x,w:L.bk.w,stun:L.bk.stun>T},falling:L.falling.filter(f=>!f.dead).map(f=>{const q=pos(f);return{n:f.n,x:q.x,y:q.y,decoy:!!f.decoy}}),shards:L.shards.filter(d=>!d.dead).map(d=>({x:d.x,y:d.y})),
  guide:L.task&&L.task.guide&&!L.task.solved?L.task.guide(L):null,guideOn:guideOn(L),cnt:L.cnt?L.cnt.i:null,strong:L.strong,zx:L.zx,walkTo:L.walkTo,locks:L.locks,th:L.scale?L.scale.th:null,mist:L.mist,gy:L.gy}},
 css(x,y){return G.pg(x,y)},lv(){return LV},vis(){return vis()}};
go('load');
