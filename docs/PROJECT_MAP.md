# Mira Project Map

Этот файл — стартовая карта проекта для разработки и диагностики. Его цель — быстро определить нужный участок кода, не перечитывая весь репозиторий.

Обновлено: 23 июля 2026 года.

## 1. Как убедиться, что открыт правильный проект

Ожидаемые признаки актуальной версии:

```text
Repository: https://github.com/iskanderakhunov1993/new-mira.git
Local path: /Users/iskander/Documents/мира
Stack: Next.js + Supabase Auth + PostgreSQL + Prisma
Production: https://mira-cycle.vercel.app
Vercel project: mira-cycle
```

Если в корне находится Vite-приложение с `src/`, IndexedDB и localStorage как основным хранилищем, это старая версия из `/Users/iskander/Documents/flo`, а не production-код.

Быстрая проверка:

```bash
pwd
git remote -v
git branch --show-current
git status --short
```

## 2. Технологии и структура

```text
new-mira/
├── apps/web/
│   ├── app/                 # страницы, layouts и API routes Next.js
│   ├── components/          # общие UI-компоненты
│   ├── lib/domain/          # чистая продуктовая логика и unit-тесты
│   ├── lib/server/          # серверные контракты и валидация
│   ├── lib/supabase/        # browser/server/proxy auth clients
│   ├── generated/prisma/    # сгенерированный Prisma client
│   └── public/              # PWA и статические ресурсы
├── prisma/
│   ├── schema.prisma        # модели базы данных
│   └── migrations/          # миграции production-БД
└── package.json             # общие команды workspace
```

Основной UI написан непосредственно в route-файлах. Перед редактированием нужно найти активный `apps/web/app/<route>/page.tsx`; не следует предполагать, что экран вынесен в отдельный компонент.

## 3. Карта пользовательских маршрутов

| Поток | Route | Основные связанные файлы |
| --- | --- | --- |
| Регистрация | `/register` | `app/register/page.tsx`, `lib/supabase/client.ts`, `app/auth/callback/route.ts` |
| Вход | `/login` | `app/login/page.tsx`, `lib/supabase/*` |
| Онбординг | `/onboarding` | `app/onboarding/page.tsx`, `app/api/users/route.ts` |
| Сегодня | `/today` | `app/today/page.tsx`, `lib/domain/today-cards.ts`, `AppTabBar.tsx` |
| Календарь | `/calendar` | `app/calendar/page.tsx`, `lib/domain/calendar-markers.ts` |
| Дневник | `/diary` | `app/diary/page.tsx`, `app/api/entries/[date]/route.ts` |
| Отметка самочувствия | `/check-in` | `app/check-in/*`, assessment contracts and domain modules |
| Цикл | `/period` | `app/period/page.tsx`, `app/api/periods/*` |
| Аналитика | `/analytics` | `app/analytics/*`, `lib/domain/analytics-summary.ts` |
| Материалы | `/knowledge` | `app/knowledge/*`, `lib/knowledge-library.ts` |
| Профиль и данные | `/profile` | `app/profile/page.tsx`, `app/api/users/route.ts`, `app/api/entries/route.ts` |

Нижняя навигация находится в `apps/web/components/AppTabBar.tsx`.

## 4. Данные и серверный поток

Основной поток:

```text
Client page
  → authenticated `/api/*` route
  → user from Supabase session
  → validation/server contract
  → Prisma
  → PostgreSQL
```

Модели в `prisma/schema.prisma`:

- `Profile` — профиль, онбординг, настройки и согласия;
- `Entry` — дневная запись, цикл, симптомы и самочувствие;
- `HealthAssessment` — результаты health-check flows;
- `ProductEvent` — события авторизованного пользователя;
- `PublicProductEvent` — допустимые публичные продуктовые события.

При добавлении поля проверить весь вертикальный срез:

1. Prisma schema и миграция;
2. серверная валидация/контракт;
3. API read/write;
4. типы клиента;
5. экран ввода;
6. экраны, где данные читаются;
7. экспорт, удаление и приватность;
8. тесты.

## 5. Авторизация и PWA-сессия

Ключевые файлы:

- `apps/web/lib/supabase/client.ts` — singleton browser client, persistence и refresh;
- `apps/web/lib/supabase/server.ts` — server client;
- `apps/web/lib/supabase/proxy.ts` — обновление cookies и защита маршрутов;
- `apps/web/lib/supabase/cookie-options.ts` — единые параметры cookie;
- `apps/web/components/AuthSessionRestorer.tsx` — восстановление/refresh при возврате в PWA;
- `apps/web/app/auth/callback/route.ts` — подтверждение email и создание сессии;
- `apps/web/lib/domain/session-lifetime.ts` — срок и порог refresh.

Текущая политика: сессия сохраняется до 90 дней и автоматически обновляется при открытии, возврате в приложение, фокусе окна и восстановлении видимости. Если пользователь явно вышел, очищать сессию корректно.

При проблемах со входом сначала проверять cookies, callback URL Supabase, proxy redirects и environment variables; service worker не должен быть первым подозреваемым.

## 6. Продуктовая логика

Расчёты должны оставаться чистыми и тестируемыми в `apps/web/lib/domain`.

Ключевые модули:

- `cycle-engine.ts` — цикл и прогноз;
- `cycle-phase.ts` — фаза;
- `calendar-markers.ts` — отметки календаря;
- `today-cards.ts` — карточки Today;
- `analytics-summary.ts` — осторожные аналитические выводы;
- `assessment.ts` и `result-builder.ts` — health-check логика;
- `knowledge-recommendations.ts` — рекомендации материалов.

Правило: UI отображает результат domain-функций и не копирует формулы внутри страниц.

## 7. Команды

```bash
npm install          # установить зависимости
npm run dev          # Next dev server
npm run lint         # ESLint
npm test             # domain unit tests
npm run build        # production build
npm run db:generate  # Prisma client
npm run db:deploy    # применить готовые миграции
git diff --check     # whitespace/errors в diff
```

Переменные среды хранятся в `apps/web/.env.local`. Список и назначение переменных описаны в `.env.example`; значения никогда не копируются в документацию или Git.

## 8. Документы по типу задачи

Не нужно читать всё сразу:

| Задача | Читать |
| --- | --- |
| Today cards | `TODAY_CARDS.md` |
| Расчёты цикла | `CALCULATION_SPEC.md` |
| Health/safety flow | `SAFETY_RULES.md` |
| Проверка релиза | `QA_MATRIX.md`, `PRODUCTION_CHECKLIST.md` |
| Любая инженерная задача | этот файл и ближайшие связанные исходники |

## 9. Definition of Done

Задача завершена, когда:

- работает полный изменённый пользовательский поток;
- обработаны loading, empty, error и offline states, если они затронуты;
- сохранена приватность и удаление связанных пользовательских данных;
- русский текст помещается на узком мобильном экране;
- lint, тесты и build прошли либо явно указана внешняя причина сбоя;
- миграция применена до кода, который от неё зависит;
- diff не содержит секретов и чужих изменений;
- production проверен только после статуса Ready, а не сразу после команды deploy.

## 10. Когда обновлять эту карту

Обновить файл при изменении:

- source-of-truth репозитория или production-домена;
- framework, auth, database или hosting;
- структуры ключевых маршрутов;
- политики сессии;
- команд проверки или процесса релиза.
