/*
  ОБРАЗЫ = КАНАЛЫ
  ---------------
  Каждый объект ниже это один канал (образ). Порядок в списке = порядок каналов.

  id     — короткий код, используется в ссылке: t.me/<бот>/<app>?startapp=ch02
  name   — название, как на плашке (капсом)
  color  — цвет канала из палитры гайдбука
  full   — фото в полный рост (вертикальное)
  d1, d2 — фото деталей

  Пока фото нет, там стоит null, и вместо фото рисуется заглушка цвета канала.
  Когда фото появятся, кладём их в папку img/looks/ и пишем путь, например:
    full: 'img/looks/ch01-full.webp',
  Если надо сдвинуть кадрирование (что попадает в кадр), можно так:
    full: { src: 'img/looks/ch01-full.webp', pos: '50% 20%' },
*/

window.LOOKS = [
  { id: 'ch01', name: 'ХИП-ХОП', color: '#FEFB54', full: null, d1: null, d2: null },
  { id: 'ch02', name: 'РОКЕР',   color: '#E934F5', full: null, d1: null, d2: null },
  { id: 'ch03', name: 'ОБРАЗ 3', color: '#01ACD0', full: null, d1: null, d2: null },
  { id: 'ch04', name: 'ОБРАЗ 4', color: '#75FB4E', full: null, d1: null, d2: null },
  { id: 'ch05', name: 'ОБРАЗ 5', color: '#E83224', full: null, d1: null, d2: null },
];
