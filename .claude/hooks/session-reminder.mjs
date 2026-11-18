// UserPromptSubmit hook: reminds Claude (and you) of the session routine in CLAUDE.md.
//
// Fires on the first prompt of every session, and again whenever you type after a break
// of GAP_MINUTES or more. Works on Windows (Git Bash) and Linux (Claude Code Cloud).
// State is kept in .claude/.session-reminder.json, which is git-ignored (one per machine).
// It never blocks a prompt: any error just means no reminder.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const GAP_MINUTES = 30
const here = path.dirname(fileURLToPath(import.meta.url))
const stateFile = path.join(here, '..', '.session-reminder.json')

function readStdin() {
  try {
    return JSON.parse(fs.readFileSync(0, 'utf8') || '{}')
  } catch {
    return {}
  }
}

try {
  const input = readStdin()
  const session = input.session_id || 'unknown'
  const now = Date.now()

  let state = {}
  try {
    state = JSON.parse(fs.readFileSync(stateFile, 'utf8'))
  } catch {}

  const last = state[session]
  const firstPrompt = last === undefined
  const gapMin = firstPrompt ? 0 : Math.round((now - last) / 60000)

  // remember this prompt; keep only the 20 most recent sessions
  state[session] = now
  const recent = Object.entries(state).sort((a, b) => b[1] - a[1]).slice(0, 20)
  try {
    fs.writeFileSync(stateFile, JSON.stringify(Object.fromEntries(recent)))
  } catch {}

  if (!firstPrompt && gapMin < GAP_MINUTES) process.exit(0)

  const why = firstPrompt ? 'First message of this session' : `Back after ${gapMin} min`
  const context = [
    `[Session routine reminder: ${why}]`,
    'Before answering, follow the "Session routine" in CLAUDE.md:',
    '- START: run `git pull`, read CLAUDE.md and ROADMAP.md, then tell the user in 3 lines where we left off. Then handle their message.',
    firstPrompt
      ? '- END (later): before the user stops, update CLAUDE.md (current state + a Session log entry with today\'s date) and ROADMAP.md, commit everything with a clear message, and push.'
      : '- END: if work from before the break is not yet committed and pushed, remind the user and offer to do the end-of-session routine (update CLAUDE.md current state + Session log with today\'s date, update ROADMAP.md, commit, push).',
  ].join('\n')

  process.stdout.write(
    JSON.stringify({
      systemMessage: `${why}: start routine = git pull, read CLAUDE.md + ROADMAP.md, 3-line recap. End routine = update CLAUDE.md + ROADMAP.md, commit, push.`,
      hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: context },
    }),
  )
} catch {
  // never block the prompt
}
process.exit(0)
