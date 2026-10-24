'use strict';
// ===== Главы 1–5 и пекарня: задания «часть–целое» на брусках-бусинах =====
const LVNAME=['Лунная кузница','Мост над Бездной','Звездопадные ворота','Стражи-осколыши','Погоня на ките','Башня Раскола','Лунная пекарня'];
const until=f=>(async()=>{while(!f())await wait(60)})();
const SEEN={};// какие жесты ребёнок уже видел (рука-показ при первом появлении)
async function fadeClear(){const L=LV;for(let i=1;i<=8;i++){for(const p of L.pieces)p.a=1-i/8;for(const s of L.sockets)s.a=1-i/8;L.gA=1-i/8;await wait(45)}
 for(const p of L.pieces.slice())killPiece(p);L.sockets.length=0;L.guards.length=0;L.ptr.clear();L.lastTap=null;L.gA=1;L.mark=false;L.golems=[];
 L.cnt=null;L.fly.length=0;L.shards.length=0;L.bk=null;L.bkId=null;L.scale=null;L.drop=null;L.falling.length=0;L.rain=null;L.shell=null;L.moveS=0}
function setGrounds(gs){const L=LV;for(const g of L.grounds)if(g.b)L.world.destroyBody(g.b);L.grounds=gs;for(const g of gs)mkGround(g)}
function setCradle(c){const L=LV;if(L.cradle&&L.cradle.b)L.world.destroyBody(L.cradle.b);L.cradle=c;if(c)mkCradle(c)}
// точка рисунка фона (1280x720) → координаты сцены
function imgP(ix,iy){const b=G.bgm;return b?{x:b.x0+ix*b.s,y:b.y0+iy*b.s}:{x:ix,y:iy}}
// общий каркас уровня
function mkLevel(idx,o){const L=newWorld(Object.assign({idx,bg:'c'+(idx+1),music:'level',tasks:[],cur:-1,task:null,won:false,checks:null,gA:1,golems:[],zx:150,zh:330,px:280,ph:150,shard:null,hintT:{},act:T,
  fly:[],shards:[],falling:[],cnt:null,walkTo:null},o));
 L.onBlade=(ax,ay,bx,by)=>{shardBlade(ax,ay,bx,by);darkBlade(ax,ay,bx,by)};return L}
function sock(o){return addSocket(o)}
async function runTasks(){const L=LV;
 for(let i=0;i<L.tasks.length;i++){const t=L.tasks[i];L.cur=i;L.task=t;t.solved=false;L.mist=0;L.act=T;L.taskT=T;L.strong=0;L.cnt=null;L.fewT=0;L.demoT=0;
  t.setup(L);if(i===L.shardTask)L.shardOn=true;
  await say(t.t);L.act=T;
  const gk=t.gk||'x';if(!SEEN[gk]){SEEN[gk]=1;L.demoT=T+6}
  await until(()=>t.done(L));
  t.solved=true;L.cnt=null;L.hudFlash=T;SFX.chime();setPose('z_cheer',3);L.checks=t.chk;L.checkT=T;
  for(const g of L.guards)g.done=true;
  if(t.win)run(()=>t.win(L));
  await say(t.k);await wait(400);L.checks=null;
  if(t.after)await t.after(L);
  if(i<L.tasks.length-1)await fadeClear()}
 L.shardOn=false}
async function winLevel(next){const L=LV;if(L.won)return;L.won=true;L.task=null;SV.done[L.idx]=1;save();music('win');SFX.fanfare();vib([30,50,30,50,60]);setPose('z_cheer',9);
 const v=vis();for(let i=0;i<5;i++)setTimeout(()=>{if(LV===L)burst(v.x0+v.w*(.15+i*.17),v.y0+60,40,'conf')},i*180);
 await say('g_win');await wait(700);if(next)next();else go('map')}
// ---- осколок памяти: пролетает по небу, ловится лентой или тапом ----
function shardStep(dt){const L=LV;if(!L||!L.shardOn||SV.shards[L.idx]||L.idx>4){if(L&&L.shard&&!L.shard.got)L.shard=null;return}
 if(!L.shard){L.shard={t0:T+2.5,got:0}}const s=L.shard;if(s.got)return;const v=vis();const k=(T-s.t0)/6;
 if(k<0){s.on=false;return}if(k>1){L.shard={t0:T+8,got:0};return}
 s.on=true;s.x=v.x0-60+(v.w+120)*k;s.y=(L.zeroG?160:150)+Math.sin(k*Math.PI*2)*50}
function shardHit(x,y,r){const s=LV&&LV.shard;return s&&s.on&&!s.got&&Math.hypot(x-s.x,y-s.y)<r}
function segD(ax,ay,bx,by,x,y){const dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy||1;const t=clamp(((x-ax)*dx+(y-ay)*dy)/l2,0,1);return Math.hypot(ax+dx*t-x,ay+dy*t-y)}
function shardBlade(ax,ay,bx,by){const s=LV.shard;if(!s||!s.on||s.got)return;if(segD(ax,ay,bx,by,s.x,s.y)<56)gotShard()}
function gotShard(){const L=LV,s=L.shard;s.got=T;s.gx=s.x;s.gy=s.y;SV.shards[L.idx]=1;save();SFX.chime();vib([20,40,20]);burst(s.x,s.y,40,'spark',280,1);FX.flash=.4;FX.flashC='#e8d8ff';FX.slow=.2;
 sayQ('g_shard');sayQ('s'+NSH())}
function drawShard(){const L=LV,s=L.shard;if(!s)return;
 if(s.got){const k=clamp((T-s.got)/1,0,1);if(k>=1)return;const tx=safeR()-150,ty=safeT()+40;spr('shard',lerp(s.gx,tx,ease(k)),lerp(s.gy,ty,ease(k))-Math.sin(k*Math.PI)*80,90*(1-k*.5),{rot:T*6});return}
 if(!s.on)return;X.save();X.globalCompositeOperation='lighter';const g=X.createRadialGradient(s.x,s.y,4,s.x,s.y,80);g.addColorStop(0,'rgba(230,200,255,.8)');g.addColorStop(1,'rgba(160,120,255,0)');X.fillStyle=g;X.beginPath();X.arc(s.x,s.y,80,0,7);X.fill();X.restore();
 for(let i=1;i<6;i++){X.globalAlpha=.25-i*.04;spr('shard',s.x-i*22,s.y-Math.cos((T-s.t0)/6*Math.PI*2)*i*6,56,{});}X.globalAlpha=1;spr('shard',s.x,s.y,76,{rot:Math.sin(T*5)*.3})}
