import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { addBoard } from "../store/board/board.action"
import { useNavigate } from 'react-router-dom'

export const AddBoardModal = ({ isAddBoard, setIsAddBoard }) => {

    const loggedinUser = useSelector(state => state.userModule.loggedinUser)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        document.body.classList.add('add-board-modal-open')
        return () => {
            document.body.classList.remove('add-board-modal-open')
        }
    }, [])

    const onCreateBoard = async (ev) => {
        ev.preventDefault()
        const title = ev.target[0].value
        const { _id, fullname, imgUrl } = loggedinUser || { _id: '0000', fullname: 'guest', imgUrl: 'profile-img-guest' }
        const board = {
            title,
            createdBy: { _id, fullname, imgUrl },
            members: [{ _id, fullname, imgUrl }]
        }
        const saved = await dispatch(addBoard(board))
        setIsAddBoard(!isAddBoard)
        if (saved?._id) navigate(`/workspace/board/${saved._id}`)
    }

    const onCloseAddModal = () => {
        setIsAddBoard(!isAddBoard)
    }

    return <section className="add-board-modal">
        <div className="add-modal">
            <h2>Create New Board</h2>
            <form onSubmit={onCreateBoard}>
                <label htmlFor="name">
                    Board name
                </label>
                <input autoFocus type="txt" id="name" />
                <div className="add-modal-btns">
                    <button className="btn-create-board">Create</button>
                    <button onClick={onCloseAddModal}>Cancel</button>
                </div>
            </form>
        </div>
    </section>
}