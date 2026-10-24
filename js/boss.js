'use strict';
// ===== Башня Раскола: босс в 3 фазы + «сердце» (возвращение Раскола в Луну) =====
function rDraw(L){const r=L.rk;if(!r)return;const v=vis();const hit=r.hit&&T-r.hit<.5;const x=Math.min(r.x,safeR()-r.h*.22)+(hit?Math.sin(T*60)*6:0);
 const n=r.kneel?'r_kneel':hit?'r_kneel':(r.thr&&T-r.thr<.6)?'r_attack':(G.kind?'r_kind':'r_proud');const h=n==='r_kneel'?r.h*.8:r.h;
 X.save();X.globalCompositeOperation='lighter';const g=X.createRadialGradient(x,L.gy-r.h*.5,10,x,L.gy-r.h*.5,r.h*.7);g.addColorStop(0,G.kind?'rgba(255,220,140,.35)':'rgba(190,90,255,.35)');g.addColorStop(1,'rgba(120,40,200,0)');X.fillStyle=g;X.fillRect(x-r.h,L.gy-r.h*1.3,r.h*2,r.h*1.4);X.restore();
 hero(n,x,L.gy,h,{flip:n==='r_kneel',ph:2});r.cx=x;
 // сердечко Пазлика в броне
 if(!r.noHeart){const hx=x+(n==='r_kneel'?-h*.05:-r.h*.02),hy=L.gy-h*(n==='r_kneel'?.62:.66);X.save();X.globalCompositeOperation='lighter';X.fillStyle=`rgba(255,200,90,${.35+.25*Math.sin(T*4)})`;X.beginPath();X.arc(hx,hy,26,0,7);X.fill();X.restore()}
 // полоска «брони»
 if(L.hp!=null){const w=200,y=Math.max(L.gy-r.h-30,safeT()+96);for(let i=0;i<L.hpMax;i++){const on=i<L.hp;X.fillStyle=on?'#c070ff':'rgba(255,255,255,.25)';X.strokeStyle='#2a1040';X.lineWidth=3;rr(x-w/2+i*(w/L.hpMax)+3,y,w/L.hpMax-6,16,8);X.fill();X.stroke()}}}
