import moment from "moment/moment"
import { Fragment, useRef, useState } from "react"
import { ReactComponent as NoPersonSvg } from '../assets/icons/no-person-icon.svg'
import { FaPlusCircle } from "react-icons/fa"
import { PopUpModal } from "./pop-up-modal"
import { TaskTimeline } from "./task-timeline"
import { BiImageAdd } from "react-icons/bi"
import { uploadService } from "../services/upload.service"
import { useDispatch } from "react-redux"
import { updateTask } from "../store/board/board.action"
import { useEffect } from "react"
import { HoverModal } from "./hover-modal"


export const DynamicTaskCmp = ({ board, task, category, group }) => {
    const [modalName, setModalName] = useState(null)
    const [modalHoverName, setHoverModalName] = useState(null)
    const [currMemberId, setCurrMemberId] = useState(null)
    const isCategoryInc = ['priority', 'status', 'lastUpdated', 'attachments'].includes(category)
    let className = `flex justify-center task-preview-`
    let headerTxt, cmp
    let cb = () => { }

    const getFormattedDateTime = (date) => {
        if (!date) return
        moment.updateLocale('en', {
            relativeTime: {
                s: 'just now',
                ss: '%d seconds ago',
                m: 'a minute ago',
                mm: '%d minutes ago',
                h: 'an hour ago',
                hh: '%d hours ago',
                d: 'a day ago',
                dd: '%d days ago',
                w: 'a week ago',
                ww: '%d weeks ago',
                M: 'a month ago',
                MM: '%d months ago',
                y: 'a year ago',
                yy: '%d years ago'
            }
        })
        return moment(date).fromNow(true)
    }

    const onSetTaskStatusMenuOpen = () => {
        setTimeout(() => {
            setModalName('TASK_STATUS_MENU')
        }, 100);
    }

    const onSetTaskPriorityMenuOpen = () => {
        setTimeout(() => {
            setModalName('TASK_PRIORITY_MENU')
        }, 100);
    }

    const onSetTaskPersonMenuOpen = () => {
        setTimeout(() => {
            setModalName('TASK_PERSON_MENU')
        }, 100);
    }

    const GetMemberImgFromId = (board, memberId) => {
        const imgUrl = (memberId !== 'Guest') ?
            board.members.find(member => member._id === memberId).imgUrl : 'profile-img-guest'
        return <img key={memberId} className='profile-img-icon' src={require(`../assets/img/${imgUrl}.png`)} alt="" />
    }

    const imgHoverRef = useRef()
    const GetMemberImgFromIdHover = (board, memberId, modalHoverName, setHoverModalName, setCurrMemberId) => {

        const mouseHoverEnter = () => {
            imgHoverRef.current = setTimeout(() => {
                setHoverModalName('MEMBER')
                setCurrMemberId(memberId)
            }, 500);
        }

        const mouseHoverLeave = () => {
            clearTimeout(imgHoverRef.current)
            setTimeout(() => {
                setHoverModalName(null)
                setCurrMemberId(null)
            }, 100);
        }

        const imgUrl = (memberId !== 'Guest') ?
            board.members.find(member => member._id === memberId).imgUrl : 'profile-img-guest'
        return <img key={memberId} onMouseOver={mouseHoverEnter} onMouseLeave={mouseHoverLeave} className='profile-img-icon' src={require(`../assets/img/${imgUrl}.png`)} alt="" />
    }

    const makeClass = (status) => {
        if (!status) return
        // if(status === 'undefined') return ''
        return status.split(' ').join('')
    }

    switch (category) {

        case 'member':
            className += `developer same-width `
            break;

        case 'status':
            cmp = <span className='fold'></span>
            headerTxt = (task[category] === undefined) ? '' : task[category]
            className += `status same-width `
            cb = onSetTaskStatusMenuOpen

            break;
        case 'priority':
            cmp = <span className='fold'></span>
            headerTxt = (task[category] === undefined) ? '' : task[category]
            className += `priority same-width `
            if (task[category] === 'Critical') {
                headerTxt += " ⚠"
            }
            cb = onSetTaskPriorityMenuOpen

            break;
        case 'attachments':
            cmp = <AddFile task={task} group={group} board={board} />
            className += 'attachments same-width '



            break;
        case 'timeline':
            className += 'timeline '


            break;
        case 'lastUpdated':
            className += `last-updated same-width `
            headerTxt = getFormattedDateTime(task[category]?.date)


            break;

        default:
            break;
    }

    if (isCategoryInc && category !== 'lastUpdated' && category !== 'attachments') className += makeClass(task[category])
    return <>
        {modalName &&
            <PopUpModal setModalName={setModalName} modalName={modalName} task={task} group={group} board={board} />
        }
        <li className={className} onClick={cb}>
            {category === 'member' &&
                <Fragment>
                    <button className="btn btn-add-developer" onClick={() => onSetTaskPersonMenuOpen()}>
                        <FaPlusCircle />
                    </button>
                    <div className='developer-container'>
                        {modalHoverName && <HoverModal modalHoverName={modalHoverName} setModalHoverName={setHoverModalName} task={task} board={board} currMemberId={currMemberId} />}
                        {(task.memberIds && task.memberIds.length > 0) ?
                            task.memberIds.map(memberId => GetMemberImgFromIdHover(board, memberId, modalHoverName, setHoverModalName, setCurrMemberId))
                            :
                            <NoPersonSvg className="svg-no-person" />}
                    </div>
                </Fragment>}

            {category === 'lastUpdated' &&
                <div className='flex align-center last-updated'>
                    {task.lastUpdated && task.lastUpdated.byUserId &&
                        GetMemberImgFromId(board, task.lastUpdated.byUserId)}
                </div>}
            {category === 'timeline' &&
                <TaskTimeline task={task} group={group} board={board} />}
            {isCategoryInc && <>
                <h4>{headerTxt}</h4>
                {cmp}
            </>}
        </li>
    </>
}

