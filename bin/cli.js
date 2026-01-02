#!/usr/bin/env node
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { spawnSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const toolsDir = join(__dirname, '../tools-gh') // ВСЕГДА из node_modules

const args = process.argv.slice(2)
const command = args[0]
const commandArgs = args.slice(1)

const commands = {
  init: () => {
    const initScript = join(__dirname, 'init.js')
    spawnSync('node', [initScript], { stdio: 'inherit' })
  },

  'init-readme': () => {
    spawnSync('node', [join(toolsDir, 'init-readme.js')], { stdio: 'inherit' })
  },

  changelog: () => {
    spawnSync('npx', ['changelogen', ...commandArgs], { stdio: 'inherit', shell: true })
  },

  release: () => {
    console.log('🚀 Запуск релиза...\n')

    const checkDemo = spawnSync('node', [join(toolsDir, 'check-demo-for-release.js')], { stdio: 'inherit' })
    if (checkDemo.status !== 0) {
      console.error('❌ Проверка демо не прошла')
      process.exit(1)
    }

    const changelog = spawnSync('npx', ['changelogen', '--release'], { stdio: 'inherit', shell: true })
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
    spawnSync('gh', ['issue', 'list', '--label', 'bug', '--state', 'open'], { stdio: 'inherit', shell: true })
  },

  'create-bug': () => {
    if (commandArgs.length === 0) {
      spawnSync('node', [join(toolsDir, 'create-bug.js')], { stdio: 'inherit' })
    } else {
      const title = commandArgs.join(' ')
      spawnSync('gh', ['issue', 'create', '--label', 'bug', '--title', title], { stdio: 'inherit', shell: true })
    }
  },

  tasks: () => {
    spawnSync('gh', ['issue', 'list', '--label', 'task', '--state', 'open'], { stdio: 'inherit', shell: true })
  },

  'create-task': () => {
    if (commandArgs.length === 0) {
      spawnSync('node', [join(toolsDir, 'create-task.js')], { stdio: 'inherit' })
    } else {
      const title = commandArgs.join(' ')
      spawnSync('gh', ['issue', 'create', '--label', 'task', '--title', title], { stdio: 'inherit', shell: true })
    }
  },

  'all-issues': () => {
    spawnSync('gh', ['issue', 'list', '--state', 'open'], { stdio: 'inherit', shell: true })
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
  jst create-task "Добавить темную тему"
  jst release
  jst tasks
  `)
  process.exit(command ? 1 : 0)
}
