import { Fragment, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Loader } from "../cmps/loader"
import { loadBoards, setLoader } from "../store/board/board.action"
import { ReactComponent as NoPersonSvg } from '../assets/icons/no-person-icon.svg'
import { TaskTimeline } from "../cmps/task-timeline"
import '../styles/cmps/_task-timeline.scss'

export const MyWork = () => {

  const dispatch = useDispatch()
  const { boards, isLoading, boardsLoaded } = useSelector(state => state.boardModule)

  const loggedinUser = useSelector(state => state.userModule.loggedinUser)

  useEffect(() => {
    if (isLoading || boardsLoaded) return
    dispatch(setLoader())
    dispatch(loadBoards())
  }, [isLoading, boardsLoaded])

  if (isLoading) return <Loader />
  return (
    <section className="my-work">
      <div className="header">
        <h1 className="title">My Work</h1>
      </div>
      <main className="my-work-tasks">
          <div className="flex tasks-header">
            {/* <div className="left-color-indicator"></div> */}
            <div className="header-title">Item</div>
            <div className="board">Board</div>
            <div className="group">Group</div>
            <div className="members">People</div>
            <div className="date">Date</div>
            <div className="status">Status</div>
          </div>
          <div className="content">
            <TaskList boards={boards} loggedinUser={loggedinUser} />
          </div>
      </main>
    </section>
  )
}

const TaskList = ({ boards, loggedinUser }) => {
  return (
    <Fragment>

      {boards.map(board =>
        board.groups.map(group =>
          group.tasks.map((task, idx) => {
            const userId = loggedinUser?._id
            const shouldShow = userId
              ? (task.byMember?._id === userId || task.memberIds?.includes(userId))
              : true // no user -> show all tasks for a full guest experience
            if (!shouldShow) return null
            return <TaskPreview key={idx}
              task={task}
              group={group}
              groupTitle={group.title}
              boardTitle={board.title}
              board={board}
            />
          })
        )
      )}
    </Fragment>
  )
}

const TaskPreview = ({ task, group, groupTitle, board, boardTitle }) => {

  const GetMemberImgFromId = (board, memberId) => {
    const imgUrl = (memberId !== 'Guest') ?
      board.members.find(member => member._id === memberId).imgUrl : 'profile-img-guest'
    return <img key={memberId} className='profile-img-icon' src={require(`../assets/img/${imgUrl}.png`)} alt="" />
  }

  const makeClass = (status) => {
    if (!status) return
    return status.split(' ').join('')
  }
  // return <h1>{task.title}</h1>
  return (
    <div className="flex align-center task-preview">
      <div className="left-color-indicator" style={{ borderLeft: `3px solid var(--status-${group.style})` }}></div>
      <div className="title">{task.title}</div>
      <div className="board">{boardTitle}</div>
      <div className="group"><div className={`group-color-indicator ${group.style}`}></div> {groupTitle}</div>
      <div className="members">
        {task.memberIds ?
          task.memberIds.map(memberId => GetMemberImgFromId(board, memberId))
          :
          <NoPersonSvg className="svg-no-person" />}
      </div>
      {/* <div className="members">People</div> */}
      <div className="date task-preview-timeline">
        {task.timeline &&
          <TaskTimeline task={task} group={group} board={board} isReadOnly={true} />}
      </div>
      <div className={`status ${makeClass(task.status)}`}>{task.status}</div>
    </div>
  )
}