const AddFile = ({ task, group, board }) => {

    const dispatch = useDispatch()
    const fileRef = useRef()
    const [isFile, setIsFile] = useState(task.files ? true : false)
    const [src, setSrc] = useState(task.files || '')
    const [modalName, setModalName] = useState(null)
    const [modalHoverName, setHoverModalName] = useState(null)

    const importImg = async (ev) => {
        try {
            const { secure_url: imgSrc } = await uploadService.uploadImg(ev)
            setIsFile(true)
            setSrc(imgSrc)
            task.files = imgSrc
            dispatch(updateTask({ task, groupId: group.id, boardId: board._id }))
        }
        catch {

        }

    }

    const openFileMenu = () => {
        setTimeout(() => {
            setModalName('FILE_MENU')
        }, 200);
    }

    const mouseHoverRef = useRef()
    const mouseHoverEnter = () => {
        mouseHoverRef.current = setTimeout(() => {
            setHoverModalName('FILE')
        }, 750);
    }

    const mouseHoverLeave = () => {
        setTimeout(() => {
            clearTimeout(mouseHoverRef.current)
            setHoverModalName(null)
        }, 200);
    }

    return <div className="img-container">
        {modalHoverName && <HoverModal modalHoverName={modalHoverName} setModalHoverName={setHoverModalName} task={task} />}
        {modalName && <PopUpModal modalName={modalName} setModalName={setModalName} task={task} group={group} board={board} setIsFile={setIsFile} />}
        {isFile ? <img className='file-img' src={src} ref={fileRef} onClick={openFileMenu} onMouseEnter={() => mouseHoverEnter()} onMouseLeave={() => mouseHoverLeave()} />
            : <button className='btn add-file-btn'>
                <input className="import-img-input" title="Import image" type='file' onChange={(ev) => importImg(ev, 'img')} accept="image/*" />
                <BiImageAdd />
            </button>}
    </div>
}