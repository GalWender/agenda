import { Link } from "react-router-dom"
import { ReactComponent as StarClrIcon } from '../assets/icons/star-clr.svg'

export const BoardPreview = ({ board, isStarred }) => {

    return (
        <Link to={`/workspace/board/${board._id}`}>
            <section className="board-preview">
                <div className={`board-preview-icon ${board.style}`}>{board.title.charAt(0).toUpperCase()}</div>
                <div className="board-preview-details">
                    <h3>{board.title}</h3>
                    <p className="board-group-count">{board.groups.length} Groups</p>
                </div>
                    {isStarred && <StarClrIcon className="star-svg" /> }
            </section>
        </Link>
    )
}