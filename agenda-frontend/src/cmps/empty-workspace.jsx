import { useState } from 'react'
import { AddBoardModal } from './board-add-modal'
import { useDispatch, useSelector } from 'react-redux'
import { addBoard } from '../store/board/board.action'
import { useNavigate } from 'react-router-dom'

export const EmptyWorkspace = () => {
  const [isAddBoard, setIsAddBoard] = useState(false)
  const dispatch = useDispatch()
  const loggedinUser = useSelector(state => state.userModule.loggedinUser)
  const navigate = useNavigate()

  const openCreateBoard = () => setIsAddBoard(true)

  const createStarterBoard = async () => {
    // Minimal starter board to help first-time users
    const starter = {
      title: 'My First Board',
      groups: [
        { id: `g${Date.now()}1`, title: 'To do', tasks: [], style: 'clr1' },
        { id: `g${Date.now()}2`, title: 'In progress', tasks: [], style: 'clr2' },
        { id: `g${Date.now()}3`, title: 'Done', tasks: [], style: 'clr3' }
      ],
      cmpsOrder: ['member', 'status', 'priority', 'attachments', 'timeline']
    }
    const { _id, fullname, imgUrl } = loggedinUser || { _id: '0000', fullname: 'guest', imgUrl: 'profile-img-guest' }
    starter.createdBy = { _id, fullname, imgUrl }
    starter.members = [{ _id, fullname, imgUrl }]
    const saved = await dispatch(addBoard(starter))
    if (saved?._id) navigate(`/workspace/board/${saved._id}`)
  }

  return (
    <section className="empty-workspace">
      <div className="empty-hero">
        <h2>Welcome! Let’s create your first board</h2>
        <p>Boards help you organize work. Start with a blank board or a quick starter.</p>
        <div className="actions">
          <button className="btn primary" onClick={openCreateBoard}>Create board</button>
          <button className="btn secondary" onClick={createStarterBoard}>Create starter board</button>
        </div>
      </div>
      {isAddBoard && <AddBoardModal isAddBoard={isAddBoard} setIsAddBoard={setIsAddBoard} />}
    </section>
  )
}
