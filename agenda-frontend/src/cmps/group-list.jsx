import { GroupPreview } from "./group-preview"
import { ReactComponent as PlusIcon } from '../assets/icons/plus-icon.svg'
import { useDispatch } from "react-redux"
import { addGroup, updateBoard } from "../store/board/board.action"
import { useEffect, useState } from "react"
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import { useRef } from "react"

export const GroupList = ({ board }) => {


  const dispatch = useDispatch()
  const [groups, setGroups] = useState(board.groups)

  const containerRef = useRef()

  const onAddGroup = () => {
    dispatch(addGroup(board._id))
  }

  const handleOnDragEnd = (ev) => {
    if (!ev.destination) return
    const updatedGroups = [...groups]
    const [draggedItem] = updatedGroups.splice(ev.source.index, 1)
    updatedGroups.splice(ev.destination.index, 0, draggedItem)

    setGroups(updatedGroups)
    board.groups = updatedGroups
    dispatch(updateBoard(board))
  }

  useEffect(() => {
    if (groups !== board.groups) {
      setGroups(board.groups)
    }
  }, [board.groups])

  return <div ref={containerRef}>
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId='group'>
        {(droppableProvided) => {
          return <section ref={droppableProvided.innerRef} {...droppableProvided.droppableProps} className="group-list">
            {groups.map((group, idx) =>
              <GroupPreview
                key={group.id}
                idx={idx}
                group={group}
                board={board} />
            )}
            <button className="btn btn-svg add-group-btn" onClick={onAddGroup}><PlusIcon /> Add new group</button>
            {droppableProvided.placeholder}
          </section >
        }}
      </Droppable >
    </DragDropContext >
  </div>
}