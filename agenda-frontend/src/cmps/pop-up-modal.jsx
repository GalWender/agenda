import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { ReactComponent as Trash } from '../assets/icons/trash-icon.svg'
import { addGroup, loadTask, removeBoard, removeComment, removeGroup, removeTask, updateGroup, updateTask } from '../store/board/board.action'
import { ReactComponent as TrashIcon } from '../assets/icons/trash-icon.svg'
import { ReactComponent as PencilIcon } from '../assets/icons/pencil.svg'
import { ReactComponent as LogoutSvg } from '../assets/icons/logout.svg'
import { ReactComponent as ImgFileSvg } from '../assets/icons/img-file.svg'
import { GrClose } from 'react-icons/gr'
import { BiLogIn } from 'react-icons/bi'
import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../store/user/user.action'
import { ReactComponent as NewGroupIcon } from '../assets/icons/new-group-icon.svg'

export const PopUpModal = ({ modalName, setModalName, task, group, board, boards, setCurrBoard, setIsRenaming, isRenaming, comment, setIsFile }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const loggedinUser = useSelector(state => state.userModule.loggedinUser)
  const closeModal = () => {
    setTimeout(() => {
      setModalName(null)
    }, 100);
  }

  useEffect(() => {
    document.body.addEventListener('click', closeModal)
    document.body.classList.add('pop-up-modal-open')
    return () => {
      document.body.removeEventListener('click', closeModal)
      document.body.classList.remove('pop-up-modal-open')
    }
  })

  const onUpdateStatus = (status) => {
    task.status = status
    // const updatedTask = { ...task, status }
    const activity = { type: "status", data: status }
    setTimeout(() => { setModalName(null) }, 100)
    // updatedTask.lastUpdated = { date: Date.now(), byUserId: loggedinUser?._id || 'Guest' }
    task.lastUpdated = { date: Date.now(), byUserId: loggedinUser?._id || 'Guest' }
    dispatch(updateTask({ task, groupId: group.id, boardId: board._id }, activity))
  }

  const onRemoveTask = () => {
    const removeObj = { taskId: task.id, groupId: group.id, boardId: board._id }
    dispatch(removeTask(removeObj))
  }

  const onUpdatePriority = (priority) => {
    task.priority = priority
    // const updatedTask = { ...task, priority }
    const activity = { type: "priority", data: priority }
    setTimeout(() => {
      setModalName(null)
    }, 100);
    // updatedTask.lastUpdated = { date: Date.now(), byUserId: loggedinUser?._id || 'Guest' }
    task.lastUpdated = { date: Date.now(), byUserId: loggedinUser?._id || 'Guest' }
    dispatch(updateTask({ task, groupId: group.id, boardId: board._id }, activity))
  }

  const addMemberToTask = (member) => {
    let updatedTask
    if (task.memberIds) {
      if (task.memberIds.includes(member._id)) {
        setTimeout(() => { setModalName(null) }, 100);
        return
      }
      // updatedTask = { ...task, memberIds: [...task.memberIds, member._id] }
      task.memberIds = [...task.memberIds, member._id]
    }
    else {
      // updatedTask = { ...task, memberIds: [member._id] }
      task.memberIds = [member._id]
    }
    setTimeout(() => { setModalName(null) }, 100);
    const activity = { type: "add member", data: member }
    // updatedTask.lastUpdated = { date: Date.now(), byUserId: loggedinUser?._id || 'Guest' }
    task.lastUpdated = { date: Date.now(), byUserId: loggedinUser?._id || 'Guest' }
    dispatch(updateTask({ task, groupId: group.id, boardId: board._id }, activity))
    return
  }

  const removeMemberFromTask = (member) => {
    let updatedTask
    if (task.memberIds) {
      if (task.memberIds.includes(member._id)) {
        // updatedTask = { ...task, memberIds: task.memberIds.filter(memberId => memberId !== member._id) }
        task.memberIds = task.memberIds.filter(memberId => memberId !== member._id)
        setTimeout(() => { setModalName(null) }, 100);
        const activity = { type: "remove member", data: member }
        // updatedTask.lastUpdated = { date: Date.now(), byUserId: loggedinUser?._id || 'Guest' }
        task.lastUpdated = { date: Date.now(), byUserId: loggedinUser?._id || 'Guest' }
        dispatch(updateTask({ task, groupId: group.id, boardId: board._id }, activity))
      }
    }

  }

  const getAvailableMembers = () => {
    return board.members.filter(member => task.memberIds?.includes(member._id))
  }
  const getSuggestedMembers = () => {
    return board.members.filter(menubar => !task.memberIds?.includes(menubar._id))
  }

  const onRemoveGroup = () => {
    const removeObj = { groupId: group.id, boardId: board._id }
    setTimeout(() => { setModalName(null) }, 100);
    dispatch(removeGroup(removeObj))
  }

  const openColorMenu = () => {
    setTimeout(() => { setModalName('COLOR_MENU') }, 100);
  }

  const changeGroupColor = (color) => {
    let updatedGroup = { ...group, style: color }
    setTimeout(() => { setModalName(null) }, 100)
    dispatch(updateGroup({ group: updatedGroup, boardId: board._id }))
  }

  const onRemoveBoard = (ev, boardId) => {
    ev.preventDefault()
    ev.stopPropagation()
    setTimeout(() => { setModalName(null) }, 100)
    dispatch(removeBoard(boardId))
    setCurrBoard(boards[0])
  }

  const onEditBoard = (ev) => {
    ev.preventDefault()
    ev.stopPropagation()
    setTimeout(() => { setModalName(null) }, 100)
    setIsRenaming(!isRenaming)
  }

  const onLogout = () => {
    setTimeout(() => { setModalName(null) }, 100)
    dispatch(logout())
    navigate('/')
  }

  const closeMenu = () => {
    setTimeout(() => { setModalName(null) }, 100)
  }

  const onRemovePost = () => {
    let updatedComments = task.comments.filter(currComment => currComment.id !== comment.id)
    task.comments = updatedComments
    dispatch(removeComment({ task, groupId: group.id, boardId: board._id }))
  }

  const onAddGroup = () => {
    dispatch(addGroup(board._id, true))
    closeMenu()
  }

  const removeFile = () => {
    delete task['files']
    dispatch(updateTask({ task, groupId: group.id, boardId: board._id }))
    setIsFile(false)
    setTimeout(() => { setModalName(null) }, 100)
  }

  switch (modalName) {
    case 'TASK_MENU':
      return <section className="task-menu modal" onClick={(ev) => ev.stopPropagation()}>
        <button onClick={onRemoveTask} className='btn btn-svg btn-trash-task'><Trash /> Delete</button>
      </section>
    case 'TASK_STATUS_MENU':
      return <section className="task-status-menu modal" onClick={(ev) => ev.stopPropagation()}>
        <button className='btn-status working-on-it' onClick={() => onUpdateStatus('Working on it')}>Working on it</button>
        <button className='btn-status stuck' onClick={() => onUpdateStatus('Stuck')}>Stuck</button>
        <button className='btn-status done' onClick={() => onUpdateStatus('Done')}>Done</button>
        <button className='btn-status waiting-for-qa' onClick={() => onUpdateStatus('Waiting for QA')}>Waiting for QA</button>
        <button className='btn-status need-help' onClick={() => onUpdateStatus('Need help')}>Need help</button>
        <button className='btn-status pending' onClick={() => onUpdateStatus('Pending')}>Pending</button>
        <button className='btn-status empty-status' onClick={() => onUpdateStatus()}></button>
      </section>
    case 'TASK_PRIORITY_MENU':
      return <section className="task-priority-menu modal" onClick={(ev) => ev.stopPropagation()}>
        <button className='btn-priority critical' onClick={() => onUpdatePriority('Critical')}>Critical ⚠</button>
        <button className='btn-priority medium' onClick={() => onUpdatePriority('Medium')}>Medium</button>
        <button className='btn-priority high' onClick={() => onUpdatePriority('High')}>High</button>
        <button className='btn-priority low' onClick={() => onUpdatePriority('Low')}>Low</button>
        <button className='btn-priority empty-status' onClick={() => onUpdatePriority()}></button>
      </section>
    case 'TASK_PERSON_MENU':
      return <section className="task-person-menu modal" onClick={(ev) => ev.stopPropagation()}>
        {getAvailableMembers().map(member => {
          return <div key={member._id} className="member-container-available">
            <img className="profile-img-icon" src={require(`../assets/img/${member.imgUrl}.png`)} alt="" />
            <h4>{member.fullname}</h4>
            <button className="btn btn-svg btn-remove-person-from-task" onClick={() => removeMemberFromTask(member)}><GrClose /></button>
          </div>
        })}
        <h4 className="suggested people-title">Suggested People</h4>
        {getSuggestedMembers().map(member => {
          return <div key={member._id} className="member-container-suggested" onClick={() => addMemberToTask(member)}>
            <img className="profile-img-icon" src={require(`../assets/img/${member.imgUrl}.png`)} alt="" />
            <h4>{member.fullname}</h4>
          </div>
        })}
      </section>

    case 'GROUP_MENU':
      return <section className="group-menu modal" onClick={(ev) => ev.stopPropagation()}>
        <div className="group-color-icon-container" onClick={openColorMenu}>
          <div className={`group-color-icon ${group.style}`}></div>
          <button>Change group color</button>
        </div>
        <button onClick={onRemoveGroup} className='btn btn-svg btn-trash-task'><Trash /> Delete</button>
      </section>
    case 'COLOR_MENU':
      return <section className='color-menu modal' onClick={(ev) => ev.stopPropagation()}>
        <div className='clr1' onClick={() => changeGroupColor('clr1')}></div>
        <div className='clr2' onClick={() => changeGroupColor('clr2')}></div>
        <div className='clr3' onClick={() => changeGroupColor('clr3')}></div>
        <div className='clr4' onClick={() => changeGroupColor('clr4')}></div>
        <div className='clr5' onClick={() => changeGroupColor('clr5')}></div>
        <div className='clr6' onClick={() => changeGroupColor('clr6')}></div>
        <div className='clr7' onClick={() => changeGroupColor('clr7')}></div>
        <div className='clr8' onClick={() => changeGroupColor('clr8')}></div>
        <div className='clr9' onClick={() => changeGroupColor('clr9')}></div>
        <div className='clr10' onClick={() => changeGroupColor('clr10')}></div>
        <div className='clr11' onClick={() => changeGroupColor('clr11')}></div>
        <div className='clr12' onClick={() => changeGroupColor('clr13')}></div>
        <div className='clr13' onClick={() => changeGroupColor('clr14')}></div>
        <div className='clr14' onClick={() => changeGroupColor('clr15')}></div>
        <div className='clr15' onClick={() => changeGroupColor('clr16')}></div>
        <div className='clr17' onClick={() => changeGroupColor('clr17')}></div>
      </section>
    case 'SIDE_NAV_MENU':
      return <div className='board-opts-modal modal' onClick={(ev) => ev.stopPropagation()}>
        <div onClick={(ev) => onEditBoard(ev)} className="nav-board-menu-opt">
          <PencilIcon />
          <span>Rename Board</span>
        </div>
        <div onClick={(ev) => onRemoveBoard(ev, board._id)} className="nav-board-menu-opt">
          <TrashIcon />
          <span>Remove Board</span>
        </div>
      </div>

    case 'USER_MENU':
      return <section className="user-menu" onClick={(ev) => ev.stopPropagation()}>
        {loggedinUser ?
          <button className='btn btn-svg btn-logout' onClick={() => onLogout()}><LogoutSvg />Logout</button> :
          // <Link to={'/auth/login'} className='btn btn-svg btn-logout' onClick={() => onLogout()}><IoLogInOutline />Login</Link>
          <Link to={'/auth/login'} className='btn btn-svg btn-logout' onClick={() => onLogout()}><BiLogIn />Login</Link>
        }
      </section>
    case 'TASK_DETAIL_PERSON_MENU':
      return <section className='task-detail-person-menu' onClick={(ev) => ev.stopPropagation()}>
        {getAvailableMembers().map(member => {
          return <div key={member._id} className="member-container-available">
            <div>
            <img className="profile-img-icon" src={require(`../assets/img/${member.imgUrl}.png`)} alt="" />
            <h4>{member.fullname}</h4>
            </div>
            <button className="btn btn-svg btn-remove-person-from-task" onClick={() => removeMemberFromTask(member)}><GrClose /></button>
          </div>
        })}
        <h4 className="suggested people-title">Suggested People</h4>
        {getSuggestedMembers().map(member => {
          return <div key={member._id} className="member-container-suggested" onClick={() => addMemberToTask(member)}>
            <img className="profile-img-icon" src={require(`../assets/img/${member.imgUrl}.png`)} alt="" />
            <h4>{member.fullname}</h4>
          </div>
        })}
      </section>
    case 'TASK_DETAIL_POST_MENU':
      return <section className='task-detail-post-menu' onClick={(ev) => ev.stopPropagation()}>
        <button onClick={() => onRemovePost()} className='btn btn-svg btn-trash-post'><Trash /> Delete update for everyone</button>
      </section>

    case 'NEW_TASK_MENU':
      return <section className='new-task-menu' onClick={(ev) => ev.stopPropagation()}>
        <div onClick={onAddGroup} className='new-task-menu-item'><NewGroupIcon /> <span>Add new group</span></div>
      </section>
    case 'FILE_MENU':
      return <section className='file-menu'>
        <div className='file-menu-main' onClick={(ev) => ev.stopPropagation()}>
          <div className='file-header'>
            <div className='file-title'>
              <ImgFileSvg />
              <span>{task.title}</span>
            </div>
            <div className='file-close-remove'>
              <Trash onClick={() => removeFile()} />
              <GrClose onClick={() => closeMenu()} />
            </div>
          </div>
          <div className='file-container'><img src={task.files} alt={task.title} />
          </div>
        </div>
      </section>
    default: return console.error('cannot open modal!')
  }
}
