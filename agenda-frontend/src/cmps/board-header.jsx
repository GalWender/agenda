import { ReactComponent as InviteSvg } from '../assets/icons/invite.svg'
import { ReactComponent as DownArrowSvg } from '../assets/icons/down-arrow.svg'
import { BiSearch } from 'react-icons/bi'
import { AiFillCloseCircle } from 'react-icons/ai'
import { useForm } from '../hooks/useForm'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { addTask, updateBoard } from '../store/board/board.action'
import { useFilter } from '../hooks/useFilter'
import { NavLink, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { ReactComponent as HomeIcon } from '../assets/icons/home-icon.svg'
import { ReactComponent as StarIcon } from '../assets/icons/star.svg'
import { ReactComponent as StarClrIcon } from '../assets/icons/star-clr.svg'
import { useSelector } from 'react-redux'
import { updateUser } from '../store/user/user.action'
import { Fragment } from 'react'
import { InviteMemberModal } from './board-invite-member-modal'
import { PopUpModal } from './pop-up-modal'

export const BoardHeader = ({ board }) => {
  const { title } = board

  const params = useParams()
  const dispatch = useDispatch()
  const loggedinUser = useSelector(state => state.userModule.loggedinUser)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameTitle, handleChange] = useForm({ title: board.title })
  const [isDashboard, setIsDashboard] = useState(false)
  const [user, setUser] = useState(loggedinUser)
  const [isInviteMemberOpen, setIsInviteMemberOpen] = useState(false)
  const [guestFavBoards, setGuestFavBoards] = useState([])

  useEffect(() => {
    if (params['*'] === `board/dashboard/${board._id}`) {
      setIsDashboard(true)
    } else {
      setIsDashboard(false)
    }
  }, [params])

  const changeBoardTitle = () => {
    setIsRenaming(!isRenaming)
  }

  useEffect(() => {
    if (!user) setUser(loggedinUser)
  }, [loggedinUser])

  useEffect(() => {
    if (!loggedinUser) {
      try {
        const stored = JSON.parse(localStorage.getItem('guestFavBoards') || '[]')
        setGuestFavBoards(Array.isArray(stored) ? stored : [])
      } catch (_) {
        setGuestFavBoards([])
      }
    }
  }, [loggedinUser])

  const addBoardToFav = () => {
    if (loggedinUser) {
      if (loggedinUser?.favBoards?.includes(board._id)) {
        const favorites = loggedinUser?.favBoards?.filter(boardId => boardId !== board._id)
        loggedinUser.favBoards = favorites
      }
      else {
        if (loggedinUser?.favBoards) loggedinUser.favBoards = [...loggedinUser.favBoards, board._id]
        else loggedinUser.favBoards = [board._id]
      }
      setUser({ ...loggedinUser })
      dispatch(updateUser(loggedinUser))
    } else {
      const exists = guestFavBoards.includes(board._id)
      const updated = exists ? guestFavBoards.filter(id => id !== board._id) : [...guestFavBoards, board._id]
      setGuestFavBoards(updated)
      try { localStorage.setItem('guestFavBoards', JSON.stringify(updated)) } catch (_) {}
    }
  }

  const onRenameBoard = (ev) => {
    ev.preventDefault()
    board = { ...board, ...renameTitle }
    setIsRenaming(!isRenaming)
    dispatch(updateBoard(board))
  }

  return (
    <Fragment>
      {isInviteMemberOpen &&
        <InviteMemberModal isInviteMemberOpen={isInviteMemberOpen} setIsInviteMemberOpen={setIsInviteMemberOpen} />}
      <section className="board-header">
        <div className="flex board-info">
          <div className='header-main'>
            <div className='board-header-title'>
              {isRenaming ? <form className='rename-form' onSubmit={onRenameBoard} onBlur={onRenameBoard}>
                <input autoFocus type="text" name='title' value={renameTitle.title} onChange={handleChange} />
              </form>
                : <h1 onClick={changeBoardTitle} className="title">{title}</h1>}
              {(loggedinUser ? user?.favBoards?.includes(board._id) : guestFavBoards.includes(board._id)) ?
                <StarClrIcon onClick={addBoardToFav} className="svg svg-star starred" title='Remove from favorites' />
                : <StarIcon onClick={addBoardToFav} className="svg svg-star" title='Add to favorites' />}
              <div className="flex btns-container">
                <button className="btn btn-svg invite" onClick={() => setIsInviteMemberOpen(true)}>
                  <InviteSvg />
                  <span>Invite</span>
                </button>
                {/* <button className="btn btn-svg menu">
              <BoardMenuSvg />
            </button> */}
              </div>
            </div>
            <div className="board-header-nav-container">
              <NavLink to={`/workspace/board/${board._id}`} className="board-header-nav-link"><HomeIcon /> Main Table</NavLink>
              <NavLink to={`/workspace/board/kanban/${board._id}`} className="board-header-nav-link">Kanban</NavLink>
              <NavLink to={`/workspace/board/dashboard/${board._id}`} className="board-header-nav-link">Dashboard</NavLink>
            </div>
          </div>
        </div>
        {!isDashboard && <div className="flex board-nav">
          <BoardControls board={board} />
        </div>}
      </section>
    </Fragment>
  )
}



