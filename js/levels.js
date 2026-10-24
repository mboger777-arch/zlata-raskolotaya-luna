'use strict';
// ===== Главы 1–5 и пекарня: задания «часть–целое» на брусках-бусинах =====
const LVNAME=['Лунная кузница','Мост над Бездной','Звездопадные ворота','Стражи-осколыши','Погоня на ките','Башня Раскола','Лунная пекарня'];
const until=f=>(async()=>{while(!f())await wait(60)})();
async function fadeClear(){const L=LV;for(let i=1;i<=8;i++){for(const p of L.pieces)p.a=1-i/8;for(const s of L.sockets)s.a=1-i/8;L.gA=1-i/8;await wait(45)}
 for(const p of L.pieces.slice())killPiece(p);L.sockets.length=0;L.guards.length=0;L.ptr.clear();L.lastTap=null;L.gA=1;L.guide=null;L.mark=false;L.golems=[]}
function setGrounds(gs){const L=LV;for(const g of L.grounds)if(g.b)L.world.destroyBody(g.b);L.grounds=gs;for(const g of gs)mkGround(g)}
// общий каркас уровня
function mkLevel(idx,o){const L=newWorld(Object.assign({idx,bg:'c'+(idx+1),music:'level',tasks:[],cur:-1,task:null,won:false,checks:null,gA:1,golems:[],zx:150,zh:330,px:280,ph:150,shard:null,hintT:{},act:T},o));
 L.onBlade=(ax,ay,bx,by)=>shardBlade(ax,ay,bx,by);return L}
function sock(o){return addSocket(o)}
const mkChk=(a,b)=>[a,b];
async function runTasks(){const L=LV;
 for(let i=0;i<L.tasks.length;i++){const t=L.tasks[i];L.cur=i;L.task=t;t.solved=false;L.mist=0;L.act=T;L.taskT=T;
  t.setup(L);if(i===L.shardTask)L.shardOn=true;
  await say(t.t);L.act=T;
  await until(()=>t.done(L));
  t.solved=true;L.hudFlash=T;SFX.chime();setPose('z_cheer',3);L.checks=t.chk;L.checkT=T;stopHint();
  for(const g of L.guards)g.done=true;
  await say(t.k);await wait(400);L.checks=null;
  if(t.after)await t.after(L);
  if(i<L.tasks.length-1)await fadeClear()}
 L.shardOn=false}
function stopHint(){}
async function winLevel(next){const L=LV;if(L.won)return;L.won=true;L.task=null;SV.done[L.idx]=1;save();music('win');SFX.fanfare();vib([30,50,30,50,60]);setPose('z_cheer',9);
 const v=vis();for(let i=0;i<5;i++)setTimeout(()=>{if(LV===L)burst(v.x0+v.w*(.15+i*.17),v.y0+60,40,'conf')},i*180);
 await say('g_win');await wait(700);if(next)next();else go('map')}
// ---- осколок памяти: пролетает по небу, ловится лентой или тапом ----
function shardStep(dt){const L=LV;if(!L||!L.shardOn||SV.shards[L.idx]||L.idx>4){if(L&&L.shard&&!L.shard.got)L.shard=null;return}
 if(!L.shard){L.shard={t0:T+2.5,got:0}}const s=L.shard;if(s.got)return;const v=vis();const k=(T-s.t0)/6;
 if(k<0){s.on=false;return}if(k>1){L.shard={t0:T+8,got:0};return}
 s.on=true;s.x=v.x0-60+(v.w+120)*k;s.y=(L.zeroG?160:150)+Math.sin(k*Math.PI*2)*50}
function shardHit(x,y,r){const s=LV&&LV.shard;return s&&s.on&&!s.got&&Math.hypot(x-s.x,y-s.y)<r}
function shardBlade(ax,ay,bx,by){const s=LV.shard;if(!s||!s.on||s.got)return;const dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy||1;const t=clamp(((s.x-ax)*dx+(s.y-ay)*dy)/l2,0,1);if(Math.hypot(ax+dx*t-s.x,ay+dy*t-s.y)<56)gotShard()}
function gotShard(){const L=LV,s=L.shard;s.got=T;s.gx=s.x;s.gy=s.y;SV.shards[L.idx]=1;save();SFX.chime();vib([20,40,20]);burst(s.x,s.y,40,'spark',280,1);FX.flash=.4;FX.flashC='#e8d8ff';FX.slow=.2;
 sayQ('g_shard');sayQ('s'+NSH())}
