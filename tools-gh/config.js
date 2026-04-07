import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { pathToFileURL } from 'url'

const DEFAULTS = {
  branch: {
    main: 'main',
    patterns: ['v{version}-{name}'],
  },
  labels: [
    { name: 'task', color: '0E8A16', description: 'Новая фича', emoji: '✨' },
    { name: 'bug', color: 'D73A4A', description: 'Баг', emoji: '🐛' },
    { name: 'refactor', color: 'FEF2C0', description: 'Рефакторинг/техдолг', emoji: '♻️' },
    { name: 'perf', color: '007bff', description: 'Оптимизация производительности', emoji: '⚡' },
  ],
  commits: {
    types: ['feat', 'fix', 'refactor', 'build', 'chore', 'docs', 'perf'],
    requireIssue: ['feat', 'fix'],
    closeKeyword: 'close',
  },
  release: {
    requireDemo: true,
    demoDir: 'docs',
    demoFormats: ['gif', 'png'],
  },
  changelog: {
    types: {
      feat: { title: '✨ Новые фичи', semver: 'minor' },
      fix: { title: '🐛 Исправления', semver: 'patch' },
      refactor: { title: '♻️ Рефакторинг', semver: 'patch' },
      perf: { title: '⚡ Оптимизация', semver: 'patch' },
    },
  },
  depUpdater: false,
  jstRepo: 'vv0rkz/js-template',
}

// --- Branch pattern template engine ---

const BRANCH_PLACEHOLDERS = {
  '{version}': '\\d+\\.\\d+\\.\\d+',
  '{issue}': '\\d+',
  '{name}': '[a-zA-Z0-9_-]+',
}

function compileTemplate(template) {
  const parts = template.split(/(\{[a-z]+\}|\*)/g)
  return parts
    .map((part) => {
      if (BRANCH_PLACEHOLDERS[part]) return BRANCH_PLACEHOLDERS[part]
      if (part === '*') return '.+'
      return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    })
    .join('')
}

/**
 * Compiles branch config into a RegExp.
 * Supports template patterns (new) and raw regex (legacy).
 *
 * Templates:
 *   {version}  → X.Y.Z (semver)
 *   {issue}    → issue number (digits)
 *   {name}     → branch description (letters, digits, hyphens, underscores)
 *   *          → anything
 */
export function compileBranchRegex(branchConfig) {
  if (branchConfig.patterns && Array.isArray(branchConfig.patterns)) {
    const compiled = branchConfig.patterns.map(compileTemplate)
    return new RegExp(`^(${compiled.join('|')})$`)
  }

  if (branchConfig.pattern) {
    return new RegExp(branchConfig.pattern)
  }

  return new RegExp('^v.*-.*')
}

// --- Deep merge ---

function deepMerge(target, source) {
  const result = { ...target }
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key], source[key])
    } else {
      result[key] = source[key]
    }
  }
  return result
}

/**
 * Loads config from jst.config.js (preferred) or jst.config.json (fallback)
 * Deep-merges user config with defaults
 */
export async function loadConfig() {
  const jsPath = join(process.cwd(), 'jst.config.js')
  const jsonPath = join(process.cwd(), 'jst.config.json')
  let userConfig = {}

  if (existsSync(jsPath)) {
    try {
      const mod = await import(pathToFileURL(jsPath).href)
      userConfig = mod.default || {}
    } catch (e) {
      console.warn('⚠️  Ошибка чтения jst.config.js:', e.message)
    }
  } else if (existsSync(jsonPath)) {
    try {
      userConfig = JSON.parse(readFileSync(jsonPath, 'utf8'))
    } catch (e) {
      console.warn('⚠️  Ошибка чтения jst.config.json:', e.message)
    }
  }

  return deepMerge(DEFAULTS, userConfig)
}
