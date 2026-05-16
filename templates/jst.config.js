/**
 * JST Configuration
 * Документация: https://github.com/vv0rkz/js-template
 *
 * Все значения ниже — дефолтные. Измени нужные или закомментируй.
 */
export default {
  /**
   * Правила именования веток
   */
  branch: {
    /** Имя главной ветки ('main' | 'master') */
    main: 'main',

    /**
     * Допустимые форматы веток (массив шаблонов)
     *
     * Плейсхолдеры:
     *   {version}  → семвер (X.Y.Z)
     *   {issue}    → номер issue (цифры)
     *   {name}     → описание (буквы, цифры, дефисы, подчёркивания)
     *   *          → что угодно
     *
     * Примеры наборов:
     *
     *   ['v{version}-{name}']
     *     ✅ v2.3.0-normalize-operators
     *
     *   ['release/v{version}', 'feature/#{issue}-{name}', 'fix/#{issue}-{name}']
     *     ✅ release/v2.3.0
     *     ✅ feature/#12-dark-theme
     *     ✅ fix/#7-validation-bug
     *
     *   ['feature/*', 'fix/*', 'release/*']
     *     ✅ feature/anything-goes-here
     *     ✅ fix/urgent-patch
     *
     *   ['*']
     *     ✅ любое имя (без ограничений)
     */
    patterns: ['v{version}-{name}'],
  },

  /**
   * GitHub Labels
   * Используются при `jst setup-labels` и `jst create-*`
   *
   * Цвета — 6-символьный hex без #
   */
  labels: [
    { name: 'task', color: '0E8A16', description: 'Новая фича', emoji: '✨' },
    { name: 'bug', color: 'D73A4A', description: 'Баг', emoji: '🐛' },
    { name: 'refactor', color: 'FEF2C0', description: 'Рефакторинг/техдолг', emoji: '♻️' },
    { name: 'perf', color: '007bff', description: 'Оптимизация производительности', emoji: '⚡' },
  ],

  /**
   * Правила коммитов
   */
  commits: {
    /**
     * Разрешённые типы коммитов
     * Должны совпадать с commitlint и changelog
     */
    types: ['feat', 'fix', 'refactor', 'build', 'chore', 'docs', 'perf'],

    /**
     * Типы, требующие номер issue (#N)
     * Остальные типы — свободный формат
     */
    requireIssue: ['feat', 'fix'],

    /**
     * Ключевое слово для закрытия issue в коммите
     *
     * С ним:  feat: close #9 описание  → закроет issue #9
     * Без:    feat: #9 описание        → просто ссылка, issue остаётся открытым
     */
    closeKeyword: 'close',
  },

  /**
   * Настройки релиза (`jst release`)
   */
  release: {
    /**
     * Настройки демо
     */
    demo: {
      /** Требовать демо перед релизом (true | false) */
      enable: true,

      /** Директория для демо-файлов */
      dir: 'docs',

      /** Допустимые форматы демо-файлов */
      formats: ['gif', 'png'],

      /**
       * Способ отображения демо в README
       * 'click'        — PNG превью, клик открывает GIF (быстрая загрузка)
       * 'side-by-side' — PNG + GIF рядом (GIF грузится автоматически)
       */
      style: 'click',
    },
  },

  /**
   * Настройки changelog (changelogen)
   * title — заголовок секции в CHANGELOG.md
   * semver — тип версионирования ('major' | 'minor' | 'patch')
   */
  changelog: {
    types: {
      feat: { title: '✨ Новые фичи', semver: 'minor' },
      fix: { title: '🐛 Исправления', semver: 'patch' },
      refactor: { title: '♻️ Рефакторинг', semver: 'patch' },
      perf: { title: '⚡ Оптимизация', semver: 'patch' },
    },
  },

  /**
   * Автообновление зависимостей
   *
   * Короткая форма:
   *   depUpdater: 'dependabot'   — создаст .github/dependabot.yml
   *   depUpdater: 'renovate'     — создаст renovate.json
   *   depUpdater: false          — отключено
   *
   * Расширенная форма (только dependabot):
   *   depUpdater: {
   *     type: 'dependabot',
   *     ignoreMajor: true,                       // не открывать major PR-ы
   *     ignore: { major: true, minor: false },   // или более гранулярно
   *     autoMerge: { patch: true, minor: true, major: false },
   *   }
   *
   * При `autoMerge` jst дополнительно создаёт
   * .github/workflows/dependabot-auto-merge.yml
   */
  depUpdater: false,

  /**
   * Continuous Integration (GitHub Actions)
   *
   * При `enable: true` команда `jst setup-ci` (и `jst apply`) создаёт
   * .github/workflows/ci.yml — workflow с по одной job на каждый check.
   * Имя job совпадает с именем npm-скрипта, который оно запускает.
   *
   *   ci.yml: jobs.lint → runs `npm run lint`
   *           jobs.test → runs `npm run test`
   */
  ci: {
    enable: false,
    checks: ['lint', 'test'],
    nodeVersion: '20',
  },

  /**
   * Branch protection (через `gh api`)
   *
   * Команда `jst setup-branch-protection` настраивает защиту главной ветки
   * через GitHub API. Не запускается автоматически в `jst apply` —
   * требует admin прав на репозитории.
   *
   *   requiredChecks — список обязательных status checks (должны совпадать
   *   с именами job-ов из ci.checks).
   */
  branchProtection: {
    enable: false,
    requiredChecks: [],
    enforceAdmins: false,
  },

}
