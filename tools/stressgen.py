# Дубли с вариантами написания для реплик + акустическая проверка ударения (stress311.check) + ASR.
# stressgen.py jobs.json  ; jobs: [{"k":..,"who":..,"vars":["текст",...],"takes":3}]  -> /tmp/sg/<k>_<vi>_<take>.mp3, лог jsonl
import json,os,re,sys,subprocess,torch,soundfile as sf,numpy as np
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));src=open(R+'/tools/voicegen.py').read()
g={'__file__':R+'/tools/voicegen.py'};exec(src[:src.index('lines=json.load')],g)
sys.path.insert(0,R+'/tools');import stress311 as S
from qwen_tts import Qwen3TTSModel
torch.set_num_threads(int(os.environ.get('NT','6')))
M=Qwen3TTSModel.from_pretrained('Qwen/Qwen3-TTS-12Hz-1.7B-Base',device_map='cpu',dtype=torch.float32);P={}
os.makedirs('/tmp/sg',exist_ok=True);J=json.load(open(sys.argv[1]));LN={o['k']:o for o in json.load(open(R+'/tools/lines.json'))}
def _n(s): s=s.lower().replace('ё','е');return re.sub(r'[^а-я0-9 ]',' ',s).split()
def norm(s):return [w.replace('палоск','полоск') for w in _n(s)]
def wer(a,b):
    D=list(range(len(b)+1))
    for i,x in enumerate(a,1):
        P_=D[:];D[0]=i
        for j_,y in enumerate(b,1): D[j_]=min(P_[j_]+1,D[j_-1]+1,P_[j_-1]+(x!=y))
    return D[-1]/max(1,len(a))
for j in J:
  w=j['who'];o=LN[j['k']]
  if w not in P:P[w]=M.create_voice_clone_prompt(ref_audio=g['REF'][w][0],ref_text=g['REF'][w][1],x_vector_only_mode=False)
  for vi,t in enumerate(j['vars']):
    for take in range(j.get('takes',3)):
      fin=f"/tmp/sg/{j.get('tag',j['k'])}_{vi}_{take}.mp3"
      if not os.path.exists(fin):
        torch.manual_seed(5000+vi*101+take*17);wv,sr=M.generate_voice_clone(text=t,language='Russian',voice_clone_prompt=P[w],non_streaming_mode=True,temperature=0.6 if take==0 else 0.5,max_new_tokens=max(80,int(len(t)*1.8)+40))
        raw=fin[:-4]+'.wav';sf.write(raw,wv[0],sr);subprocess.run(['ffmpeg','-y','-loglevel','error','-i',raw,'-af',g['CHAIN'],'-ac','1','-ar','24000','-b:a','64k',fin],check=True)
      res,hyp=S.check(fin);ref=g['spoken'](o)
      er=wer(norm(ref),norm(hyp))
      pol=[r for r in res if r['w'].startswith(('полос','палос'))]
      q=[round(r['dur'][1]*r['rms'][1]/max(1e-9,r['dur'][0]*r['rms'][0]),2) for r in pol if 'dur' in r]
      print(json.dumps({'q':q,'k':j['k'],'vi':vi,'take':take,'t':t,'wer':round(er,3),'hyp':hyp,'pol':pol,'other':[r for r in res if r not in pol]},ensure_ascii=False),flush=True)
print('SGDONE',flush=True)
