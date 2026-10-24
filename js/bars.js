'use strict';
// ===== Движок брусков: физика planck.js (1 бусина = 1 м = BS дизайн-пикселей), резка лентой, сплавление, гнёзда, стражи-колонны =====
const pl=planck,V=pl.Vec2,BS=60,BH=.86;
const FX={shake:0,slow:1,flash:0,flashC:'#fff'};
let LV=null,PID=0;
const HUE={gold:44,teal:176,violet:278,pink:330,blue:208,green:120,crust:32,rask:300};
function addShake(a){FX.shake=Math.min(1,FX.shake+a)}
function newWorld(o){
 const w=new pl.World({gravity:V(0,o.zeroG?0:22)});
 const L=Object.assign({world:w,pieces:[],sockets:[],guards:[],grounds:[],cradle:null,ev:[],t:0,mist:0,maxN:10,act:T,ptr:new Map(),lastTap:null,walls:null,trails:[],checks:[],recover:{x:700,y:200},killY:860,zeroG:false,wrap:false,pose:null,pz:{hop:0}},o);
 LV=L;
 w.on('pre-solve',c=>{const a=c.getFixtureA().getBody().getUserData(),b=c.getFixtureB().getBody().getUserData();
  if((a&&a.held)||(b&&b.held))c.setEnabled(false);// удерживаемый кусок проходит сквозь всё
  if(a&&b&&a.ghost>T||b&&a&&b.ghost>T)c.setEnabled(false);
  if(a&&a.phase||b&&b.phase)c.setEnabled(false)});// падающие сверху части проходят сквозь всё
 for(const g of L.grounds)mkGround(g);
 if(L.cradle)mkCradle(L.cradle);
 return L}
function mkGround(g){const [x0,x1,y]=g;const b=LV.world.createBody({type:'static',position:V((x0+x1)/2/BS,(y+200)/BS)});b.createFixture(pl.Box((x1-x0)/2/BS,200/BS),{friction:.9});g.b=b}
function mkCradle(c){const b=LV.world.createBody({type:'static',position:V((c.x0+c.x1)/2/BS,c.y/BS+.08)});const hw=(c.x1-c.x0)/2/BS;
 b.createFixture(pl.Box(hw,.08),{friction:1});b.createFixture(pl.Box(.08,.35,V(-hw,-.3),0),{friction:.5});b.createFixture(pl.Box(.08,.35,V(hw,-.3),0),{friction:.5});c.b=b}
// стены по видимым краям экрана
function syncWalls(){const L=LV,v=vis();const key=Math.round(v.x0)+'_'+Math.round(v.w);if(L.wrap||L.wallKey===key)return;L.wallKey=key;
 if(L.walls)for(const b of L.walls)L.world.destroyBody(b);L.walls=[];
 const x0=v.x0/BS,x1=(v.x0+v.w)/BS,top=(v.y0-260)/BS;
 for(const x of [x0-.5,x1+.5]){const b=L.world.createBody({type:'static',position:V(x,6)});b.createFixture(pl.Box(.5,30),{friction:.2});L.walls.push(b)}
 if(L.zeroG){for(const y of [top-.5,(v.y0+v.h)/BS+.5]){const b=L.world.createBody({type:'static',position:V((x0+x1)/2,y)});b.createFixture(pl.Box(40,.5),{friction:.2});L.walls.push(b)}}}
// ---------- куски ----------
function newPiece(n,x,y,o){o=o||{};const p=Object.assign({id:++PID,n,cols:o.cols||Array(n).fill(o.hue==null?HUE.gold:o.hue),hist:null,held:null,locked:false,sock:null,born:T,cool:0,ghost:0,fuseCool:0,a:1,float:false},o);
 delete p.hue;p.cols=p.cols.slice(0,n);while(p.cols.length<n)p.cols.push(HUE.gold);
 mkBody(p,x/BS,y/BS,o.ang||0,o.vx||0,o.vy||0,o.av||0);LV.pieces.push(p);return p}
function mkBody(p,x,y,ang,vx,vy,av){const b=LV.world.createBody({type:'dynamic',position:V(x,y),angle:ang,bullet:true,angularDamping:LV.zeroG?2.5:1.2,linearDamping:LV.zeroG||p.float?1.6:.05});
 b.createFixture(pl.Box(p.n/2,BH/2),{density:1,friction:.7,restitution:.12});b.setLinearVelocity(V(vx,vy));b.setAngularVelocity(av);b.setUserData(p);if(LV.zeroG||p.float)b.setGravityScale(0);p.b=b}
