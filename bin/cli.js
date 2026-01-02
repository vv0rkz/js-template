#!/usr/bin/env node
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { spawnSync } from 'child_process'
import { platform } from 'os'

const __dirname = dirname(fileURLToPath(import.meta.url))
const toolsDir = join(__dirname, '../tools-gh')

const args = process.argv.slice(2)
const command = args[0]
const commandArgs = args.slice(1)

// Для Windows npx должен быть npx.cmd без shell
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

  changelog: () => {
    // БЕЗ shell: true
    spawnSync(npxCmd, ['changelogen', ...commandArgs], { stdio: 'inherit' })
  },

  release: () => {
    console.log('🚀 Запуск релиза...\n')

    const checkDemo = spawnSync('node', [join(toolsDir, 'check-demo-for-release.js')], { stdio: 'inherit' })
    if (checkDemo.status !== 0) {
      console.error('❌ Проверка демо не прошла')
      process.exit(1)
    }

    const changelog = spawnSync(npxCmd, ['changelogen', '--release'], { stdio: 'inherit' })
    if (changelog.status !== 0) {
      console.error('❌ Ошибка создания changelog')
      process.exit(1)
    }

    spawnSync('node', [join(toolsDir, 'update-readme.js')], { stdio: 'inherit' })
    console.log('\n✅ Релиз успешно создан!')
  },

  'update-readme': () => {
    spawnSync('node', [join(toolsDir, 'update-readme.js')], { stdio: 'inherit' })
  },

  'push-release': () => {
    spawnSync('node', [join(toolsDir, 'push-release-to-main.js')], { stdio: 'inherit' })
  },

  bugs: () => {
    // БЕЗ shell: true — убирает warning
    spawnSync(ghCmd, ['issue', 'list', '--label', 'bug', '--state', 'open'], { stdio: 'inherit' })
  },

  'create-bug': () => {
    if (commandArgs.length === 0) {
      spawnSync('node', [join(toolsDir, 'create-bug.js')], { stdio: 'inherit' })
    } else {
      const title = commandArgs.join(' ')
      // БЕЗ shell: true — теперь пробелы работают!
      spawnSync(ghCmd, ['issue', 'create', '--label', 'bug', '--title', title], { stdio: 'inherit' })
    }
  },

  tasks: () => {
    // БЕЗ shell: true
    spawnSync(ghCmd, ['issue', 'list', '--label', 'task', '--state', 'open'], { stdio: 'inherit' })
  },

  'create-task': () => {
    if (commandArgs.length === 0) {
      spawnSync('node', [join(toolsDir, 'create-task.js')], { stdio: 'inherit' })
    } else {
      const title = commandArgs.join(' ')
      // БЕЗ shell: true — теперь пробелы работают!
      spawnSync(ghCmd, ['issue', 'create', '--label', 'task', '--title', title], { stdio: 'inherit' })
    }
  },

  'all-issues': () => {
    // БЕЗ shell: true
    spawnSync(ghCmd, ['issue', 'list', '--state', 'open'], { stdio: 'inherit' })
  },
}

if (commands[command]) {
  commands[command]()
} else {
  console.log(`
⚡ JS Template CLI

Использование: jst <команда> [аргументы]

📋 ПРОЕКТ:
  jst init                      Инициализация проекта
  jst init-readme               Создать стартовый README.md

🔧 РАЗРАБОТКА:
  jst changelog                 Создать changelog
  jst release                   Полный релиз (проверка + changelog + README)
  jst update-readme             Обновить README
  jst push-release              Запушить релиз в main

📝 ЗАДАЧИ:
  jst tasks                     Список открытых задач
  jst create-task [название]    Создать задачу
  jst bugs                      Список открытых багов
  jst create-bug [название]     Создать баг
  jst all-issues                Все открытые issues

📚 ПРИМЕРЫ:
  jst init
  jst init-readme
  jst create-task "Добавить темную тему"
  jst release
  jst tasks
  `)
  process.exit(command ? 1 : 0)
}
