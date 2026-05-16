# @vv0rkz/js-template

Переиспользуемый шаблон для JS проектов с husky, changelog, GitHub tools и конфигурируемым workflow.

## Установка (новый проект)

```bash
npm install -D @vv0rkz/js-template
npx jst init
```

`init` создаст все конфиги, хуки, labels и настроит проект.

## Обновление (существующий проект)

```bash
npm update @vv0rkz/js-template
npx jst upgrade
```

`upgrade` обновит хуки, конфиги commitlint/changelog, и создаст `jst.config.js` если его ещё нет.

## Конфигурация

Все настройки в одном файле — `jst.config.js` в корне проекта.

```js
export default {
  // Формат веток (шаблоны, не regex)
  branch: {
    main: 'main',
    patterns: [
      'v{version}-{name}',          // v2.3.0-dark-theme
      // 'feature/#{issue}-{name}', // feature/#12-dark-theme
      // 'release/v{version}',      // release/v2.3.0
    ],
  },

  // GitHub labels
  labels: [
    { name: 'task', color: '0E8A16', description: 'Новая фича', emoji: '✨' },
    { name: 'bug',  color: 'D73A4A', description: 'Баг',        emoji: '🐛' },
    // добавь свои...
  ],

  // Правила коммитов
  commits: {
    types: ['feat', 'fix', 'refactor', 'build', 'chore', 'docs', 'perf'],
    requireIssue: ['feat', 'fix'],   // эти типы требуют #номер
    closeKeyword: 'close',           // слово для закрытия issue
  },

  // Релиз
  release: {
    demo: {
      enable: true,                  // требовать демо перед релизом
      dir: 'docs',                   // где искать демо-файлы
      formats: ['gif', 'png'],       // допустимые форматы
      style: 'click',                // 'click' | 'side-by-side'
    },
    // Pre-run хук: перед каждой jst-командой сравнивает теги ↔ Releases ↔
    // демо ↔ README и выводит предупреждения (не блокирует команду).
    audit: {
      enable: true,
      warnOnly: true,
    },
  },

  // Автообновление зависимостей
  // Короткая форма: 'dependabot' | 'renovate' | false
  // Расширенная (только dependabot):
  //   { type: 'dependabot', ignoreMajor: true, autoMerge: { patch: true, minor: true } }
  depUpdater: false,

  // CI workflow (.github/workflows/ci.yml)
  ci: {
    enable: false,                   // включить генерацию ci.yml
    checks: ['lint', 'test'],        // имена job-ов = имена npm-скриптов
    nodeVersion: '20',
  },

  // Branch protection (через gh api)
  branchProtection: {
    enable: false,
    requiredChecks: [],              // должны совпадать с ci.checks
    enforceAdmins: false,
  },
}
```

### Что автоматическое, а что нужно применить вручную

| Что изменил | Когда вступит в силу |
|---|---|
| `branch.pattern` | На следующем `git push` |
| `commits.*` | На следующем `git commit` |
| `release.*` | На следующем `jst release` |
| `labels` | После `jst setup-labels` или `jst apply` |
| `depUpdater` | После `jst setup-deps` или `jst apply` |
| `ci.*` | После `jst setup-ci` или `jst apply` |
| `branchProtection.*` | После `jst setup-branch-protection` (вручную) |

Короткий путь — `jst apply` применит labels + deps + ci за раз. Branch protection требует admin-прав и запускается отдельно.

## Команды

```bash
npm run _ <команда>     # короткая форма
npm run jst <команда>   # полная форма
npx jst <команда>       # напрямую
```

### Проект

| Команда | Описание |
|---|---|
| `init` | Инициализация нового проекта |
| `upgrade` | Обновить конфиги после `npm update` |
| `apply` | Применить изменения из `jst.config.js` (labels + deps + ci) |
| `setup-labels` | Настроить GitHub labels |
| `setup-deps` | Настроить dependabot/renovate (+ auto-merge workflow) |
| `setup-ci` | Сгенерировать `.github/workflows/ci.yml` |
| `setup-branch-protection` | Настроить защиту главной ветки через `gh api` |
| `audit` | Проверить теги/Releases/демо/README на пробелы |
| `fix-releases` | Создать GitHub Release для тегов без Release |

> Audit запускается автоматически перед каждой `jst`-командой (кроме `init`, `upgrade`, `audit`, `fix-releases`). Отключить разово — флагом `--no-audit`: `jst --no-audit create-task "..."`. Полностью — в `jst.config.js`: `release.audit.enable = false`.

### Разработка

| Команда | Описание |
|---|---|
| `release` | Полный релиз (changelog + README) |
| `push-release` | Создать PR и смерджить в main |
| `changelog` | Создать changelog |
| `update-readme` | Обновить README с версией |

### Issues (текущий проект)

