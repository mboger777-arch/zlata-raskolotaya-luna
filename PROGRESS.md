# PROGRESS · Урок 303 «Злата и Расколотая Луна» — СБОРКА (одобрено)
Возобновляемо: читать этот файл и CONCEPT.md, продолжать с первого незакрытого пункта. Коммит+push после каждого шага.
Репо: mboger777-arch/zlata-raskolotaya-luna → https://mboger777-arch.github.io/zlata-raskolotaya-luna/
Тяжёлое (TTS, birefnet, тесты) — `nice -n 15`, по одному.

## Архитектура (2D canvas, как 306b; planck.js — разрезы/сплав/броски; «свечение» — additive-слои canvas)
- js/core.js (экран/ввод/звук/голос/текст — из 306b), js/music.js, js/bars.js (бруски-бусины: физика, разрез, хват, бросок, сплав, гнёзда),
  js/levels.js (гл.1–5), js/boss.js, js/scenes.js (лоадер, титул, интро-катсцена, карта, катсцены глав, HUD, финал, бонус), js/lines.js, js/voice.js
- Ввод: палец на куске = схватить/бросить; палец мимо куска = лента-разрез; два куска концами = сплав; двойной тап = вернуть кусок.
- Голоса: zlata←yarmarka/nika, pazl←prost/shester, luna←refs/malina, rask←prost/granit, narr←refs/narrator

## Чеклист
- [x] Скелет: репо + Pages, шрифты, planck, инструменты
- [x] Арт-листы → art/: [x] zlata_front(idle,talk,cheer) [x] zlata_act(slash,push,oops,heart) [x] pazlik(idle,wave,jump,scared) [x] luna(idle,talk,weak) [x] raskol(proud,attack,kneel) [x] raskol2(kind,gift) [x] creatures(guard,guard_ok,whale) [x] items(shard,medal,pie,cake,lantern,moonfrag) [x] ui(plaque,round,socket)
  - [x] фоны bg: title, map, c1 кузница, c2 мост, c3 ворота, c4 долина, c5 ночное небо, boss, fin, rotate(9:16); катсцены cs_crack, cs_fall, cs_heart, cs_whole
- [x] Вырезка birefnet → assets/ (creatures через cols.json), ореол проверен (/tmp/sheet303.jpg); моргание z_idle/z_talk/z_cheer/p_idle (_b); Луна без моргания (очки); фоны → assets/bg/*.jpg 1280x720 (рисовать cover!)
- [x] Движок bars.js + прототип ввода (резать/хватать/сплав/гнездо/возврат)
  - [x] js/core.js адаптирован (картинки, SV 'luna303', SFX slice/fuse/lock/crack/chime); BLINKS заполнить после blink
  - [x] js/bars.js черновик: куски, резка (кусок/страж), сплав, двойной тап-отмена, гнёзда (точно/длинно/коротко/туман), стражи, пропасть, рисование
  - [x] проверено в браузере (smoke: shots/smoke, 0 ошибок)
- [x] scenes.js: лоадер, титул, интро, карта, HUD (табло уравнения), катсцены, финал, поворот, цикл, window.__T
- [x] (код) Гл.1 Кузница (обучение) · Гл.2 Мост (a+x=b) · Гл.3 Ворота (x−a=b) · Гл.4 Стражи (a−x=b) · Гл.5 Кит (смесь)
- [x] (код) Босс 3 фазы + финал-воссоединение + медаль; секреты 5 осколков памяти → «Лунная пекарня»
- [x] Музыка/SFX (js/music.js, SFX в core.js)
- [ ] Реплики → голоса + ASR + проверка ударений
  - [x] tools/lines.py (96 реплик) → tools/lines.json, js/lines.js
  - [x] voicegen.py: REF zlata/pazl/luna/rask/narr, префикс z303; запуск: cd /workspace/lesson303 && nice -n 15 /home/box/tts/qw/bin/python tools/voicegen.py > /tmp/vg303.log (после вырезки!)
  - [~] генерация идёт (/tmp/vg303.log, перезапущена после OOM; дописывает недостающие) · [ ] ударения (Злата, Раскол, Пазлик, отсеки, сплавь...) · [ ] voicecheck
- [ ] tools/play303.py — полный проход реальными жестами (пишется)
- [ ] Тесты 844x390, 667x375, 932x430 (ошибка+исправление на каждом задании, аудит, fps, 0 ошибок); voicecheck
- [ ] Публикация ?v=, проверка живого URL

## Журнал
- арт: все листы/фоны/катсцены в art/ (cs_heart, cs_whole перерисованы с правильным Пазликом). Луна в bg_c4 не треснута — допустимо.