// ---- тёмные осколки Раскола (рубить пальцем) ----
function darkBlade(ax,ay,bx,by){const L=LV;for(const d of L.shards){if(d.dead)continue;if(segD(ax,ay,bx,by,d.x,d.y)<d.r+26){d.dead=1;L.act=T;SFX.snap();vib(25);burst(d.x,d.y,28,'spark',290,1);addShake(.12);if(L.rain)L.rain.done++}}}
function drawDark(){const L=LV;for(const d of L.shards){if(d.dead)continue;X.save();X.translate(d.x,d.y);X.rotate(T*2+d.ph);X.globalCompositeOperation='lighter';const g=X.createRadialGradient(0,0,4,0,0,d.r*2);g.addColorStop(0,'rgba(190,80,255,.55)');g.addColorStop(1,'rgba(120,20,200,0)');X.fillStyle=g;X.beginPath();X.arc(0,0,d.r*2,0,7);X.fill();X.globalCompositeOperation='source-over';
  X.fillStyle='#2a0a40';X.strokeStyle='#d58cff';X.lineWidth=4;X.beginPath();X.moveTo(0,-d.r*1.2);X.lineTo(d.r*.7,0);X.lineTo(0,d.r*1.2);X.lineTo(-d.r*.7,0);X.closePath();X.fill();X.stroke();X.restore()}}
// ---- подсказки: объяснение ошибки, счёт вместе, рука-показ ----
function hint(k,gap){const L=LV;if(talk||L.won||!L.task||L.task.solved)return;const t=L.hintT[k]||0;if(T-t<(gap||9))return;L.hintT[k]=T;sayQ(k)}
function mistake(L,k){setPose('z_oops',.9);const t=L.task;if(!t||t.solved)return;
 if(L.mist>=2&&!L.strong&&t.count){L.strong=1;run(()=>countHint(L,t,k));return}
 hint(k,3)}
// после второй ошибки: объясняем, потом считаем бусины вслух и подсвечиваем их; рука-подсказка остаётся
async function countHint(L,t,k){const ok=()=>LV===L&&L.task===t&&!t.solved;await wait(150);if(!ok())return;L.hintT[k]=T;await say(k);if(!ok())return;await say('g_count');if(!ok())return;
 const pts=t.count(L)||[];L.cnt={pts,i:-1};for(let i=0;i<pts.length&&i<10;i++){if(!ok()){L.cnt=null;return}L.cnt.i=i;SFX.click();await say('n'+(i+1))}L.act=T}
function eventsStep(){const L=LV;const t=L.task;if(L.ptr.size||L.bkId!=null)L.act=T;
 for(const e of L.ev){L.act=T;
  if(e.e==='long'){L.longT=T;mistake(L,(t&&t.hi)||'g_long')}
  else if(e.e==='short'){mistake(L,(t&&t.lo)||'g_short')}
  else if(e.e==='big')hint('g_big');
  else if(e.e==='fall')hint('g_fall',16);else if(e.e==='wrap')hint('c5_miss',25);
  else if(e.e==='gcut'&&e.g.b!=null){if(e.g.n<e.g.b){L.mark=true;L.mist++;mistake(L,'c4_bad')}else if(e.g.n>e.g.b)L.fewT=T}}
 L.ev.length=0;
 if(t&&!t.solved&&L.fewT&&T-L.fewT>4&&!L.ptr.size){L.fewT=0;const g=L.guards[0];if(g&&g.b!=null&&g.n>g.b){L.mark=true;hint('c4_few',6)}}
 if(t&&!t.solved&&!talk&&T-L.act>14){L.act=T;L.mark=true;hint(t.idle||t.t,1)}}
// подсказки-жесты, пересчитываются из состояния
const freeP=()=>LV.pieces.filter(p=>!p.locked&&!p.sock&&!p.dead&&p.b&&!p.noGrab);
function beadPts(p){const r=[];for(let i=0;i<p.n;i++)r.push(()=>{if(p.dead)return null;const E=ends(p),k=(i+.5)/p.n;return{x:lerp(E[0].x,E[1].x,k),y:lerp(E[0].y,E[1].y,k)}});return r}
function cellPts(s){const r=[];for(let i=0;i<s.need;i++)r.push(()=>{const R=sockRect(s);return{x:R.x0+BS/2+i*BS,y:R.y}});return r}
function guardPts(g,b){const r=[];for(let i=0;i<b;i++)r.push(()=>({x:g.x,y:g.gy-BS/2-i*BS}));return r}
function partPts(){const r=[];for(const p of freeP().filter(p=>!p.decoy).sort((a,b)=>pos(a).x-pos(b).x))r.push(...beadPts(p));return r}
function cutG(p,k){const E=ends(p),t=k/p.n;const cx=lerp(E[0].x,E[1].x,t),cy=lerp(E[0].y,E[1].y,t);const d=axis(pos(p).a);return{type:'swipe',a:{x:cx+d.y*95,y:cy-d.x*95},b:{x:cx-d.y*95,y:cy+d.x*95}}}
function gFill(s,tgt){if(!s||s.fill)return null;const need=s.need;const R=sockRect(s);const to=tgt||{x:(R.x0+R.x1)/2,y:R.y};const ps=freeP();
 if(s.temp)return{type:'tap2',p:{x:s.temp.p.x,y:s.temp.p.y}};
 const ex=ps.find(p=>p.n===need);if(ex)return{type:'drag',f:pos(ex),t:to};
 const so=ps.slice().sort((a,b)=>a.n-b.n);for(const a of so)for(const b of so)if(a!==b&&a.n<=b.n&&a.n+b.n===need){const Eb=ends(b);const r=Eb[0].x>Eb[1].x?Eb[0]:Eb[1];return{type:'drag',f:pos(a),t:{x:r.x+a.n*BS/2+6,y:r.y}}}
 const big=so.filter(p=>p.n>need&&!p.noCut)[0];if(big)return cutG(big,need);
 const u=ps.find(p=>p.hist&&(p.hist.t==='fuse'||p.hist.t==='cut'&&ps.some(q=>q.id===p.hist.sib)));if(u)return{type:'tap2',p:pos(u)};
 return null}
function gGuard(g){if(!g)return null;if(g.n<g.b){const p=LV.pieces.find(p=>p.hist&&p.hist.guard===g.id&&!p.dead);return p?{type:'tap2',p:pos(p)}:null}
 const y=g.gy-g.b*BS;return{type:'swipe',a:{x:g.x-115,y},b:{x:g.x+115,y}}}
