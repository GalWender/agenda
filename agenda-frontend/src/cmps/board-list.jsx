import { BoardPreview } from "./board-preview"

export const BoardList = ({ boards, isStarred }) => {

    if (isStarred) {
    }

    if (!boards) return
    return <section className="board-list">
        {boards.map((board, idx) =>
            <BoardPreview board={board} key={idx} isStarred={isStarred} />)}
    </section>
}