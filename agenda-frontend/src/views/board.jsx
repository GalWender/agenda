import { Fragment, useEffect } from "react"
import { BoardHeader } from "../cmps/board-header"
import { useDispatch, useSelector } from 'react-redux'
import { Routes, Route, useParams } from 'react-router-dom'
import { addTask, loadBoard, setLoader } from "../store/board/board.action"
import { Loader } from "../cmps/loader"
import { GroupList } from "../cmps/group-list"
import { TaskDetail } from "../cmps/task-detail"
import { QuickFind } from "../cmps/quick-find"


export const Board = () => {

  const params = useParams()
  const dispatch = useDispatch()
  const { board, isLoading, sortBy, filterBy } = useSelector(state => state.boardModule)

  useEffect(() => {
    if (isLoading) return
    const boardId = params.boardId
    if ((board && board._id !== boardId)) {
      dispatch(setLoader())
      dispatch(loadBoard(boardId))
    }
  }, [params, board])

  useEffect(() => {
    if (board) {
      dispatch(loadBoard(board._id, sortBy, filterBy))
    }
  }, [sortBy, filterBy])

  return (
    <div className="board-app">
      <Routes>
        <Route path="/details/:boardId" element={<TaskDetail />}></Route>
      </Routes>
      {isLoading ?
        <Loader /> :
        board &&
        <Fragment>
          <BoardHeader board={board} />
          <BoardDetails board={board} />
          {/* Quick Find bottom bar */}
          <QuickFind board={board} />
          {/* Mobile floating action button (adds task to first group) */}
          <button
            className="fab-add"
            onClick={() => {
              const groupId = board.groups?.[0]?.id
              if (!groupId) return
              dispatch(addTask({ groupId, title: 'New Task', boardId: board._id }))
            }}
            aria-label="Add"
            title="Add"
          >
            +
          </button>
        </Fragment>
      }
    </div>
  )
}

const BoardDetails = ({ board }) => {
  return (
    <div className="board-details">
      {board &&
        <GroupList board={board} />}
    </div>
  )
}