function guideOn(L){const t=L.task;if(!t||t.solved||!t.guide||L.ptr.size||L.bkId!=null)return false;if(talk&&!t.always)return false;return t.always||T<L.demoT||T-L.act>5||L.strong}
function gHand(x,y){X.save();X.translate(x,y);X.scale(1.35,1.35);hand(15,41,1);X.restore()}
function gIn(q){const v=vis();return !q||q.x>v.x0+20&&q.x<v.x0+v.w-20&&q.y>v.y0&&q.y<v.y0+v.h}
function drawGuide(L){if(!guideOn(L))return;const g=L.task.guide(L);if(!g)return;if(!gIn(g.a)||!gIn(g.f)||!gIn(g.p))return;const k=(T*.7)%1;X.save();X.lineCap='round';
 if(g.type==='swipe'){const kk=ease(clamp(k*1.5,0,1));const x=lerp(g.a.x,g.b.x,kk),y=lerp(g.a.y,g.b.y,kk);X.strokeStyle=`rgba(255,250,200,${.9*(1-k*.5)})`;X.lineWidth=10;X.beginPath();X.moveTo(g.a.x,g.a.y);X.lineTo(x,y);X.stroke();gHand(x,y)}
 else if(g.type==='drag'){const f=g.f,t=g.t;const kk=ease(clamp(k*1.4,0,1));X.setLineDash([12,10]);X.strokeStyle='rgba(255,250,200,.75)';X.lineWidth=6;X.beginPath();X.moveTo(f.x,f.y);X.lineTo(t.x,t.y);X.stroke();X.setLineDash([]);
  X.strokeStyle=`rgba(255,240,120,${.55+.4*Math.sin(T*6)})`;X.lineWidth=5;X.beginPath();X.arc(t.x,t.y,36,0,7);X.stroke();gHand(lerp(f.x,t.x,kk),lerp(f.y,t.y,kk))}
 else if(g.type==='tap2'){const p=g.p,ph=(T*1.3)%1,r=(ph%.5)*2;X.strokeStyle=`rgba(255,250,200,${1-r})`;X.lineWidth=6;X.beginPath();X.arc(p.x,p.y,18+r*44,0,7);X.stroke();txt('×2',p.x+58,p.y-46,40,'#fff3a0',{f:NUM,st:'#1a0f3a',lw:8,id:'tap2',kind:'num'});gHand(p.x,p.y+((ph%.5)<.18?7:0))}
 X.restore()}
function drawCount(L){const c=L.cnt;if(!c)return;for(let j=0;j<=c.i&&j<c.pts.length;j++){const p=c.pts[j]();if(!p)continue;const cur=j===c.i;X.save();X.globalCompositeOperation='lighter';X.fillStyle=`rgba(255,230,120,${cur?.6:.32})`;X.beginPath();X.arc(p.x,p.y,cur?36+5*Math.sin(T*10):30,0,7);X.fill();X.restore();
  X.strokeStyle='#ffe066';X.lineWidth=4;X.beginPath();X.arc(p.x,p.y,31,0,7);X.stroke();txt(String(j+1),p.x,p.y-58,cur?46:38,'#ffe066',{f:NUM,st:'#1a0f3a',lw:8,id:'cnt'+j,kind:'num'})}}
// ---- движение героев, летящие куски ----
function walkStep(dt){const L=LV;if(!L||L.walkTo==null)return;const d=L.walkTo-L.zx;if(Math.abs(d)<2){L.zx=L.walkTo;L.walkTo=null;if(L.onArrive){const f=L.onArrive;L.onArrive=null;f()}return}
 L.zx+=Math.sign(d)*Math.min(Math.abs(d),(L.walkV||230)*dt);L.walkT=T;if(Math.floor(T*3.2)!==Math.floor((T-dt)*3.2))SFX.step()}
function flyStep(){const L=LV;for(const f of L.fly)if(!f.done&&T>=f.t0+f.dur){f.done=1;f.end&&f.end()}for(let i=L.fly.length-1;i>=0;i--)if(L.fly[i].done)L.fly.splice(i,1)}
function drawFly(){for(const f of LV.fly){const k=clamp((T-f.t0)/f.dur,0,1),e=ease(k);const x=lerp(f.x0,f.x1,e),y=lerp(f.y0,f.y1,e)-Math.sin(k*Math.PI)*(f.arc==null?120:f.arc);const sc=f.shrink?1-k*.75:1;
  X.save();X.translate(x,y);X.scale(sc,sc);drawBar(0,0,lerp(f.a0||0,0,e),f.n,f.cols,{});X.restore()}}
// ---- герои у левого края ----
function zPose(L){if(L.pose&&T<L.pose.until)return L.pose.n;if(talk&&talk.who==='zlata')return'z_talk';if(L.won)return'z_cheer';return'z_idle'}
function pPose(L){if(T-L.pz.hop<.7)return'p_jump';if(L.pose&&T<L.pose.until&&L.pose.n==='z_oops')return'p_scared';if(talk&&talk.who==='pazl')return'p_wave';return'p_idle'}
function drawHeroes(L,o){o=o||{};const zx=Math.max(L.zx,safeL()+L.zh*.2),gy=L.gy+(o.dy||0);const walk=L.walkT&&T-L.walkT<.15;const bob=walk?Math.abs(Math.sin(T*9))*5:0;
 const pn=pPose(L);const hop=pn==='p_jump'?Math.sin(clamp((T-L.pz.hop)/.7,0,1)*Math.PI)*70:0;const px=L.pzBehind?zx-L.zh*.4:zx+L.zh*.42;
 hero(pn,px,gy-hop-(walk?Math.abs(Math.sin(T*9+1.5))*5:0),L.ph*(pn==='p_jump'?1.08:1),{seed:7,ph:1.3,air:hop>1,shY:gy});
 const zn=zPose(L);hero(zn,zx,gy-bob,L.zh*(zn==='z_slash'||zn==='z_push'?1.02:1),{seed:3,shY:gy});L.hand={x:zx+L.zh*.28,y:gy-L.zh*.62}}
// лента от руки Златы к пальцу
function drawRibbon(L){if(!L.hand)return;for(const [,st] of L.ptr){if(st.kind!=='blade')continue;const p=st.pts[st.pts.length-1];if(!p)continue;const h=L.hand;X.save();X.globalCompositeOperation='lighter';X.strokeStyle='rgba(170,220,255,.45)';X.lineWidth=5;X.lineCap='round';X.beginPath();X.moveTo(h.x,h.y);X.quadraticCurveTo((h.x+p[0])/2,Math.min(h.y,p[1])-80+Math.sin(T*9)*20,p[0],p[1]);X.stroke();X.strokeStyle='rgba(255,255,255,.6)';X.lineWidth=2;X.stroke();X.restore()}}
// голем-страж рядом с колонной
function drawGolem(g,o){o=o||{};const happy=g.done;const x=g.x+(g.side||1)*95,h=o.h||250;const bob=happy&&!g.leaveT?Math.abs(Math.sin(T*5))*8:0;const ch=g.chomp&&T-g.chomp<.3?1.05:1;
 hero(happy?'g_happy':'g_angry',x,g.gy-bob,h*(happy?1.02:1)*ch,{flip:(g.side||1)<0,ph:g.id,shY:g.gy});
 if(g.b!=null&&LV.mark&&!g.done){const y=g.gy-g.b*BS;X.save();X.setLineDash([12,9]);X.strokeStyle=`rgba(255,240,140,${.6+.3*Math.sin(T*5)})`;X.lineWidth=5;X.beginPath();X.moveTo(g.x-70,y);X.lineTo(g.x+70,y);X.stroke();X.restore();numTag(g.b,g.x-100,y,40,{col:'#fff3a0',id:'gmark'})}}