function killBody(p){if(p.b){LV.world.destroyBody(p.b);p.b=null}}
function killPiece(p){killBody(p);const i=LV.pieces.indexOf(p);if(i>=0)LV.pieces.splice(i,1);p.dead=true}
function pos(p){if(p.b){const q=p.b.getPosition();return{x:q.x*BS,y:q.y*BS,a:p.b.getAngle()}}return{x:p.x,y:p.y,a:p.ang||0}}
function axis(a){return{x:Math.cos(a),y:Math.sin(a)}}
function ends(p){const q=pos(p),d=axis(q.a),h=p.n*BS/2;return[{x:q.x-d.x*h,y:q.y-d.y*h},{x:q.x+d.x*h,y:q.y+d.y*h}]}
function toLocal(p,x,y){const q=pos(p),c=Math.cos(-q.a),s=Math.sin(-q.a),dx=x-q.x,dy=y-q.y;return{x:(dx*c-dy*s)/BS,y:(dx*s+dy*c)/BS}}
function hitPiece(x,y){let best=null,bd=1e9;for(const p of LV.pieces){if(p.locked||p.sock||p.dead||p.noGrab)continue;const l=toLocal(p,x,y);const ex=Math.abs(l.x)-p.n/2,ey=Math.abs(l.y)-BH/2;
  const d=Math.max(ex,0)+Math.max(ey,0);if(ex<.35&&ey<.55&&d<bd){bd=d;best=p}}return best}
const wrapA=a=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a};
// ---------- ввод ----------
function barsInput(){const L=LV;if(!L||L.frozen){TAPS=[];return}
 for(const t of TAPS){const pr=PTR.get(t.id);if(!pr||pr.own)continue;if(L.grab&&L.grab(t,pr))continue;let tmp=null;for(const s of L.sockets)if(s.temp){const q=s.temp.p;if(Math.abs(t.x-q.x)<q.n*BS/2+20&&Math.abs(t.y-q.y)<BS)tmp=q}
  if(tmp){pr.own='ui';ejectTemp(tmp);continue}
  const p=hitPiece(t.x,t.y);
  if(p){pr.own='piece';const q=pos(p);const st={kind:'piece',p,ox:q.x-t.x,oy:q.y-t.y,t0:T,x0:t.x,y0:t.y,moved:0};st.near=new Set();{const E=ends(p);for(const o of L.pieces){if(o===p||o.dead||o.locked)continue;const F=ends(o);for(let i=0;i<2;i++)for(let j=0;j<2;j++)if(Math.hypot(E[i].x-F[j].x,E[i].y-F[j].y)<1.6*BS)st.near.add(o.id)}}L.ptr.set(t.id,st);p.held=t.id;for(const s of L.sockets)delete s.cool[p.id];p.cool=0;p.fuseCool=Math.max(p.fuseCool,T+.15);if(p.b)p.b.setGravityScale(0);L.act=T;SFX.click()}
  else{pr.own='blade';L.ptr.set(t.id,{kind:'blade',pts:[[t.x,t.y,T]],cut:new Set(),t0:T})}}
 TAPS=[];
 for(const [id,st] of L.ptr){const pr=PTR.get(id);
  if(!pr){// отпустили
   L.ptr.delete(id);if(st.kind==='piece')release(st);else L.trails.push({pts:st.pts,t:T});continue}
  if(st.kind==='piece'){st.moved=Math.max(st.moved,Math.hypot(pr.x-st.x0,pr.y-st.y0));st.x=pr.x;st.y=pr.y}
  else{const last=st.pts[st.pts.length-1];if(Math.hypot(pr.x-last[0],pr.y-last[1])>3){st.pts.push([pr.x,pr.y,T]);if(st.pts.length>40)st.pts.shift();bladeSeg(last[0],last[1],pr.x,pr.y,st)}}}}
function release(st){const L=LV,p=st.p;if(p.dead)return;p.held=null;
 if(p.b){p.b.setGravityScale(L.zeroG||p.float?0:1);const v=p.b.getLinearVelocity();const sp=Math.hypot(v.x,v.y);if(sp>16)p.b.setLinearVelocity(V(v.x*16/sp,v.y*16/sp))}
 if(T-st.t0<.3&&st.moved<18){// короткий тап: двойной тап = отмена
  const lt=L.lastTap;if(lt&&T-lt.t<.45&&(lt.id===p.id||lt.fam===famOf(p))){L.lastTap=null;undo(p)}else L.lastTap={id:p.id,t:T,fam:famOf(p)}}
 else L.lastTap=null;
 L.relT=T}
function famOf(p){return p.hist&&p.hist.t==='cut'?p.hist.pid:-p.id}
function heldStep(dt){const L=LV;for(const [,st] of L.ptr){if(st.kind!=='piece'||st.p.dead||!st.p.b||st.x==null)continue;const p=st.p,b=p.b,q=b.getPosition();
  const tx=(st.x+st.ox)/BS,ty=(st.y+st.oy)/BS;let vx=(tx-q.x)*18,vy=(ty-q.y)*18;const sp=Math.hypot(vx,vy);if(sp>30){vx*=30/sp;vy*=30/sp}b.setLinearVelocity(V(vx,vy));
  const a=b.getAngle();const tgt=Math.round(a/Math.PI)*Math.PI;b.setAngularVelocity((tgt-a)*12);
  // сплавление
  if(T>p.fuseCool&&st.moved>40)tryFuse(p,st)}}
