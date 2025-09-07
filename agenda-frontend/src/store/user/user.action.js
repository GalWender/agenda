import { userService } from '../../services/user.service.js'
import { showErrorMsg, isUsernameVerified } from '../../services/event-bus.service.js'


export function checkUsername(username) {
    return async (dispatch) => {
        try {
            await userService.verifyUsername(username)
            isUsernameVerified('VERIFIED')
        } catch (err) {
            isUsernameVerified('NOT_FOUND')
        }
    }
}

export function login(creds) {
    return async (dispatch) => {
        try {
            const loggedinUser = await userService.login(creds)
            dispatch({ type: 'SET_USER', loggedinUser })
            isUsernameVerified('LOGGEDIN_SUCCESSFULLY')
        } catch (err) {
            isUsernameVerified('INVALID_CREDS')
        }
    }
}

export function signup(creds) {
    return async (dispatch) => {
        try {
            const savedUser = await userService.signup(creds)
            dispatch({ type: 'SET_USER', loggedinUser: savedUser })
        } catch (err) {
            console.error('Oops:', err)
            showErrorMsg('Cannot signup')
        }
    }
}

export function updateUser(creds) {
    return async (dispatch) => {
        try {
            const savedUser = await userService.update(creds)
            dispatch({ type: 'SET_USER', loggedinUser: savedUser })
        } catch (err) {
           console.error('Oops:', err)
        }
    }
}

export function logout() {
    return async (dispatch) => {
        try {
            await userService.logout()
            dispatch({ type: 'SET_USER', loggedinUser: null })
        } catch (err) {
            console.error('Oops:', err)
            showErrorMsg('Cannot logout')
        }
    }
}