// кузнечный огонь вспыхивает (эффект решённого задания)
function forgeGlow(L){if(!L.forge)return;const k=(T-L.forge)/1.6;if(k>1)return;const p=imgP(1120,425);X.save();X.globalCompositeOperation='lighter';const r=160+k*120;const g=X.createRadialGradient(p.x,p.y,10,p.x,p.y,r);g.addColorStop(0,`rgba(140,220,255,${.9*(1-k)})`);g.addColorStop(1,'rgba(60,120,255,0)');X.fillStyle=g;X.beginPath();X.arc(p.x,p.y,r,0,7);X.fill();X.restore()}
function forgeWin(L,x,y){L.forge=T;SFX.ok();burst(imgP(1120,425).x,imgP(1120,425).y,40,'spark',200,1.1);if(x!=null)burst(x,y,30,'conf')}
// ---- глава 1: Кузница: режем, склеиваем, весы ----
const LEVELS=[];
LEVELS[0]=()=>{const L=mkLevel(0,{gy:640,grounds:[[-600,1900,640]],cradle:{x0:430,x1:950,y:330},recover:{x:690,y:200},shardTask:1});
 const unf=()=>L.sockets.find(s=>!s.fill);
 L.tasks=[
  {vals:[8,'=',3,'+',5],plain:1,t:'c1_t1',k:'c1_k1',gk:'cut',chk:['8 = 3 + 5'],setup(){newPiece(8,690,300,{hue:HUE.gold});sock({cx:560,cy:470,n:3,showTotal:1});sock({cx:880,cy:470,n:5,showTotal:1})},
   guide:()=>gFill(unf()),count:()=>{const s=unf();return s?cellPts(s):[]},done:()=>L.sockets.every(s=>s.fill),win:()=>forgeWin(L,720,470)},
  {vals:[4,'+',2,'=',6],plain:1,t:'c1_t2',k:'c1_k2',gk:'fuse',chk:['4 + 2 = 6'],setup(){newPiece(4,560,300,{hue:HUE.teal});newPiece(2,860,300,{hue:HUE.pink});sock({cx:690,cy:470,n:6,showTotal:1})},
   guide:()=>gFill(unf()),count:()=>{const s=unf();return s?cellPts(s):[]},done:()=>L.sockets.every(s=>s.fill),win:()=>forgeWin(L,690,470)},
  // весы: слева целое 7, справа 4 и пустое место — положи недостающую часть, весы выровняются
  {vals:[4,'+','x','=',7],ans:3,t:'c1_t3',k:'c1_k3',gk:'scale',lo:'c1_lo',hi:'c1_hi',chk:['x = 7 − 4 = 3','4 + 3 = 7'],
   setup(){setCradle(null);const s=sock({cx:990,cy:440,n:7,fixed:[{n:4,at:'L',cols:Array(4).fill(HUE.blue)}],kind:'pan',dy:75});L.scale={th:.16,s};
    newPiece(2,470,600,{hue:HUE.pink});newPiece(3,690,600,{hue:HUE.gold});newPiece(5,990,600,{hue:HUE.teal})},
   guide:()=>gFill(L.scale&&L.scale.s),count:()=>cellPts(L.scale.s),done:()=>L.scale.s.fill&&Math.abs(L.scale.th)<.02,win:()=>{forgeWin(L);L.scale.win=T;burst(L.scale.lx,L.scale.ly+110,30,'conf');burst(L.scale.rx,L.scale.ry+110,30,'conf')}}];
 L.step=dt=>{const sc=L.scale;if(!sc)return;const s=sc.s;let tt=.16;if(s.fill)tt=0;else if(s.temp)tt=.07;else if(L.longT&&T-L.longT<1.2)tt=-.13;
  sc.th+=(tt-sc.th)*Math.min(1,dt*(s.fill?3:4));if(Math.abs(sc.th)<.004&&s.fill)sc.th=0;const A=225,px=765,py=330;
  sc.lx=px-A*Math.cos(sc.th);sc.ly=py+A*Math.sin(sc.th);sc.rx=px+A*Math.cos(sc.th);sc.ry=py-A*Math.sin(sc.th);
  s.cx=sc.rx;s.cy=sc.ry+110;const R=sockRect(s);if(s.temp){s.temp.p.x=R.x0+s.temp.p.n*BS/2;s.temp.p.y=s.cy}if(s.fill){s.fill.x=(R.x0+R.x1)/2;s.fill.y=s.cy;if(T-s.fill.lockT>.25){s.fill.sx=s.fill.x;s.fill.sy=s.cy}}};
 L.drawBack=()=>{forgeGlow(L);const sc=L.scale;if(!sc||sc.lx==null)return;X.save();X.globalAlpha*=L.gA;const px=765,py=330;
  X.fillStyle='#6b4a2a';X.strokeStyle='#2a1808';X.lineWidth=4;X.beginPath();X.moveTo(px-80,640);X.lineTo(px+80,640);X.lineTo(px+24,598);X.lineTo(px-24,598);X.closePath();X.fill();X.stroke();
  rr(px-13,py,26,598-py,8);X.fill();X.stroke();
  X.save();X.translate(px,py);X.rotate(-sc.th);rr(-245,-11,490,22,11);X.fillStyle='#c89a4a';X.fill();X.stroke();X.restore();
  X.beginPath();X.arc(px,py,17,0,7);X.fillStyle='#ffd27a';X.fill();X.stroke();
  // стрелка-указатель: ровно ли
  X.save();X.translate(px,py);X.rotate(-sc.th);X.fillStyle=Math.abs(sc.th)<.02?'#9fe870':'#ff9a7a';X.beginPath();X.moveTo(-10,-14);X.lineTo(10,-14);X.lineTo(0,-62);X.closePath();X.fill();X.stroke();X.restore();
  for(const [x,y] of [[sc.lx,sc.ly],[sc.rx,sc.ry]]){const ty=y+144;X.strokeStyle='#e0c890';X.lineWidth=3;X.beginPath();X.moveTo(x,y);X.lineTo(x-205,ty);X.moveTo(x,y);X.lineTo(x+205,ty);X.stroke();
   X.fillStyle='#b08040';X.strokeStyle='#2a1808';X.lineWidth=4;X.beginPath();X.ellipse(x,ty,218,15,0,0,7);X.fill();X.stroke()}
  drawBar(sc.lx,sc.ly+110,0,7,Array(7).fill(HUE.gold),{});numTag(7,sc.lx,sc.ly+110-BS*.95,52,{col:'#ffe066',id:'whole'});
  if(sc.win){const k=(T-sc.win)/1.5;if(k<1){X.globalCompositeOperation='lighter';X.fillStyle=`rgba(255,240,150,${.5*(1-k)})`;X.beginPath();X.ellipse(px,py+120,520,200,0,0,7);X.fill()}}
  X.restore()};
 run(async()=>{await wait(500);await say('c1_s');await runTasks();await winLevel()})};