function shieldWin(L){const s=L.sockets[0];if(!s)return;SFX.ok();burst(s.cx,s.cy,40,'spark',50,1.1);FX.flash=.3;FX.flashC='#fff3c0';L.shieldT=T}
async function rHit(L,k){L.hp=Math.max(0,L.hp-1);L.rk.hit=T;SFX.crack();addShake(.8);FX.flash=.5;FX.flashC='#ffd8ff';vib([40,40,80]);burst(L.rk.cx||1050,L.gy-L.rk.h*.6,50,'spark',300,1.2);if(k)await say(k)}
function throwWhole(L,n){const r=L.rk;r.thr=T;SFX.whoosh();const p=newPiece(n,(r.cx||1050)-80,L.gy-r.h*.75,{hue:HUE.rask,vx:-8.5,vy:-7,av:2.5});p.cool=T+1.6;return p}
LEVELS[5]=()=>{const L=mkLevel(5,{bg:'boss',music:'boss',gy:620,zx:150,zh:320,ph:150,grounds:[[-600,1900,620]],recover:{x:560,y:150},hp:4,hpMax:4});
 L.rk={x:1110,h:480};if(!SV.done[5])G.heartBack=0;
 const shield=(b,a)=>{sock({cx:800,cy:300,n:b,fixed:[{n:a,at:'R',cols:Array(a).fill(HUE.rask)}],kind:'shield'});throwWhole(L,b)};
 const reThrow=t=>{// если целое потерялось (разрезано не так и куски улетели) — новое целое
  if(!L.pieces.length&&!L.sockets[0].fill&&T-(L.rk.thr||0)>3)throwWhole(L,t.b)};
 L.tasks=[
  {vals:[3,'+','x','=',7],ans:4,b:7,t:'b_t1',k:'b_k',gk:'cut',guide:()=>gFill(L.sockets[0]),count:()=>cellPts(L.sockets[0]),win:()=>shieldWin(L),chk:['x = 7 − 3 = 4','3 + 4 = 7'],setup(){shield(7,3)},done(){reThrow(this);return L.sockets[0].fill},after:()=>rHit(L,'b_hit')},
  {vals:[2,'+','x','=',8],ans:6,b:8,t:'b_t2',k:'b_k',gk:'cut',guide:()=>gFill(L.sockets[0]),count:()=>cellPts(L.sockets[0]),win:()=>shieldWin(L),chk:['x = 8 − 2 = 6','2 + 6 = 8'],setup(){shield(8,2);L.moveS=1},done(){reThrow(this);return L.sockets[0].fill},after:()=>rHit(L)},
  {vals:[8,'−','x','=',5],ans:3,t:'b_t3',k:'b_k',gk:'guard',cap:'x — сколько отрубить',guide:()=>gGuard(L.guards[0]),count:()=>guardPts(L.guards[0],5),chk:['x = 8 − 5 = 3','8 − 3 = 5'],pre:'b_p2',setup(){const g=addGuard({x:860,gy:L.gy,n:8,b:5,cols:Array(8).fill(HUE.rask),walk:0});g.noGolem=1},done:()=>{const g=L.guards[0];return g&&g.n===5&&T-g.hit>.45},after:()=>rHit(L,'b_hit2')},
  {vals:['x','−',4,'=',5],ans:9,t:'b_t4',k:'b_k',gk:'fuse',guide:()=>gFill(L.sockets[0]),count:()=>partPts(),win:()=>{L.moonWin=T;SFX.ok()},chk:['x = 5 + 4 = 9','9 − 4 = 5'],pre:'b_p3',setup(){sock({cx:820,cy:250,n:9,kind:'moon',noDots:1,q:1});L.sky=T;SFX.crack();addShake(.6);
    run(async()=>{for(const [n,x] of [[4,300],[3,460],[5,380]]){newPiece(n,x,-60,{hue:n===3?HUE.pink:HUE.gold,vx:rnd(-.4,.4),decoy:n===3});SFX.whoosh();await wait(1000)}})},done:()=>L.sockets[0].fill,after:()=>rHit(L)}];
 // щит ездит туда-сюда (пока в нём пусто)
 L.step=dt=>{const s=L.sockets[0];if(L.moveS&&s&&!s.fill&&!s.temp)s.cx=800+Math.sin(T*.9)*110};
 run(async()=>{await wait(500);await say('b_s');await say('b_p1');
  await runTasksBoss();L.rk.kneel=true;L.won=true;music('win');await wait(900);go('cs','heart')})};
async function runTasksBoss(){const L=LV;const all=L.tasks;
 for(let i=0;i<all.length;i++){const t=all[i];if(i>0)await fadeClear();if(t.pre)await say(t.pre);
  L.tasks=[t];L.bossI=i;await runTasks();L.tasks=all}
 L.tasks=all}
// ---- сердце: 8 + x = 9 ----
LEVELS[7]=()=>{const L=mkLevel(5,{bg:'boss',music:'cs',gy:620,zx:150,zh:320,ph:150,grounds:[[-600,1900,620]],recover:{x:900,y:300}});G.kind=true;
 L.rk={x:1110,h:480,kneel:true,noHeart:true};G.heartBack=T;
 L.tasks=[{vals:[8,'+','x','=',9],ans:1,t:'h_t',k:'h_k',chk:['x = 9 − 8 = 1','8 + 1 = 9'],setup(){sock({cx:700,cy:260,n:9,fixed:[{n:8,at:'L',cols:Array(8).fill(HUE.gold)}],kind:'moon'});const p=newPiece(1,960,380,{hue:HUE.rask,float:true,noCut:true});p.b.setGravityScale(0);
  },gk:'heart',always:1,guide:()=>gFill(L.sockets[0]),count:()=>cellPts(L.sockets[0]),done:()=>L.sockets[0].fill}];
 run(async()=>{await wait(500);await runTasks();FX.flash=1;FX.flashC='#fff';SFX.fanfare();await wait(1200);go('cs','whole')})};
