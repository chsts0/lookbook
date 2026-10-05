# ДСГН ПСВТ TV · лукбук (Telegram Mini App)

Статичный сайт, работает без сервера и сборки. Открывается как мини апп в телеге.

## Что внутри

```
index.html            разметка всех экранов
css/style.css         стили
js/data.js            СПИСОК ОБРАЗОВ: названия, цвета, пути к фото
js/app.js             логика: экраны, раскладка, переключение каналов, телега
js/telegram-web-app.js локальная копия SDK телеги (telegram.org в РФ режется)
fonts/                Dela Gothic One + Geist Mono (локально, без Google Fonts)
img/logo.svg          лого (уже вшито в index.html)
img/looks/            сюда класть фото образов
```

## Как добавить фото

1. Пережать фото в `.webp`, ширина ~1200px для полного роста и ~900px для деталей.
2. Положить в `img/looks/`, например `ch01-full.webp`, `ch01-d1.webp`, `ch01-d2.webp`.
3. В `js/data.js` вместо `null` прописать пути:
   ```js
   { id: 'ch01', name: 'ХИП-ХОП', color: '#FEFB54',
     full: 'img/looks/ch01-full.webp', d1: 'img/looks/ch01-d1.webp', d2: 'img/looks/ch01-d2.webp' },
   ```
4. Добавить или убрать образ = добавить или удалить строку в `data.js`.

## Выкладка на GitHub Pages (бесплатно)

1. Создать публичный репозиторий, например `lookbook`.
2. Залить в него все файлы из этой папки (кнопка Add file → Upload files, перетащить всё содержимое).
3. Settings → Pages → Source: Deploy from a branch → Branch: `main`, папка `/ (root)` → Save.
4. Через минуту сайт будет на `https://<логин>.github.io/lookbook/`.

## Подключение к боту

1. В @BotFather: `/newapp` → выбрать бота → название, описание, картинка 640×360 →
   URL: `https://<логин>.github.io/lookbook/` → короткое имя, например `lookbook`.
2. Ссылка на мини апп: `https://t.me/<бот>/lookbook`.
3. Ссылка сразу на канал: `https://t.me/<бот>/lookbook?startapp=ch02`.
4. Опционально, кнопка в меню бота: `/mybots` → бот → Bot Settings → Menu Button → тот же URL.

## Проверка в браузере

Открыть сайт обычной ссылкой. В браузере вместо родной кнопки телеги появляется «‹ Назад».
Сразу на канал: `.../lookbook/#ch03`.