// ---- глава 2: Мост над Бездной (a + x = b): Злата идёт по мосту ----
function bridgeTask(L,b,a,o){o=o||{};const n=b,x0=628-n*BS/2;
 const s=sock({cx:x0+n*BS/2,cy:496,n,fixed:[{n:a,at:'L',cols:Array(a).fill(HUE.blue)}],kind:'bridge',fog:o.fog,dy:55});s.base=496;s.sway=o.sway;L.br={s,x0,x1:x0+n*BS,hole:x0+a*BS};
 newPiece(b,700,236,{hue:HUE.gold});setCradle({x0:700-b*BS/2-20,x1:700+b*BS/2+20,y:262});
 L.zx=-240;L.walkV=230;L.walkTo=o.sway?Math.min(300,x0-40):L.br.hole-75;return s}
async function bridgeCross(L){await wait(200);L.walkV=300;L.walkTo=1500;await until(()=>L.walkTo==null);L.zx=-240}
LEVELS[1]=()=>{const L=mkLevel(1,{gy:470,zx:-240,zh:300,ph:140,pzBehind:1,grounds:[[-600,480,470],[775,1900,470]],cradle:{x0:440,x1:960,y:262},recover:{x:700,y:120},killY:900,shardTask:1});
 const S=()=>L.br&&L.br.s;const cap='x — сколько не хватает';
 const T3=(vals,ans,b,a,t,k,o)=>({vals,ans,t,k,gk:'bridge',cap,chk:[`x = ${b} − ${a} = ${ans}`,`${a} + ${ans} = ${b}`],setup(){bridgeTask(L,b,a,o);if(L.cur===0)L.onArrive=()=>hint('c2_wait',99)},
  guide:()=>gFill(S()),count:()=>cellPts(S()),done:()=>S().fill&&Math.abs(S().cy-496)<3,after:()=>bridgeCross(L)});
 L.tasks=[T3([3,'+','x','=',8],5,8,3,'c2_t1','c2_k1'),T3([4,'+','x','=',9],5,9,4,'c2_t2','c2_k2',{sway:1}),T3([2,'+','x','=',9],7,9,2,'c2_t3','c2_k3',{fog:true})];
 L.step=dt=>{const s=S();if(!s)return;if(s.sway&&!s.fill&&!s.temp)s.cy=496+Math.sin(T*1.5)*26;else s.cy+=(496-s.cy)*Math.min(1,dt*6);const R=sockRect(s);
  if(s.temp){s.temp.p.y=s.cy}if(s.fill){s.fill.y=s.cy;s.fill.x=(R.x0+R.x1)/2;if(T-s.fill.lockT>.25){s.fill.sy=s.cy;s.fill.sx=s.fill.x}}};
 L.drawBack=()=>{const s=S();if(!s)return;const b=L.br;// верёвки моста и опора под ногами
  X.save();X.globalAlpha*=s.a;X.strokeStyle='#c8a070';X.lineWidth=4;for(const dy of [-58,-30]){X.beginPath();X.moveTo(b.x0-30,470+dy);X.quadraticCurveTo((b.x0+b.x1)/2,s.cy-26+dy+18,b.x1+30,470+dy);X.stroke()}
  for(const x of [b.x0-30,b.x1+30]){X.fillStyle='#6b4a2a';rr(x-8,404,16,70,6);X.fill()}X.restore();
  G.surf.push([b.x0,s.fill?b.x1:b.hole,s.cy-26])};
 run(async()=>{await wait(500);await say('c2_s');await say('c2_r');await runTasks();await winLevel()})};
