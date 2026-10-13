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

  ДВОЕ В ОДНОЙ ЛЕНТЕ (ROCK STAR): обычный photos + who — кто на каждой фотке по порядку:
  'f' девушка, 'm' парень, 'fm' оба. Значки на плашке подсвечиваются по who.

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
      { sex: 'f', title: 'CHAOS', photos: ['img/looks/ch03-f-1.webp', 'img/looks/ch03-f-2.webp', 'img/looks/ch03-f-3.webp'] },
      { sex: 'm', title: 'CRAZY', photos: ['img/looks/ch03-m-1.webp', 'img/looks/ch03-m-2.webp', 'img/looks/ch03-m-3.webp'] },
    ] },

  { id: 'ch04', name: 'POP STAR', color: '#75FB4E',
    photos: ['img/looks/ch04-1.webp', 'img/looks/ch04-2.webp', 'img/looks/ch04-3.webp'] },

  { id: 'ch05', name: 'Y2K', color: '#0001F2',
    photos: ['img/looks/ch05-1.webp', 'img/looks/ch05-2.webp', 'img/looks/ch05-3.webp'] },

  { id: 'ch06', name: 'ROCK STAR', color: '#E83224',
    photos: ['img/looks/ch06-1.webp', 'img/looks/ch06-2.webp', 'img/looks/ch06-3.webp', 'img/looks/ch06-4.webp', 'img/looks/ch06-5.webp', 'img/looks/ch06-6.webp'],
    who: ['f', 'f', 'fm', 'fm', 'm', 'm'] },

  { id: 'ch07', name: 'POP-PUNK', color: '#75FB4E',
    photos: ['img/looks/ch07-1.webp', 'img/looks/ch07-2.webp', 'img/looks/ch07-3.webp'] },

  { id: 'ch08', name: 'GLAM', color: '#FFFFFF',
    photos: ['img/looks/ch08-1.webp', 'img/looks/ch08-2.webp', 'img/looks/ch08-3.webp'] },
];