| Команда | Описание |
|---|---|
| `tasks` | Список задач |
| `create-task [название]` | Создать задачу |
| `bugs` | Список багов |
| `create-bug [название]` | Создать баг |
| `refactors` | Список рефакторингов |
| `create-refactor [название]` | Создать рефакторинг |
| `perfs` | Список оптимизаций |
| `create-perf [название]` | Создать оптимизацию |
| `all-issues` | Все открытые issues |
| `report-issue [описание]` | Сообщить о проблеме в JST |

### Pull Requests

| Команда | Описание |
|---|---|
| `pr-list` | Показать все PR |
| `pr-view <n>` | Посмотреть PR в терминале |
| `pr-view-web <n>` | Открыть PR в браузере |
| `pr-merge <n>` | Смерджить PR |
| `pr-close <n>` | Закрыть PR без merge |

## Формат коммитов

```bash
feat: #9 добавить тёмную тему               # фича, ссылка на issue
feat(Date): #9 добавить форматирование      # фича со scope
feat: close #9 добавить тёмную тему         # фича + закрыть issue
feat(parser): close #9 финализировать       # scope + закрыть issue
fix: #10 исправить валидацию                # фикс, ссылка на issue
fix(auth): close #10 исправить валидацию    # фикс + scope + закрыть
refactor: оптимизировать алгоритм           # без issue
refactor(utils): оптимизировать хелперы     # без issue, со scope
docs: обновить README                       # без issue
chore(release): v1.2.0                      # авто-релиз
```

### Когда issue закрывается

По умолчанию `feat: #9 ...` и `fix: #9 ...` **не закрывают** issue — только ссылаются. Чтобы закрыть, добавь ключевое слово `close` перед номером:

```bash
# Несколько коммитов по одной задаче
git commit -m "feat: #9 добавить компонент кнопки"
git commit -m "feat: #9 добавить стили кнопки"
git commit -m "feat: close #9 финализировать кнопку"  # ← закроет issue
```

Ключевое слово настраивается через `commits.closeKeyword` в конфиге.

## Формат веток

Ветки задаются шаблонами, без regex. Доступные плейсхолдеры:

| Плейсхолдер | Что матчит | Пример |
|---|---|---|
| `{version}` | Семвер X.Y.Z | `2.3.0` |
| `{issue}` | Номер issue | `12` |
| `{name}` | Описание (буквы, цифры, `-`, `_`) | `dark-theme` |
| `*` | Что угодно | `anything/here` |

```js
// Классический стиль
patterns: ['v{version}-{name}']
// ✅ v2.3.0-normalize-operators

// GitHub Flow стиль
patterns: ['feature/#{issue}-{name}', 'fix/#{issue}-{name}', 'release/v{version}']
// ✅ feature/#12-dark-theme
// ✅ fix/#7-validation-bug
// ✅ release/v2.3.0

// Без ограничений
patterns: ['*']
```

## Типичный workflow

```bash
# 1. Создать задачу
npm run _ create-task "Добавить тёмную тему"     # → issue #12

# 2. Создать ветку
git checkout -b v1.3.0-dark-theme

# 3. Работать и коммитить
git commit -m "feat: #12 добавить переключатель темы"
git commit -m "feat: #12 добавить CSS переменные"
git commit -m "feat: close #12 финальные стили"   # закрыть issue

# 4. Релиз
npm run _ release
npm run _ push-release
```

## Что устанавливается при init

- `jst.config.js` — единый конфиг проекта
- `.husky/` — хуки (commit-msg, pre-push, post-commit)
- `commitlint.config.js` — проверка коммитов (читает из jst.config.js)
- `changelog.config.js` — генерация changelog (читает из jst.config.js)
- `.gitignore`
- GitHub labels (если установлен `gh`)
- dependabot/renovate (если включён в конфиге)

## Технологии

- [Husky](https://typicode.github.io/husky/) — Git hooks
- [Commitlint](https://commitlint.js.org/) — Проверка коммитов
- [Changelogen](https://github.com/unjs/changelogen) — Генерация changelog
- [GitHub CLI](https://cli.github.com/) — Управление issues

## Migration Guide

### v1.9.0 — `release.demo` (breaking change)

Настройки демо переехали из плоского `release.*` в объект `release.demo`:

```js
// ❌ Было (до v1.9.0)
release: {
  requireDemo: true,
  demoDir: 'docs',
  demoFormats: ['gif', 'png'],
}

// ✅ Стало
release: {
  demo: {
    enable: true,
    dir: 'docs',
    formats: ['gif', 'png'],
    style: 'click',   // новая опция: 'click' | 'side-by-side'
  },
}
```

Если в `jst.config.js` остались старые ключи, при запуске любой `jst`-команды появится предупреждение с инструкцией по миграции.

## Лицензия

MIT © [vv0rkz](https://github.com/vv0rkz)
