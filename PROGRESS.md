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
- [x] Реплики → голоса + ASR + проверка ударений
  - [x] tools/lines.py (96 реплик) → tools/lines.json, js/lines.js
  - [x] voicegen.py: REF zlata/pazl/luna/rask/narr, префикс z303; запуск: cd /workspace/lesson303 && nice -n 15 /home/box/tts/qw/bin/python tools/voicegen.py > /tmp/vg303.log (после вырезки!)
  - [x] генерация 96/96 (VOICEDONE) · [x] ударения: scan (tools/stress.py, RISK под урок) → перегенерированы и заменены (tools/voicepick.py): g_cut, c5_s, h_3, s5, i2, i3; c4_push; h_t (Расколу): 3 раунда перегенерации (Раскалу/Рас-колу/Раскоолу/Расколлу) — детектор везде ставит ударение на «лу» из-за удлинения конца слова, хотя пик громкости на «ко»; лучше оригинала нет → оставлен оригинал (сомнение в отчёте). i2 «мечом», s4/w_4 «сердечко» — проверены whisper-medium: произнесено верно, не трогаем · [x] voicecheck (tools/voicecheck.py: intro/fall/heart/whole + старт ур.1 со звуком, клики во время речи: 26 реплик, CUT 0, OVERLAP 0)
  - ASR: 96/96, расхождения только цифры/икс и «страш» (норма оглушения); подозрительные: i2 «мечом→мячом», s4/w_4 «сердечко→сердечка» — проверка ударений идёт (запуск: nice -n 15 /home/box/tts/qw/bin/python tools/stress.py scan)
- [x] tools/play303.py — полный проход реальными жестами (все задания: ошибка+исправление, осколки, босс, сердце, пекарня, аудит, fps)
- [x] Тесты (844 ✓ регрессия, 667 ✓, 932 ✓: fps60, 0 ошибок, аудит чист, FAILS []; voicecheck 26 реплик CUT 0 OVERLAP 0; фикс: «Пропустить»/домой гасят реплику — hardStop) 844x390, 667x375, 932x430 (ошибка+исправление на каждом задании, аудит, fps, 0 ошибок); voicecheck
- [x] Публикация ?v=20261024a2: https://mboger777-arch.github.io/zlata-raskolotaya-luna/?v=20261024a2 — Pages built 3477e41, живой URL проверен (0 ошибок, 0 битых ресурсов, fps 60)

## Журнал
- арт: все листы/фоны/катсцены в art/ (cs_heart, cs_whole перерисованы с правильным Пазликом). Луна в bg_c4 не треснута — допустимо.
