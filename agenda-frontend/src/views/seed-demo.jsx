import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { addBoard, updateBoard, removeBoard } from '../store/board/board.action'
import { boardService } from '../services/board.service'
import { utilService } from '../services/util.service'

export const SeedDemo = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const loggedinUser = useSelector(state => state.userModule.loggedinUser)

  useEffect(() => {
    const seed = async () => {
      // Build identity: logged-in or persistent guest
      let user = loggedinUser
      if (!user) {
        let guestId = localStorage.getItem('guestUserId')
        if (!guestId) {
          guestId = utilService.makeId()
          localStorage.setItem('guestUserId', guestId)
        }
        user = { _id: guestId, fullname: 'Guest', imgUrl: 'profile-img-guest' }
      }

      // Demo members
      const members = [
        user,
        { _id: 'u_tal', fullname: 'Tal', imgUrl: 'profile-img-tal' },
        { _id: 'u_michael', fullname: 'Michael', imgUrl: 'profile-img-michael' },
        { _id: 'u_or', fullname: 'Or', imgUrl: 'profile-img-or' },
        { _id: 'u_gal', fullname: 'Gal', imgUrl: 'profile-img-gal' }
      ]

      const now = Date.now()
      const day = 1000 * 60 * 60 * 24

      // Helpers for richer demo content
      const memberById = (id) => members.find(m => m._id === id) || members[0]
      const makeComment = ({ by, txt, offset = 0, likes = [] }) => ({
        id: utilService.makeId(),
        txt,
        createdAt: now - offset * day,
        byMember: memberById(by),
        likes: likes.map(uid => {
          const m = memberById(uid)
          return { fullname: m.fullname, imgUrl: m.imgUrl, id: m._id }
        })
      })

      const makeTask = ({ title, status, priority, members: mids, startOffset = 0, endOffset = 2, comments = [], files = null, activities = [] }) => ({
        id: utilService.makeId(),
        title,
        status,
        priority,
        memberIds: mids,
        timeline: { startDate: now - startOffset * day, endDate: now + endOffset * day },
        comments,
        ...(files ? { files } : {}),
        ...(activities && activities.length ? { activities } : {})
      })

      const makeGroup = ({ title, style, tasks }) => ({ id: utilService.makeId(), title, tasks, style })

      // Additional generators to enrich data (~5x)
      const statuses = ['Working on it', 'Done', 'Stuck', 'Need help', 'Waiting for QA', 'Pending']
      const priorities = ['Low', 'Medium', 'Medium', 'High', 'Critical']
      const colorStyles = ['clr1','clr2','clr3','clr4','clr5','clr6','clr7','clr8','clr9','clr10','clr11','clr12','clr13','clr14','clr15','clr16','clr17']

      const randomOf = (arr) => arr[Math.floor(Math.random()*arr.length)]
      const randomMembers = (min=1, max=2) => {
        const ids = members.map(m=>m._id)
        const count = Math.min(max, Math.max(min, Math.floor(Math.random()* (max-min+1))+min))
        const shuffled = ids.sort(()=>0.5-Math.random())
        return shuffled.slice(0, count)
      }

      const genericComments = [
        'Syncing up tomorrow on this.',
        'Pushed initial draft.',
        'Need a quick review.',
        'Blocked by dependency.',
        'Looks good, moving forward.'
      ]

      const makeActivity = ({ type, by, data, offset = 0 }) => ({
        id: utilService.makeId(),
        type,
        createdAt: now - offset * day,
        byMember: memberById(by),
        data
      })

      const genTasks = (count, titlePrefix='Task') => {
        const list = []
        for (let i=0; i<count; i++) {
          const status = statuses[i % statuses.length]
          const priority = priorities[i % priorities.length]
          const mids = randomMembers(1,2)
          const startOffset = Math.floor(Math.random()*10)+1
          const endOffset = Math.floor(Math.random()*12)-3 // some past, some future
          const cmts = [
            makeComment({ by: randomOf(members)._id, txt: randomOf(genericComments), offset: Math.floor(Math.random()*5), likes: [randomOf(members)._id] })
          ]
          const files = Math.random() < 0.35 ? `https://picsum.photos/seed/${encodeURIComponent(titlePrefix+'-'+i)}/500/300` : null
          const activities = [
            makeActivity({ type: 'status', by: randomOf(members)._id, data: status, offset: Math.floor(Math.random()*7) }),
            makeActivity({ type: 'priority', by: randomOf(members)._id, data: priority, offset: Math.floor(Math.random()*7) })
          ]
          list.push(makeTask({ title: `${titlePrefix} ${i+1}`, status, priority, members: mids, startOffset, endOffset, comments: cmts, files, activities }))
        }
        return list
      }

      const enrichBoard = (b, scale = 1) => {
        // Add more tasks to each existing group
        b.groups.forEach((g, idx) => {
          const perGroup = Math.max(1, Math.round(3 * scale))
          const extra = genTasks(perGroup, `${g.title} extra`)
          g.tasks = [...g.tasks, ...extra]
        })
        // Add extra groups with many tasks
        const scaled = (n) => Math.max(2, Math.round(n * scale))
        const extraGroups = [
          { title: 'Design', style: randomOf(colorStyles), count: scaled(6) },
          { title: 'Operations', style: randomOf(colorStyles), count: scaled(6) },
          { title: 'Backlog 2', style: randomOf(colorStyles), count: scaled(5) },
          { title: 'QA 2', style: randomOf(colorStyles), count: scaled(5) }
        ]
        extraGroups.forEach(cfg => {
          b.groups.push(makeGroup({ title: cfg.title, style: cfg.style, tasks: genTasks(cfg.count, cfg.title) }))
        })
      }

      const boards = [
        {
          title: 'Website Launch',
          createdBy: { _id: user._id, fullname: user.fullname, imgUrl: user.imgUrl },
          members,
          cmpsOrder: ['member', 'status', 'priority', 'attachments', 'timeline'],
          groups: [
            makeGroup({
              title: 'Backlog', style: 'clr5', tasks: [
                makeTask({
                  title: 'Define MVP scope',
                  status: 'Working on it',
                  priority: 'High',
                  members: [user._id, 'u_tal'],
                  startOffset: 7,
                  endOffset: 7,
                  comments: [
                    makeComment({ by: 'u_tal', txt: 'Drafted the initial MVP checklist.', offset: 6, likes: [user._id] }),
                    makeComment({ by: user._id, txt: 'Looks good. Let’s confirm with the team tomorrow.', offset: 5 })
                  ]
                }),
                makeTask({
                  title: 'Wireframes for homepage',
                  status: 'Done',
                  priority: 'Medium',
                  members: ['u_michael'],
                  startOffset: 10,
                  endOffset: -1,
                  comments: [
                    makeComment({ by: 'u_michael', txt: 'Uploaded wireframes to Drive for review.', offset: 9, likes: ['u_gal'] })
                  ]
                }),
                makeTask({
                  title: 'Set up hosting',
                  status: 'Pending',
                  priority: 'Medium',
                  members: [user._id],
                  startOffset: 1,
                  endOffset: 5,
                  comments: [
                    makeComment({ by: user._id, txt: 'Comparing providers. Leaning toward Vercel for the FE and Render for the API.', offset: 1 })
                  ]
                })
              ]
            }),
            makeGroup({
              title: 'Development', style: 'clr8', tasks: [
                makeTask({
                  title: 'Implement auth flow',
                  status: 'Working on it',
                  priority: 'Critical',
                  members: ['u_or', 'u_gal'],
                  startOffset: 3,
                  endOffset: 9,
                  comments: [
                    makeComment({ by: 'u_or', txt: 'JWT implemented, finishing refresh token rotation.', offset: 2, likes: ['u_gal'] }),
                    makeComment({ by: 'u_gal', txt: 'UI wiring next. Need copy for error states.', offset: 1 })
                  ]
                }),
                makeTask({
                  title: 'Responsive navbar',
                  status: 'Stuck',
                  priority: 'High',
                  members: ['u_tal'],
                  startOffset: 2,
                  endOffset: 6,
                  comments: [
                    makeComment({ by: 'u_tal', txt: 'Edge case on mobile landscape. Need new breakpoint.', offset: 1 })
                  ]
                })
              ]
            }),
            makeGroup({
              title: 'QA', style: 'clr11', tasks: [
                makeTask({
                  title: 'Regression checklist',
                  status: 'Waiting for QA',
                  priority: 'Low',
                  members: ['u_michael'],
                  startOffset: 0,
                  endOffset: 3,
                  comments: [
                    makeComment({ by: 'u_michael', txt: 'Drafted the checklist. Waiting for FE to stabilize.', offset: 0 })
                  ]
                })
              ]
            })
          ]
        },
        {
          title: 'Marketing Plan',
          createdBy: { _id: user._id, fullname: user.fullname, imgUrl: user.imgUrl },
          members,
          cmpsOrder: ['member', 'status', 'priority', 'attachments', 'timeline'],
          groups: [
            makeGroup({
              title: 'Ideas', style: 'clr9', tasks: [
                makeTask({
                  title: 'Landing page hero A/B',
                  status: 'Working on it',
                  priority: 'High',
                  members: ['u_tal'],
                  startOffset: 1,
                  endOffset: 4,
                  comments: [
                    makeComment({ by: 'u_tal', txt: 'Variant B wins on CTR by 12%.', offset: 1, likes: ['u_michael'] })
                  ]
                }),
                makeTask({
                  title: 'Blog topics list',
                  status: 'Pending',
                  priority: 'Medium',
                  members: [user._id],
                  startOffset: 0,
                  endOffset: 7,
                  comments: [
                    makeComment({ by: user._id, txt: 'Collecting ideas around productivity and PM tips.', offset: 0 })
                  ]
                })
              ]
            }),
            makeGroup({
              title: 'In progress', style: 'clr10', tasks: [
                makeTask({
                  title: 'Launch teaser on socials',
                  status: 'Need help',
                  priority: 'Medium',
                  members: ['u_gal'],
                  startOffset: 2,
                  endOffset: 2,
                  comments: [
                    makeComment({ by: 'u_gal', txt: 'Need final brand assets for the teaser.', offset: 2, likes: [user._id] })
                  ]
                })
              ]
            }),
            makeGroup({
              title: 'Completed', style: 'clr12', tasks: [
                makeTask({
                  title: 'Brand guidelines',
                  status: 'Done',
                  priority: 'Low',
                  members: ['u_michael'],
                  startOffset: 20,
                  endOffset: -5,
                  comments: [
                    makeComment({ by: 'u_michael', txt: 'Guidelines finalized. Uploaded the PDF.', offset: 10 })
                  ]
                })
              ]
            })
          ]
        },
        {
          title: 'Sprint Backlog',
          createdBy: { _id: user._id, fullname: user.fullname, imgUrl: user.imgUrl },
          members,
          cmpsOrder: ['member', 'status', 'priority', 'attachments', 'timeline'],
          groups: [
            makeGroup({
              title: 'Sprint 34', style: 'clr3', tasks: [
                makeTask({
                  title: 'Bugfix: board filters',
                  status: 'Working on it',
                  priority: 'High',
                  members: ['u_or'],
                  startOffset: 1,
                  endOffset: 3,
                  comments: [
                    makeComment({ by: 'u_or', txt: 'Reproduced on Safari; fixing comparator.', offset: 1 })
                  ]
                }),
                makeTask({
                  title: 'Improve performance',
                  status: 'Waiting for QA',
                  priority: 'Medium',
                  members: ['u_michael', 'u_gal'],
                  startOffset: 4,
                  endOffset: 10,
                  comments: [
                    makeComment({ by: 'u_gal', txt: 'Virtualized the table rows; 3x faster.', offset: 3, likes: ['u_michael'] })
                  ]
                })
              ]
            }),
            makeGroup({
              title: 'Sprint 35', style: 'clr4', tasks: [
                makeTask({
                  title: 'Notifications center',
                  status: 'Pending',
                  priority: 'Low',
                  members: [user._id],
                  startOffset: 0,
                  endOffset: 12,
                  comments: [
                    makeComment({ by: user._id, txt: 'Drafted UX for inbox and toasts.', offset: 0 })
                  ]
                }),
                makeTask({
                  title: 'Attachments gallery',
                  status: 'Stuck',
                  priority: 'Critical',
                  members: ['u_tal'],
                  startOffset: 3,
                  endOffset: 8,
                  comments: [
                    makeComment({ by: 'u_tal', txt: 'Need backend pagination for large lists.', offset: 2 })
                  ]
                })
              ]
            })
          ]
        }
      ]

      // Read scale from query (?x=5 or ?scale=5)
      let scale = 1
      try {
        const params = new URLSearchParams(window.location.search)
        const val = Number(params.get('x') || params.get('scale') || 1)
        if (!Number.isNaN(val) && val > 0) scale = val
      } catch (_) {}

      // Enrich each board with more groups and tasks
      boards.forEach(b => enrichBoard(b, scale))

      // Optional reset: add ?reset=1 to URL to delete existing demo boards by title first
      const existing = await boardService.query()
      const reset = (() => {
        try {
          const params = new URLSearchParams(window.location.search)
          const v = params.get('reset')
          return v === '1' || v === 'true'
        } catch (_) { return false }
      })()

      if (reset) {
        const titles = boards.map(b => b.title)
        for (const ex of existing) {
          if (titles.includes(ex.title)) {
            await dispatch(removeBoard(ex._id))
          }
        }
      }

      // Upsert: update if exists by title, else create
      const afterExisting = reset ? await boardService.query() : existing
      for (const b of boards) {
        const match = afterExisting.find(x => x.title === b.title)
        if (match) {
          b._id = match._id
          await dispatch(updateBoard(b))
        } else {
          await dispatch(addBoard(b))
        }
      }

      navigate('/workspace/home')
    }

    seed()
  }, [])

  return (
    <section className="main-layout">
      <h2>Seeding demo data...</h2>
      <p>This may take a few seconds. You will be redirected automatically.</p>
    </section>
  )
}