const BoardControls = ({ board }) => {
  const dispatch = useDispatch()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [modalName, setModalName] = useState(null)

  const onToggleSearch = () => {
    setIsSearchOpen(!isSearchOpen)
  }

  const openNewTaskMenu = () => {
    setTimeout(() => {
      setModalName('NEW_TASK_MENU')
    }, 100);
  }

  const onAddTask = () => {
    const boardId = board._id
    const groupId = board.groups[0].id
    dispatch(addTask({ groupId, title: 'New Task', boardId }))
  }

  return (
    <div className="flex aline btns-container">
      {modalName && <PopUpModal board={board} modalName={modalName} setModalName={setModalName} />}
      <div className="btn btn-highlight btn-options">
        <button className="btn btn-new-task" onClick={() => onAddTask()}>
          <span>New Task</span>
        </button>
        <button onClick={openNewTaskMenu} className="btn btn-drop-down">
          <DownArrowSvg />
        </button>
      </div>
      {isSearchOpen ?
        <SearchFilter isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} />
        // <input className="input input-search"
        //   onBlur={(ev) => onToggleSearch(ev.target.value)}
        //   autoFocus
        //   type="text"
        //   name="term"
        //   value={filterBy?.term || ''}
        //   onChange={(ev) => handleFilterChange({ term: ev.target.value })}
        // />
        :
        <button className="btn btn-svg btn-ri btn-search"
          onClick={onToggleSearch}>
          <BiSearch />
          <span>Search</span>
        </button>
      }
      {/* <button className="btn btn-svg btn-person">
        <PersonSvg />
        <span>Person</span>
      </button>
      <button className="btn btn-svg btn-filter">
        <FilterSvg />
        <span>Filter</span>
      </button>
      <button className="btn btn-svg btn-sort">
        <SortSvg />
        <span>Sort</span>
      </button>
      <button className="btn btn-svg btn-hide">
        <HideSvg />
        <span>Hide</span>
      </button>
      <button className="btn btn-svg btn-task-menu">
        <BoardMenuSvg />
      </button> */}
    </div>
  )
}

const SearchFilter = ({ isSearchOpen, setIsSearchOpen }) => {

  const [filterBy, handleFilterChange, setFilterBy] = useFilter(null)

  const onToggleSearch = (inputValue) => {
    if (filterBy?.term && inputValue) return
    setIsSearchOpen(!isSearchOpen)
  }

  const onClearSearch = () => {
    setFilterBy({ term: '' })
  }

  return (
    <div className={`flex align-center board-search-filter ${filterBy?.term ? 'active' : ''}`}
      onBlur={(ev) => onToggleSearch(ev.target.value)}
    >
      <span className="icon icon-bi">
        <BiSearch />
      </span>
      <div className="input-container">
        <input className="input input-search"
          autoFocus
          type="text"
          name="term"
          placeholder="Search"
          value={filterBy?.term || ''}
          onChange={(ev) => handleFilterChange({ term: ev.target.value })} />
      </div>
      {filterBy?.term &&
        <button className="btn btn-svg btn-clear-search"
          onClick={onClearSearch} >
          <AiFillCloseCircle />
        </button>}
    </div>
  )
}