function drawShard(){const L=LV,s=L.shard;if(!s)return;
 if(s.got){const k=clamp((T-s.got)/1,0,1);if(k>=1)return;const v=vis();const tx=safeR()-150,ty=safeT()+40;spr('shard',lerp(s.gx,tx,ease(k)),lerp(s.gy,ty,ease(k))-Math.sin(k*Math.PI)*80,90*(1-k*.5),{rot:T*6});return}
 if(!s.on)return;X.save();X.globalCompositeOperation='lighter';const g=X.createRadialGradient(s.x,s.y,4,s.x,s.y,80);g.addColorStop(0,'rgba(230,200,255,.8)');g.addColorStop(1,'rgba(160,120,255,0)');X.fillStyle=g;X.beginPath();X.arc(s.x,s.y,80,0,7);X.fill();X.restore();
 for(let i=1;i<6;i++){X.globalAlpha=.25-i*.04;spr('shard',s.x-i*22,s.y-Math.cos((T-s.t0)/6*Math.PI*2)*i*6,56,{});}X.globalAlpha=1;spr('shard',s.x,s.y,76,{rot:Math.sin(T*5)*.3})}
// ---- подсказки по событиям и бездействию ----
function hint(k,gap){const L=LV;if(talk||L.won||!L.task||L.task.solved)return;const t=L.hintT[k]||0;if(T-t<(gap||9))return;L.hintT[k]=T;sayQ(k)}
function eventsStep(){const L=LV;for(const e of L.ev){L.act=T;
  if(e.e==='long')hint('g_long');else if(e.e==='short')hint('g_short');else if(e.e==='big')hint('g_big');
  else if(e.e==='fall')hint('g_fall',16);else if(e.e==='wrap')hint('c5_miss',25);
  else if(e.e==='gcut'&&e.g.b!=null&&e.g.n<e.g.b){L.mark=true;L.mist++;setPose('z_oops',.9);hint('c4_bad',6)}
  else if(e.e==='cut'||e.e==='fuse'){if(L.guide&&L.guide.until===e.e)L.guide=L.guide.next||null}
  if(L.mist>=2&&!L.undoSaid&&(e.e==='long'||e.e==='short')){L.undoSaid=1;L.hintT.g_long=T;L.hintT.g_short=T;setTimeout(()=>{if(LV===L)hint('g_undo',1)},2600)}}
 L.ev.length=0;
 if(L.task&&!L.task.solved&&!talk&&T-L.act>14){L.act=T;L.mark=true;if(L.task.idle)hint(L.task.idle,1);else hint(L.task.t,1)}}
// ---- герои у левого края ----
function zPose(L){if(L.pose&&T<L.pose.until)return L.pose.n;if(talk&&talk.who==='zlata')return'z_talk';if(L.won)return'z_cheer';return'z_idle'}
function pPose(L){if(T-L.pz.hop<.7)return'p_jump';if(L.pose&&T<L.pose.until&&L.pose.n==='z_oops')return'p_scared';if(talk&&talk.who==='pazl')return'p_wave';return'p_idle'}
function drawHeroes(L,o){o=o||{};const v=vis();const zx=Math.max(L.zx,safeL()+L.zh*.2),gy=L.gy+(o.dy||0);
 const pn=pPose(L);const hop=pn==='p_jump'?Math.sin(clamp((T-L.pz.hop)/.7,0,1)*Math.PI)*70:0;hero(pn,zx+L.zh*.42,gy-hop,L.ph*(pn==='p_jump'?1.08:1),{seed:7,ph:1.3});
 const zn=zPose(L);hero(zn,zx,gy,L.zh*(zn==='z_slash'||zn==='z_push'?1.02:1),{seed:3});L.hand={x:zx+L.zh*.28,y:gy-L.zh*.62}}
