#!/usr/bin/env node
import { spawnSync } from 'child_process'
import { platform } from 'os'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const toolsDir = join(__dirname, '../tools-gh')

const args = process.argv.slice(2)
const command = args[0]
const commandArgs = args.slice(1)

const isWin = platform() === 'win32'
const npxCmd = isWin ? 'npx.cmd' : 'npx'
const ghCmd = isWin ? 'gh.exe' : 'gh'

const commands = {
  init: () => {
    const initScript = join(__dirname, 'init.js')
    spawnSync('node', [initScript], { stdio: 'inherit' })
  },

  'init-readme': () => {
    spawnSync('node', [join(toolsDir, 'init-readme.js')], { stdio: 'inherit' })
  },

  'setup-labels': () => {
    spawnSync('node', [join(toolsDir, 'setup-labels.js')], { stdio: 'inherit' })
  },

  changelog: () => {
    spawnSync(npxCmd, ['changelogen', ...commandArgs], { stdio: 'inherit' })
  },

  release: () => {
    spawnSync('node', [join(toolsDir, 'release.js')], { stdio: 'inherit' })
  },

  'update-readme': () => {
    spawnSync('node', [join(toolsDir, 'update-readme.js')], { stdio: 'inherit' })
  },

  'push-release': () => {
    spawnSync('node', [join(toolsDir, 'push-release-to-main.js')], { stdio: 'inherit' })
  },

  bugs: () => {
    spawnSync(ghCmd, ['issue', 'list', '--label', 'bug', '--state', 'open'], { stdio: 'inherit' })
  },

  'create-bug': () => {
    if (commandArgs.length === 0) {
      spawnSync('node', [join(toolsDir, 'create-bug.js')], { stdio: 'inherit' })
    } else {
      const title = commandArgs.join(' ')
      spawnSync(ghCmd, ['issue', 'create', '--label', 'bug', '--title', title], { stdio: 'inherit' })
    }
  },

  tasks: () => {
    spawnSync(ghCmd, ['issue', 'list', '--label', 'task', '--state', 'open'], { stdio: 'inherit' })
  },

  'create-task': () => {
    if (commandArgs.length === 0) {
      spawnSync('node', [join(toolsDir, 'create-task.js')], { stdio: 'inherit' })
    } else {
      const title = commandArgs.join(' ')
      spawnSync(ghCmd, ['issue', 'create', '--label', 'task', '--title', title], { stdio: 'inherit' })
    }
  },

  'create-refactor': () => {
    const args = process.argv.slice(3)
    spawnSync('node', [join(toolsDir, 'create-refactor.js'), ...args], { stdio: 'inherit' })
  },

  refactors: () => {
    spawnSync(ghCmd, ['issue', 'list', '--label', 'refactor'], { stdio: 'inherit' })
  },

  'create-perf': () => {
    const args = process.argv.slice(3)
    spawnSync('node', [join(toolsDir, 'create-perf.js'), ...args], { stdio: 'inherit' })
  },

  perfs: () => {
    spawnSync(ghCmd, ['issue', 'list', '--label', 'perf'], { stdio: 'inherit' })
  },

  'all-issues': () => {
    spawnSync(ghCmd, ['issue', 'list', '--state', 'open'], { stdio: 'inherit' })
  },

  'report-issue': () => {
    spawnSync('node', [join(toolsDir, 'report-issue.js'), ...commandArgs], { stdio: 'inherit' })
  },

  'setup-deps': () => {
    spawnSync('node', [join(toolsDir, 'setup-deps.js')], { stdio: 'inherit' })
  },

  upgrade: () => {
    spawnSync('node', [join(toolsDir, 'upgrade.js')], { stdio: 'inherit' })
  },

  apply: () => {
    console.log('⚙️  Применение jst.config.js...\n')
    spawnSync('node', [join(toolsDir, 'setup-labels.js')], { stdio: 'inherit' })
    spawnSync('node', [join(toolsDir, 'setup-deps.js')], { stdio: 'inherit' })
    console.log('\n✅ Конфиг применён!')
  },

  'pr-list': () => {
    console.log('📋 Список Pull Requests...\n')
    spawnSync(ghCmd, ['pr', 'list'], { stdio: 'inherit' })
  },

  'pr-view': () => {
    const prNumber = process.argv[3]
    if (!prNumber) {
      console.log('❌ Укажи номер PR: npm run _ pr-view 5')
      process.exit(1)
    }
    console.log(`👀 Просмотр PR #${prNumber}...\n`)
    spawnSync(ghCmd, ['pr', 'view', prNumber], { stdio: 'inherit' })
  },

  'pr-view-web': () => {
    const prNumber = process.argv[3]
    if (!prNumber) {
      console.log('❌ Укажи номер PR: npm run _ pr-view-web 5')
      process.exit(1)
    }
    console.log(`🌐 Открываю PR #${prNumber} в браузере...`)
    spawnSync(ghCmd, ['pr', 'view', prNumber, '--web'], { stdio: 'inherit' })
  },

  'pr-merge': () => {
    const prNumber = process.argv[3]
    if (!prNumber) {
      console.log('❌ Укажи номер PR: npm run _ pr-merge 5')
      process.exit(1)
    }
    console.log(`🔀 Мерджу PR #${prNumber}...\n`)
    spawnSync(ghCmd, ['pr', 'merge', prNumber, '--merge'], { stdio: 'inherit' })
    console.log('\n✅ PR смерджен!')
  },

  'pr-close': () => {
    const prNumber = process.argv[3]
    if (!prNumber) {
      console.log('❌ Укажи номер PR: npm run _ pr-close 5')
      process.exit(1)
    }
    console.log(`❌ Закрываю PR #${prNumber}...\n`)
    spawnSync(ghCmd, ['pr', 'close', prNumber], { stdio: 'inherit' })
    console.log('\n✅ PR закрыт!')
  },
}

