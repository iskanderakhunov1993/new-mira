# UI Kit, данные и release

**Job:** обеспечивать единый интерфейс, надёжное хранение и безопасные релизы.

| ID | Priority | Status | Task | Outcome |
| --- | --- | --- | --- | --- |
| PLATFORM-01 | P0 | ready | Применить миграцию структурированных дневных данных | Production совместим с новым кодом |
| PLATFORM-02 | P0 | in-progress | Автотест полного потока Diary → Insights → Report | Контракты и browser smoke готовы; нужен постоянный E2E harness |
| PLATFORM-03 | P1 | done | Библиотека подсимптомов в UI Kit | Есть единый визуальный словарь |
| PLATFORM-04 | P1 | backlog | Вынести подсимптомы в переиспользуемый компонент | UI Kit и дневник используют один источник |
| PLATFORM-05 | P0 | backlog | Проверка accessibility и mobile 320–430 px | Основные потоки доступны на узких экранах |
| PLATFORM-06 | P0 | backlog | Release checklist для миграций, Vercel и smoke-тестов | Production обновляется предсказуемо |
| PLATFORM-07 | P2 | idea | Визуальные regression screenshots | Дизайн не ломается незаметно |
| PLATFORM-08 | P1 | backlog | Обновить PROJECT_MAP новыми маршрутами | Архитектурная карта остаётся актуальной |
| PLATFORM-09 | P2 | blocked | Apple Health / HealthKit | Нужен нативный iOS-контейнер, разрешения пользователя и privacy review; web/PWA не имеет доступа к HealthKit |
| PLATFORM-10 | P2 | blocked | Google Health Connect | Нужен нативный Android-контейнер, runtime permissions и privacy review; не показывать фиктивный переключатель |
| PLATFORM-11 | P2 | idea | Read-only импорт веса и базальной температуры | Реализовать после выбора мобильной оболочки и карты согласий |
| PLATFORM-12 | P2 | blocked | Надёжные системные напоминания | Нужны Web Push subscriptions, серверный планировщик, управление разрешениями и проверка доставки; обычный таймер открытой страницы не выдавать за системное напоминание |