// лента от руки Златы к пальцу
function drawRibbon(L){if(!L.hand)return;for(const [,st] of L.ptr){if(st.kind!=='blade')continue;const p=st.pts[st.pts.length-1];if(!p)continue;const h=L.hand;X.save();X.globalCompositeOperation='lighter';X.strokeStyle='rgba(170,220,255,.45)';X.lineWidth=5;X.lineCap='round';X.beginPath();X.moveTo(h.x,h.y);X.quadraticCurveTo((h.x+p[0])/2,Math.min(h.y,p[1])-80+Math.sin(T*9)*20,p[0],p[1]);X.stroke();X.strokeStyle='rgba(255,255,255,.6)';X.lineWidth=2;X.stroke();X.restore()}}
// подсказка-рука
function drawGuide(L){const g=L.guide;if(!g||talk&&!g.always)return;const k=(T*.8)%1;
 if(g.type==='cut'){const y=lerp(g.y0,g.y1,ease(Math.min(1,k*1.4)));X.save();X.strokeStyle=`rgba(255,250,200,${.8*(1-k)})`;X.lineWidth=8;X.lineCap='round';X.beginPath();X.moveTo(g.x,g.y0);X.lineTo(g.x,y);X.stroke();X.restore();hand(g.x+14,y+30,1)}
 else{const f=typeof g.from==='function'?g.from():g.from,t=typeof g.to==='function'?g.to():g.to;if(!f||!t)return;const kk=ease(Math.min(1,k*1.3));hand(lerp(f.x,t.x,kk)+14,lerp(f.y,t.y,kk)+30,1);
  X.save();X.setLineDash([10,10]);X.strokeStyle='rgba(255,250,200,.55)';X.lineWidth=5;X.beginPath();X.moveTo(f.x,f.y);X.lineTo(t.x,t.y);X.stroke();X.restore()}}
// голем-страж рядом с колонной
function drawGolem(g,o){o=o||{};const happy=g.done;const x=g.x+(g.side||1)*95,h=o.h||250;const bob=happy?Math.abs(Math.sin(T*5))*10:0;
 hero(happy?'g_happy':'g_angry',x,g.gy-bob,h*(happy?1.02:1),{flip:(g.side||1)<0,ph:g.id});
 if(g.b!=null&&LV.mark&&!g.done){const y=g.gy-g.b*BS;X.save();X.setLineDash([12,9]);X.strokeStyle=`rgba(255,240,140,${.6+.3*Math.sin(T*5)})`;X.lineWidth=5;X.beginPath();X.moveTo(g.x-70,y);X.lineTo(g.x+70,y);X.stroke();X.restore();numTag(g.b,g.x-100,y,40,{col:'#fff3a0',id:'gmark'})}}
// ---- глава 1: Кузница (обучение) ----
const LEVELS=[];
LEVELS[0]=()=>{const L=mkLevel(0,{gy:600,grounds:[[-600,1900,600]],cradle:{x0:430,x1:950,y:330},recover:{x:690,y:200},shardTask:1});
 L.tasks=[
  {vals:[8,'=',3,'+',5],plain:1,t:'c1_t1',k:'c1_k1',chk:['8 = 3 + 5'],setup(){newPiece(8,690,300,{hue:HUE.gold});sock({cx:560,cy:470,n:3,showTotal:1});sock({cx:880,cy:470,n:5,showTotal:1});
    L.guide={type:'cut',x:690-240+180,y0:240,y1:400,until:'cut',next:{type:'drag',from:()=>{const p=L.pieces.find(p=>p.n===3&&!p.locked);return p&&pos(p)},to:{x:560,y:470},until:'lock'}}},
   done:()=>L.sockets.every(s=>s.fill)},
  {vals:[4,'+',2,'=',6],plain:1,t:'c1_t2',k:'c1_k2',chk:['4 + 2 = 6'],setup(){newPiece(4,560,300,{hue:HUE.teal});newPiece(2,860,300,{hue:HUE.pink});sock({cx:690,cy:470,n:6,showTotal:1});
    L.guide={type:'drag',from:()=>{const p=L.pieces.find(p=>p.n===2);return p&&ends(p)[0]},to:()=>{const p=L.pieces.find(p=>p.n===4);return p&&ends(p)[1]},until:'fuse'}},
   done:()=>L.sockets.every(s=>s.fill)}];
 L.drawBack=()=>{};
 run(async()=>{await wait(500);await say('c1_s');await runTasks();await winLevel()})};
// ---- глава 2: Мост над Бездной (a + x = b) ----
function bridgeTask(L,b,a,at,fog){const n=b,x0=at==='L'?440-a*BS:440;setGrounds([[-600,x0,430],[x0+n*BS,1900,430]]);
 sock({cx:x0+n*BS/2,cy:456,n,fixed:[{n:a,at,cols:Array(a).fill(HUE.blue)}],kind:'bridge',fog,dy:40});
 newPiece(b,700,236,{hue:HUE.gold});L.cradle.x0=700-b*BS/2-20;L.cradle.x1=700+b*BS/2+20;if(L.cradle.b)L.world.destroyBody(L.cradle.b);mkCradle(L.cradle)}
