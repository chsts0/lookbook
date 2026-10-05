/*
  ОБРАЗЫ = КАНАЛЫ
  ---------------
  Каждый объект ниже это один канал. Порядок в списке = порядок каналов.

  id     — короткий код для ссылки: t.me/lookbook_psvt_bot/psvt_tv?startapp=ch02
           у парных каналов можно открыть второго человека: ?startapp=ch06m
  name   — название канала (капсом, как на плашке)
  color  — цвет канала из палитры гайдбука
  full   — фото в полный рост (вертикальное)
  d1, d2 — фото деталей

  ПАРНЫЕ КАНАЛЫ (двое в одном образе): вместо full/d1/d2 пишем duo — список из двух людей.
  Первой всегда идёт девушка (sex: 'f'), потом парень (sex: 'm').
  title — если у человека своё название (как CHAOS / CRAZY), оно заменит name на плашке.

  Пока фото нет, стоит null и рисуется заглушка цвета канала.
  Фото кладём в img/looks/ и пишем путь:  full: 'img/looks/ch01-f-full.webp',
  Сдвинуть кадрирование:                  full: { src: 'img/looks/ch01-f-full.webp', pos: '50% 20%' },
*/

window.LOOKS = [
  { id: 'ch01', name: 'HIP-HOP', color: '#FEFB54',
    duo: [
      { sex: 'f', full: null, d1: null, d2: null },
      { sex: 'm', full: null, d1: null, d2: null },
    ] },

  { id: 'ch02', name: 'PAPARAZZI', color: '#01ACD0',
    full: null, d1: null, d2: null },

  { id: 'ch03', name: 'CHAOS × CRAZY', color: '#E934F5',
    duo: [
      { sex: 'f', title: 'CHAOS', full: null, d1: null, d2: null },
      { sex: 'm', title: 'CRAZY', full: null, d1: null, d2: null },
    ] },

  { id: 'ch04', name: 'POP STAR', color: '#75FB4E',
    full: null, d1: null, d2: null },

  { id: 'ch05', name: 'Y2K', color: '#0001F2',
    full: null, d1: null, d2: null },

  { id: 'ch06', name: 'ROCK STAR', color: '#E83224',
    duo: [
      { sex: 'f', full: null, d1: null, d2: null },
      { sex: 'm', full: null, d1: null, d2: null },
    ] },

  { id: 'ch07', name: 'POP-PUNK', color: '#75FB4E',
    full: null, d1: null, d2: null },

  { id: 'ch08', name: 'GLAM', color: '#FFFFFF',
    full: null, d1: null, d2: null },
];