function tryFuse(p,st){const L=LV,E=ends(p);let best=null;
 for(const q of L.pieces){if(q===p||q.locked||q.sock||q.dead||q.guardPart||T<q.fuseCool||q.noFuse||p.noFuse)continue;if((p.hist&&p.hist.sib===q.id)||(q.hist&&q.hist.sib===p.id))continue;// братья по разрезу не слипаются (для этого двойной тап)
  const F=ends(q);
  // соседи в момент захвата не слипаются, пока кусок не отведут и не поднесут снова
  if(st.near&&st.near.has(q.id)){let md=1e9;for(let i=0;i<2;i++)for(let j=0;j<2;j++)md=Math.min(md,Math.hypot(E[i].x-F[j].x,E[i].y-F[j].y));if(md>1.6*BS)st.near.delete(q.id);else continue}
  for(let i=0;i<2;i++)for(let j=0;j<2;j++){const d=Math.hypot(E[i].x-F[j].x,E[i].y-F[j].y);if(d<1.0*BS&&(!best||d<best.d))best={q,d,i,j}}}
 if(!best)return;const q=best.q;
 if(p.n+q.n>L.maxN){if(lim('big',2500)){L.ev.push({e:'big'});SFX.bad();p.fuseCool=T+1;q.fuseCool=T+1;const qq=pos(q),pp=pos(p);if(q.b)q.b.setLinearVelocity(V(Math.sign(qq.x-pp.x||1)*5,-4))}return}
 fuse(p,q,best,st)}
// порядок бусин вдоль оси: конец 0 = «левый» в локальных координатах
function colsFrom(p,end){return end===1?p.cols.slice():p.cols.slice().reverse()}
function fuse(p,q,best,st){const L=LV;// p держим; сливаем: [... p ...][... q ...] в направлении от конца p
 const pp=pos(p),qq=pos(q);const n=p.n+q.n;
 // если у p стыкуется правый конец (1) — p слева; иначе p справа (тогда разворачиваем всё)
 let left,right,lc,rc;
 const qColsFromJoin=best.j===0?q.cols.slice():q.cols.slice().reverse();// бусины q начиная от точки стыка
 if(best.i===1){lc=p.cols.slice();rc=qColsFromJoin}else{lc=qColsFromJoin.slice().reverse();rc=p.cols.slice()}
 const cols=lc.concat(rc);
 const d=axis(pp.a);const sgn=best.i===1?1:-1;// центр нового: от центра p сдвиг на q.n/2 в сторону стыка
 const cx=pp.x+d.x*sgn*q.n*BS/2,cy=pp.y+d.y*sgn*q.n*BS/2;
 const pa={n:p.n,cols:p.cols.slice(),hist:p.hist},qa={n:q.n,cols:q.cols.slice(),hist:q.hist};
 const hist={t:'fuse',a:best.i===1?pa:Object.assign({},qa,{cols:lc}),b:best.i===1?Object.assign({},qa,{cols:rc}):pa,an:best.i===1?p.n:q.n};
 killPiece(p);killPiece(q);
 const np=newPiece(n,cx,cy,{cols,ang:pp.a,hist,fuseCool:T+.5});np.flash=T;
 if(st){np.held=st.id;st.p=np;const sx=st.x??st.x0,sy=st.y??st.y0;st.ox=cx-sx;st.oy=cy-sy;np.b.setGravityScale(0)}
 SFX.fuse();vib(25);burst(cx,cy,26,'spark',50,.7);FX.flash=Math.max(FX.flash,.25);FX.flashC='#fff3c0';L.act=T;L.ev.push({e:'fuse',n});setPose('z_push',.6)}
function splitFused(p){const L=LV,h=p.hist,q=pos(p),d=axis(q.a);const an=h.a.n,bn=h.b.n;
 const ca={x:q.x+d.x*(-p.n/2+an/2)*BS,y:q.y+d.y*(-p.n/2+an/2)*BS},cb={x:q.x+d.x*(p.n/2-bn/2)*BS,y:q.y+d.y*(p.n/2-bn/2)*BS};
 killPiece(p);
 const A=newPiece(an,ca.x-d.x*12,ca.y-d.y*12,{cols:h.a.cols,hist:h.a.hist,ang:q.a,vx:-d.x*3,vy:-d.y*3-2,fuseCool:T+1.2});
 const B=newPiece(bn,cb.x+d.x*12,cb.y+d.y*12,{cols:h.b.cols,hist:h.b.hist,ang:q.a,vx:d.x*3,vy:d.y*3-2,fuseCool:T+1.2});
 SFX.slice();burst(q.x,q.y,18,'spark',200,.6);L.ev.push({e:'undo'});return[A,B]}
// ---------- резка ----------
function segHit(ax,ay,bx,by,cx,cy,dx,dy){const r1x=bx-ax,r1y=by-ay,r2x=dx-cx,r2y=dy-cy,den=r1x*r2y-r1y*r2x;if(Math.abs(den)<1e-9)return null;
 const t=((cx-ax)*r2y-(cy-ay)*r2x)/den,u=((cx-ax)*r1y-(cy-ay)*r1x)/den;return t>=0&&t<=1&&u>=0&&u<=1?{t,u,x:ax+r1x*t,y:ay+r1y*t}:null}
