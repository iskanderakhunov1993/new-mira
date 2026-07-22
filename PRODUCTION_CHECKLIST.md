# Mira MVP — Production Checklist

## P0 release gate

- [ ] Миграции проверены на копии схемы и применяются add-only.
- [ ] Auth callback, register, login, logout и удаление аккаунта проверены.
- [ ] Все API получают `user_id` из Supabase-сессии; тест двух аккаунтов пройден.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` настроен только server-side.
- [ ] Entries и assessments отсутствуют в localStorage/sessionStorage/IndexedDB/Cache Storage.
- [ ] URL результата содержит только непрозрачный ID.
- [ ] ProductEvent содержит только name, route, user и timestamp.
- [ ] Экспорт и удаление данных включают assessments.
- [ ] Safety-тексты прошли клиническую проверку. До этого пункт блокирует medical production approval.
- [ ] Loading/error/empty/retry и защита от повторного submit проверены.
- [ ] PWA manifest, standalone, offline fallback и обновление service worker проверены.
- [ ] iOS Safari и актуальные Chrome/Safari проверены на мобильной ширине.
- [ ] Keyboard focus, labels, dialog names и контраст проверены.
- [ ] `npm run lint`, `npm test`, `npm run build`, `git diff --check` проходят.
- [ ] Vercel production env соответствует Supabase production project.
- [ ] Pull Request проверен и слит в `main`; production deploy создан только из `main`.

## Rollback

- Код откатывается предыдущим Vercel deployment.
- Add-only таблица `health_assessments` при rollback кода сохраняется и не удаляется.
- Service worker меняет cache version при изменении shell; старые caches удаляются в `activate`.

## Release report

- Commit/branch/deployment URL.
- Результаты `QA_MATRIX.md` с PASS/FAIL/BLOCKED.
- Список P0/P1/P2 дефектов.
- Подтверждение двух аккаунтов и отсутствия health payload в browser storage.
- Решение: Ready / Not ready и перечисление блокеров.
