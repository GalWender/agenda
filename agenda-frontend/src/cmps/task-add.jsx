import { useDispatch } from "react-redux"
import { addTask } from '../store/board/board.action'

export const TaskAdd = ({ group, boardId }) => {
    const dispatch = useDispatch()


    const onAddTask = (ev) => {
        ev.preventDefault()
        const task = { groupId: group.id, title: ev.target[0].value, boardId }
        dispatch(addTask(task))
        ev.target[0].value = ''

    }

    return <ul className="task-add">
        <div className="sticky-container">
            <div className="mask"></div>
            {/* <div className="sticky-helper"></div> */}
            <li className={`task-add-group-color ${group.style}`}>
            </li>
            {/* <li className='task-add-checkbox'>
                <input disabled type="checkbox" />
            </li> */}
            <li className="task-add-item">
                <form onSubmit={(ev) => onAddTask(ev)}>
                    <input type="text" placeholder="+ Add item" />
                </form>
            </li>
        </div>
            <li><div></div></li>
    </ul>
}