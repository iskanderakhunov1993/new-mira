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

## Supabase и база данных

Mira использует Supabase Auth для входа, Supabase PostgreSQL для постоянного хранения и Prisma для серверных запросов. Браузер не обращается к таблицам здоровья напрямую.

1. Создайте проект в Supabase.
2. В SQL Editor создайте отдельного пользователя Prisma по [официальной инструкции Supabase](https://supabase.com/docs/guides/database/prisma).
3. Скопируйте `.env.example` в `apps/web/.env.local` и заполните:
   - `NEXT_PUBLIC_SUPABASE_URL`;
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`;
   - `SUPABASE_SERVICE_ROLE_KEY`;
   - `DATABASE_URL` — transaction pooler, порт `6543`;
   - `DIRECT_URL` — session pooler, порт `5432`.
4. Никогда не добавляйте `.env.local` и service role key в Git.
5. Примените миграцию:

```bash
npm run db:deploy
```

6. В Supabase Auth добавьте разрешённые redirect URL:

```text
http://localhost:3000/auth/callback
https://mira-cycle.vercel.app/auth/callback
```

Для Vercel добавьте те же пять переменных в Settings → Environment Variables. Миграции запускаются отдельно перед production-деплоем.

Основные команды:

```bash
npm run dev      # локальная разработка
npm run lint     # проверка кода
npm run build    # production-сборка
```

## Простой Git-flow

В проекте используется одна постоянная ветка:

- `main` — проверенная production-версия, автоматически публикуемая через Vercel.

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

Дождитесь успешных проверок GitHub Actions и Preview Deployment от Vercel, затем выполните merge и удалите временную ветку.

### 4. Production-деплой

После проверки и слияния Pull Request в `main` Vercel автоматически публикует новую production-версию:

[https://mira-cycle.vercel.app](https://mira-cycle.vercel.app)

Не коммитьте напрямую в `main` и не делайте production-деплой из временной ветки.

### 5. Срочное исправление production

```bash
git switch main
git pull origin main
git switch -c fix/short-description
```

Дальше создайте Pull Request `fix/* → main`. После проверок и слияния исправление автоматически попадёт в production.

## Схема процесса

```text
feature/* ─┐
           ├─ Pull Request → CI + Preview → main → Vercel Production
fix/* ─────┘
```

## Правила, чтобы не запутаться

1. Одна задача — одна временная ветка.
2. Новая работа всегда начинается от свежей `main`.
3. В `main` изменения попадают только через Pull Request.
4. `main` должна собираться и проходить lint.
5. `main` всегда соответствует текущему production.
6. После слияния временная ветка удаляется.
7. Основная локальная копия проекта: `/Users/iskander/Documents/мира`.
