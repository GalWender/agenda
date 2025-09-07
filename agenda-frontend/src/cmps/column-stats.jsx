import moment from "moment"
import { Fragment } from "react"

export const ColumnStats = ({ group, board }) => {
    return <ul className="column-stats">
        <div className="sticky-container">
            <li className="mask"></li>
            <li className="empty-start"></li>
            <li className="border-start"></li>
        </div>
        {board.cmpsOrder?.map(cmp => {
            return <li key={cmp} className={`${cmp}-stat`}>
                <GetCmpsFromSwitch cmp={cmp} group={group} />
            </li>
        })}
        <li></li>
    </ul>
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
                <div key={forInCounter} className={`status-progress ${status === 'undefined' ? 'none' : makeClass(status)}`}
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
    let max = 0, min = Infinity
    const getTimelineProgressBar = () => {
        group.tasks?.forEach(({ timeline }) => {
            if (timeline?.startDate < min) min = timeline.startDate
            if (timeline?.endDate > max) max = timeline.endDate
        })
        if (min === Infinity && max === 0) return
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