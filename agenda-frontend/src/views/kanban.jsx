import { useSelector } from "react-redux"
import { BoardHeader } from "../cmps/board-header"
import { TaskTimeline } from "../cmps/task-timeline"
import { PopUpModal } from "../cmps/pop-up-modal"
import { useState } from "react"
import { Link, Route, Routes, useParams } from "react-router-dom"
import { TaskDetail } from "../cmps/task-detail"
import { useDispatch } from "react-redux"
import { addTask, loadBoard, setLoader, updateBoard, updateGroup, updateTask } from "../store/board/board.action"
import { useForm } from "../hooks/useForm"
import { ReactComponent as StartConversation } from "../assets/icons/start-conversation.svg"
import { ReactComponent as StartConversationEmptySvg } from '../assets/icons/start-conversation-empty.svg'
import { ReactComponent as MenuIcon } from "../assets/icons/kanban-status.svg"
import { ReactComponent as TimelineMenu } from "../assets/icons/timeline-menu.svg"
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd"
import { useEffect } from "react"


export const Kanban = () => {

    const params = useParams()
    const dispatch = useDispatch()
    const { board, isLoading, sortBy, filterBy } = useSelector(state => state.boardModule)
    const [groups, setGroups] = useState(board?.groups || null)

    useEffect(() => {
        if (isLoading) return
        const boardId = params.boardId
        if ((board && (board._id !== boardId))) {
            dispatch(setLoader())
            dispatch(loadBoard(boardId))
        }
        if (board && (groups !== board?.groups)) {
            setGroups(board.groups)
        }
    }, [params, board])

    useEffect(() => {
        if (board) {
            dispatch(loadBoard(board._id, sortBy, filterBy))
        }
    }, [sortBy, filterBy])

    const handleOnDragEnd = (ev) => {
        if (!ev.destination) return
        const updatedGroups = [...groups]
        const [draggedItem] = updatedGroups.splice(ev.source.index, 1)
        updatedGroups.splice(ev.destination.index, 0, draggedItem)

        setGroups(updatedGroups)
        board.groups = updatedGroups
        dispatch(updateBoard(board))
    }
    if (!board || !groups) return
    return <section className="kanban">
        <BoardHeader board={board} />
        <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId='groups' direction="horizontal">
                {(droppableProvided) => {
                    return <div ref={droppableProvided.innerRef} {...droppableProvided.droppableProps} className="task-list">
                        <div className="kanban-container">
                            {groups.map((group, idx) => {
                                return <KanbanGroupPreview key={group.id} group={group} board={board} idx={idx} />
                            })}
                            {droppableProvided.placeholder}
                        </div>
                    </div>
                }}
            </Droppable >
        </DragDropContext >
        <Routes>
            <Route path="/details/:boardId" element={<TaskDetail />}></Route>
        </Routes>
    </section >

}


const KanbanGroupPreview = ({ group, board, idx }) => {

    const dispatch = useDispatch()
    const [tasks, setTasks] = useState(group.tasks)

    const handleOnDragEnd = (ev) => {
        if (!ev.destination) return
        const updatedTasks = [...tasks]
        const [draggedItem] = updatedTasks.splice(ev.source.index, 1)
        updatedTasks.splice(ev.destination.index, 0, draggedItem)
        group.tasks = updatedTasks
        dispatch(updateGroup({ group, boardId: board._id }))
    }

    const onAddTask = () => {
        dispatch(addTask({ groupId: group.id, title: 'New Task', boardId: board._id }))
    }

    return <Draggable key={group.id} draggableId={group.id} index={idx}>
        {(provided) => {
            return <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId={`tasks-${group.id}`}>
                    {(droppableProvided) => {
                        return <div ref={droppableProvided.innerRef} {...droppableProvided.droppableProps} className="task-list">
                            <section className={`kanban-group-preview ${group.style}`} ref={provided.innerRef}
                                {...provided.draggableProps}>
                                <h3  {...provided.dragHandleProps}>{group.title} / {group.tasks.length}</h3>
                                <div className={`kanban-task-list`} >
                                    {group.tasks.map((task, idx) => {
                                        return <Draggable key={task.id} draggableId={task.id} index={idx} >
                                            {(provided) => {
                                                return <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                    <KanbanTaskPreview task={task} group={group} board={board} tasks={tasks} setTasks={setTasks} />
                                                </div>
                                            }}
                                        </Draggable>
                                    })}
                                    {droppableProvided.placeholder}
                                </div>
                                <div onClick={onAddTask} className="kanban-group-add-item"> <span>+</span> Add Item</div>
                            </section>
                        </div>
                    }}
                </Droppable>
            </DragDropContext>
        }}
    </Draggable>
}

const KanbanTaskPreview = ({ task, group, board, tasks, setTasks }) => {

    const dispatch = useDispatch()
    const [modalName, setModalName] = useState(null)
    const [isRenaming, setIsRenaming] = useState(false)
    const [renameTask, handleChange] = useForm({ title: task.title })


    const makeClass = (status) => {
        if (!status) return 'card empty'
        let className = status.split(' ').join('')
        className += ' card'
        return className
    }

    useEffect(() => {
        if ((group.tasks !== tasks))
            setTasks(group.tasks)
    }, [group.tasks])

    const onModalOpen = (str) => {
        const name = `TASK_${str}_MENU`
        setTimeout(() => {
            setModalName(name)
        }, 100);
    }

    const onRenameTask = (ev) => {
        ev.preventDefault()
        task = { ...task, ...renameTask }
        setIsRenaming(false)
        dispatch(updateTask({ task: task, groupId: group.id, boardId: board._id }))
    }

    const openFileMenu = () => {
        setTimeout(() => {
            setModalName('FILE_MENU')
        }, 100);
    }

    return <section className={`kanban-task-preview`}>
        {modalName && <PopUpModal modalName={modalName}
            setModalName={setModalName}
            task={task}
            group={group}
            board={board} />}
        <div className="kanban-task-item">
            {isRenaming ? <form className="rename-task" onSubmit={onRenameTask} onBlur={onRenameTask}>
                <input autoFocus type="text" name='title' value={renameTask.title} onChange={handleChange} />
            </form>
                : <h6 onClick={() => setIsRenaming(true)}>{task.title}</h6>}
            <Link to={`/workspace/board/kanban/${board._id}/details/${board._id}?groupId=${group.id}&taskId=${task.id}`} className="btn btn-svg btn-start-conversation">
                {(!task.comments || task.comments.length <= 0) && <StartConversation className="svg svg-chat" />}
                {(task.comments && task.comments.length > 0) && <div className='with-comments-container'><StartConversationEmptySvg /><span>{task.comments.length}</span></div>}
            </Link>
        </div>
        <div className="kanban-task-item status"><span className="item-category"><MenuIcon className="svg svg-menu" />
            Status</span> <span onClick={() => onModalOpen('STATUS')} className={makeClass(task.status)}>{task.status}</span>
        </div>
        <div className="kanban-task-item priority"><span className="item-category"><MenuIcon className="svg svg-menu" />
            Priority</span> <span onClick={() => onModalOpen('PRIORITY')} className={makeClass(task.priority)}>{task.priority}</span>
        </div>
        <div className="kanban-task-item "><span className="item-category"><TimelineMenu className="svg svg-menu" />
            Timeline</span> <span className="card kanban-timeline task-preview-timeline"><TaskTimeline task={task} group={group} board={board} /></span>
        </div>
        {task.files && <div onClick={openFileMenu} className="kanban-img-item">
            <img src={task.files} alt="img" />
        </div>}
    </section>
}