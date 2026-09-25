const TECHNICAL_HINTS = ['clima','condizion','elettr','luce','acqua','scarico','wc','bagno','porta','serratura','tv','televis','frigo','cassaforte','guasto','manuten']

function textOf(value){ return String(value ?? '').trim().toLowerCase() }

export function areaForIssue(issue = {}) {
  const room = textOf(issue.camera)
  const match = room.match(/(?:^|\D)([1-8])\d{2}(?:\D|$)/)
  if (match) {
    const floor = Number(match[1])
    return floor <= 4 ? `jazz${floor}` : `wine${floor}`
  }

  const haystack = [issue.categoria, issue.note].map(textOf).join(' ')
  if (TECHNICAL_HINTS.some(hint => haystack.includes(hint))) return 'technical'
  return 'reception'
}

export function linkedIssueFor(agent, issues = []) {
  if (!agent?.task_id) return null
  return issues.find(issue => String(issue.id) === String(agent.task_id)) || null
}

export function liveDirectiveFor(agent, issues = []) {
  if (!agent) return null
  const status = String(agent.status || '').toUpperCase()

  if (status === 'RUNNING') {
    const issue = linkedIssueFor(agent, issues)
    if (!issue) return {
      source: 'LIVE',
      zone: null,
      action: agent.activity || agent.detail || 'Task reale in corso',
      taskId: agent.task_id || null,
    }

    const room = issue.camera ? ` · ${issue.camera}` : ''
    return {
      source: 'LIVE',
      zone: areaForIssue(issue),
      action: agent.activity || `Intervento${room}: ${issue.categoria || 'manutenzione'}`,
      taskId: agent.task_id,
      issueId: issue.id,
    }
  }

  if (status === 'WAITING_APPROVAL') return {
    source: 'LIVE',
    zone: 'reception',
    action: agent.activity || agent.detail || 'Attende approvazione',
    taskId: agent.task_id || null,
  }

  if (status === 'ERROR') return {
    source: 'LIVE',
    zone: 'technical',
    action: agent.detail || agent.activity || 'Diagnostica errore',
    taskId: agent.task_id || null,
  }

  return null
}

export function runtimeEventFeed(agents = [], issues = []) {
  const events = []

  for (const agent of agents) {
    const directive = liveDirectiveFor(agent, issues)
    if (!directive) continue
    events.push({
      id: `agent:${agent.id}:${directive.taskId || agent.status}`,
      kind: 'agent',
      source: directive.source,
      agentId: agent.id,
      label: agent.name || agent.id,
      detail: directive.action,
      zone: directive.zone,
    })
  }

  for (const issue of issues) {
    events.push({
      id: `issue:${issue.id}`,
      kind: 'maintenance',
      source: 'LIVE',
      issueId: issue.id,
      label: issue.camera || 'Hotel',
      detail: issue.categoria || 'Segnalazione',
      zone: areaForIssue(issue),
    })
  }

  return events
}