function bladeSeg(ax,ay,bx,by,st){const L=LV;if(Math.hypot(bx-ax,by-ay)<2)return;
 for(const p of L.pieces.slice()){if(p.locked||p.sock||p.dead||p.held||p.n<2||st.cut.has(p.id)||p.noCut)continue;
  const E=ends(p);const h=segHit(ax,ay,bx,by,E[0].x,E[0].y,E[1].x,E[1].y);if(!h)continue;
  const xi=h.u*p.n;const k=clamp(Math.round(xi),1,p.n-1);st.cut.add(p.id);const [A,B]=cutPiece(p,k,bx-ax,by-ay);st.cut.add(A.id);st.cut.add(B.id)}
 for(const g of L.guards){if(g.done||g.n<2||st.cut.has('g'+g.id)||g.noCut)continue;const top=g.gy-g.n*BS;const h=segHit(ax,ay,bx,by,g.x,g.gy,g.x,top);if(!h)continue;
  const k=clamp(Math.round(h.u*g.n),1,g.n-1);st.cut.add('g'+g.id);cutGuard(g,k,bx-ax)}
 // осколки памяти и прочие «срезаемые»
 if(L.onBlade)L.onBlade(ax,ay,bx,by)}
function cutPiece(p,k,sx,sy){const L=LV,q=pos(p),d=axis(q.a),v=p.b?p.b.getLinearVelocity():V(0,0);const n1=k,n2=p.n-k;
 const c1={x:q.x+d.x*(-p.n/2+n1/2)*BS,y:q.y+d.y*(-p.n/2+n1/2)*BS},c2={x:q.x+d.x*(p.n/2-n2/2)*BS,y:q.y+d.y*(p.n/2-n2/2)*BS};
 const parent={n:p.n,cols:p.cols.slice(),hist:p.hist,float:p.float};const pid=p.id;
 const cut={x:q.x+d.x*(-p.n/2+k)*BS,y:q.y+d.y*(-p.n/2+k)*BS};
 killPiece(p);const sl=Math.hypot(sx,sy)||1,nx=sx/sl*1.2,ny=sy/sl*1.2;
 const A=newPiece(n1,c1.x-d.x*6,c1.y-d.y*6,{cols:parent.cols.slice(0,n1),ang:q.a,vx:v.x-d.x*2.2+nx,vy:v.y-d.y*2.2-2+ny,av:-1.2,fuseCool:T+1.1,float:parent.float});
 const B=newPiece(n2,c2.x+d.x*6,c2.y+d.y*6,{cols:parent.cols.slice(n1),ang:q.a,vx:v.x+d.x*2.2+nx,vy:v.y+d.y*2.2-2+ny,av:1.2,fuseCool:T+1.1,float:parent.float});
 A.hist={t:'cut',sib:B.id,pid,parent,side:0};B.hist={t:'cut',sib:A.id,pid,parent,side:1};
 cutFx(cut.x,cut.y,p.cols[k]);L.ev.push({e:'cut',n:p.n,k});return[A,B]}
function cutFx(x,y,hue){SFX.slice();vib(20);burst(x,y,30,'spark',hue==null?50:hue,.8);FX.slow=.22;addShake(.15);setPose('z_slash',.45);LV.act=T;LV.slashes=(LV.slashes||[]);LV.slashes.push({x,y,t:T})}
function cutGuard(g,k,dir){const L=LV;const n2=g.n-k;const top=g.gy-g.n*BS;const cy=g.gy-k*BS-n2*BS/2;const cols=g.cols.slice(k);
 g.n=k;g.cols=g.cols.slice(0,k);
 const P=newPiece(n2,g.x,cy-8,{cols,ang:Math.PI/2,vx:(dir>=0?1:-1)*2.5,vy:-5,av:(dir>=0?1:-1)*2.2,fuseCool:T+1});
 P.hist={t:'cut',guard:g.id,pid:-1000-g.id};g.cuts.push(P.id);g.hit=T;
 cutFx(g.x,g.gy-k*BS,cols[0]);L.ev.push({e:'gcut',g,k})}
function reattach(p,g){const L=LV,q=pos(p);killPiece(p);g.cols=g.cols.concat(p.cols);g.n+=p.n;g.cuts=g.cuts.filter(i=>i!==p.id);g.hit=T;
 SFX.fuse();burst(g.x,g.gy-g.n*BS,24,'spark',HUE.violet,.7);L.ev.push({e:'undo'});L.act=T}
// ---------- отмена (двойной тап) ----------
function undo(p){const L=LV;const h=p.hist;
 if(!h){SFX.bad();p.wob=T;return}
 if(h.t==='fuse'){splitFused(p);return}
 if(h.t==='cut'){
  if(h.guard){const g=L.guards.find(g=>g.id===h.guard);if(g&&!g.done){reattach(p,g);return}}
  const s=L.pieces.find(q=>q.id===h.sib&&!q.locked&&!q.sock&&!q.dead);
  if(s){// склеить обратно
   const pp=pos(p),ss=pos(s);const par=h.parent;const left=h.side===0?p:s,right=h.side===0?s:p;
   const cx=(pp.x*p.n+ss.x*s.n)/(p.n+s.n),cy=(pp.y*p.n+ss.y*s.n)/(p.n+s.n);
   killPiece(p);killPiece(s);const np=newPiece(par.n,cx,cy-10,{cols:par.cols,hist:par.hist,ang:0,vy:-2,fuseCool:T+.8,float:par.float});np.flash=T;
   SFX.fuse();burst(cx,cy,24,'spark',200,.7);L.ev.push({e:'undo'});L.act=T;return}
  SFX.bad();p.wob=T}}
