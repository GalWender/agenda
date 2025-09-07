import moment from 'moment'
import { Fragment, useState } from 'react'
import { useDispatch } from 'react-redux'
import { ReactComponent as ArrowRightSvg } from '../assets/icons/agenda-arrow-icon-right.svg'
import { useForm } from '../hooks/useForm'
import { updateGroup } from '../store/board/board.action'



export const GroupHeader = ({ group, setIsHeaderOpen, isHeaderOpen, board }) => {
    const dispatch = useDispatch()
    const [isEditTitle, setIsEditTitle] = useState(false)
    const [editedGroup, handleChange] = useForm(group)

    const onSetIsHeaderOpen = ({ target }) => {
        target.classList.toggle('open')
        setIsHeaderOpen(prevState => prevState = !isHeaderOpen)
    }

    const updateGroupName = (ev) => {
        if (ev) ev.preventDefault()
        dispatch(updateGroup({ group: editedGroup, boardId: board._id }))
        setIsEditTitle(prevState => prevState = !isEditTitle)
    }

    return <ul className="group-header">
        <div className="sticky-container">
            <li className="mask"></li>
            <li className={`group-header-color ${group.style}`}></li>
            <li className="group-header-name">
                <button className="btn btn-svg btn-arrow-down" onClick={(ev) => { onSetIsHeaderOpen(ev) }} title='Expand group'>
                    <ArrowRightSvg className={`${group.style} no-background`} />
                </button>
                <div className='group-header-name-container'>
                    {!isEditTitle && <h4 onClick={() => setIsEditTitle(!isEditTitle)} className={`${group.style} no-background group-header-title-h4`}>{group.title}</h4>}
                    {isEditTitle && <form onSubmit={(ev) => updateGroupName(ev)} onBlur={updateGroupName}>
                        <input type="text" autoFocus value={editedGroup.title} name="title" onChange={handleChange} className={`${group.style} no-background`} />
                    </form>}
                    <p>{group.tasks.length} Items</p>
                </div>
            </li>
        </div>
        {board.cmpsOrder?.map(cmp => {
            return <li key={cmp} className={`group-header-${cmp} ${cmp}-stat`}>
                <h4><GetNameFromSwitch cmp={cmp} /></h4>
                <GetCmpsFromSwitch group={group} cmp={cmp} />
            </li>
        })}
        <li></li>
        {/* <li className="group-header-developer">

                    </li>
                    <li className="group-header-status">
                        <h4>Status</h4>
                    </li>
                    <li className="group-header-priority">
                        <h4>Priority</h4>
                    </li>
                    <li className="group-header-last-updated">
                    </li>
                    <li className="group-header-files">
                        <h4>Files</h4>
                    </li>
                    <li className="group-header-timeline">
                        <h4>TimeLine</h4>
                    </li> */}


    </ul>
}

const GetNameFromSwitch = ({ cmp }) => {
    switch (cmp) {
        case 'status':
            return `${cmp[0].toUpperCase()}${cmp.substring(1)}`
        case 'priority':
            return `${cmp[0].toUpperCase()}${cmp.substring(1)}`
        case 'attachments':
            return `Files`
        case 'timeline':
            return `${cmp[0].toUpperCase()}${cmp.substring(1)}`
        default:
            return
    }
}

const makeClass = (status) => {
    if (!status) return
    return status.split(' ').join('')
}

const StatusStat = ({ group }) => {
    const getStatusProgressBar = () => {
        const statusProgressBar = []
        let counter = {}
        group.tasks.forEach(({ status }) => {
            counter[status] = (counter[status] || 0) + 1

        })
        let forInCounter = 0
        for (const status in counter) {
            forInCounter++
            const counts = counter[status]
            statusProgressBar.push(
                <div key={forInCounter} className={`status-progress ${(status === 'undefined') ? 'none' : makeClass(status)}`}
                    style={{ width: `${counts / group.tasks.length * 100}%` }}
                    title={`${status === 'undefined' ? 'none' : status}: ${(counts / group.tasks.length * 100).toFixed()}%`}>
                </div>
            )
        }
        return statusProgressBar
    }
    return <div className="status-progress-bar">{getStatusProgressBar()}</div>
}

const PriorityStat = ({ group }) => {
    const getPriorityProgressBar = () => {
        const priorityProgressBar = []
        let counter = {}
        group.tasks.forEach(({ priority }) => {
            counter[priority] = (counter[priority] || 0) + 1

        })
        let forInCounter = 0
        for (const priority in counter) {
            forInCounter++
            const counts = counter[priority]
            priorityProgressBar.push(
                <div key={forInCounter} className={`priority-progress ${priority === 'undefined' ? 'none' : makeClass(priority)}`}
                    style={{ width: `${counts / group.tasks.length * 100}%` }}
                    title={`${priority === 'undefined' ? 'none' : priority}: ${(counts / group.tasks.length * 100).toFixed()}%`}>

                </div>
            )
        }
        return priorityProgressBar
    }
    return <div className="priority-progress-bar">{getPriorityProgressBar()}</div>
}

const GetCmpsFromSwitch = ({ cmp, group }) => {
    switch (cmp) {
        case 'status':
            return <StatusStat group={group} />
        case 'priority':
            return <PriorityStat group={group} />
        case 'timeline':
            return <TimelineStat group={group} />
        default:
            break;
    }
}
const TimelineStat = ({ group }) => {
    let max = group.tasks[0]?.timeline?.endDate, min = group.tasks[0]?.timeline?.startDate;
    const getTimelineProgressBar = () => {
        group.tasks?.forEach(({ timeline }) => {
            if (timeline?.startDate && timeline.startDate < min) min = timeline.startDate
            if (timeline?.endDate && timeline.endDate > max) max = timeline.endDate
        })
        return <Fragment>
            <div className="background-time-progress-bar" style={{ width: `${100 - getTimeProgress({ startDate: min, endDate: max })}%` }}></div>
            <>
                <div className={"time-progress-bar " + group.style || ''} style={{ width: `${getTimeProgress({ startDate: min, endDate: max })}%` }}></div>
                <span >{getFormattedDateTime(min)}</span>
            </>
            <span> - </span>
            <span>{getFormattedDateTime(max)}</span>
        </Fragment>
    }
    if (min === undefined && max === undefined) return
    return <div className="flex justify-center timeline-wrapper">{getTimelineProgressBar()}</div>
}

const getTimeProgress = ({ startDate, endDate }) => {
    if (!startDate || !endDate) return ''
    const timeRatio = (Date.now() - startDate) / (endDate - startDate)
    const timeProgress = (timeRatio * 100).toFixed()
    return (timeProgress < 0) ? 0 : (timeProgress < 100) ? timeProgress : 100
}

const getFormattedDateTime = (date) => {
    if (!date) return
    return moment(date).format("MMM D")
}