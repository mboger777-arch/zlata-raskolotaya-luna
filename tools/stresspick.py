# Подбор дубля с правильным ударением: варианты написания × сиды, пока не найдём уверенный дубль.
# jobs: [{"k","who","vars":[...],"target":{"полоск":1},"max":12}] -> /tmp/sp311/<k>_<n>.mp3 ; итог в /tmp/sp311/pick.jsonl
import json,os,re,sys,subprocess,torch,soundfile as sf,numpy as np,hashlib,shutil
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));src=open(R+'/tools/voicegen.py').read()
g={'__file__':R+'/tools/voicegen.py'};exec(src[:src.index('lines=json.load')],g)
sys.path.insert(0,R+'/tools');import stress311 as S
from qwen_tts import Qwen3TTSModel
torch.set_num_threads(int(os.environ.get('NT','6')))
M=Qwen3TTSModel.from_pretrained('Qwen/Qwen3-TTS-12Hz-1.7B-Base',device_map='cpu',dtype=torch.float32);P={}
D='/tmp/sp311';os.makedirs(D,exist_ok=True);J=json.load(open(sys.argv[1]));LN={o['k']:o for o in json.load(open(R+'/tools/lines.json'))}
T1=float(os.environ.get('T1','1.5'));T0=float(os.environ.get('T0','0.6'))
def _n(s): s=s.lower().replace('ё','е');return re.sub(r'[^а-я0-9 ]',' ',s).split()
FIXW={'палоск':'полоск','шуршык':'шуршик'}
def norm(s):
  out=[]
  for w in _n(s):
    for a,b in FIXW.items():w=w.replace(a,b)
    out.append(w)
  return out
def wer(a,b):
    D_=list(range(len(b)+1))
    for i,x in enumerate(a,1):
        P_=D_[:];D_[0]=i
        for j_,y in enumerate(b,1): D_[j_]=min(P_[j_]+1,D_[j_-1]+1,P_[j_-1]+(x!=y))
    return D_[-1]/max(1,len(a))
NUM={'4':'четыре','5':'пять','3':'три','7':'семь','2':'два','6':'шесть','8':'восемь','9':'девять','10':'десять'}
pk=open(D+'/pick.jsonl','a')
for j in J:
  w=j['who'];o=LN[j['k']];ref=g['spoken'](o);tg=j['target']
  if w not in P:P[w]=M.create_voice_clone_prompt(ref_audio=g['REF'][w][0],ref_text=g['REF'][w][1],x_vector_only_mode=False)
  cands=[];n=0
  while n<j.get('max',12):
    vi=n%len(j['vars']);t=j['vars'][vi];fin=f"{D}/{j['k']}_{os.environ.get('SEEDOFF','0')}_{n}.mp3"
    torch.manual_seed(9100+int(os.environ.get('SEEDOFF','0'))+n*37+len(j['k']));wv,sr=M.generate_voice_clone(text=t,language='Russian',voice_clone_prompt=P[w],non_streaming_mode=True,temperature=0.6 if n%3==0 else 0.5,max_new_tokens=max(80,int(len(t)*1.8)+40))
    raw=fin[:-4]+'.wav';sf.write(raw,wv[0],sr);subprocess.run(['ffmpeg','-y','-loglevel','error','-i',raw,'-af',g['CHAIN'],'-ac','1','-ar','24000','-b:a','64k',fin],check=True);os.remove(raw)
    res,hyp=S.check(fin);hy=' '.join(NUM.get(x,x) for x in re.sub(r'(\d+)',r' \1 ',hyp).split())
    er=wer(norm(ref),norm(hy));qs=[]
    for st,ex in tg.items():
      rr=[r for r in res if norm(r['w']) and norm(r['w'])[0].startswith(st)]
      if not rr or 'dur' not in rr[0]:qs.append(None);continue
      r=rr[0];q=r['dur'][1]*r['rms'][1]/max(1e-9,r['dur'][0]*r['rms'][0]);qs.append((ex,round(q,2)))
    ok=er<=0.15 and all(x and ((x[0]==1 and x[1]>=T1) or (x[0]==0 and x[1]<=T0)) for x in qs)
    strength=min([(x[1] if x[0]==1 else 1/max(x[1],1e-3)) for x in qs if x] or [0])
    rec={'k':j['k'],'n':n,'t':t,'wer':round(er,3),'q':qs,'ok':ok,'str':round(strength,2),'hyp':hyp,'f':fin}
    print(json.dumps(rec,ensure_ascii=False),flush=True);n+=1
    if ok:cands.append(rec)
    if ok and strength>=j.get('strong',2.2):break
    if len(cands)>=2 and n>=j.get('min',4):break
  best=max(cands,key=lambda r:r['str']) if cands else None
  pk.write(json.dumps({'k':j['k'],'best':best,'tried':n},ensure_ascii=False)+'\n');pk.flush()
  print('PICK',j['k'],best and best['f'],best and best['q'],flush=True)
print('SPDONE',flush=True)