// ---- глава 3: Звездопадные ворота (x − a = b): лови части корзинкой, склей ключ ----
const LOCKY=[300,400,500];
LEVELS[2]=()=>{const L=mkLevel(2,{gy:645,zx:150,zh:320,ph:150,grounds:[[-600,1900,645]],cradle:{x0:320,x1:1100,y:300},recover:{x:700,y:200},shardTask:1,locks:[0,0,0]});
 const bkMin=()=>Math.max(L.zx,safeL()+L.zh*.2)+L.zh*.42+L.ph*.4+130,bkMax=()=>Math.min(safeR()-130,imgP(1006,0).x-170);
 const gate=(parts,o)=>{o=o||{};const sum=parts.filter(p=>!p[2]).reduce((a,p)=>a+p[0],0);const s=sock({cx:680,cy:430,n:sum,kind:'key',noDots:1,q:1,dy:55});
  L.bk=L.bk||{x:(bkMin()+bkMax())/2,w:240,h:96,stun:0};L.drop=parts.map(p=>({n:p[0],h:p[1],decoy:!!p[2]}));L.nextDrop=T+.4;L.benchX=340;L.rain=o.rain?{next:T+2,done:0}:null;return s};
 const S=()=>L.sockets[0];const cap='x — каким было целое';
 const G3=(vals,ans,a,b,parts,t,k,o,i)=>({vals,ans,t,k,gk:'basket',cap,hi:'g_long',chk:[`x = ${b} + ${a} = ${ans}`,`${ans} − ${a} = ${b}`],setup(){gate(parts,o)},
  guide(){const f=L.falling.find(f=>!f.decoy&&!f.dead);if(f&&L.bk){const q=pos(f),y=645-L.bk.h/2;if(Math.abs(q.x-L.bk.x)<40)return null;return{type:'drag',f:{x:L.bk.x,y},t:{x:clamp(q.x,bkMin(),bkMax()),y}}}return gFill(S())},
  count:()=>partPts(),done:()=>S().fill,win:()=>{L.locks[i]=T;SFX.ok();const p=imgP(1006,LOCKY[i]);burst(p.x,p.y,40,'spark',50,1.1);FX.flash=.3;FX.flashC='#fff3c0'}});
 L.tasks=[G3(['x','−',2,'=',7],9,2,7,[[7,HUE.gold],[2,HUE.blue]],'c3_t1','c3_k1',{},0),
  G3(['x','−',3,'=',4],7,3,4,[[4,HUE.gold],[2,HUE.pink,1],[3,HUE.blue]],'c3_t2','c3_k2',{},1),
  Object.assign(G3(['x','−',5,'=',3],8,5,3,[[3,HUE.gold],[5,HUE.blue]],'c3_t3','c3_k3',{rain:1},2),{after:async()=>{L.gateOpen=T;SFX.quake&&SFX.quake();addShake(.4);L.walkV=200;L.walkTo=Math.min(560,imgP(1006,0).x-420);await wait(1600);
    L.rask={t0:T,out:0};SFX.crack();addShake(.5);await wait(700);await say('c3_r1');await say('c3_r2');L.rask.out=T;await wait(800);L.rask=null}})];
 // корзинку двигают пальцем
 L.grab=(t,pr)=>{const b=L.bk;if(!b||!L.task||L.task.solved)return false;for(const p of L.pieces){if(p.dead||p.locked||p.phase)continue;const q=pos(p);if(Math.abs(q.x-t.x)<p.n*BS/2+10&&Math.abs(q.y-t.y)<45)return false}if(Math.abs(t.x-b.x)<b.w/2+40&&t.y>645-b.h-70&&t.y<660){pr.own='bk';L.bkId=t.id;L.act=T;SFX.click();return true}return false};
 L.step=dt=>{const b=L.bk;if(!b)return;const pr=L.bkId!=null&&PTR.get(L.bkId);if(pr)b.tx=pr.x;else L.bkId=null;if(b.tx!=null)b.x+=(clamp(b.tx,bkMin(),bkMax())-b.x)*Math.min(1,dt*14);b.x=clamp(b.x,bkMin(),bkMax());
  const t=L.task;if(!t||t.solved)return;const v=vis(),mouth=645-b.h;
  // сброс частей ключа сверху — по одной
  if(L.drop&&L.drop.length&&!L.falling.length&&T>L.nextDrop&&!talk){const d=L.drop.shift();const x=rnd(bkMin(),bkMax());const p=newPiece(d.n,x,v.y0-50,{hue:d.h,noGrab:1,noCut:1,phase:1,decoy:d.decoy});p.b.setGravityScale(.22);p.b.setLinearDamping(2);p.b.setAngularVelocity(0);p.b.setFixedRotation(true);p.dd=d;L.falling.push(p);SFX.whoosh()}
  for(const f of L.falling.slice()){if(f.dead){L.falling.splice(L.falling.indexOf(f),1);continue}const q=pos(f);if(f.b)f.b.setAngle(Math.sin(T*2+f.id)*.08);
   if(q.y>mouth-30&&q.y<mouth+25&&Math.abs(q.x-b.x)<b.w/2+12&&!(b.stun>T)){// поймали
    if(f.decoy){killPiece(f);L.falling.splice(L.falling.indexOf(f),1);SFX.bad();burst(q.x,mouth,26,'spark',290,.8);addShake(.25);b.stun=T+.6;L.nextDrop=T+1.2;continue}
    killPiece(f);L.falling.splice(L.falling.indexOf(f),1);SFX.fuse();burst(q.x,mouth,22,'spark',f.cols[0],.7);b.hop=T;L.act=T;const sx=L.benchX+f.n*BS/2;L.benchX+=f.n*BS+100;
    const cols=f.cols,n=f.n,dec=f.decoy;L.fly.push({n,cols,x0:q.x,y0:mouth,x1:sx,y1:268,t0:T,dur:.55,end(){if(LV===L&&L.task===t){const np=newPiece(n,sx,268,{cols});np.decoy=dec;np.flash=T}}});L.nextDrop=T+.9}
   else if(q.y>mouth+40){killPiece(f);L.falling.splice(L.falling.indexOf(f),1);burst(q.x,q.y,16,'spark',f.cols[0],.5);SFX.bad();if(!f.decoy){L.drop.push(f.dd);hint('c3_miss',8)}L.nextDrop=T+1.4}}
  // тёмные осколки
  if(L.rain){if(T>L.rain.next&&!talk){L.rain.next=T+2.6;L.shards.push({x:rnd(bkMin(),bkMax()),y:v.y0-30,vx:0,vy:120,r:30,ph:Math.random()*6})}
   for(const d of L.shards){if(d.dead)continue;d.y+=d.vy*dt;if(d.y>mouth-10&&Math.abs(d.x-b.x)<b.w/2){d.dead=1;b.stun=T+1;SFX.bad();addShake(.3);burst(d.x,d.y,24,'spark',290,.8);setPose('z_oops',.8);hint('c3_hit',5)}else if(d.y>640){d.dead=1;burst(d.x,640,12,'spark',290,.4)}}
   for(let i=L.shards.length-1;i>=0;i--)if(L.shards[i].dead)L.shards.splice(i,1)}};
 L.drawBack=()=>{// замки на воротах + свет открывающихся ворот
  for(let i=0;i<3;i++){const p=imgP(1006,LOCKY[i]),o=L.locks[i],k=o?ease(clamp((T-o)/.6,0,1)):0;X.save();X.translate(p.x,p.y);
   if(o){X.globalCompositeOperation='lighter';X.fillStyle=`rgba(255,220,120,${.35+.15*Math.sin(T*4)})`;X.beginPath();X.arc(0,0,58,0,7);X.fill();X.globalCompositeOperation='source-over'}
   X.strokeStyle=o?'#ffd86a':'#9a8ab8';X.lineWidth=9;X.beginPath();X.arc(0,-26-k*16,20,Math.PI,0);X.lineTo(20,-26-k*16+(o?-4:14));X.stroke();
   X.fillStyle=o?'#f0c040':'#5a4a7a';X.strokeStyle='#1a1030';X.lineWidth=4;rr(-30,-26,60,52,10);X.fill();X.stroke();X.fillStyle='#1a1030';X.beginPath();X.arc(0,-4,7,0,7);X.fill();X.fillRect(-3,-2,6,16);X.restore()}
  if(L.gateOpen){const k=clamp((T-L.gateOpen)/1.5,0,1),a=imgP(1006,80),b=imgP(1006,640);X.save();X.globalCompositeOperation='lighter';const w=10+k*170;const g=X.createLinearGradient(a.x-w,0,a.x+w,0);g.addColorStop(0,'rgba(255,240,180,0)');g.addColorStop(.5,`rgba(255,250,220,${.9})`);g.addColorStop(1,'rgba(255,240,180,0)');X.fillStyle=g;X.fillRect(a.x-w,a.y,w*2,b.y-a.y);X.restore()}};
 L.drawFront=()=>{const b=L.bk;if(!b)return;const hp=b.hop&&T-b.hop<.25?Math.sin((T-b.hop)/.25*Math.PI)*8:0;const st=b.stun>T?Math.sin(T*50)*5:0;const x=b.x+st,y=645,w=b.w,h=b.h-hp;X.save();X.globalAlpha*=L.gA;
  X.fillStyle='rgba(10,6,24,.35)';X.beginPath();X.ellipse(x,y-2,w*.55,10,0,0,7);X.fill();
  X.fillStyle=b.stun>T?'#7a4a6a':'#b07a3a';X.strokeStyle='#3a2008';X.lineWidth=5;X.beginPath();X.moveTo(x-w/2,y-h);X.lineTo(x+w/2,y-h);X.lineTo(x+w/2-24,y);X.lineTo(x-w/2+24,y);X.closePath();X.fill();X.stroke();
  X.strokeStyle='rgba(60,30,8,.6)';X.lineWidth=3;for(let i=1;i<4;i++){X.beginPath();X.moveTo(x-w/2+6+i*2,y-h+i*h/4);X.lineTo(x+w/2-6-i*2,y-h+i*h/4);X.stroke()}
  X.fillStyle='#d8a050';rr(x-w/2-8,y-h-8,w+16,16,8);X.fill();X.strokeStyle='#3a2008';X.stroke();
  if(L.bkId!=null){X.strokeStyle='rgba(255,250,200,.8)';X.lineWidth=4;rr(x-w/2-14,y-h-16,w+28,h+22,16);X.stroke()}X.restore();drawDark()};
 run(async()=>{await wait(500);await say('c3_s');await say('c3_r');await runTasks();await winLevel()})};
