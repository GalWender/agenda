import { useSelector } from "react-redux"
import { BoardHeader } from "../cmps/board-header"
import { Loader } from "../cmps/loader"
import { Doughnut, Bar, Line } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, LineElement, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement } from "chart.js"
import { useEffect, useState } from "react"
import { taskService } from "../services/task.service"
import { BsFillHddStackFill } from 'react-icons/bs'
import { BsPeopleFill } from 'react-icons/bs'
import { FaCheckCircle } from 'react-icons/fa'


ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LineElement, LinearScale, BarElement, Title, PointElement)



export const Dashboard = () => {

    const board = useSelector(state => state.boardModule.board)
    const priorityOpts = ['critical', 'low', 'medium', 'high', '']
    const statusOpts = ['done', 'working on it', 'stuck', 'need help', 'waiting for qa', 'pending', '']
    const [dataCounter, setDataCounter] = useState(null)
    const [tasks, setTasks] = useState(null)

    useEffect(() => {
        getTablesData(statusOpts, priorityOpts, board, setDataCounter, setTasks)
    }, [board])


    const doughnutData = {
        labels: board?.groups.map(group => (group.title)),
        datasets: [
            {
                label: '# of Votes',
                data: board?.groups.map(group => group.tasks.length),
                backgroundColor: [
                    "#00bfa0",
                    "#b3d4ff",
                    "#dc0ab4",
                    "#ffa300",
                    "#9b19f5",
                    "#e6d800",
                    "#0dd4ff",
                    "#e60049",
                ],
                borderColor: [
                    "#00bfa0",
                    "#b3d4ff",
                    "#dc0ab4",
                    "#ffa300",
                    "#9b19f5",
                    "#e6d800",
                    "#0dd4ff",
                    "#e60049",
                ],
                borderWidth: 1,
            },
        ],
    }

    const priorityLabels = () => {
        const priorities = [...priorityOpts]
        priorities.splice(priorities.length - 1, 1, 'no priority')
        return priorities
    }

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    usePointStyle: 'true',
                    pointStyle: 'circle',
                }
            },
        },
    };

    const priorityData = {
        labels: priorityLabels(),
        datasets: [
            {
                label: 'Priority count',
                data: dataCounter?.priority,
                borderColor: [
                    "#333333",
                    "#579bfc",
                    "#5559df",
                    "#401694",
                    "#c4c4c4",
                ],
                backgroundColor: [
                    "#333333",
                    "#579bfc",
                    "#5559df",
                    "#401694",
                    "#c4c4c4",
                ],
                borderWidth: 1,
                tension: 0.4,
                fill: true,
            },
        ],
    }

    if (!board || !tasks) return <Loader />
    const statusStat = StatusStat(tasks)
    return <section className="dashboard">
        <BoardHeader board={board} />

        <div className="dashboard-main-container">
            <div className="top-dashboard-item groups">
                <div className="icon groups"><BsFillHddStackFill /></div>
                <div className="flex">
                    <span><span className="info-number">{board.groups.length}</span> Groups</span>
                </div>
            </div>
            <div className="top-dashboard-item tasks">
                <div className="icon tasks"><FaCheckCircle /></div>
                <div className="flex">
                    <span><span className="info-number">{tasks.length}</span> Tasks</span>
                    <div className="task-count">{statusStat.doneCount + " Done"}</div>
                </div>
            </div>
            <div className="top-dashboard-item members">
                <div className="icon members"><BsPeopleFill /></div>
                <div className="flex">
                    <span><span className="info-number">{board.members?.length}</span> Members</span>
                    <div className="members-container">{board.members?.map(member => {
                        return <img key={member._id} src={require(`../assets/img/${member.imgUrl}.png`)} />
                    })}</div>
                </div>
            </div>


            {/* <div className="table-chart tasks-status"> */}
            <div className="table-chart tasks-status">
                <div className="status-battery">
                    {statusStat.elStatus}
                    <span>
                        <span className="info-number">
                            {(statusStat.doneCount / tasks.length * 100).toFixed(1) + '%'}
                        </span>
                        Done
                    </span>
                </div>
            </div>



            <div className="table-chart tasks-per-group">
                <h3 className="chart-title">Tasks Per Group</h3>
                <div className="chart-container">
                    <Doughnut className="chart" data={doughnutData} options={options} />
                </div>
            </div>

            <div className="table-chart tasks-priority">
                <h3 className="chart-title">Tasks Priority</h3>
                <div className="chart-container">
                    <Line className="chart" data={priorityData} options={options} />
                </div>
            </div>
            {/* </div> */}

            <div className="table-chart member-container">
                <h3 className="chart-title">Member's Progress</h3>
                <div className="member-progress">
                    {board.members.map(member => {
                        return <div key={member._id} className="member-info">
                            <div className="member-img-name">
                                <img src={require(`../assets/img/${member.imgUrl}.png`)} />
                                <span className="member-name">{member.fullname}</span>
                            </div>
                            {getMemberTasksFormId(member._id, tasks)}
                        </div>
                    })}
                </div>
            </div>
        </div>

    </section>
}

