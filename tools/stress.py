# Акустическая проверка ударения. Для слова находим гласные ядра (пики энергии в озвученных участках, по числу гласных),
# «сила» слога = длительность(>50% пика) × пик энергии × тон. Ударный — самый сильный; margin = сильнейший/следующий.
# scan: проверить готовые файлы; gen: варианты написания × дубли для реплик (json на входе).
import json,os,re,sys,subprocess,numpy as np
import librosa
from scipy.signal import find_peaks
from faster_whisper import WhisperModel
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A=WhisperModel('small',device='cpu',compute_type='int8',cpu_threads=3)
VOW='аеёиоуыэюя'
# слово -> индекс ударного слога (0-based)
RISK={'краск':0,'крыш':0,'пляск':0,'кольц':1,'весн':1,'сестр':1,'полоск':1,'полосок':1,'палоск':1,'палосок':1,'дорог':1,'ворон':1,'собак':1,'полочк':0,'косточк':0,'лодочк':0,'варя':0,'варе':0,'варю':0,'варей':0,'вари':0,'квадратик':1,'шуршик':1,'шуршык':1,'клякс':0,'клетк':0,'клеток':0,'клеточк':0,'клеточек':0}
def L(f): return np.frombuffer(subprocess.run(['ffmpeg','-loglevel','error','-i',f,'-f','f32le','-ac','1','-ar','16000','-'],capture_output=True).stdout,np.float32).copy()
def nv(w): return sum(c in VOW for c in w)
def stem(w):
  w=w.lower().replace('ё','е').strip('.,!?:;«»-— ')
  for k in sorted(RISK,key=len,reverse=True):
    if w.startswith(k):return k,w
  return None,w
def analyze(a,st,en,word):
  s0=int(max(0,st-.04)*16000);s1=int(min(len(a)/16000,en+.06)*16000);x=a[s0:s1]
  if len(x)<1600:return None
  hop=160;rms=librosa.feature.rms(y=x,frame_length=400,hop_length=hop)[0];rms=np.convolve(rms,np.ones(3)/3,'same')
  f0,vf,_=librosa.pyin(x,fmin=70,fmax=600,sr=16000,frame_length=1024,hop_length=hop);n=min(len(rms),len(f0));rms=rms[:n];f0=np.nan_to_num(f0[:n]);vf=vf[:n]
  e=rms*(vf|(f0>0));N=nv(word)
  pk,pr=find_peaks(e,prominence=e.max()*.06,distance=5)
  if len(pk)<N:return {'err':f'peaks {len(pk)}<{N}'}
  pk=sorted(sorted(pk,key=lambda p:-pr['prominences'][list(pk).index(p)]*0+-e[p])[:N]) if False else sorted(pk[np.argsort(-pr['prominences'])[:N]])
  thr=e.max()*.08;bd=[]
  i=pk[0]
  while i>0 and e[i-1]>thr:i-=1
  bd.append(i)
  for p,q in zip(pk[:-1],pk[1:]):bd.append(p+int(np.argmin(e[p:q+1])))
  j=pk[-1]
  while j<n-1 and e[j+1]>thr:j+=1
  bd.append(j+1)
  S=[]
  for t,p in enumerate(pk):
    seg=e[bd[t]:bd[t+1]];core=int((seg>e[p]*.6).sum())
    ff=f0[bd[t]:bd[t+1]];fo=np.median(ff[ff>0]) if (ff>0).any() else 150
    S.append((core*10,float(e[p]),float(fo)))
  sc=[d*r*f for d,r,f in S];o=np.argsort(sc)[::-1]
  return {'syl':int(o[0]),'margin':round(sc[o[0]]/max(sc[o[1]],1e-9),2) if len(sc)>1 else 9,'dur':[s[0] for s in S],'rms':[round(s[1]/max(x[1] for x in S),2) for s in S],'f0':[int(s[2]) for s in S]}
def check(f):
  a=L(f);segs=A.transcribe(a,language='ru',beam_size=3,word_timestamps=True)[0];ws=[w for s in segs for w in s.words];out=[]
  for w in ws:
    k,full=stem(w.word)
    if not k:continue
    r=analyze(a,w.start,w.end,full);exp=RISK[k]
    ok=None if (r is None or 'err' in r) else (r['syl']==exp)
    out.append({'w':full,'exp':exp,'ok':ok,**(r or {})})
  return out,' '.join(w.word.strip() for w in ws)
if __name__=='__main__':
  mode=sys.argv[1]
  if mode=='scan':
    exec(open(R+'/js/voice.js').read().replace('const VOICE=','V=').rstrip().rstrip(';'));LN=json.load(open(R+'/tools/lines.json'))
    for o in LN:
      if not any(stem(w)[0] for w in re.findall(r'[А-Яа-яЁё]+',o['t'])):continue
      f=R+'/assets/voice/'+V[o['k']][0];res,hyp=check(f)
      for r in res:print(json.dumps({'k':o['k'],'who':o['who'],**r},ensure_ascii=False),flush=True)
  else:
    for f in sys.argv[2:]:
      res,hyp=check(f);print(json.dumps({'f':f,'hyp':hyp,'res':res},ensure_ascii=False),flush=True)
