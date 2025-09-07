import { Fragment, useEffect, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import { Route, Routes } from 'react-router-dom';
import { AppHome } from '../views/app-home'
import { Board } from '../views/board'
import { Inbox } from '../views/inbox';
import { ReactComponent as BoardSvg } from '../assets/icons/nav-bar/board.svg';
// import { ReactComponent as NotificationSvg } from '../assets/icons/nav-bar/notification.svg';
// import { ReactComponent as InboxSvg } from '../assets/icons/nav-bar/inbox.svg';
import { ReactComponent as MyWorkSvg } from '../assets/icons/nav-bar/my-work.svg';
import { ReactComponent as FavoritesSvg } from '../assets/icons/nav-bar/favorites.svg';
// import { ReactComponent as InviteSvg } from '../assets/icons/nav-bar/invite.svg';
// import { ReactComponent as SearchSvg } from '../assets/icons/nav-bar/search.svg';
// import { ReactComponent as HelpSvg } from '../assets/icons/nav-bar/help.svg';
import { ReactComponent as MenuSvg } from '../assets/icons/nav-bar/menu.svg';
import { ReactComponent as AgendaLogoSvg } from '../assets/icons/agenda-logo-color.svg';
import { SideNavBar } from './side-nav-bar';
import { useDispatch, useSelector } from 'react-redux';
import { Loader } from './loader';
import { loadBoard, loadBoards, setLoader } from '../store/board/board.action';
import { Dashboard } from '../views/dashboard';
import { PopUpModal } from './pop-up-modal';
import { Kanban } from '../views/kanban';
import { MyWork } from '../views/my-work';
import { EmptyWorkspace } from './empty-workspace';


export const NavBar = () => {
  const loggedinUser = useSelector(state => state.userModule.loggedinUser)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { board, boards, boardsLoaded, isLoading } = useSelector(state => state.boardModule)
  const params = useParams()
  const [isOpen, setIsOpen] = useState(false)
  const [currBoard, setCurrBoard] = useState(board)
  const [modalName, setModalName] = useState(null)
  const [isFavorites, setIsFavorites] = useState(false)
  const hasNoBoards = boardsLoaded && (!boards || boards.length === 0)

  useEffect(() => {
    if (board && !currBoard) setCurrBoard(board)

    // Fetch boards only once; if already loaded (even empty), do not refetch
    if ((!boards || boards.length === 0) && !boardsLoaded && !isLoading) {
      dispatch(setLoader())
      dispatch(loadBoards())
    }

    // When we have boards, make sure we load the current one if not set
    if (boards.length > 0 && !board && !isLoading) {
      const currParams = params['*'].split('/')
      const boardId = (currParams[0] === 'home' || currParams[0] === 'mywork') ? boards[0]._id : currParams[currParams.length - 1]
      if (!params.boardId && boardId) {
        dispatch(loadBoard(boardId))
      } else if (params.boardId) {
        dispatch(setLoader())
        dispatch(loadBoard(params.boardId))
      }
    }
  }, [boards, board, boardsLoaded, isLoading])

  useEffect(() => {
    const width = (isOpen || hasNoBoards)
      ? '317px'
      : ((params['*'] !== 'home') ? '96px' : '66px')
    document.documentElement.style.setProperty('--board-grid-column', width)
    return (() => document.documentElement.style.removeProperty('--board-grid-column'))
  }, [isOpen, params, hasNoBoards])

  const openUserMenu = () => {
    setTimeout(() => {
      setModalName('USER_MENU')
    }, 100);
  }

  const showFavorites = () => {
    setIsFavorites(true)
    if (params.boardId || !currBoard) return
    navigate(`/workspace/board/${currBoard._id}`)
  }


  if (!currBoard && !hasNoBoards) return <Loader />
  return (
    <Fragment>
      {params['*'] !== 'home' &&
        <SideNavBar setCurrBoard={setCurrBoard}
          boards={boards}
          board={currBoard}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          isFavorites={isFavorites} />}
      <section className="nav-bar">
        <button title='Home' onClick={() => setIsFavorites(false)} className="btn btn-home" >
          <NavLink onClick={() => setIsOpen(false)} to="/workspace/home" className="set" ><AgendaLogoSvg />
            <div className="selected-indication"></div>
          </NavLink>
        </button>
        <div className="divider-horizontal"></div>
        <button onClick={() => setIsFavorites(false)} className="btn btn-board" title='Work managment'>
          <NavLink to={currBoard ? `/workspace/board/${currBoard._id}` : '/workspace/home'} className={`${!isFavorites ? 'set' : ''} ${!currBoard ? 'disabled' : ''}`}><BoardSvg />
            <div className="selected-indication"></div>
          </NavLink>
        </button>
        {/* <button className="btn btn-svg btn-notification" title='Notifications'><NotificationSvg /></button> */}
        {/* <button className="btn btn-svg btn-index" title='Inbox'>
          <NavLink to="/workspace/inbox"><InboxSvg />
            <div className="selected-indication"></div>
          </NavLink>
        </button> */}
        <button className="btn btn-svg btn-my-work" title='My work'>
          <NavLink to="/workspace/mywork"><MyWorkSvg />
            <div className="selected-indication"></div>
          </NavLink>
        </button>
        <button onClick={showFavorites} className={`btn btn-svg btn-favorites set ${isFavorites ? 'active' : ''}`} title='Favorites'>
          <FavoritesSvg />
          <div className="selected-indication"></div>
        </button>
        {/* <button className="btn btn-svg btn-invite" title='Invite members'><InviteSvg /></button> */}
        {/* <button className="btn btn-svg btn-search" title='Search everything'><SearchSvg /></button> */}
        {/* <button className="btn btn-svg btn-help" title='Help'><HelpSvg /></button> */}
        <div className="divider-horizontal"></div>
        <button className="btn btn-svg btn-menu"><MenuSvg /></button>
        {modalName && <PopUpModal setModalName={setModalName} modalName={modalName} />}
        {loggedinUser ?
          <button className="btn btn-img btn-user" onClick={() => openUserMenu()} title={loggedinUser.fullname}>
            <img className="profile-img-icon" src={require(`../assets/img/${loggedinUser.imgUrl}.png`)} alt="Profile img" />
          </button> :
          // <button className="btn btn-img btn-user" onClick={() => openUserMenu()} title={loggedinUser.fullname}>O</button> :
          <button className="btn btn-img btn-user" onClick={() => openUserMenu()} title={'guest'}>O</button>}


      </section>
      {hasNoBoards ? (
        <EmptyWorkspace />
      ) : (
        <Routes>
          <Route path="/home" element={<AppHome />} />
          <Route path="/board/kanban/:boardId/*" element={<Kanban />} />
          <Route path="/board/dashboard/:boardId" element={<Dashboard />} />
          <Route path="/board/:boardId/*" element={<Board />} />
          <Route path="/mywork" element={<MyWork />} />
          <Route path="/inbox" element={<Inbox />} />
        </Routes>
      )}
    </Fragment>
  )
}