// ---------- гнёзда ----------
// s: {cx,cy,n,fixed:[{n,at:'L'|'R',cols}],kind,fog}
function addSocket(o){const s=Object.assign({id:++PID,fixed:[],fill:null,temp:null,cool:{},fog:false,kind:'mold',pulse:0,a:1},o);s.fixedN=s.fixed.reduce((a,f)=>a+f.n,0);s.need=s.n-s.fixedN;LV.sockets.push(s);return s}
function sockRect(s){// пустая область
 const x0=s.cx-s.n*BS/2;const fl=s.fixed.filter(f=>f.at==='L').reduce((a,f)=>a+f.n,0),fr=s.fixed.filter(f=>f.at==='R').reduce((a,f)=>a+f.n,0);
 return{x0:x0+fl*BS,x1:x0+(s.n-fr)*BS,y:s.cy,fl,fr}}
function socketStep(){const L=LV;
 for(const s of L.sockets){if(s.fill||s.off)continue;const R=sockRect(s);
  if(s.temp){const tp=s.temp;if(T-tp.t0>1.5){// выталкиваем короткий
    const p=tp.p;s.temp=null;p.sock=null;mkBody(p,p.x/BS,(s.cy-70)/BS,0,rnd(-1,1),-8,rnd(-2,2));p.cool=T+1.2;s.cool[p.id]=1e9}continue}
  for(const p of L.pieces){if(p.phase||p.held!=null||p.locked||p.sock||p.dead||!p.b||T<p.cool||(s.cool[p.id]||0)>T)continue;const q=pos(p);
   const w=R.x1-R.x0,cx=(R.x0+R.x1)/2;if(Math.abs(q.x-cx)>w/2+BS*.9||Math.abs(q.y-R.y)>(s.dy||BS))continue;
   // нужна примерно горизонтальная ориентация или вертикальный кусок низко
   if(s.accept&&!s.accept(p))continue;
   const need=s.need;
   if(p.n===need){lockIn(p,s,R);break}
   else if(p.n>need){const v=p.b.getLinearVelocity();p.b.setLinearVelocity(V(q.x<cx?-5:5,-9));p.b.setAngularVelocity(rnd(-3,3));s.cool[p.id]=1e9;p.cool=T+.6;s.rej=T;L.mist++;SFX.bad();vib([20,30,20]);L.ev.push({e:'long',s,p});setPose('z_oops',.9);burst(q.x,q.y,10,'spark',0,.4)}
   else{s.temp={p,t0:T};p.sock=s;killBody(p);const x=s.fixed.some(f=>f.at==='R')?R.x1-p.n*BS/2:R.x0+p.n*BS/2;p.x=x;p.y=R.y;p.ang=0;s.rej=T;L.mist++;SFX.bad();L.ev.push({e:'short',s,p});setPose('z_oops',.9);break}}}}
function lockIn(p,s,R){const L=LV;const q=pos(p);killBody(p);p.locked=true;p.sock=s;s.fill=p;p.sx=q.x;p.sy=q.y;p.sa=wrapA(q.a);
 if(Math.abs(p.sa)>Math.PI/2){p.sa=wrapA(p.sa-Math.PI);p.cols=p.cols.slice().reverse()}
 p.x=(R.x0+R.x1)/2;p.y=R.y;p.ang=0;p.lockT=T;s.fog=false;SFX.lock();vib(40);burst(p.x,p.y,30,'spark',55,.8);FX.flash=.35;FX.flashC='#fff6c8';L.ev.push({e:'lock',s,p});L.act=T}
function ejectTemp(p){const s=p.sock;if(!s||!s.temp)return;s.temp.t0=-9}
// ---------- стражи (колонны) ----------
function addGuard(o){const g=Object.assign({id:++PID,cuts:[],done:false,walk:0,hit:0,state:'angry'},o);g.cols=g.cols||Array(g.n).fill(HUE.violet);g.n0=g.n;LV.guards.push(g);return g}
// ---------- шаг ----------
function barsStep(dt){const L=LV;if(!L)return;syncWalls();heldStep(dt);
 if(L.zeroG){for(const p of L.pieces){if(!p.b||p.held!=null)continue;const v=p.b.getLinearVelocity();if(L.wind)p.b.applyForceToCenter(V(L.wind*p.b.getMass(),Math.sin(T*.7+p.id)*.2*p.b.getMass()),true)}}
 for(const p of L.pieces)if(p.b&&p.float&&p.held==null&&!L.zeroG){/* парящий кусок (босс) */}
 L.world.step(dt,8,3);L.t+=dt;
 socketStep();
 // перецеп к стражу: кусок поднесли к верху колонны
 for(const g of L.guards){if(g.done)continue;const top={x:g.x,y:g.gy-g.n*BS};for(const p of L.pieces){if(!p.hist||p.hist.guard!==g.id||p.held==null||T<p.fuseCool)continue;const E=ends(p);if(E.some(e=>Math.hypot(e.x-top.x,e.y-top.y)<BS*.8)){for(const [id,st] of L.ptr)if(st.p===p)L.ptr.delete(id);reattach(p,g)}}}
 // упал в пропасть / улетел
 const v=vis();
 for(const p of L.pieces.slice()){if(!p.b)continue;const q=pos(p);
  if(L.wrap){if(q.x<v.x0-p.n*BS/2-40){p.b.setPosition(V((v.x0+v.w+p.n*BS/2+30)/BS,p.b.getPosition().y));L.ev.push({e:'wrap',p})}
   if(q.y<v.y0+30)p.b.applyForceToCenter(V(0,6*p.b.getMass()),true);if(q.y>v.y0+v.h-30)p.b.applyForceToCenter(V(0,-6*p.b.getMass()),true)}
  if(q.y>L.killY||q.x<v.x0-400||q.x>v.x0+v.w+400){if(L.onLost&&L.onLost(p))continue;const r=L.recover;p.b.setPosition(V(r.x/BS,r.y/BS));p.b.setLinearVelocity(V(0,1));p.b.setAngularVelocity(0);p.b.setAngle(0);p.ghost=T+.4;L.pz.hop=T;burst(r.x,r.y,24,'spark',200,.7);SFX.pop();L.ev.push({e:'fall'})}}}
