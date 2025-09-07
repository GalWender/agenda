import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useForm } from "../hooks/useForm"
import { eventBusService } from "../services/event-bus.service"
import { updateBoard } from "../store/board/board.action"
import { checkUsername } from "../store/user/user.action"
import { GrClose } from 'react-icons/gr'
import { RiVipCrownFill } from 'react-icons/ri'
import { MdDoNotDisturbAlt } from 'react-icons/md'
import { userService } from "../services/user.service"

export const InviteMemberModal = ({ setIsInviteMemberOpen }) => {

  const dispatch = useDispatch()
  const board = useSelector(state => state.boardModule.board)
  const [isUsernameVerified, setUserNameVerified] = useState(false)
  const [fields, handleChange] = useForm({ username: '' })

  const unsubscribeRef = useRef()

  useEffect(() => {
    unsubscribeRef.current = eventBusService.on('username-verify', (isVerified) => {
      setUserNameVerified(isVerified)
      if (isVerified === 'VERIFIED') {
        addMemberToBoard()
      }
    })
    return () => { unsubscribeRef.current() }
  })

  const addMemberToBoard = () => {
    userService.getUsers()
      .then(users => users.find(user => user.username === fields.username))
      .then(user => {
        if (board.members?.some(member => member._id === user._id)) {
          setUserNameVerified('ALREADY_IN_BOARD')
        } else {
          const member = { _id: user._id, fullname: user.fullname, imgUrl: user.imgUrl }
          board.members = (board.members) ?
            [member, ...board.members] : [member]
          dispatch(updateBoard(board))
        }
      })
  }

  const onSearchMember = (ev) => {
    ev.preventDefault()
    const { username } = fields
    dispatch(checkUsername(username))
  }

  return (
    <section className="board-invite-member" onClick={() => setIsInviteMemberOpen(false)}>
      <div className="invite-member-modal" onClick={(ev) => ev.stopPropagation()}>
        <button className="btn btn-svg btn-close" onClick={() => setIsInviteMemberOpen(false)}>
          <GrClose />
        </button>
        <h1 className="title">Board Members</h1>
        {isUsernameVerified === 'NOT_FOUND' &&
          <div className="flex align-center username-not-found">
            <div className="icon icon-svg"><MdDoNotDisturbAlt /></div>
            <span className="msg">We couldn't find a user with this email</span>
          </div>}
        {isUsernameVerified === 'ALREADY_IN_BOARD' &&
          <div className="flex align-center username-not-found">
            <div className="icon icon-svg"><MdDoNotDisturbAlt /></div>
            <span className="msg">User is already in the board</span>
          </div>}
        <form className="form form-member-search" onSubmit={onSearchMember}>
          <input className="input input-username"
            name="username"
            autoComplete="off"
            type="text"
            value={fields.username}
            placeholder="Enter email"
            onChange={handleChange}
          />
        </form>
        {board.members &&
          <div className="member-list">
            {board.members.map((member, idx) =>
              <MemberPreview key={idx} member={member} isAdmin={member._id === board.createdBy?._id} />
            )}
          </div>}
      </div>
    </section>
  )
}

const MemberPreview = ({ member, isAdmin }) => {
  return (
    <div className="flex align-center space-between member-preview">
      <div className="flex align-center member-info">
        <img className="profile-img-icon" src={require(`../assets/img/${member.imgUrl}.png`)} alt="Profile img" />
        <span className="name">{member.fullname}</span>
      </div>
      <div className={`icon icon-svg admin-indicator ${isAdmin ? 'admin' : ''}`}><RiVipCrownFill /></div>
    </div>
  )
}