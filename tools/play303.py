# Полное прохождение реальными жестами: ошибка + исправление на каждом задании, аудит, fps, 0 ошибок консоли.
import asyncio,sys,json,time,math,os
from playwright.async_api import async_playwright
W,H=int(sys.argv[1]),int(sys.argv[2]);OUT=sys.argv[3] if len(sys.argv)>3 else f'/workspace/lesson303/shots/pl_{W}x{H}'
URL=os.environ.get('URL','http://localhost:8303/index.html')
LOG=[];FAIL=[];AUDS=[];BS=60
def log(*a):
  s=' '.join(str(x) for x in a);LOG.append(s);print(s,flush=True)
async def main():
  import shutil;shutil.rmtree(OUT,ignore_errors=True);os.makedirs(OUT,exist_ok=True)
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    pg=await b.new_page(viewport={'width':W,'height':H},has_touch=True,device_scale_factor=2)
    errs=[];pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None);pg.on('pageerror',lambda e: errs.append(str(e)))
    await pg.goto(URL);await pg.wait_for_timeout(3000)
    await pg.evaluate("localStorage.clear();0")
    W8=lambda ms: pg.wait_for_timeout(ms);ev=pg.evaluate
    async def st(): return await ev("__T.st()")
    async def shot(n): await pg.screenshot(path=f'{OUT}/{n}.jpg',type='jpeg',quality=72)
    async def audit(name):
      await ev("G.auditReq=1");await W8(150)
      a=await ev("({t:(G._aud||{t:[]}).t,h:G.heroes||[],vw:innerWidth,vh:innerHeight})")
      bad=[]
      for t in a['t']:
        bb=t['b'];box=t['box']
        if not bb or not t['t'].strip(): continue
        out=bb[2]<0 or bb[3]<0 or bb[0]>a['vw'] or bb[1]>a['vh']
        if not out and (bb[0]<-1 or bb[1]<-1 or bb[2]>a['vw']+1 or bb[3]>a['vh']+1): bad.append(('edgecut',t['id'],t['t'][:20],[round(v) for v in bb]))
        if out: continue
        if box and (bb[0]<box[0]-2 or bb[1]<box[1]-2 or bb[2]>box[2]+2 or bb[3]>box[3]+2): bad.append(('outframe',t['id'],t['t'][:20],[round(v) for v in bb],[round(v) for v in box]))
        if t['t'].strip().isdigit() and t['css']<14: bad.append(('smalldigit',t['id'],t['t'],round(t['css'],1)))
      for h in a['h']:
        if h.get('ar') and abs(h['w']/h['h']-h['ar'])/h['ar']>.03: bad.append(('stretch',h['n']))
        if h['feet']<a['vh']*.35 and G_SCENE[0]=='play': bad.append(('float?',h['n'],round(h['feet'])))
      AUDS.append((name,len(a['t']),bad))
      if bad: log('AUDIT',name,bad[:6])
      else: log('audit ok',name,len(a['t']),'texts',len(a['h']),'heroes')
    G_SCENE=['']
    want=lambda k: not os.environ.get('ONLY') or k in os.environ['ONLY'].split(',')
    async def until(js,timeout=8000,step=100):
      t0=time.time()
      while time.time()-t0<timeout/1000:
        if await ev(js): return True
        await W8(step)
      return False
    async def btn(id,timeout=8000):
      t0=time.time()
      while time.time()-t0<timeout/1000:
        bs=await ev("G.btns()");m=[x for x in bs if x['id']==id and not x['dis']]
        if m:
          c=await ev(f"G.pg({m[0]['x']},{m[0]['y']})");await pg.touchscreen.tap(c['x'],c['y']);return True
        await W8(150)
      FAIL.append('no button '+id);log('NO BUTTON',id,[x['id'] for x in bs]);return False
    async def C(x,y):
      c=await ev(f"G.pg({x},{y})");return c['x'],c['y']
    async def swipe(x0,y0,x1,y1,n=10):
      a=await C(x0,y0);bb=await C(x1,y1)
      await pg.mouse.move(*a);await pg.mouse.down()
      for i in range(1,n+1):
        await pg.mouse.move(a[0]+(bb[0]-a[0])*i/n,a[1]+(bb[1]-a[1])*i/n);await W8(18)
      await pg.mouse.up();await W8(60)
    async def drag(x0,y0,x1,y1,n=22,hold=250,lift=True):
      pts=[(x0,y0)]
      if lift=='always' or (lift and abs(x1-x0)>80):
        ly=max(140,min(y0,y1)-110);pts+=[(x0,ly),(x1,ly)]
      pts.append((x1,y1));P=[await C(*q) for q in pts]
      await pg.mouse.move(*P[0]);await pg.mouse.down();await W8(40)
      for a,bb in zip(P,P[1:]):
        m=max(6,n//(len(P)-1))
        for i in range(1,m+1):
          k=i/m;await pg.mouse.move(a[0]+(bb[0]-a[0])*k,a[1]+(bb[1]-a[1])*k);await W8(18)
      await W8(hold);await pg.mouse.up();await W8(80)
    async def tap2(x,y):
      a=await C(x,y)
      for _ in range(2):
        await pg.mouse.move(*a);await pg.mouse.down();await W8(40);await pg.mouse.up();await W8(110)
    async def pcs(): return await ev("__T.pieces()")
    async def piece(n,free=True):
      for q in await pcs():
        if q['n']==n and not q['locked'] and not q['sock']: return q
      return None
    async def mist(): return await ev("LV?LV.mist:0")
    async def ready(timeout=20000):
      return await until("(()=>{const s=__T.st();return s.scene==='play'&&s.task&&!s.task.solved&&!s.talk})()",timeout)
    async def settle(ms=900):
      await W8(min(ms,400))
      if await ev("LV&&LV.zeroG"): await W8(max(0,ms-400));return
      t0=time.time();a=await pcs()
      while time.time()-t0<5:
        await W8(150);bq=await pcs()
        if len(a)==len(bq) and all(abs(x['x']-y['x'])<1.5 and abs(x['y']-y['y'])<1.5 for x,y in zip(a,bq)): return
        a=bq
    async def cut(n,m):
      q=await piece(n)
      if not q: log('no piece',n,[(q['n'],round(q['x']),round(q['y']),q['sock']) for q in await pcs()]);FAIL.append(f'no piece {n}');return
      E=await ev(f"__T.ends({q['id']})");ax,ay,bx,by=E[0]['x'],E[0]['y'],E[1]['x'],E[1]['y'];k=m/n
      px,py=ax+(bx-ax)*k,ay+(by-ay)*k;l=math.hypot(bx-ax,by-ay) or 1;nx,ny=-(by-ay)/l,(bx-ax)/l
      await swipe(px-nx*80,py-ny*80,px+nx*80,py+ny*80)
    async def drop(n,si=0,dx=0):
      q=await piece(n)
      if not q and await ev("(()=>{const s=__T.st();return !s.task||s.task.solved||s.scene!=='play'})()"): log('  (already solved)');return
      if not q: log('no piece',n,[(q['n'],round(q['x']),round(q['y']),q['sock']) for q in await pcs()]);FAIL.append(f'no piece {n}');return
      s=(await ev("__T.socks()"))[si];x=(s['x0']+s['x1'])/2+dx;y=s['y']
      await drag(q['x'],q['y'],x,y)
    async def fuse(na,nb):
      a=await piece(na);bq=await piece(nb)
      if not a or not bq: log('fuse miss',na,nb,[(q['n'],round(q['x']),round(q['y']),q['sock']) for q in await pcs()]);FAIL.append(f'fuse {na}+{nb}');return
      E=await ev(f"__T.ends({bq['id']})");r=max(E,key=lambda e:e['x']);l=min(E,key=lambda e:e['x'])
      vr=min(await ev('vis().x0+vis().w-40'),1100);vl=max(await ev('vis().x0+40'),60)
      others=[]
      for o in await pcs():
        if o['id'] in (a['id'],bq['id']) or o['locked']: continue
        others+=await ev(f"__T.ends({o['id']})")
      cands=[]
      for side,e in (('R',r),('L',l)):
        cx=e['x']+(1 if side=='R' else -1)*(na*BS/2+6);far=e['x']+(1 if side=='R' else -1)*(na*BS+6)
        if far>vr or far<vl: continue
        d=min([math.hypot(far-o['x'],e['y']-o['y']) for o in others]+[999])
        cands.append((d,cx,e['y']))
      if not cands: cands=[(0,r['x']+na*BS/2+6,r['y'])]
      _,tx,ty=max(cands)
      await drag(a['x'],a['y'],tx,ty,hold=450,lift='always');await settle(500);log('  fused?',[(q['n'],round(q['x']),round(q['y'])) for q in await pcs()])
    async def gcut(b):
      g=(await ev("__T.guards()"))[0];y=g['gy']-b*BS;await swipe(g['x']-90,y-4,g['x']+90,y+4)
    async def gundo():
      await W8(1300)
      for q in await pcs():
        if q['guard'] is not None and not q['locked']:
          await tap2(q['x'],q['y']);return True
      log('no guard piece to undo');return False
    async def solved(timeout=9000):
      ok=await until("(()=>{const s=__T.st();return !s.task||s.task.solved||s.scene!=='play'})()",timeout)
      if not ok:
        FAIL.append('not solved '+json.dumps(await st()));log('NOT SOLVED',await st());await shot('FAIL_'+str(len(FAIL)))
        if len(FAIL)>2: raise SystemExit('too many fails')
      return ok
    async def shard_try():
      ok=await until("(()=>{const s=__T.st().shard;return s&&s.on&&s.x>vis().x0+120&&s.x<vis().x0+vis().w-160})()",16000,60)
      if ok:
        s=(await st())['shard'];await pg.touchscreen.tap(*(await C(s['x']+12,s['y'])));await W8(300)
        log('shard',(await st())['shard'])
    async def mcheck(m0,what):
      m1=await mist();ok=m1>m0;log('  mistake',what,'registered' if ok else 'NOT registered');
      if not ok and what!='heart-miss': FAIL.append('mistake not registered '+what)
    # ---------- титул и интро
    G_SCENE[0]='title';await shot('00_title');await audit('title')
    await btn('play');await until("G.scene==='cs'",4000);await W8(900);await shot('01_intro');await audit('intro')
    await btn('next');await W8(400);i1=(await st())['cs'];log('cs after next',i1);await btn('skip');await ev('G.fast=true');await until("G.scene==='map'",5000);G_SCENE[0]='map';await W8(1200);await shot('02_map');await audit('map')
    async def level(i):
      if os.environ.get('ONLY'): await ev(f"go('play',{i})")
      else: await btn('n'+str(i))
      await until("G.scene==='play'",4000);G_SCENE[0]='play';await ready()
      log('LEVEL',i,await st())
    async def finish(to='map',timeout=20000):
      ok=await until(f"G.scene==='{to}'",timeout)
      if not ok: FAIL.append(f'level not finished -> {to}');log('NOT FINISHED',await st())
      G_SCENE[0]=to;await W8(800)
    # ---------- Гл.1
    if want('0'):
      await level(0);await settle(800);await shot('10_c1');await audit('c1')
      m=await mist();await drop(8,0);await settle(700);await mcheck(m,'whole8->mold3');await shot('11_c1_bad')
      await cut(8,3);await settle(900);await shot('12_c1_cut');await drop(3,0);await settle(400);await drop(5,1);await solved();await shot('13_c1_ok')
      await ready();await shard_try();await settle(600);m=await mist();await drop(2,0,dx=120);await settle(300);await mcheck(m,'2->6 short');await W8(1900)
      await fuse(2,4);await shot('14_c1_fuse');await drop(6,0);await solved()
      await finish()
    # ---------- Гл.2 мост
    if want('1'):
      await level(1);await settle(800);await shot('20_c2');await audit('c2')
      for k,(bb,need) in enumerate([(8,5),(9,5),(9,7)]):
        if k:await ready()
        if k==1: await shard_try()
        await settle(700);m=await mist();await drop(bb,0);await settle(900);await mcheck(m,f'whole{bb} on bridge')
        if k==2: await shot('21_c2_bad')
        await settle(1200);await cut(bb,need);await settle(1000);await drop(need,0);await solved()
        if k==0: await W8(250);await shot('22_c2_ok')
      await finish()
    # ---------- Гл.3 ворота
    if want('2'):
      await level(2);await audit('c3')
      for k,(ns,tot) in enumerate([([7,2],9),([4,3,2],7),([3,5,4],8)]):
        if k:await ready()
        await W8(len(ns)*900+1500)
        if k==1: await shard_try()
        m=await mist();await drop(ns[0],0);await settle(400);await mcheck(m,f'{ns[0]} into key {tot}')
        if k==1: await shot('30_c3_bad')
        await W8(1900);await fuse(ns[1],ns[0]);await settle(300)
        if k==1: await shot('31_c3_fused')
        await drop(tot,0);await solved()
      await finish(timeout=30000)
    # ---------- Гл.4 стражи
    if want('3'):
      await level(3);await audit('c4')
      for k,(a,bb) in enumerate([(8,3),(7,5),(6,2)]):
        if k:await ready()
        if k==1: await shard_try()
        m=await mist();await gcut(bb-1);await settle(300);await mcheck(m,f'guard too deep {a}->{bb-1}')
        if k==0: await shot('40_c4_bad')
        await gundo();await settle(500)
        g=(await ev("__T.guards()"))[0];log('  after undo n=',g['n'])
        if g['n']!=a: FAIL.append('guard undo failed')
        await gcut(bb);await solved()
        if k==0: await W8(200);await shot('41_c4_ok')
      await finish()
    # ---------- Гл.5 кит
    if want('4'):
      await level(4);await audit('c5')
      async def visible(n):
        return await until(f"__T.pieces().some(p=>p.n==={n}&&p.x<vis().x0+vis().w-{n*30+40}&&p.x>vis().x0+{n*30})",15000,80)
      await visible(7);m=await mist();await drop(7,0);await settle(600);await mcheck(m,'whole7 into sky9')
      await shot('50_c5_bad');await W8(800);await visible(7);await cut(7,4);await settle(600);await drop(4,0);await solved()
      await ready();await shard_try()
      for n in (4,3,2): await visible(n)
      m=await mist();await drop(2,0);await settle(300);await mcheck(m,'2 into sky7');await W8(1900)
      await visible(4);await visible(3);await fuse(3,4);await shot('51_c5_fuse');await visible(7);await drop(7,0);await solved()
      await ready();m=await mist();await gcut(3);await settle(300);await mcheck(m,'sky guard too deep');await gundo();await settle(400);await gcut(4);await solved()
      await finish('cs',25000);await W8(1500);await shot('52_cs_fall');await audit('cs_fall')
      await until("G.scene==='map'",30000);G_SCENE[0]='map';await W8(1200);await shot('53_map_boss')
      sh=await ev("NSH()");log('SHARDS',sh)
    # ---------- Босс
    if want('5'):
      await level(5);await W8(400);await audit('boss')
      async def landed(n,t=8000): return await until(f"__T.pieces().some(p=>p.n==={n}&&!p.locked&&p.y>440)",t,80)
      await landed(7);await settle(800);m=await mist();await drop(7,0);await settle(700);await mcheck(m,'boss whole7 into shield');await shot('60_boss_bad')
      await settle(1200);await cut(7,4);await settle(900);await drop(4,0);await solved();await W8(300);await shot('61_boss_hit')
      await ready();await landed(8);await settle(800);m=await mist();await cut(8,2);await settle(900);await drop(2,0);await settle(300);await mcheck(m,'boss 2 short');await W8(1900);await drop(6,0);await solved()
      await ready();m=await mist();await gcut(4);await settle(300);await mcheck(m,'armor too deep');await gundo();await settle(400);await gcut(5);await solved()
      await ready();await W8(3800);await shot('62_boss_p3');m=await mist();await drop(3,0);await settle(300);await mcheck(m,'boss frag 3');await W8(1900);await fuse(5,4);await drop(9,0);await solved()
      await finish('cs',25000);await W8(1500);await shot('63_cs_heart');await audit('cs_heart')
      await until("G.scene==='play'",30000);G_SCENE[0]='play';await ready();await shot('64_heart');await audit('heart')
      q=await piece(1);await drag(q['x'],q['y'],500,560);await settle(500);await mcheck(await mist(),'heart-miss')
      q=await piece(1);s=(await ev("__T.socks()"))[0];await drag(q['x'],q['y'],(s['x0']+s['x1'])/2,s['y']);await solved()
      await finish('cs',20000);await W8(2500);await shot('65_cs_whole')
      await until("G.scene==='fin'",40000);G_SCENE[0]='fin';await W8(2500);await shot('70_fin');await audit('fin')
      await btn('tomap',30000);await until("G.scene==='map'",5000);G_SCENE[0]='map';await W8(1500);await shot('71_map_end');await audit('map_end')
    # ---------- Пекарня
    if want('6'):
      if await btn('bake',3000):
        await until("G.scene==='play'",4000);G_SCENE[0]='play'
        await until("LV&&LV.tEnd>0&&LV.pieces.length>0",10000);await settle(1200);await shot('80_bake');await audit('bake')
        first=True
        for r in range(3):
          t=(await st())['task'];a,bb=t['vals'][0],t['vals'][4];need=bb-a
          await until("__T.pieces().some(p=>p.n===10)",4000);await settle(900)
          if first: m=await mist();await drop(10,0);await settle(800);await mcheck(m,'pie whole10');first=False;await settle(1500)
          await cut(10,need);await settle(900);await drop(need,0);await W8(900)
          log('bake score',(await st())['score'])
        await shot('81_bake_play')
        await until("G.scene==='map'",75000);log('bake best',await ev("SV.best"))
      else: FAIL.append('no bakery (shards<5)')
    fps=await ev("G.fps()");log('FPS',fps,'ERR',errs[:8]);log('FAILS',FAIL)
    json.dump({'fps':fps,'errs':errs,'fail':FAIL,'aud':AUDS,'log':LOG},open(f'{OUT}/report.json','w'),ensure_ascii=False,indent=1,default=str)
    await b.close()
asyncio.run(main())