function setPose(n,d){if(LV)LV.pose={n,until:T+d}}
// ---------- рисование ----------
function drawBar(x,y,a,n,cols,o){o=o||{};const L=n*BS,h=BS*BH;X.save();X.translate(x,y);X.rotate(a);if(o.alpha!=null)X.globalAlpha*=o.alpha;
 const pie=o.pie;
 // корпус-трубка
 X.fillStyle=pie?'rgba(120,64,20,.9)':o.ghost?'rgba(200,220,255,.12)':'rgba(24,14,60,.78)';rr(-L/2,-h/2,L,h,h/2);X.fill();
 X.lineWidth=o.held?5:3.5;X.strokeStyle=o.held?'#fff7c2':pie?'#ffd890':'rgba(220,230,255,.9)';X.stroke();
 const r=BS*.37;
 for(let i=0;i<n;i++){const cx=-L/2+BS/2+i*BS,hue=cols[i];
  if(pie){const g=X.createRadialGradient(cx-r*.3,-r*.3,r*.15,cx,0,r);g.addColorStop(0,'#ffe9b0');g.addColorStop(.6,'#e8a24a');g.addColorStop(1,'#9a5a1c');X.fillStyle=g;X.beginPath();X.arc(cx,0,r,0,7);X.fill();X.fillStyle='rgba(180,40,60,.85)';X.beginPath();X.arc(cx,0,r*.45,0,7);X.fill();continue}
  const g=X.createRadialGradient(cx-r*.35,-r*.35,r*.1,cx,0,r);g.addColorStop(0,`hsl(${hue},100%,92%)`);g.addColorStop(.45,`hsl(${hue},90%,62%)`);g.addColorStop(1,`hsl(${hue},80%,30%)`);
  X.fillStyle=g;X.beginPath();X.arc(cx,0,r,0,7);X.fill();X.fillStyle='rgba(255,255,255,.75)';X.beginPath();X.ellipse(cx-r*.32,-r*.38,r*.28,r*.16,-.5,0,7);X.fill()}
 // перегородки
 X.strokeStyle='rgba(230,235,255,.35)';X.lineWidth=2;for(let i=1;i<n;i++){const cx=-L/2+i*BS;X.beginPath();X.moveTo(cx,-h/2+5);X.lineTo(cx,h/2-5);X.stroke()}
 if(!pie&&!o.noGlow){X.globalCompositeOperation='lighter';for(let i=0;i<n;i++){const cx=-L/2+BS/2+i*BS,hue=cols[i];const g=X.createRadialGradient(cx,0,0,cx,0,BS*.7);g.addColorStop(0,`hsla(${hue},100%,70%,${o.flash?.55:.28})`);g.addColorStop(1,`hsla(${hue},100%,60%,0)`);X.fillStyle=g;X.fillRect(cx-BS*.7,-BS*.7,BS*1.4,BS*1.4)}X.globalCompositeOperation='source-over'}
 X.restore()}
let TAGQ=null,TAGOB=null;
function numTag(v,x,y,size,o){o=o||{};o.ga=X.globalAlpha*(o.alpha==null?1:o.alpha);if(o.ga<.04)return;if(TAGQ){TAGQ.push({v,x,y,size,o});return}numTag0(v,x,y,size,o)}
// подписи-числа никогда не перекрываются: раздвигаем по оси меньшего перекрытия, «якорные» (у гнёзд/стражей) не двигаем
function flushTags(){const q=TAGQ,ob=TAGOB||[];TAGQ=null;TAGOB=null;if(!q)return;const mv=t=>t.o.id==='pnum'||t.o.id==='gnum';
 for(const t of q){const s=t.size||52;t.w=s*.6*String(t.v).length+s*.35;t.h=s*.95}
 // жадная расстановка подписей кусков: над / под / у концов — первая позиция, не задевающая чужие бруски и уже поставленные подписи
 const hit=(t,x,y,placed)=>{for(const o of ob){if(o.p===t.o.pid)continue;if(Math.abs(x-o.x)<t.w/2+o.hx&&Math.abs(y-o.y)<t.h/2+o.hy)return true}
  for(const u of placed){if(Math.abs(x-u.x)<(t.w+u.w)/2+4&&Math.abs(y-u.y)<(t.h+u.h)/2+2)return true}return false};
 const placed=q.filter(t=>!t.o.cand);
 for(const t of q.filter(t=>t.o.cand)){for(const [cx,cy] of t.o.cand){if(!hit(t,cx,cy,placed)){t.x=cx;t.y=cy;break}}placed.push(t)}
 for(let it=0;it<8;it++){let any=false;for(let i=0;i<q.length;i++)for(let j=i+1;j<q.length;j++){const a=q[i],b=q[j];
   const ox=(a.w+b.w)/2+4-Math.abs(a.x-b.x),oy=(a.h+b.h)/2+2-Math.abs(a.y-b.y);if(ox<=0||oy<=0)continue;any=true;
   const ma=mv(a),mb=mv(b);if(!ma&&!mb)continue;const wa=ma&&mb?.5:ma?1:0,wb=1-wa;
   if(ox<oy){const d=a.x<b.x||(a.x===b.x&&i<j)?-1:1;a.x+=d*ox*wa;b.x-=d*ox*wb}else{const d=a.y<b.y||(a.y===b.y&&i<j)?-1:1;a.y+=d*oy*wa;b.y-=d*oy*wb}}
  if(!any)break}
 for(const t of q)numTag0(t.v,t.x,t.y,t.size,t.o)}
