import { ReactComponent as BoardMenu } from '../assets/icons/board-menu.svg'
import { ReactComponent as StartConversationSvg } from '../assets/icons/start-conversation.svg'
import { ReactComponent as StartConversationEmptySvg } from '../assets/icons/start-conversation-empty.svg'
import { useState } from 'react'
import { useForm } from '../hooks/useForm'
import { updateTask } from '../store/board/board.action'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { DynamicTaskCmp } from './dynamic-task-cmp'
import { PopUpModal } from './pop-up-modal'


export const TaskPreview = ({ task, group, board }) => {
  const [modalName, setModalName] = useState(null)

  const loggedinUser = useSelector(state => state.userModule.loggedinUser)
  const [isEditTitle, setIsEditTitle] = useState(false)
  const [editedTask, handleChange] = useForm(task)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const onSetIsTaskMenuOpen = () => {
    setTimeout(() => {
      setModalName('TASK_MENU')
    }, 100);
  }

  const updateTitle = (ev) => {
    if (ev) ev.preventDefault()
    if (task.title !== editedTask.title) {
      // Todo: Prevent guests from editing tasks
      task.lastUpdated = { date: Date.now(), byUserId: loggedinUser?._id || 'Guest' }
      task.title = editedTask.title
      const activity = { type: "title", data: task.title }
      dispatch(updateTask({ task: task, groupId: group.id, boardId: board._id }, activity))
    }
    setIsEditTitle(prevState => prevState = !isEditTitle)
  }

  const onSetEditTitle = (ev) => {
    ev.preventDefault()
    ev.stopPropagation()
    setIsEditTitle(!isEditTitle)
  }

  return <ul key={task.id} className="clean-list task-preview">
    <div className={`sticky-container ${modalName === 'TASK_MENU' ? 'open' : ''}`}>
      <button className='btn btn-svg btn-task-menu' onClick={() => onSetIsTaskMenuOpen()}><BoardMenu /></button>
      {modalName && <PopUpModal setModalName={setModalName} modalName={modalName} task={task} group={group} board={board} />}
      <li className={`task-preview-group-color ${group.style}`}>
      </li>
      {/* <li className='flex justify-center task-preview-checkbox'>
        <input className='task-check-input' type="checkbox" />
      </li> */}
      <div className='item-container' onClick={() => navigate(`/workspace/board/${board._id}/details/${board._id}?groupId=${group.id}&taskId=${task.id}`)} >
        <li className='item-preview-sub-task-expansion'>

        </li>
        <div className='item-container-right'>
          <li className="task-preview-item">
            {!isEditTitle && <h4 onClick={(ev) => onSetEditTitle(ev)}>{task.title}</h4>}
            {isEditTitle && <form onSubmit={(ev) => updateTitle(ev)} onBlur={updateTitle}>
              <input type="text" autoFocus value={editedTask.title} name="title" onChange={handleChange} onClick={(ev) => ev.stopPropagation()} />
            </form>}
          </li>
          <li className="task-preview-start-conversation" title='Add to conversation'>
            {/* <Link to={`/workspace/board/${board._id}/details?groupId=${group.id}&taskId=${task.id}`} className="btn btn-svg btn-start-conversation"> */}
            <button className="btn btn-svg btn-start-conversation">
              {(!task.comments || task.comments?.length === 0) && <StartConversationSvg />}
              {(task.comments && task.comments.length > 0) &&
                <div className='with-comments-container'>
                  <StartConversationEmptySvg />
                  <span>{task.comments.length}</span></div>}
              {/* </Link> */}
            </button>
          </li>
        </div>
      </div>
    </div>
    {board.cmpsOrder && board.cmpsOrder.map(category => <DynamicTaskCmp key={category} board={board} category={category} task={task} group={group} />)}
    <li><div></div></li>
  </ul>
}
