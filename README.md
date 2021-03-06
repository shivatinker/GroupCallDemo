# -1/12 INT20H Meeting platform 

## Описание

Данный проект - тестовое задание команды "-1/12" на хакатон INT20H 2022 года. Мы реализовали небольшую митинг платформу на базе WebRTC, которая поддерживает неограниченное количество участников с видео и аудио связью. Использованный стек технологий: Kotlin + Spring boot + Kurento Media Server + Typescript + React + MobX. Для передачи WebRTC данных используется KMS в отдельном контейнере, а Kotlin-сервер используется для создания комнат и сигналинга между участниками. Связь между KMS и основным сервером осуществляется с помошью websocket. Задача основного сервера - обрабатывать SDP-запросы и ответы, транспортируя их между KMS и участниками комнаты. После этого потоки медиа передаются напрямую с браузеров в KMS. 

Интерфейс встречает страницей создания комнаты: 

![1](https://github.com/shivatinker/GroupCallDemo/blob/master/screenshots/1.png?raw=true)

После нажатия кнопки создается комната и выводится ссылка для присоединения:

![2](https://github.com/shivatinker/GroupCallDemo/blob/master/screenshots/2.png?raw=true)

После того, как пользователь переходит по ссылке и вводит свой никнейм, у него есть возможность присоединиться к конференции:

![3](https://github.com/shivatinker/GroupCallDemo/blob/master/screenshots/3.png?raw=true)

После присоединения открывается websocket с сервером и в реальном времени передаются и получаются медиапотоки всех участников:

![4](https://github.com/shivatinker/GroupCallDemo/blob/master/screenshots/4.png?raw=true)

При этом, при присоединении новых участников, они автоматически отображаются у все других, а если кто-то покинет конференцию -- он исчезнет с экранов всех других участников. Для примера я зашел в комнату с рядом стоящего ноутбука и с другой вкладки на компьютере с веб-камерой:

![5](https://github.com/shivatinker/GroupCallDemo/blob/master/screenshots/5.png?raw=true)

Также, при закрытии вкладки или при другом разрывае соединения, пользователь автоматически выходит из комнаты. Передается звук от всех участников, есть возможность выключить передачу звука от себя, или выключить свою камеру. Система достаточно стабильная, есть автоматическое переподключение к вебсокету.

## Сборка

Для запуска проекта локально на 80 порту достаточно скачать репозиторий и в корне проекта выполнить

`docker-compose build && docker-compose up`

После этого можно экспериментировать.
Также версия проекта есть на Azure по адресу https://meetall-kms.azurewebsites.net/, с тестовой комнатой https://meetall-kms.azurewebsites.net/room/test. Однако из-за особенностей хостинга WebRTC иногда работает нестабильно, так что в случае проблем обращайтесь ко мне в Telegram: @shivatinker.

**Happy hacking!**