LEVELS[1]=()=>{const L=mkLevel(1,{gy:430,zx:150,zh:300,ph:140,grounds:[[-600,440,430],[920,1900,430]],cradle:{x0:440,x1:960,y:262},recover:{x:700,y:120},killY:900,shardTask:1});
 L.tasks=[
  {vals:['x','+',3,'=',8],ans:5,t:'c2_t1',k:'c2_k1',chk:['x = 8 − 3 = 5','5 + 3 = 8'],setup(){bridgeTask(L,8,3,'R')},done:()=>L.sockets[0].fill,after:()=>bridgeRun()},
  {vals:['x','+',4,'=',9],ans:5,t:'c2_t2',k:'c2_k2',chk:['x = 9 − 4 = 5','5 + 4 = 9'],setup(){bridgeTask(L,9,4,'R')},done:()=>L.sockets[0].fill,after:()=>bridgeRun()},
  {vals:[2,'+','x','=',9],ans:7,t:'c2_t3',k:'c2_k3',chk:['x = 9 − 2 = 7','2 + 7 = 9'],setup(){bridgeTask(L,9,2,'L',true)},done:()=>L.sockets[0].fill,after:()=>bridgeRun()}];
 run(async()=>{await wait(500);await say('c2_s');await say('c2_r');await runTasks();await winLevel()})};
async function bridgeRun(){const L=LV;const z0=L.zx;L.running=T;SFX.whoosh&&SFX.whoosh();for(let i=0;i<=24;i++){L.zx=lerp(z0,1500,ease(i/24));await wait(40)}L.running=0;L.zx=-300;await wait(150);for(let i=0;i<=12;i++){L.zx=lerp(-300,z0,ease(i/12));await wait(40)}L.zx=z0}
// ---- глава 3: Звездопадные ворота (x − a = b) ----
async function dropParts(ns){const L=LV;let x=480;for(const [n,h] of ns){if(L.task&&L.task.solved)return;newPiece(n,x+rnd(-30,30),-60,{hue:h,vx:rnd(-.6,.6),av:rnd(-.6,.6)});SFX.whoosh&&SFX.whoosh();x+=150;await wait(900)}}
function gateTask(L,parts){sock({cx:950,cy:350,n:parts[0][0]+parts[1][0],kind:'key',noDots:1,q:1,dy:50});run(()=>dropParts(parts))}
LEVELS[2]=()=>{const L=mkLevel(2,{gy:590,zx:150,zh:320,ph:150,grounds:[[-600,1900,590]],recover:{x:640,y:120},shardTask:1});
 L.tasks=[
  {vals:['x','−',2,'=',7],ans:9,t:'c3_t1',k:'c3_k1',chk:['x = 7 + 2 = 9','9 − 2 = 7'],setup(){gateTask(L,[[7,HUE.gold],[2,HUE.blue]])},done:()=>L.sockets[0].fill},
  {vals:['x','−',3,'=',4],ans:7,t:'c3_t2',k:'c3_k2',chk:['x = 4 + 3 = 7','7 − 3 = 4'],setup(){gateTask(L,[[4,HUE.gold],[3,HUE.blue],[2,HUE.pink]])},done:()=>L.sockets[0].fill},
  {vals:['x','−',5,'=',3],ans:8,t:'c3_t3',k:'c3_k3',chk:['x = 3 + 5 = 8','8 − 5 = 3'],setup(){gateTask(L,[[3,HUE.gold],[5,HUE.blue],[4,HUE.pink]])},done:()=>L.sockets[0].fill,
   after:async()=>{L.rask={t0:T,out:0};SFX.crack();addShake(.5);await wait(700);await say('c3_r1');await say('c3_r2');L.rask.out=T;await wait(800);L.rask=null}}];
 run(async()=>{await wait(500);await say('c3_s');await say('c3_r');await runTasks();await winLevel()})};
// ---- глава 4: Стражи-осколыши (a − x = b) ----
function guardTask(L,a,b,o){o=o||{};const g=addGuard({x:o.x||1000,gy:L.gy,n:a,b,cols:Array(a).fill(HUE.violet),walk:o.walk==null?11:o.walk,side:1});g.home=g.x;return g}
function guardStep(dt){const L=LV;for(const g of L.guards){if(g.done){g.x+=dt*0;continue}if(!g.walk||talk&&L.cur<0)continue;
  if(g.push){const k=(T-g.push)/.8;g.x=lerp(g.px,g.home,ease(clamp(k,0,1)));if(k>=1)g.push=0;continue}
  g.x-=g.walk*dt;if(g.x<Math.max(L.zx,safeL()+L.zh*.2)+L.zh*.75+70){g.push=T;g.px=g.x;addShake(.5);SFX.crack();setPose('z_oops',1);vib(60);hint('c4_push',12)}}}
