import { userService } from "../../services/user.service"


const initialState = {
    loggedinUser: userService.getLoggedinUser(),
}

export function userReducer(state = initialState, action) {
    switch (action.type) {

        case 'SET_USER':
            return { ...state, loggedinUser: action.loggedinUser }

        default:
            return state
    }
}
