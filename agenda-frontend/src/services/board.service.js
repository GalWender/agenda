import { getActionUpdateBoard } from "../store/board/board.action";
import { store } from "../store/store";
import { httpService } from "./http.service"
import { socketService, SOCKET_EMIT_SET_BOARD_ID_CHANNEL, SOCKET_EMIT_SEND_BOARD_CHANGES, SOCKET_EVENT_ADD_BOARD_CHANGES } from "./socket.service";

/* ?- WebSocket */;
(() => {
  socketService.on(SOCKET_EMIT_SEND_BOARD_CHANGES, (board) => {
    store.dispatch(getActionUpdateBoard(board))
  })
  socketService.on(SOCKET_EVENT_ADD_BOARD_CHANGES, (board) => {
    store.dispatch(getActionUpdateBoard(board))
  })
})()

export const boardService = {
  query,
  getById,
  save,
  // update,
  remove,
}

const statusOpts = ['done', 'working on it', 'stuck', 'need help', 'waiting for qa', 'pending', '']
const priorityOpts = ['', 'low', 'medium', 'high', 'critical',]

// const STORAGE_KEY = 'boardDB'
//?- Prod:
const BASE_URL = 'board/'

async function query(filterBy) {
  if (filterBy) return httpService.get(BASE_URL, filterBy)
  else return httpService.get(BASE_URL)
}

function getById(boardId, sortBy, filterBy) {
  socketService.emit(SOCKET_EMIT_SET_BOARD_ID_CHANNEL, boardId)
  return httpService.get(BASE_URL + boardId)
    .then((board) => {
      if (sortBy) {
        board.groups.forEach(group => {
          if (sortBy.by === 'title') {
            group.tasks.sort((taskA, taskB) =>
              taskA.title.localeCompare(taskB.title))
          }

          if (sortBy.by === 'status') {
            const res = []
            statusOpts.forEach(currStatus => {
              group.tasks.forEach(task => {
                if (!task.status) task.status = ''
                if (task.status.toLowerCase() === currStatus) res.push(task)
              })
            })
            group.tasks = res
          }

          if (sortBy.by === 'priority') {
            const res = []
            priorityOpts.forEach(currPriority => {
              group.tasks.forEach(task => {
                if (!task.priority) task.priority = ''
                if (task.priority.toLowerCase() === currPriority) res.push(task)
              })
            })

            group.tasks = res
          }

          if (sortBy.isDecending) group.tasks = group.tasks.reverse()
        })
      }
      if (filterBy) {
        board.groups.map((group) =>
          group.tasks = group.tasks.filter((task) =>
            (filterBy.term && filterBy.term !== '') ?
              new RegExp(filterBy.term, 'i').test(task.title) : true
          )
        )
      }
      return board
    })
}

function remove(boardId) {
  return httpService.delete(BASE_URL + boardId)
}

function save(board) {
  // Todo: board.createBy
  if (board._id) {
    socketService.emit(SOCKET_EMIT_SEND_BOARD_CHANGES, board)
    return httpService.put(BASE_URL + board._id, board)
  }
  else return httpService.post(BASE_URL, board)
}