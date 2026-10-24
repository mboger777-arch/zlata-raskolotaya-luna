'use strict';
// ===== Музыка: процедурные лунные мотивы (минор, колокольчики) (look-ahead планировщик) =====
const MUS={on:null,next:0,step:0,gain:null,duck:1};
const midi=m=>440*Math.pow(2,(m-69)/12);
const SONGS={
 title:{bpm:92,bass:[45,null,52,null,41,null,48,null,43,null,50,null,40,null,47,null],mel:[76,null,72,69,71,72,74,null,76,79,77,76,74,null,72,null,69,null,72,76,79,77,76,74,72,null,71,72,69,null,null,null],ch:'triangle',drum:'soft'},
 cs:{bpm:76,bass:[45,null,null,null,41,null,null,null,43,null,null,null,40,null,null,null],mel:[69,null,72,null,76,null,74,null,72,null,71,null,69,null,null,null],ch:'sine',drum:'none'},
 level:{bpm:118,bass:[45,45,52,45,41,41,48,41,43,43,50,43,40,40,47,40],mel:[69,72,76,72,77,null,76,null,74,72,71,72,74,null,76,null,81,79,77,76,74,72,71,69,71,74,72,71,69,null,null,null],ch:'square',drum:'beat'},
 level2:{bpm:124,bass:[50,50,57,50,46,46,53,46,48,48,55,48,45,45,52,45],mel:[74,77,81,77,82,null,81,null,79,77,76,77,79,null,81,null,86,84,82,81,79,77,76,74,76,79,77,76,74,null,null,null],ch:'square',drum:'beat'},
 sky:{bpm:100,bass:[41,null,48,null,43,null,50,null,45,null,52,null,40,null,47,null],mel:[77,81,84,null,83,81,79,null,76,79,83,null,81,79,77,null,74,77,81,null,79,77,76,null,72,76,79,null,77,null,null,null],ch:'triangle',drum:'soft'},
 boss:{bpm:146,bass:[40,40,47,40,41,41,48,41,40,40,47,40,38,38,45,46],mel:[64,null,67,64,70,null,69,67,64,null,67,64,62,63,64,null,76,null,74,72,70,69,67,64,62,64,67,null,64,null,null,null],ch:'sawtooth',drum:'hard'},
 bake:{bpm:132,bass:[48,55,48,55,53,60,53,60,50,57,50,57,55,62,55,59],mel:[72,76,79,76,77,81,79,77,76,74,72,74,76,null,79,null,72,76,79,84,81,77,79,76,74,77,76,74,72,null,null,null],ch:'triangle',drum:'beat'},
 win:{bpm:112,bass:[45,52,50,52,41,48,53,48,43,50,55,50,45,52,45,null],mel:[69,72,76,81,79,77,76,79,84,81,79,76,74,79,81,null],ch:'triangle',drum:'soft'}};
function music(name){if(MUS.on===name)return;MUS.on=name;MUS.step=0;const a=ac();if(a)MUS.next=a.currentTime+.08}
function musTick(){const a=AC;if(!a||!MUS.on||G.mute||a.state!=='running')return;const s=SONGS[MUS.on];const sp=60/s.bpm/2;
 if(MUS.next<a.currentTime-.5)MUS.next=a.currentTime+.05;
 while(MUS.next<a.currentTime+.25){const i=MUS.step,w=MUS.next-a.currentTime,v=(talk?.45:1)*MUS.duck;
  const b=s.bass[i%s.bass.length];if(b!=null)tone(midi(b),sp*.9,'triangle',.07*v,w);
  const m=s.mel[i%s.mel.length];if(m!=null&&!(talk&&i%2)){tone(midi(m),sp*.8,s.ch,(s.ch==='square'?.022:.05)*v,w);if(i%4===0)tone(midi(m+12),sp*2.5,'sine',.018*v,w)}
  if(s.drum==='beat'||s.drum==='hard'){if(i%4===0){noise(.1,.3*v,150,w);tone(110,.12,'sine',.12*v,w,50)}if(i%4===2)noise(.08,.14*v,2000,w,.8);if(i%2===1)noise(.03,.05*v,7000,w,2)}
  else if(s.drum==='soft'&&i%8===0)noise(.06,.08*v,4000,w,2);
  if(s.drum==='hard'&&i%8===6)noise(.1,.2*v,600,w);
  MUS.next+=sp;MUS.step++}}