function numTag0(v,x,y,size,o){o=o||{};const s=size||52;const g0=X.globalAlpha;if(o.ga!=null)X.globalAlpha=o.ga;txt(String(v),x,y,s,o.col||'#fff',{f:NUM,st:o.st||'#1a0f3a',lw:Math.max(6,s*.2),id:o.id||'num',kind:'num'});X.globalAlpha=g0}
function drawPieces(){const L=LV;
 for(const p of L.pieces){if(p.sock&&!p.locked)continue;let q=pos(p);let x=q.x,y=q.y,a=q.a;
  if(p.locked&&p.lockT!=null){const k=ease(clamp((T-p.lockT)/.25,0,1));x=lerp(p.sx,p.x,k);y=lerp(p.sy,p.y,k);a=lerp(p.sa,0,k)}
  if(p.wob&&T-p.wob<.4)x+=Math.sin(T*60)*5;
  const fl=p.flash&&T-p.flash<.4;
  drawBar(x,y,a,p.n,p.cols,{held:p.held!=null,flash:fl,alpha:p.a,pie:L.pie});
  if(!p.hideNum&&!(p.locked&&p.sock&&p.sock.hideNum)){const up=Math.abs(Math.cos(a))>.5?BS*.95:0;const side=up?0:BS*.95;const hl=p.n*BS/2,ca=Math.abs(Math.cos(a)),sa=Math.abs(Math.sin(a));if(TAGOB)TAGOB.push({p,x,y,hx:ca*hl+sa*BS*.42,hy:sa*hl+ca*BS*.42});
   const d=BS*.95,e=hl+BS*.75;const cand=up?[[x,y-d],[x,y+d],[x-e*ca,y-e*sa],[x+e*ca,y+e*sa]]:[[x+d,y],[x-d,y],[x,y-e],[x,y+e]];
   numTag(p.n,x+side,y-up,52,{col:p.locked?'#fff3a0':'#fff',id:'pnum',pid:p,cand,alpha:p.a==null?1:p.a})}}}
