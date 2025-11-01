import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const QuickFind = ({ board }) => {
  const [term, setTerm] = useState('')
  const navigate = useNavigate()

  const results = useMemo(() => {
    const t = term.trim().toLowerCase()
    if (!t) return { groups: [], tasks: [] }
    const groups = board.groups.filter(g => g.title.toLowerCase().includes(t))
    const tasks = []
    for (const g of board.groups) {
      for (const task of g.tasks || []) {
        if (String(task.title || '').toLowerCase().includes(t)) tasks.push({ task, group: g })
      }
    }
    return { groups, tasks }
  }, [term, board])

  const scrollTo = (elId) => {
    const el = document.getElementById(elId)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // brief highlight
    el.classList.add('qf-highlight')
    setTimeout(() => el.classList.remove('qf-highlight'), 1200)
  }

  const onSubmit = (ev) => {
    ev.preventDefault()
    const { groups, tasks } = results
    if (groups.length > 0) return scrollTo(`group-${groups[0].id}`)
    if (tasks.length > 0) return scrollTo(`task-${tasks[0].task.id}`)
  }

  const onOpenDetails = (task, group) => {
    navigate(`/workspace/board/${board._id}/details/${board._id}?groupId=${group.id}&taskId=${task.id}`)
  }

  return (
    <div className="quick-find">
      <form onSubmit={onSubmit} className="qf-bar">
        <input
          placeholder="Quick find"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
        <button type="submit" className="qf-go">Go</button>
      </form>
      {term && (
        <div className="qf-results">
          {results.groups.slice(0, 5).map(g => (
            <button key={g.id} className="qf-row" onClick={() => scrollTo(`group-${g.id}`)}>
              <span className="qf-tag">Group</span>
              <span className="qf-title">{g.title}</span>
            </button>
          ))}
          {results.tasks.slice(0, 5).map(({ task, group }) => (
            <button key={task.id} className="qf-row" onClick={() => onOpenDetails(task, group)}>
              <span className="qf-tag">Task</span>
              <span className="qf-title">{task.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
