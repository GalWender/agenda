import { ReactComponent as AppHeaderSvg } from '../assets/icons/app-header-background.svg'
import { ReactComponent as ArrowRightSvg } from '../assets/icons/agenda-arrow-icon-right.svg'
import fistBumpGif from '../assets/img/fist-bump.gif'
import { useState } from 'react'
import { BoardList } from '../cmps/board-list'
import {  useSelector } from 'react-redux'



export const AppHome = () => {

    const { boards } = useSelector(state => state.boardModule)
    const loggedinUser = useSelector(state => state.userModule.loggedinUser)

    return (
        <section className="app-home main-layout-app-home">
            <Header loggedinUser={loggedinUser} />
            <section className='main-panel-container'>
                <Favorites boards={boards} loggedinUser={loggedinUser} />
                <MyBoards boards={boards} />
                <Inbox />
            </section>
        </section>
    )
}

// Header
const Header = ({ loggedinUser }) => {
    return (
        <header className="app-home-header">
            <div className='header-container'>
                <h2>Good morning, {loggedinUser ? loggedinUser.fullname : 'User'}!</h2>
                <h1>Let's start the day off right :{')'}</h1>
            </div>
            <AppHeaderSvg />
        </header>
    )
}

//Inbox
const Inbox = () => {
    const [isInboxOpen, setIsInboxOpen] = useState(true)
    const onInboxOpen = ({ target }) => {
        target.classList.toggle('open')
        setIsInboxOpen(!isInboxOpen)
    }
    return <section className='app-home-inbox'>
        <div className='app-home-inbox-header'>
            <ArrowRightSvg onClick={(ev) => onInboxOpen(ev)} />
            <h1>Inbox</h1>
        </div>
        <div className='app-home-inbox-content'>
            {isInboxOpen && <InboxContent />}

        </div>
    </section>
}

const InboxContent = () => {
    return <div className='app-home-inbox-content-container'>
        <img className='fist-bump' src={fistBumpGif} alt="" />
        <p>Fist Bumb!</p>
        <p>Your inbox is empty, We'll let you know when we get news</p>
    </div>
}

// Favorites
const Favorites = ({boards ,loggedinUser }) => {

    const [isFavoritesOpen, setIsFavoritesOpen] = useState(true)
    const onFavoritesOpen = ({ target }) => {
        target.classList.toggle('open')
        setIsFavoritesOpen(!isFavoritesOpen)
    }
    return <section className='app-home-recent'>
        <div className='app-home-recent-header'>
            <ArrowRightSvg onClick={(ev) => onFavoritesOpen(ev)} />
            <h1>Favorites</h1>
        </div>
        <div className='app-home-recent-content'>
            {isFavoritesOpen && <FavoriteContent boards={boards} loggedinUser={loggedinUser} />}
        </div>
    </section>
}

const FavoriteContent = ({boards , loggedinUser }) => {
    let favIds = []
    if (loggedinUser) favIds = loggedinUser.favBoards || []
    else {
        try {
            const stored = JSON.parse(localStorage.getItem('guestFavBoards') || '[]')
            favIds = Array.isArray(stored) ? stored : []
        } catch (_) { favIds = [] }
    }
    const favBoards = boards.filter(board => favIds.includes(board._id))
    return <div className='app-home-recent-content-container'>
        <BoardList boards={favBoards} isStarred={true} />
    </div>
}

// MyBoards
const MyBoards = ({boards}) => {

    const [isMyboardsOpen, setIsMyboardsOpen] = useState(true)
    const onMyboardsOpen = ({ target }) => {
        target.classList.toggle('open')
        setIsMyboardsOpen(!isMyboardsOpen)
    }

    return <section className='app-home-myboards'>

        <div className='app-home-myboards-header'>
            <ArrowRightSvg onClick={(ev) => onMyboardsOpen(ev)} />
            <h1>My boards</h1>
        </div>
        {isMyboardsOpen && boards && <BoardList boards={boards} />}
    </section>
}