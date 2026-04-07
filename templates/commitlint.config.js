let types = ['feat', 'fix', 'refactor', 'build', 'chore', 'docs', 'perf']

try {
  const { default: config } = await import('./jst.config.js')
  if (config.commits?.types) types = config.commits.types
} catch {}

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', types],
  },
}