if (commands[command]) {
  commands[command]()
} else {
  console.log(`
⚡ JS Template CLI

Использование: npm run _ <команда> [аргументы]

📋 ПРОЕКТ:
  init                      Инициализация нового проекта
  upgrade                   Обновить конфиги после npm update
  apply                     Применить изменения из jst.config.js
  init-readme               Создать стартовый README.md
  setup-labels              Настроить GitHub labels
  setup-deps                Настроить dependabot/renovate

🔧 РАЗРАБОТКА:
  update-readme             Обновить README с версией
  release                   Полный релиз (changelog + README)
  push-release              Создать PR и смерджить в main

📝 ISSUES (текущий проект):
  tasks                        Список задач (фичи)
  create-task [название]       Создать задачу
  bugs                         Список багов
  create-bug [название]        Создать баг
  refactors                    Список рефакторингов
  create-refactor [название]   Создать рефакторинг
  perfs                        Список оптимизаций
  create-perf [название]       Создать оптимизацию
  all-issues                   Все issues

📮 ISSUES (jst инструмент):
  report-issue [описание]   Сообщить о проблеме в js-template

🔀 PULL REQUESTS:
  pr-list                   Показать все PR
  pr-view <number>          Посмотреть PR в терминале
  pr-view-web <number>      Открыть PR в браузере
  pr-merge <number>         Смерджить PR
  pr-close <number>         Закрыть PR без merge

⚙️  КОНФИГУРАЦИЯ:
  jst.config.js             Настройки веток, labels, коммитов, релизов

📝 ФОРМАТ КОММИТОВ:
  feat: #9 описание               Фича (ссылка на issue)
  feat(scope): #9 описание        Фича со scope
  feat: close #9 описание         Фича + закрыть issue
  fix: #10 описание               Фикс (ссылка на issue)
  fix(scope): close #10 описание  Фикс + scope + закрыть
  refactor: описание              Рефакторинг (без issue)
  refactor(utils): описание       Рефакторинг со scope
  chore(release): v1.2.0          Авто-релиз

📚 ПРИМЕРЫ:
  npm run _ init
  npm run _ create-task "Добавить темную тему"
  npm run _ release
  npm run _ report-issue "Баг в release команде"
  npm run _ pr-list

  `)
  process.exit(command ? 1 : 0)
}
