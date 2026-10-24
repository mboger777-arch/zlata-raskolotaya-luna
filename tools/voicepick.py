# Установка выбранных дублей: voicepick.py k=/path.mp3 ... (перезаписывает файл реплики, обновляет длительность в js/voice.js)
import json,sys,shutil,subprocess,os
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));p=R+'/js/voice.js'
V=json.loads(open(p).read().replace('const VOICE=','').rstrip().rstrip(';'))
for a in sys.argv[1:]:
  k,f=a.split('=',1);dst=R+'/assets/voice/'+V[k][0];shutil.copy(f,dst)
  V[k][1]=round(float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',dst])),2);print(k,V[k])
open(p,'w').write('const VOICE='+json.dumps(V,ensure_ascii=False)+';\n')
