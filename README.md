# Mira

Mira — веб-приложение на Next.js для отслеживания цикла и самочувствия.

## Локальный запуск

Требования: Node.js 24 и npm.

```bash
git clone https://github.com/iskanderakhunov1993/new-mira.git
cd new-mira
npm install
cp .env.example .env.local
npm run dev
```

Приложение откроется по адресу [http://localhost:3000](http://localhost:3000).

Основные команды:

```bash
npm run dev      # локальная разработка
npm run lint     # проверка кода
npm run build    # production-сборка
```

## Простой Git-flow

В проекте используются только две постоянные ветки:

- `main` — проверенная версия для совместной разработки;
- `deploy` — версия, которая публикуется в production через Vercel.

Для отдельной задачи создаётся одна временная ветка:

- `feature/короткое-название` — новая возможность;
- `fix/короткое-название` — исправление ошибки;
- `docs/короткое-название` — только документация.

После слияния временную ветку нужно удалить. Не создавайте дополнительные постоянные ветки и ветки с номерами версий.

### 1. Начало работы

Всегда начинайте с актуальной `main`:

```bash
git switch main
git pull origin main
git switch -c feature/profile-settings
```

Для исправления:

```bash
git switch main
git pull origin main
git switch -c fix/login-error
```

Названия пишем латиницей, маленькими буквами, слова разделяем дефисом.

### 2. Сохранение изменений

```bash
git status
git add <изменённые-файлы>
git commit -m "feat: add profile settings"
git push -u origin feature/profile-settings
```

Префиксы коммитов:

- `feat:` — новая возможность;
- `fix:` — исправление;
- `docs:` — документация;
- `refactor:` — улучшение кода без изменения поведения;
- `test:` — тесты;
- `chore:` — техническое обслуживание.

Не добавляйте в Git `.env.local`, пароли, токены и ключи API.

### 3. Pull Request в `main`

На GitHub создайте Pull Request:

```text
feature/* или fix/* → main
```

Перед слиянием обязательно:

```bash
npm run lint
npm run build
```

Проверьте Preview Deployment от Vercel, затем выполните squash merge и удалите временную ветку.

### 4. Production-деплой

Когда версия в `main` готова к публикации, создайте Pull Request:

```text
main → deploy
```

После проверки и слияния Vercel автоматически публикует ветку `deploy` в production:

[https://mira-cycle.vercel.app](https://mira-cycle.vercel.app)

Не коммитьте напрямую в `deploy` и не делайте production-деплой из временной ветки.

### 5. Срочное исправление production

```bash
git switch main
git pull origin main
git switch -c fix/short-description
```

Дальше используется обычный путь:

```text
fix/* → main → deploy
```

Так исправление остаётся и в рабочей версии, и в production.

## Схема процесса

```text
feature/* ─┐
           ├─ Pull Request → main → проверка → Pull Request → deploy → Vercel Production
fix/* ─────┘
```

## Правила, чтобы не запутаться

1. Одна задача — одна временная ветка.
2. Новая работа всегда начинается от свежей `main`.
3. В `main` и `deploy` изменения попадают только через Pull Request.
4. `main` должна собираться и проходить lint.
5. `deploy` всегда соответствует текущему production.
6. После слияния временная ветка удаляется.
7. Основная локальная копия проекта: `/Users/iskander/Documents/мира`.

