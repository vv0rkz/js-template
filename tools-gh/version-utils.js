import { execSync } from 'child_process'

/**
 * Returns the last tag (e.g. "v1.8.4") or '' if no tags exist.
 */
export function getLastTag() {
  try {
    return execSync('git describe --tags --abbrev=0', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return ''
  }
}

/**
 * Returns commit subjects since the last tag (or last 10 commits if no tag).
 */
export function getCommitsSinceLastTag(lastTag = getLastTag()) {
  const log = lastTag
    ? execSync(`git log ${lastTag}..HEAD --format=%s`, { encoding: 'utf8' })
    : execSync('git log --format=%s -10', { encoding: 'utf8' })
  return log.split('\n').filter(Boolean)
}

/**
 * Predicts the next semver version string ("vX.Y.Z") based on commits since the
 * last tag. If any feat: commit is present → minor bump; otherwise patch bump.
 *
 * Uses commits since the last tag (not last 10 commits) so the prediction stays
 * correct even after many docs:/refactor: commits land on top of older feat:s.
 */
export function predictNextVersion(currentVersion) {
  const [major, minor, patch] = currentVersion.split('.').map(Number)
  const commits = getCommitsSinceLastTag()
  const hasFeat = commits.some((c) => /^feat(\(.+\))?!?:/.test(c))

  return hasFeat ? `v${major}.${minor + 1}.0` : `v${major}.${minor}.${patch + 1}`
}