const StatusStat = (tasks) => {
    const getStatusProgressBar = () => {
        const statusProgressBar = []
        let counter = {}
        let doneCount = 0
        tasks.forEach(({ status }) => {
            counter[status] = (counter[status] || 0) + 1

        })
        let forInCounter = 0
        for (const status in counter) {
            forInCounter++
            const counts = counter[status]
            if (status === 'Done') doneCount = counts
            statusProgressBar.push(
                <div key={forInCounter} className={`status-progress ${status === 'undefined' ? 'none' : makeClass(status)}`}
                    style={{ height: `${counts / tasks.length * 100}%` }}
                    title={`${status === 'undefined' ? 'none' : status}: ${(counts / tasks.length * 100).toFixed()}%`}>
                </div>
            )
        }
        return { statusProgressBar, doneCount }
    }
    const statusProgress = getStatusProgressBar()
    return {
        elStatus: <div className="status-progress-bar">
            <div className="battery-top"></div>
            {statusProgress.statusProgressBar}</div>,
        doneCount: statusProgress.doneCount
    }
}

const makeClass = (status) => {
    if (!status) return
    return status.split(' ').join('')
}

const getTablesData = async (statusOpts, priorityOpts, board, setDataCounter, setTasks) => {
    if (!board) return
    let priorityCounts = []
    let statusCounts = []
    const newTasks = await taskService.query({ boardId: board._id })

    statusOpts.forEach((status, idx) => {
        statusCounts[idx] = 0

        newTasks.forEach(task => {
            if (task.status) {
                if (task.status.toLowerCase() === status) statusCounts[idx] += 1
            } else if (!task.status) {
                statusCounts[statusOpts.length - 1] += 1
            }
        })
    })

    priorityOpts.forEach((priority, idx) => {
        priorityCounts[idx] = 0
        newTasks.forEach(task => {
            if (task.priority) {
                if (task.priority.toLowerCase() === priority) priorityCounts[idx] += 1
            } else if (!task.priority) {
                priorityCounts[priorityOpts.length - 1] += 1
            }
        })
    })
    setDataCounter({ status: statusCounts, priority: priorityCounts })
    setTasks(newTasks)
}


const getMemberTasksFormId = (memberId, tasks) => {
    const userTasksCount = tasks.reduce(
        (acc, task) => (task.memberIds?.includes(memberId)) ?
            acc + 1 : acc, 0)

    const userTaskDoneCount = tasks.reduce(
        (acc, task) => (task.memberIds?.includes(memberId) && task.status === 'Done') ?
            acc + 1 : acc, 0)

    return <div className="user-done-progress-bar-wrapper">
        <span className="precentage">{userTasksCount !== 0 ? (userTaskDoneCount / userTasksCount * 100).toFixed() + '%' : '0%'}</span>
        {(userTasksCount !== 0) ?
            <div className="user-done-progress-bar"
                style={{ width: `${userTaskDoneCount / userTasksCount * 100}%` }}>
            </div> : <div className="user-done-progress-bar"
                style={{ width: '0%' }}>
            </div>
        }
    </div>
}