function drawSocket(s){const R=sockRect(s);const L0=s.cx-s.n*BS/2,h=BS*BH+14;X.save();X.globalAlpha*=s.a;
 const pulse=s.temp||(s.rej&&T-s.rej<.5);const sx=pulse?Math.sin(T*50)*4:0;X.translate(sx,0);
 // ложе
 X.fillStyle=s.kind==='bridge'?'rgba(40,30,50,.55)':'rgba(10,12,40,.5)';rr(L0-8,s.cy-h/2,s.n*BS+16,h,h/2);X.fill();
 X.lineWidth=4;X.strokeStyle=s.fill?'#ffe680':'rgba(190,215,255,.95)';X.stroke();
 // пустые ячейки
 if(!s.fill){X.setLineDash([8,7]);X.strokeStyle=`rgba(255,240,170,${.55+.35*Math.sin(T*4)})`;X.lineWidth=3;rr(R.x0+4,s.cy-h/2+7,R.x1-R.x0-8,h-14,(h-14)/2);X.stroke();X.setLineDash([]);
  if(s.q&&!s.fog)txt('?',(R.x0+R.x1)/2,s.cy-BS*.95,56,'#fff3a0',{f:NUM,st:'#1a0f3a',lw:10,id:'sq',kind:'num'});
  if(!s.fog&&!s.noDots){X.fillStyle='rgba(255,240,170,.25)';for(let i=0;i<s.need;i++){X.beginPath();X.arc(R.x0+BS/2+i*BS,s.cy,BS*.12,0,7);X.fill()}}}
 X.restore();
 // неподвижные части
 let x=L0;for(const f of s.fixed.filter(f=>f.at==='L')){drawBar(x+f.n*BS/2,s.cy,0,f.n,f.cols||Array(f.n).fill(HUE.blue),{});if(!s.hideFixNum)numTag(f.n,x+f.n*BS/2,s.cy-BS*.95,48,{id:'fixnum'});x+=f.n*BS}
 x=L0+s.n*BS;for(const f of s.fixed.filter(f=>f.at==='R')){drawBar(x-f.n*BS/2,s.cy,0,f.n,f.cols||Array(f.n).fill(HUE.blue),{});if(!s.hideFixNum)numTag(f.n,x-f.n*BS/2,s.cy-BS*.95,48,{id:'fixnum'});x-=f.n*BS}
 // временно лежащий короткий кусок (провисает)
 if(s.temp){const p=s.temp.p,k=T-s.temp.t0;const sag=Math.min(18,k*40)+Math.sin(T*30)*2;drawBar(p.x,p.y+sag,(s.fixed.some(f=>f.at==='R')?-1:1)*Math.min(.12,k*.2),p.n,p.cols,{});numTag(p.n,p.x,p.y-BS*.95+sag,50,{id:'pnum'});
  const gx0=s.fixed.some(f=>f.at==='R')?R.x0:R.x0+p.n*BS,gx1=s.fixed.some(f=>f.at==='R')?R.x1-p.n*BS:R.x1;X.fillStyle=`rgba(255,80,80,${.35+.25*Math.sin(T*12)})`;rr(gx0+4,s.cy-12,Math.max(6,gx1-gx0-8),24,12);X.fill()}
 // туман
 if(s.fog){X.save();for(let i=0;i<7;i++){const fx=R.x0+(R.x1-R.x0)*(i+.5)/7+Math.sin(T*.8+i)*14,fy=s.cy+Math.cos(T*.9+i*1.7)*8;const g=X.createRadialGradient(fx,fy,4,fx,fy,BS*1.2);g.addColorStop(0,'rgba(235,240,255,.85)');g.addColorStop(1,'rgba(235,240,255,0)');X.fillStyle=g;X.beginPath();X.arc(fx,fy,BS*1.2,0,7);X.fill()}X.restore();
  txt('?',(R.x0+R.x1)/2,s.cy-BS*.95,56,'#fff3a0',{f:NUM,st:'#1a0f3a',lw:10,id:'fog',kind:'num'})}
 // общий размер целого над гнездом
 if(s.showTotal){numTag(s.totalLabel||s.n,s.cx,s.cy+BS*1.15,50,{col:'#ffe066',id:'total'})}}
function drawGuard(g){const top=g.gy-g.n*BS;const sh=g.hit&&T-g.hit<.3?Math.sin(T*70)*4:0;
 // кристальный столб: бусины снизу вверх
 X.save();X.translate(g.x+sh,0);const h=BS*BH;X.fillStyle='rgba(30,10,60,.7)';rr(-h/2,top,h,g.n*BS,h/2);X.fill();X.lineWidth=3.5;X.strokeStyle=g.done?'#ffe680':'rgba(220,200,255,.95)';X.stroke();X.restore();
 for(let i=0;i<g.n;i++){const y=g.gy-BS/2-i*BS;drawBar(g.x+sh,y,0,1,[g.cols[i]],{noGlow:false})}
 numTag(g.n,g.x+sh,top-BS*.6,54,{col:g.done?'#fff3a0':'#fff',id:'gnum'})}
function drawTrails(){const L=LV;X.save();X.globalCompositeOperation='lighter';X.lineCap='round';X.lineJoin='round';
 const all=[];for(const [,st] of L.ptr)if(st.kind==='blade')all.push(st.pts);L.trails=L.trails.filter(t=>T-t.t<.35);for(const t of L.trails)all.push(t.pts);
 for(const pts of all){const P=pts.filter(p=>T-p[2]<.28);for(let i=1;i<P.length;i++){const k=1-(T-P[i][2])/.28;X.strokeStyle=`hsla(${190+i*4},100%,80%,${k*.9})`;X.lineWidth=4+k*14;X.beginPath();X.moveTo(P[i-1][0],P[i-1][1]);X.lineTo(P[i][0],P[i][1]);X.stroke();
   X.strokeStyle=`rgba(255,255,255,${k})`;X.lineWidth=2+k*4;X.stroke()}}
 L.slashes=(L.slashes||[]).filter(s=>T-s.t<.4);for(const s of L.slashes){const k=(T-s.t)/.4;X.strokeStyle=`rgba(255,250,210,${1-k})`;X.lineWidth=6*(1-k)+1;X.beginPath();X.arc(s.x,s.y,20+k*90,0,7);X.stroke()}
 X.restore()}
function drawCradle(c){if(!c)return;X.save();const g=X.createLinearGradient(0,c.y-30,0,c.y+14);g.addColorStop(0,'rgba(200,225,255,0)');g.addColorStop(1,'rgba(200,225,255,.55)');X.fillStyle=g;X.fillRect(c.x0,c.y-30,c.x1-c.x0,40);
 X.fillStyle='rgba(235,245,255,.9)';rr(c.x0-6,c.y,c.x1-c.x0+12,10,5);X.fill();X.globalCompositeOperation='lighter';X.fillStyle='rgba(150,190,255,.25)';rr(c.x0-14,c.y-6,c.x1-c.x0+28,22,11);X.fill();
 X.fillStyle='rgba(235,245,255,.85)';X.fillRect(c.x0-6,c.y-22,8,28);X.fillRect(c.x1-2,c.y-22,8,28);X.restore()}
