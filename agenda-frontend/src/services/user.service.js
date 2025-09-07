import { httpService } from './http.service'
import { socketService } from './socket.service'
// import { storageService } from './async-storage.service'
// import { showSuccessMsg } from '../services/event-bus.service'

export const userService = {
    getUsers,
    login,
    verifyUsername,
    signup,
    logout,
    getLoggedinUser,
    saveLocalUser,
    getById,
    remove,
    update,
}

//?- Dev:
// const STORAGE_KEY = 'userDB'

//?- Prod:
const URL_USER = 'user/'
const URL_AUTH = 'auth/'

const STORAGE_KEY_LOGGEDIN_USER = 'loggedinUser'

async function login(creds) {
    const user = await httpService.post(URL_AUTH + 'login', creds)
    if (user) {
        socketService.login(user._id)
        return saveLocalUser(user)
    }
}
async function logout() {
    sessionStorage.removeItem(STORAGE_KEY_LOGGEDIN_USER)
    socketService.logout()
    return await httpService.post(URL_AUTH + 'logout')
}

async function signup(creds) {
    const user = await httpService.post(URL_AUTH + 'signup', creds)
    socketService.login(user._id)
    return saveLocalUser(user)
}

async function getUsers() {
    return httpService.get(URL_USER)
}

async function getById(userId) {
    return httpService.get(URL_USER + userId)
}

async function verifyUsername(username) {
    const isVerified = await httpService.get(URL_AUTH + 'verifyUsername', {username})
    if (!isVerified) throw new Error('NOT_FOUND')
}

function remove(userId) {
    //?- Dev:
    // Todo: remove user


    //?- Prod:
    // return storageService.remove('user', userId)
    // return httpService.delete(`user/${userId}`)
}

async function update(user) {
    //?- Dev:
    // Todo: update user info

    //?- Prod:
    user = await httpService.put(`user/${user._id}`, user)
    // Handle case in which admin updates other user's details
    if (getLoggedinUser()._id === user._id) saveLocalUser(user)
    return user
}

function saveLocalUser(user) {
    sessionStorage.setItem(STORAGE_KEY_LOGGEDIN_USER, JSON.stringify(user))
    return user
}

function getLoggedinUser() {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY_LOGGEDIN_USER))
}