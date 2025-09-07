
const initialState = {
    isLoading: false,
    boards: [],
    boardsLoaded: false,
    board: null,
    filterBy: null,
    sortBy: null,
    task: null,
}

export function boardReducer(state = initialState, action) {
    var boards, filterBy, task
    switch (action.type) {
        case 'INIT':
            state.init()
            return { ...state }

        case 'SET_LOADING':
            return { ...state, isLoading: action.isLoading }


        case 'SET_BOARDS':
            return { ...state, boards: action.boards, boardsLoaded: true }


        case 'SET_BOARD':
            return { ...state, board: action.board }

        case 'ADD_BOARD':
            boards = [...state.boards, action.board]
            return { ...state, boards }

        case 'UPDATE_BOARD':
            boards = state.boards.map((board) => {
                if (board._id !== action.board._id) return board
                return action.board
            })
            return { ...state, boards, board: action.board }

        case 'UPDATE_TASK':
            return { ...state, task: action.task }


        case 'UPDATE_GROUP':
            return { ...state, board: action.board }

        case 'REMOVE_BOARD':
            boards = state.boards.filter(board => board._id !== action.boardId)
            return { ...state, boards }

        case 'SET_FILTER':
            filterBy = action.filterBy
            return ((filterBy && ((filterBy.term && filterBy.term !== '') || filterBy.status || filterBy.priority))) ?
                { ...state, filterBy: { ...state.filterBy, ...action.filterBy } } :
                { ...state, filterBy: null }

        case 'SET_SORT':
            return action.sortBy ?
                { ...state, sortBy: { ...state.sortBy, ...action.sortBy } }
                : { ...state, sortBy: null }


        case 'SET_TASK':
            return { ...state, task: action.task }

        case 'ADD_TASK_ACTIVITY':
            task = state.task
            if (!task.activities) task.activities = [action.activity]
            else task.activities.unshift(action.activity)
            return { ...state, task: { ...task } }

        case 'ADD_TASK_COMMENT':
            // Todo: add task comment
            return { ...state, task: action.task }

        default:
            return state
    }
}
