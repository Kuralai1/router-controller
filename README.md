# Router Controller

## О проекте
Router Controller - это веб-приложение для управления и мониторинга сетевого маршрутизатора. Проект разделен на две части: бэкенд (Django) и фронтенд (React).

## Структура проекта
```
├── backend/         # Django бэкенд
├── frontend/        # React фронтенд
└── README.md
```

## Требования
### Для бэкенда:
- Python 3.10 или выше
- pip (менеджер пакетов Python)
- virtualenv (для создания виртуального окружения)

### Для фронтенда:
- Node.js (версия 14 или выше)
- npm (менеджер пакетов Node.js)

## Установка и запуск

### Бэкенд
1. Создайте и активируйте виртуальное окружение:
```bash
# Создание виртуального окружения
python3 -m venv backend_env

# Активация виртуального окружения
# Для Linux/macOS:
source backend_env/bin/activate
# Для Windows:
backend_env\Scripts\activate
```

2. Перейдите в директорию бэкенда и установите зависимости:
```bash
cd backend/controller
pip install -r requirements.txt
```

3. Примените миграции базы данных:
```bash
python manage.py migrate
```

4. Создайте супер юзера для входа в сайт:
```bash
python manage.py createsuperuser

# Укажите username и password
```
Бэкенд будет доступен по адресу: http://localhost:8000


5. Запустите сервер разработки:
```bash
python manage.py runserver
```
Бэкенд будет доступен по адресу: http://localhost:8000

### Фронтенд
1. Перейдите в директорию фронтенда:
```bash
cd frontend
```

2. Установите зависимости:
```bash
npm install
```

3. Запустите сервер разработки:
```bash
npm run dev
```
Фронтенд будет доступен по адресу: http://localhost:5173

4. Введите username и password которые вы указали при создании супер юзера



## Основные функции
- Авторизация пользователей
- Мониторинг состояния маршрутизатора
- Управление подключенными устройствами
- Настройка безопасности
- Просмотр статистики и логов

## Использование
1. Откройте веб-браузер и перейдите по адресу http://localhost:5173
2. Войдите в систему, используя свои учетные данные
3. После успешной авторизации вы получите доступ к панели управления
4. В панели управления доступны следующие разделы:
   - Обзор системы
   - Подключенные устройства
   - Настройки безопасности
   - Конфигурация маршрутизатора

## Разработка
Проект использует следующие основные технологии:
- **Бэкенд**: Django, Django REST framework
- **Фронтенд**: React, Vite, CSS Modules

## Примечания
- Убедитесь, что порты 8000 (бэкенд) и 5173 (фронтенд) свободны перед запуском серверов
- Для корректной работы необходимо запустить как бэкенд, так и фронтенд серверы
- В режиме разработки все изменения в коде автоматически отображаются в браузере