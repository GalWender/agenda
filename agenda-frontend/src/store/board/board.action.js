import { boardService } from "../../services/board.service"
// import { userService } from "../../services/user.service"
import { showSuccessMsg, showErrorMsg } from '../../services/event-bus.service'
import { groupService } from "../../services/group.service"
import { taskService } from "../../services/task.service"


export function getActionUpdateBoard(board) {
    return { type: 'UPDATE_BOARD', board }
}

export function getActionUpdateTask(task) {
    // Todo: add action func to add comment 
    return { type: 'UPDATE_TASK', task }
}

export function setLoader() {
    return (dispatch, getState) => {
        dispatch({ type: 'SET_LOADING', isLoading: true })
    }
}

export function loadBoards() {
    return async (dispatch, getState) => {
        try {
            const boards = await boardService.query()
            dispatch({ type: 'SET_BOARDS', boards })
        } catch (err) {
            // showErrorMsg('Failed to load boards')
            // Mark boards as loaded with an empty list to prevent infinite refetch loops
            dispatch({ type: 'SET_BOARDS', boards: [] })
        } finally {
            dispatch({ type: 'SET_LOADING', isLoading: false })
        }
    }
}

export function removeBoard(boardId) {
    return async (dispatch, getState) => {
        dispatch({ type: 'SET_LOADING', isLoading: true })
        try {
            boardService.remove(boardId)
            dispatch({ type: 'REMOVE_BOARD', boardId })
            showSuccessMsg('Board removed succesfully')
        } catch (err) {
            // showErrorMsg('Failed to remove board')
        } finally {
            dispatch({ type: 'SET_LOADING', isLoading: false })
        }
    }
}

export function setFilter(filterBy) {
    return (dispatch) => {
        dispatch({ type: 'SET_FILTER', filterBy })
    }
}

export function setSort(sortBy) {
    return (dispatch) => {
        dispatch({ type: 'SET_SORT', sortBy })
    }
}

export function loadBoard(boardId, sortBy, filterBy) {
    return async (dispatch, getState) => {
        try {
            const board = await boardService.getById(boardId, sortBy, filterBy)
            dispatch({ type: 'SET_BOARD', board })
        } catch (err) {
            // showErrorMsg('Failed to load board try again later')
        } finally {
            dispatch({ type: 'SET_LOADING', isLoading: false })
        }
    }
}

export function addBoard(board) {
    return async (dispatch, getState) => {
        try {
            dispatch({ type: 'SET_LOADING', isLoading: true })
            const savedBoard = await boardService.save(board)
            dispatch({ type: 'ADD_BOARD', board: savedBoard })
            return savedBoard
        } catch (err) {
            // showErrorMsg('Failed to add board try again')
        } finally {
            dispatch({ type: 'SET_LOADING', isLoading: false })
        }
    }
}

export function updateBoard(board) {
    return async (dispatch, getState) => {
        try {
            await boardService.save(board)
            // const updatedBoard = await boardService.save(board)
            // dispatch({ type: 'UPDATE_BOARD', board: updatedBoard })
        } catch (err) {
            // showErrorMsg('Failed to update board')
        } finally {
            dispatch({ type: 'SET_LOADING', isLoading: false })
        }
    }
}

export function setTask(task) {
    return (dispatch) => {
        dispatch({ type: 'SET_TASK', task })
    }
}

export function loadTask(task) {
    return async (dispatch) => {
        try {
            const savedTask = await taskService.getById(task)
            dispatch({ type: 'SET_TASK', task: savedTask })
        } catch (err) {
            // showErrorMsg('Failed to load task')
        }
    }
}

export function addTask(task) {
    return async (dispatch, getState) => {
        try {
            await taskService.save(task)
            // const updatedBoard = await taskService.save(task)
            // dispatch({ type: 'UPDATE_BOARD', board: updatedBoard })
        } catch (err) {
            // showErrorMsg('Failed to add task')
        }
    }
}

export function updateTask(task, activity) {
    return async (dispatch, getState) => {
        try {
            await taskService.update(task, activity)
            // const updatedBoard = await taskService.update(task, activity)
            // dispatch({ type: 'UPDATE_BOARD', board: updatedBoard })
        } catch (err) {
            // showErrorMsg('Failed to update task')
        }
    }
}

export function removeTask(task) {
    return async (dispatch, getState) => {
        try {
            await taskService.remove(task)
            // const updatedBoard = await taskService.remove(task)
            // dispatch({ type: 'UPDATE_BOARD', board: updatedBoard })
            showSuccessMsg('Task removed succesfully')
        } catch (err) {
            // showErrorMsg('Failed to remove task')
        }
    }
}

export function addGroup(boardId, isFromTop) {
    return async (dispatch, getState) => {
        try {
            await groupService.save(boardId, isFromTop)
            // const updatedBoard = await groupService.save(boardId)
            // dispatch({ type: 'UPDATE_BOARD', board: updatedBoard })
        } catch (err) {
            // showErrorMsg('Failed to add group')
        }
    }
}

export function updateGroup(group) { // 👈 group is obj prop: { group, boardId }
    return async (dispatch, getState) => {
        try {
            await groupService.update(group)
            // const updatedBoard = await groupService.update(group)
            // dispatch({ type: 'UPDATE_BOARD', board: updatedBoard })
        } catch (err) {
            // showErrorMsg('Failed to update group')
        }
    }
}

export function removeGroup(group) {
    return async (dispatch, getState) => {
        try {
            await groupService.remove(group)
            // const updatedBoard = await groupService.remove(group)
            // dispatch({ type: 'UPDATE_BOARD', board: updatedBoard })
            showSuccessMsg('Group removed successfully')
        } catch (err) {
            // showErrorMsg('Failed to remove group')
        }
    }
}

export function addComment(task, activity) {
    return async (dispatch, getState) => {
        try {
            await taskService.update(task, activity)
            // const savedBoard = await taskService.update(task, activity)
            // dispatch({ type: 'UPDATE_BOARD', board: savedBoard })
        } catch (err) {
            // showErrorMsg('Failed to add comment')
        }
    }
}

export function removeComment(task, activity) {
    return async (dispatch, getState) => {
        try {
            await taskService.update(task, activity)
            // const savedBoard = await taskService.update(task, activity)
            // dispatch({ type: 'UPDATE_BOARD', board: savedBoard })
        } catch (err) {
            // showErrorMsg('Failed to add comment')
        }
    }
}