// ---- глава 4: Стражи-осколыши (a − x = b): покорми стража, ракушка, идущий страж ----
function guardTask(L,a,b,o){o=o||{};const g=addGuard({x:o.x||1000,gy:L.gy,n:a,b,cols:Array(a).fill(HUE.violet),walk:o.walk==null?11:o.walk,side:1});g.home=g.x;return g}
function guardStep(dt){const L=LV;for(const g of L.guards){if(g.done){if(g.leaveT)g.x+=dt*380;continue}if(!g.walk||talk&&L.cur<0)continue;
  if(g.push){const k=(T-g.push)/.8;g.x=lerp(g.px,g.home,ease(clamp(k,0,1)));if(k>=1)g.push=0;continue}
  g.x-=g.walk*dt;if(g.x<Math.max(L.zx,safeL()+L.zh*.2)+L.zh*.75+70){g.push=T;g.px=g.x;addShake(.5);SFX.crack();setPose('z_oops',1);vib(60);hint('c4_push',12)}}}
// отрубленные куски летят стражу в рот
function feedGolem(L,h){const g=L.guards[0];if(!g)return;const mx=g.x+95,my=g.gy-(h||250)*.7;let i=0;
 for(const p of L.pieces.slice()){if(!p.hist||p.hist.guard!==g.id)continue;const q=pos(p);killPiece(p);L.fly.push({n:p.n,cols:p.cols,x0:q.x,y0:q.y,a0:q.a,x1:mx,y1:my,t0:T+i*.2,dur:.7,shrink:1,arc:140,end(){SFX.fuse();burst(mx,my,24,'spark',HUE.violet,.7);g.chomp=T}});i++}}
LEVELS[3]=()=>{const L=mkLevel(3,{gy:635,zx:150,zh:320,ph:150,grounds:[[-600,1900,635]],recover:{x:640,y:150},shardTask:1});
 const gd=(b)=>()=>{const g=L.guards[0];return g&&g.n===b&&T-g.hit>.45&&![...L.ptr.values()].some(s=>s.kind==='blade')};
 const leave=async()=>{const g=L.guards[0];if(g){g.leaveT=T;SFX.step()}await wait(900)};
 const GT=(a,b,t,k,o,cap)=>({vals:[a,'−','x','=',b],ans:a-b,t,k,gk:'guard',cap,chk:[`x = ${a} − ${b} = ${a-b}`,`${a} − ${a-b} = ${b}`],setup(){guardTask(L,a,b,o)},
  guide:()=>gGuard(L.guards[0]),count:()=>guardPts(L.guards[0],b),done:gd(b),win:()=>feedGolem(L),after:leave});
 L.tasks=[GT(8,3,'c4_t1','c4_k1',{walk:0},'x — сколько отрубить'),
  // ракушка: 7 − x = 5 — часть бусин спрятана, положи под ракушку столько же
  {vals:[7,'−','x','=',5],ans:2,t:'c4_t2',k:'c4_k2',gk:'shell',lo:'c4_lo',hi:'c4_hi',cap:'x — сколько под ракушкой',chk:['x = 7 − 5 = 2','7 − 2 = 5'],
   setup(){const g=addGuard({x:1010,gy:L.gy,n:5,b:null,cols:Array(5).fill(HUE.violet),walk:0,side:1});g.noCut=1;L.shell={s:sock({cx:720,cy:603,n:2,kind:'shell',noDots:1,q:1,dy:80}),open:1};
    setCradle({x0:380,x1:900,y:360});newPiece(1,440,330,{hue:HUE.gold,noFuse:1});newPiece(3,620,330,{hue:HUE.teal,noFuse:1});newPiece(2,820,330,{hue:HUE.pink,noFuse:1})},
   guide:()=>gFill(L.shell.s),count:()=>cellPts(L.shell.s),done:()=>L.shell.s.fill,
   win:async()=>{const sh=L.shell,g=L.guards[0];sh.close=T;await wait(500);const p=sh.s.fill;sh.s.off=1;L.sockets.splice(L.sockets.indexOf(sh.s),1);
    L.fly.push({n:2,cols:p?p.cols:[HUE.pink,HUE.pink],x0:720,y0:603,x1:g.x,y1:g.gy-6*BS,a0:0,t0:T,dur:.7,arc:160,end(){g.cols=g.cols.concat([HUE.gold,HUE.gold]);g.n=7;g.hit=T;SFX.fuse();burst(g.x,g.gy-6*BS,30,'spark',50,.9)}});if(p)killPiece(p)},
   after:async()=>{await wait(300);setCradle(null);await leave()}},
  GT(6,2,'c4_t3','c4_k3',{walk:14},'x — сколько отрубить')];
 L.drawBack=()=>{const sh=L.shell;if(!sh||!sh.s)return;const x=720,y=603;const cl=sh.close?ease(clamp((T-sh.close)/.35,0,1)):0;const op=sh.close&&T-sh.close>.6?ease(clamp((T-sh.close-.6)/.4,0,1)):0;X.save();X.globalAlpha*=L.gA;
  // нижняя створка — веер с рёбрышками
  const fan=(up)=>{X.beginPath();X.moveTo(-120,0);X.bezierCurveTo(-120,up*95,120,up*95,120,0);X.closePath()};
  X.translate(x,y);X.fillStyle='rgba(10,6,24,.35)';X.beginPath();X.ellipse(0,40,130,14,0,0,7);X.fill();
  fan(.75);let g=X.createLinearGradient(0,0,0,70);g.addColorStop(0,'#ffd6e4');g.addColorStop(1,'#d9809e');X.fillStyle=g;X.fill();X.strokeStyle='#6a2242';X.lineWidth=4;X.stroke();
  X.lineWidth=3;X.strokeStyle='rgba(106,34,66,.6)';for(let i=-4;i<=4;i++){X.beginPath();X.moveTo(i*26,4);X.lineTo(i*6,52);X.stroke()}
  // крышка на петле сзади (открыта, при решении захлопывается)
  const sy=Math.max(.12,1-cl*.88+op*.88);X.translate(0,-2);X.scale(1,sy);fan(-1.1);g=X.createLinearGradient(0,-70,0,0);g.addColorStop(0,'#ffe8f0');g.addColorStop(1,'#f0a0bc');X.fillStyle=g;X.fill();X.strokeStyle='#6a2242';X.lineWidth=4;X.stroke();
  X.lineWidth=3;X.strokeStyle='rgba(106,34,66,.5)';for(let i=-4;i<=4;i++){X.beginPath();X.moveTo(i*26,-4);X.lineTo(i*6,-56);X.stroke()}
  if(sh.close){const k=(T-sh.close)/.8;if(k<1){X.globalCompositeOperation='lighter';X.fillStyle=`rgba(255,240,200,${.6*(1-k)})`;X.beginPath();X.arc(0,0,150,0,7);X.fill()}}
  X.restore()};
 run(async()=>{await wait(500);await say('c4_s');await say('c4_r');await runTasks();await winLevel()})};
