# Mira MVP — Production Checklist

## P0 release gate

- [ ] Миграции проверены на копии схемы и применяются add-only.
- [ ] Auth callback, register, login, logout и удаление аккаунта проверены.
- [ ] Все API получают `user_id` из Supabase-сессии; тест двух аккаунтов пройден.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` настроен только server-side.
- [ ] Entries и assessments отсутствуют в localStorage/sessionStorage/IndexedDB/Cache Storage.
- [ ] URL результата содержит только непрозрачный ID.
- [ ] ProductEvent содержит только name, route, user и timestamp.
- [ ] PublicProductEvent содержит только allow-listed name, route и timestamp — без cookie ID, email и health payload.
- [ ] Реквизиты оператора заданы через `NEXT_PUBLIC_LEGAL_OPERATOR_NAME`, `NEXT_PUBLIC_LEGAL_OPERATOR_EMAIL` и `NEXT_PUBLIC_LEGAL_OPERATOR_ADDRESS`.
- [ ] Страницы `/privacy` и `/terms` проверены юристом для выбранной юрисдикции запуска.
- [ ] Регион Supabase, локализация персональных данных и возможная трансграничная передача документированы и согласованы.
- [ ] Регистрация отдельно фиксирует принятие условий и явное согласие на обработку данных о цикле и здоровье.
- [ ] Экспорт и удаление данных включают assessments.
- [ ] Safety-тексты прошли клиническую проверку. До этого пункт блокирует medical production approval.
- [ ] Loading/error/empty/retry и защита от повторного submit проверены.
- [ ] PWA manifest, standalone, offline fallback и обновление service worker проверены.
- [ ] iOS Safari и актуальные Chrome/Safari проверены на мобильной ширине.
- [ ] Keyboard focus, labels, dialog names и контраст проверены.
- [ ] `npm run lint`, `npm test`, `npm run build`, `git diff --check` проходят.
- [ ] Vercel production env соответствует Supabase production project.
- [ ] Add-only миграция `public_product_events` применена до включения landing analytics.
- [ ] Pull Request проверен и слит в `main`; production deploy создан только из `main`.

## Rollback

- Код откатывается предыдущим Vercel deployment.
- Add-only таблица `health_assessments` при rollback кода сохраняется и не удаляется.
- Add-only таблица `public_product_events` при rollback кода сохраняется и не удаляется.
- Service worker меняет cache version при изменении shell; старые caches удаляются в `activate`.

## Release report

- Commit/branch/deployment URL.
- Результаты `QA_MATRIX.md` с PASS/FAIL/BLOCKED.
- Список P0/P1/P2 дефектов.
- Подтверждение двух аккаунтов и отсутствия health payload в browser storage.
- Решение: Ready / Not ready и перечисление блокеров.
# Возврат в установленную PWA

- После входа закрыть PWA, перевести дату тестового access token к истечению и открыть снова: `/today` открывается без формы входа.
- Проверить возврат через 48 часов на iOS standalone и Android standalone.
- После подтверждения email вернуться в установленную Mira и нажать «Я подтвердила почту»: повторный ввод email и пароля не требуется.
- `/login` и `/register` с действующей сессией перенаправляют на `/today`.
