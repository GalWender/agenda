import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { setFilter } from '../store/board/board.action'

export const useFilter = (initialFilter) => {
    const dispatch = useDispatch()
    const debounceTimer = useRef()
    const { filterBy } = useSelector(state => state.boardModule)
    const [filter, onSetFilter] = useState(initialFilter)

    useEffect(() => {
        clearTimeout(debounceTimer.current)
        debounceTimer.current = setTimeout(() => {
            dispatch(setFilter({ ...filterBy, ...filter }))
        }, 1000)
    }, [filter])

    const handleChange = (change) => {
        onSetFilter(prevFilter => ({ ...prevFilter, ...change }))
    }
    return [filter, handleChange, onSetFilter]
}