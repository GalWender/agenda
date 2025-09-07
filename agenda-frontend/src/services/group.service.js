import { boardService } from "./board.service";
import { utilService } from "./util.service";

export const groupService = {
  getById,
  save,
  update,
  remove,
}

async function getById({ groupId, boardId }) {
  const board = await boardService.getById(boardId)
  return board.groups.find(g => g.id === groupId)
}

async function remove({ groupId, boardId }) {
  const board = await boardService.getById(boardId)
  board.groups = board.groups.filter(g => g.id !== groupId)
  return boardService.save(board)
}

async function update({ group, boardId }) {
  const board = await boardService.getById(boardId)
  board.groups = board.groups.map(g => (g.id !== group.id) ? g : group)
  return boardService.save(board)
}

async function save(boardId, isFromTop) {
  const board = await boardService.getById(boardId)
  if (isFromTop) board.groups = [{ id: utilService.makeId(), title: 'New Group', tasks: [] }, ...board.groups]
  else board.groups.push({ id: utilService.makeId(), title: 'New Group', tasks: [] })
  return boardService.save(board)
}