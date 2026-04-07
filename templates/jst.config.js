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
    /** Требовать GIF/PNG демо перед релизом (true | false) */
    requireDemo: true,

    /** Директория для демо-файлов */
    demoDir: 'docs',

    /** Допустимые форматы демо-файлов */
    demoFormats: ['gif', 'png'],
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
   * @type {'dependabot' | 'renovate' | false}
   *
   * 'dependabot' — создаст .github/dependabot.yml
   * 'renovate'   — создаст renovate.json
   * false        — отключено
   */
  depUpdater: false,

  /**
   * Репозиторий JST для команды `report-issue`
   * Формат: 'owner/repo'
   */
  jstRepo: 'vv0rkz/js-template',
}
