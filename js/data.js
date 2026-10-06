/*
  ОБРАЗЫ = КАНАЛЫ
  ---------------
  Каждый объект ниже это один канал. Порядок в списке = порядок каналов.

  id     — короткий код для ссылки: t.me/lookbook_psvt_bot/psvt_tv?startapp=ch02
           у парных каналов можно открыть второго человека: ?startapp=ch06m
  name   — название канала (капсом, как на плашке)
  color  — цвет канала из палитры гайдбука
  photos — 3 фото человека по порядку показа (CAM 1 … CAM 3). Первое идёт и на превью в телегиде.

  ПАРНЫЕ КАНАЛЫ (двое в одном образе): вместо photos пишем duo — список из двух людей.
  Первой всегда идёт девушка (sex: 'f'), потом парень (sex: 'm').
  title — если у человека своё название (как CHAOS / CRAZY), оно заменит name на плашке.

  Пока фото нет, стоит null и рисуется заглушка цвета канала.
  Фото кладём в img/looks/ и пишем путь:  'img/looks/ch01-f-1.webp',
  Сдвинуть кадрирование:                  { src: 'img/looks/ch01-f-1.webp', pos: '50% 20%' },
*/

const EMPTY = () => [null, null, null];

window.LOOKS = [
  { id: 'ch01', name: 'HIP-HOP', color: '#FEFB54',
    duo: [
      { sex: 'f', photos: ['img/looks/ch01-f-1.webp', 'img/looks/ch01-f-2.webp', 'img/looks/ch01-f-3.webp'] },
      { sex: 'm', photos: ['img/looks/ch01-m-1.webp', 'img/looks/ch01-m-2.webp', 'img/looks/ch01-m-3.webp'] },
    ] },

  { id: 'ch02', name: 'PAPARAZZI', color: '#01ACD0',
    photos: ['img/looks/ch02-1.webp', 'img/looks/ch02-2.webp', 'img/looks/ch02-3.webp'] },

  { id: 'ch03', name: 'CHAOS × CRAZY', color: '#E934F5',
    duo: [
      { sex: 'f', title: 'CHAOS', photos: EMPTY() },
      { sex: 'm', title: 'CRAZY', photos: EMPTY() },
    ] },

  { id: 'ch04', name: 'POP STAR', color: '#75FB4E',
    photos: EMPTY() },

  { id: 'ch05', name: 'Y2K', color: '#0001F2',
    photos: EMPTY() },

  { id: 'ch06', name: 'ROCK STAR', color: '#E83224',
    duo: [
      { sex: 'f', photos: EMPTY() },
      { sex: 'm', photos: EMPTY() },
    ] },

  { id: 'ch07', name: 'POP-PUNK', color: '#75FB4E',
    photos: EMPTY() },

  { id: 'ch08', name: 'GLAM', color: '#FFFFFF',
    photos: EMPTY() },
];