LEVELS[3]=()=>{const L=mkLevel(3,{gy:600,zx:150,zh:320,ph:150,grounds:[[-600,1900,600]],recover:{x:640,y:150},shardTask:1});
 const gd=(b)=>()=>{const g=L.guards[0];return g&&g.n===b&&T-g.hit>.45&&![...L.ptr.values()].some(s=>s.kind==='blade')};
 L.tasks=[
  {vals:[8,'−','x','=',3],ans:5,t:'c4_t1',k:'c4_k1',chk:['x = 8 − 3 = 5','8 − 5 = 3'],setup(){guardTask(L,8,3,{walk:8})},done:gd(3)},
  {vals:[7,'−','x','=',5],ans:2,t:'c4_t2',k:'c4_k2',chk:['x = 7 − 5 = 2','7 − 2 = 5'],setup(){guardTask(L,7,5)},done:gd(5)},
  {vals:[6,'−','x','=',2],ans:4,t:'c4_t3',k:'c4_k3',chk:['x = 6 − 2 = 4','6 − 4 = 2'],setup(){guardTask(L,6,2,{walk:14})},done:gd(2)}];
 run(async()=>{await wait(500);await say('c4_s');await say('c4_r');await runTasks();await winLevel()})};
// ---- глава 5: Погоня на лунном ките (смесь) ----
function skyPiece(n,h,y,dx){const v=vis();return newPiece(n,v.x0+v.w+n*BS/2+40+(dx||0),y,{hue:h,vx:-1.2})}
LEVELS[4]=()=>{const L=mkLevel(4,{gy:372,zx:190,zh:170,ph:90,zeroG:true,wrap:true,wind:-.5,music:'sky',killY:5000,recover:{x:640,y:300},shardTask:1});
 L.tasks=[
  {vals:['x','+',5,'=',9],ans:4,t:'c5_t1',k:'c5_k1',chk:['x = 9 − 5 = 4','4 + 5 = 9'],setup(){sock({cx:870,cy:540,n:9,fixed:[{n:5,at:'R',cols:Array(5).fill(HUE.blue)}],kind:'sky'});skyPiece(7,HUE.gold,260)},done:()=>L.sockets[0].fill},
  {vals:['x','−',4,'=',3],ans:7,t:'c5_t2',k:'c5_k2',chk:['x = 3 + 4 = 7','7 − 4 = 3'],setup(){sock({cx:870,cy:560,n:7,kind:'sky',noDots:1,q:1});skyPiece(4,HUE.blue,190);skyPiece(3,HUE.gold,330,260);skyPiece(2,HUE.pink,250,560)},done:()=>L.sockets[0].fill},
  {vals:[7,'−','x','=',4],ans:3,t:'c5_t3',k:'c5_k3',chk:['x = 7 − 4 = 3','7 − 3 = 4'],setup(){const g=guardTask(L,7,4,{x:900,walk:0});g.gy=600},done:()=>{const g=L.guards[0];return g&&g.n===4&&T-g.hit>.45}}];
 run(async()=>{await wait(500);await say('c5_s');await runTasks();await winLevel(()=>go('cs','fall'))})};
// ---- пекарня: режь пироги на время ----
LEVELS[6]=()=>{const L=mkLevel(6,{bg:'fin',gy:640,zx:150,zh:300,ph:140,grounds:[[-600,1900,640]],cradle:{x0:370,x1:1010,y:330},recover:{x:690,y:200},pie:true,music:'bake',score:0,tEnd:0});
 const nextPie=()=>{for(const p of L.pieces.slice())killPiece(p);L.sockets.length=0;const b=3+Math.floor(Math.random()*7),a=1+Math.floor(Math.random()*(b-1));
  L.task={vals:[a,'+','x','=',b],ans:b-a,bake:1};sock({cx:690,cy:500,n:b,fixed:[{n:a,at:'L',cols:Array(a).fill(HUE.crust)}],kind:'plate'});newPiece(10,690,300,{})};
 L.tasks=[];
 run(async()=>{await wait(400);await say('k_s');L.tEnd=T+60;nextPie();
  while(T<L.tEnd){await wait(60);if(L.sockets[0]&&L.sockets[0].fill){L.score++;SFX.chime();burst(690,500,30,'conf');await wait(500);nextPie()}}
  L.task=null;L.won=true;SV.bake=1;SV.best=Math.max(SV.best||0,L.score);save();music('win');SFX.fanfare();await say('k_end');await wait(1500);go('map')})};
