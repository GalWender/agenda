import moment from "moment"
import { Fragment, useEffect, useState } from 'react'
import { DateRange } from 'react-date-range'
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { updateTask } from '../store/board/board.action';

export const TaskTimeline = ({ task, group, board, isReadOnly }) => {

  const [datePickerIsOpen, setDatePickerIsOpen] = useState(false)
  const [taskTimeline, setTaskTimeline] = useState([
    {
      startDate: new Date(task.timeline?.startDate || Date.now()),
      endDate: new Date(task.timeline?.endDate || Date.now()),
      key: 'selection'
    }
  ])

  const getFormattedDateTime = (date) => {
    if (!date) return
    return moment(date).format("MMM D")
  }


  const getTimeProgress = ({ startDate, endDate }) => {
    if (!startDate || !endDate) return ''
    const timeRatio = (Date.now() - startDate) / (endDate - startDate)
    const timeProgress = (timeRatio * 100).toFixed()
    return (timeProgress < 0) ? 0 : (timeProgress < 100) ? timeProgress : 100
  }

  const toggleModal = () => {
    if (isReadOnly) return
    setDatePickerIsOpen(!datePickerIsOpen)
  }

  const handleDateChange = (dateRange) => {
    setTaskTimeline([dateRange])
    task.timeline = { startDate: Date.parse(dateRange.startDate), endDate: Date.parse(dateRange.endDate) }
  }
  return (
    <Fragment>
      {datePickerIsOpen &&
        <DatePicker
          setDatePickerIsOpen={setDatePickerIsOpen}
          taskTimeline={taskTimeline}
          handleDateChange={handleDateChange}
          task={task} groupId={group.id} boardId={board._id}
        />
      }
      <div className="flex justify-center timeline-wrapper" onClick={toggleModal}>
        {task.timeline &&
          <Fragment>
            {task.timeline?.endDate && <div className="background-time-progress-bar" style={{ width: `${100 - getTimeProgress(task.timeline)}%` }}></div>}
            {task.timeline?.startDate &&
              <div className={"time-progress-bar " + group.style || ''} style={{ width: `${getTimeProgress(task.timeline)}%` }}></div>}
            <div className="dates">
              {task.timeline?.startDate &&
                <span >{getFormattedDateTime(task.timeline.startDate)}</span>}
              {task.timeline?.startDate && task.timeline?.endDate &&
                <span> - </span>}
              {task.timeline?.endDate &&
                <span>{getFormattedDateTime(task.timeline.endDate)}</span>}
            </div>
          </Fragment>
        }
      </div>
    </Fragment>
  )
}




export const DatePicker = ({ setDatePickerIsOpen, taskTimeline, handleDateChange, task, groupId, boardId }) => {

  const loggedinUser = useSelector(state => state.userModule.loggedinUser)
  const dispatch = useDispatch()

  useEffect(() => {
    setTimeout(() => {
      document.body.addEventListener('click', closeDatePicker)
    }, 100)
    return () => {
      document.body.removeEventListener('click', closeDatePicker)

      const activity = { type: "timeline", data: task.timeline }
      task.lastUpdated = { date: Date.now(), byUserId: loggedinUser?._id || 'Guest' }
      dispatch(updateTask({ task, groupId, boardId }, activity))
    }
  }, [])

  const closeDatePicker = () => {
    setDatePickerIsOpen(false)
  }

  return (
    <div className="date-picker" onClick={(ev) => ev.stopPropagation()}>
      <DateRange
        editableDateInputs={true}
        onChange={item => handleDateChange(item.selection)}
        moveRangeOnFirstSelection={false}
        ranges={taskTimeline}
      />
    </div>
  )
}