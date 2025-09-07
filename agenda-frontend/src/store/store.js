import { applyMiddleware, combineReducers, compose, legacy_createStore as createStore } from 'redux'

import thunk from 'redux-thunk'
import { boardReducer } from './board/board.reducer'
import { userReducer } from './user/user.reducer'


const rootReducer = combineReducers({
    boardModule: boardReducer,
    userModule: userReducer,
})

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export const store = createStore(
    rootReducer,
    composeEnhancers(applyMiddleware(thunk))
)
window.gStore = store