// ---- глава 5: Погоня на лунном ките ----
function skyPiece(n,h,y,dx){const v=vis();return newPiece(n,v.x0+v.w+n*BS/2+40+(dx||0),y,{hue:h,vx:-1.2})}
LEVELS[4]=()=>{const L=mkLevel(4,{gy:372,zx:190,zh:170,ph:90,zeroG:true,wrap:true,wind:-.5,music:'sky',killY:5000,recover:{x:640,y:300},shardTask:2});
 const S=()=>L.sockets[0];
 L.tasks=[
  {vals:['x','+',5,'=',9],ans:4,t:'c5_t1',k:'c5_k1',gk:'cut',cap:'x — сколько не хватает',chk:['x = 9 − 5 = 4','4 + 5 = 9'],setup(){sock({cx:870,cy:540,n:9,fixed:[{n:5,at:'R',cols:Array(5).fill(HUE.blue)}],kind:'sky'});skyPiece(7,HUE.gold,260)},
   guide:()=>gFill(S()),count:()=>cellPts(S()),done:()=>S().fill,win:()=>{L.cloudWin=T;SFX.ok()}},
  // ритм-вставка: руби осколки, пока они не попали в кита
  {t:'c5_sh',k:'c5_shk',gk:'slash',setup(){L.rain={next:T+.3,n:0,max:7,done:0,res:0}},
   guide(){const d=L.shards.find(d=>!d.dead);return d?{type:'swipe',a:{x:d.x-20,y:d.y-95},b:{x:d.x+20,y:d.y+95}}:null},done:()=>L.rain&&L.rain.res>=L.rain.max,win:()=>{burst(L.wx||300,L.wy||430,40,'conf');SFX.ok()}},
  {vals:['x','−',4,'=',3],ans:7,t:'c5_t2',k:'c5_k2',gk:'fuse',cap:'x — целое спряталось',chk:['x = 3 + 4 = 7','7 − 4 = 3'],setup(){sock({cx:870,cy:560,n:7,kind:'sky',noDots:1,q:1});skyPiece(4,HUE.blue,190);skyPiece(3,HUE.gold,330,260);const d=skyPiece(2,HUE.pink,250,560);d.decoy=1},
   guide:()=>gFill(S()),count:()=>partPts(),done:()=>S().fill,win:()=>{L.cloudWin=T;SFX.ok()}},
  {vals:[7,'−','x','=',4],ans:3,t:'c5_t3',k:'c5_k3',gk:'guard',cap:'x — сколько отрубить',chk:['x = 7 − 4 = 3','7 − 3 = 4'],setup(){const g=guardTask(L,7,4,{x:900,walk:0});g.gy=600;g.sky=1},
   guide:()=>gGuard(L.guards[0]),count:()=>guardPts(L.guards[0],4),done:()=>{const g=L.guards[0];return g&&g.n===4&&T-g.hit>.45},win:()=>feedGolem(L,200)}];
 L.step=dt=>{for(const g of L.guards)if(g.sky&&!g.done)g.gy=600+Math.sin(T*1.1)*34;
  const r=L.rain;if(!r||!L.task||L.task.solved)return;const v=vis();
  if(r.n<r.max&&T>r.next&&!talk){r.n++;r.next=T+1.5;const y=rnd(200,500),x=v.x0+v.w+30;const tx=L.wx||300,ty=L.wy||430,d=Math.hypot(tx-x,ty-y);L.shards.push({x,y,vx:(tx-x)/d*230,vy:(ty-y)/d*230,r:30,ph:Math.random()*6})}
  for(const d of L.shards){if(d.dead){if(!d.cnt){d.cnt=1;r.res++}continue}d.x+=d.vx*dt;d.y+=d.vy*dt;if(Math.hypot(d.x-(L.wx||300),d.y-(L.wy||430))<120){d.dead=1;d.cnt=1;r.res++;L.whaleHit=T+.5;SFX.bad();addShake(.35);burst(d.x,d.y,24,'spark',290,.8);hint('c5_hit',5)}}
  for(let i=L.shards.length-1;i>=0;i--)if(L.shards[i].dead&&L.shards[i].cnt)L.shards.splice(i,1)};
 L.drawBack=()=>{for(const g of L.guards){X.save();X.globalAlpha*=L.gA*.92;X.fillStyle='#f4f0ff';for(const [dx,dy,rx] of [[40,10,190],[-60,18,110],[160,18,120]]){X.beginPath();X.ellipse(g.x+dx,g.gy+dy+14,rx,34,0,0,7);X.fill()}X.restore();G.surf.push([g.x-150,g.x+250,g.gy])}
  if(L.cloudWin&&T-L.cloudWin<1.4){const s=S();if(s){const k=(T-L.cloudWin)/1.4;X.save();X.globalCompositeOperation='lighter';X.fillStyle=`rgba(255,240,170,${.6*(1-k)})`;X.beginPath();X.ellipse(s.cx,s.cy,s.n*BS*.6+k*120,80+k*60,0,0,7);X.fill();X.restore()}}};
 L.drawFront=()=>drawDark();
 run(async()=>{await wait(500);await say('c5_s');await runTasks();await winLevel(()=>go('cs','fall'))})};
// ---- пекарня: режь пироги на время ----
LEVELS[6]=()=>{const L=mkLevel(6,{bg:'fin',gy:640,zx:150,zh:300,ph:140,grounds:[[-600,1900,640]],cradle:{x0:370,x1:1010,y:330},recover:{x:690,y:200},pie:true,music:'bake',score:0,tEnd:0});
 const nextPie=()=>{for(const p of L.pieces.slice())killPiece(p);L.sockets.length=0;const b=3+Math.floor(Math.random()*7),a=1+Math.floor(Math.random()*(b-1));
  L.task={vals:[a,'+','x','=',b],ans:b-a,bake:1};sock({cx:690,cy:500,n:b,fixed:[{n:a,at:'L',cols:Array(a).fill(HUE.crust)}],kind:'plate'});newPiece(10,690,300,{})};
 L.tasks=[];
 run(async()=>{await wait(400);await say('k_s');L.tEnd=T+60;nextPie();
  while(T<L.tEnd){await wait(60);if(L.sockets[0]&&L.sockets[0].fill){L.score++;SFX.chime();burst(690,500,30,'conf');await wait(500);nextPie()}}
  L.task=null;L.won=true;SV.bake=1;SV.best=Math.max(SV.best||0,L.score);save();music('win');SFX.fanfare();await say('k_end');await wait(1500);go('map')})};
