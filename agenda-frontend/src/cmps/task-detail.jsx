import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { useSelector } from "react-redux"
import { addComment, loadTask, setTask, updateTask } from "../store/board/board.action"
import { ReactComponent as Like } from '../assets/icons/like.svg'
import { ReactComponent as Reply } from '../assets/icons/reply.svg'
import { ReactComponent as Clock } from '../assets/icons/clock.svg'
import { ReactComponent as Menu } from '../assets/icons/board-menu.svg'
import { ReactComponent as PersonAddIcon } from '../assets/icons/preson-add.svg'
import { ReactComponent as PersonRemoveIcon } from '../assets/icons/person-remove.svg'
import { ReactComponent as TimelineMenu } from "../assets/icons/timeline-menu.svg"
import { ReactComponent as StatusActivityIcon } from "../assets/icons/status-activity-icon.svg"
import { GrClose } from 'react-icons/gr'
import { FaPlusCircle } from "react-icons/fa"
import { MdArrowForwardIos } from "react-icons/md"
import { AiOutlineFontSize } from "react-icons/ai"
import moment from "moment"
import { utilService } from "../services/util.service"
import { useRef } from "react"
import confetti from 'canvas-confetti'
import { TaskTimeline } from "./task-timeline"
import { PopUpModal } from "./pop-up-modal"


export const TaskDetail = () => {

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const task = useSelector(state => state.boardModule.task)
    const board = useSelector(state => state.boardModule.board)
    const [whichRenders, setWhichRenders] = useState('isUpdates')
    const params = useParams()
    const [searchParams] = useSearchParams()
    const groupId = searchParams.get('groupId')
    const taskId = searchParams.get('taskId')
    const boardId = params.boardId
    const [modalName, setModalName] = useState(null)

    useEffect(() => {
        dispatch(loadTask(taskId))
        return (() => dispatch(setTask(null)))
    }, [taskId])

    const closeTaskDetail = () => {
        window.location.href = (window.location.toString().includes('kanban')) ?
            `/#/workspace/board/kanban/${boardId}` :
            `/#/workspace/board/${boardId}`
    }


    const onSetTaskPersonMenuOpen = () => {
        setTimeout(() => {
            setModalName('TASK_DETAIL_PERSON_MENU')
        }, 100);
    }

    if (!task) return
    return <section className='task-detail'>
        <button className="btn btn-svg btn-svg-x" onClick={() => closeTaskDetail()}><GrClose /></button>
        <div className='task-detail-header'>
            <div className='task-detail-header-top'>
                <h3>{task.title}</h3>
                <div className='task-detail-member-container'>
                    <button className="btn btn-add-developer" onClick={() => onSetTaskPersonMenuOpen()}>
                        <FaPlusCircle />
                    </button>
                    {modalName && <PopUpModal setModalName={setModalName} modalName={modalName} task={task} group={{ id: groupId }} board={board} />}
                    {task.memberIds && task.memberIds.map(memberId => GetMemberImgFromId(board, memberId))}
                </div>
            </div>
            <div className='task-detail-header-bottom'>
                <button onClick={() => setWhichRenders('isUpdates')}><span>Updates</span></button>
                {/* <button onClick={() => setWhichRenders('isFiles')}><span>Files</span></button> */}
                <button onClick={() => setWhichRenders('isActivity')}><span>Activity Log</span></button>
            </div>
        </div>
        {(whichRenders === 'isUpdates' && task) && <TaskDetailUpdates task={task} groupId={groupId} board={board} />}
        {/* {whichRenders === 'isFiles' && <TaskDetailFiles />} */}
        {whichRenders === 'isActivity' && <TaskDetailActivity task={task} group={{ id: groupId, style: "clr13" }} board={board} />}
    </section>
}


const TaskDetailUpdates = ({ task, groupId, board }) => {
    const [isChatOpen, setIsChatOpen] = useState(false)
    return <section className='task-detail-updates'>
        {!isChatOpen && <button className='chat-box-closed' onClick={() => setIsChatOpen(true)}><span>Write an update...</span></button>}
        {isChatOpen && <ChatBox setIsChatOpen={setIsChatOpen} task={task} groupId={groupId} board={board} />}
        {task.comments && task.comments.map(comment =>
            <Post key={comment.id} comment={comment} board={board} task={task} groupId={groupId} byMember={comment.byMember} txt={comment.txt} createdAt={comment.createdAt} />
        )}
    </section>
}

const TaskDetailFiles = () => {
    return <section className='task-detail-files'>
    </section>
}

const TaskDetailActivity = ({ task, group, board }) => {
    const makeClass = (status) => {
        if (!status) return
        return status.split(' ').join('')
    }

    return <section className='task-detail-activity'>

        {task.activities?.map(activity => {
            let title
            let info
            switch (activity.type) {
                case 'add member':
                    title = <span className="activity-type"> <PersonAddIcon /> Added</span>
                    info = <span className="activity-status">
                        <img className="profile-img-icon" src={require(`../assets/img/${activity.data.imgUrl}.png`)} alt='profile img' />
                        {activity.data.fullname}
                    </span>

                    break;
                case 'remove member':
                    title = <span className="activity-type"> <PersonRemoveIcon /> Removed</span>
                    info = <span className="activity-status">
                        <img className="profile-img-icon" src={require(`../assets/img/${activity.data.imgUrl}.png`)} alt='profile img' />
                        {activity.data.fullname}
                    </span>

                    break;
                case 'status':
                    title = <span className="activity-type"> <StatusActivityIcon /> Status</span>
                    info = <span className={"activity-status clr " + makeClass(activity.data)}>
                        {activity.data}
                    </span>

                    break;
                case 'priority':
                    title = <span className="activity-type"> <StatusActivityIcon /> Priority</span>
                    info = <span className={"activity-status clr " + makeClass(activity.data)}>
                        {activity.data}
                    </span>

                    break;
                case 'title':
                    title = <span className="activity-type"> <AiOutlineFontSize /> Name</span>
                    info = <span className="activity-status">
                        {activity.data}
                    </span>

                    break;
                case 'timeline':
                    title = <span className="activity-type"><TimelineMenu /> Timeline</span>
                    info = <span className="task-preview-timeline">
                        <TaskTimeline task={{ ...task, timeline: activity.data }} group={group} board={board} isReadOnly={true} />
                    </span>

                    break;

                default:
                    break;
            }

            return <div key={activity.id} className="activity-container">
                <span className="activity-time"><Clock /> {getFormattedDateTime(activity.createdAt)}</span>
                <span className="activity-by">
                    <img className='profile-img-icon' src={require(`../assets/img/${activity.byMember.imgUrl}.png`)} alt='profile img' />
                    {activity.byMember.fullname}
                </span>
                <span className="activity-type">{title}</span>
                <MdArrowForwardIos className="svg arrow-right-activity" />
                {info}
            </div>
        })}
    </section>
}

const getFormattedDateTime = (date) => {
    if (!date) return
    moment.updateLocale('en', {
        relativeTime: {
            s: 'now',
            ss: '%ds',
            mm: "%dm",
            m: "%dm",
            hh: "%dh",
            h: "%dh",
            dd: "%dd",
            d: "%dd",
            ww: "%dw",
            w: "%dw",
            MM: "%dm",
            M: "%dm",
            yy: "%dy",
            y: "%dy",
        }
    });
    return moment(date).fromNow(true)
}


const Post = ({ comment, board, task, groupId, byMember, txt, createdAt }) => {
    const dispatch = useDispatch()
    const commentIdx = task.comments.findIndex(currComment => currComment.id === comment.id)
    const loggedinUser = useSelector(state => state.userModule.loggedinUser)
    const likeRef = useRef()
    const [modalName, setModalName] = useState(null)
    const [isReplyOpen, setIsReplyOpen] = useState(false)


    const getIsCommentLiked = () => {
        // Determine current user id (logged-in or persistent guest)
        const userId = loggedinUser?._id || localStorage.getItem('guestUserId')
        const idxLiked = comment?.likes?.findIndex(currLike => currLike.id === userId)
        return (idxLiked !== -1 && idxLiked !== undefined)
    }

    const animateLike = (ev) => {
        // Build user identity (logged-in or persistent guest)
        let user = loggedinUser
        if (!user) {
            const guestId = localStorage.getItem('guestUserId') || utilService.makeId()
            localStorage.setItem('guestUserId', guestId)
            user = { _id: guestId, fullname: 'Guest', imgUrl: 'profile-img-guest' }
        }
        const idxLiked = comment?.likes?.findIndex(currLike => currLike.id === user._id)
        if (idxLiked !== -1 && idxLiked !== undefined) {
            comment.likes?.splice(idxLiked, 1)
            dispatch(updateTask({ task, groupId, boardId: board._id }))
            return
        }

        likeRef.current.classList.add('wobble-ver-left')
        confetti({
            particleCount: 150,
            spread: 60,
            origin: {
                x: ev.pageX / window.innerWidth,
                y: ev.pageY / window.innerHeight,
            }
        })

        setTimeout(() => {
            likeRef.current.classList.remove('wobble-ver-left')
        }, 1300)

        let like = { fullname: user.fullname, imgUrl: user.imgUrl, id: user._id || '' }

        if (!comment.likes) comment.likes = [like]
        else comment.likes.unshift(like)

        task.comments.splice(commentIdx, 1, comment)
        dispatch(updateTask({ task, groupId, boardId: board._id }))
    }

    const openPostMenu = () => {
        setTimeout(() => {
            setModalName('TASK_DETAIL_POST_MENU')
        }, 100);
    }

    const onReplyToComment = () => {
        // comment.isReplyOpen = true
        // task.comments[commentIdx] = comment
        // dispatch(updateTask({ task, groupId, boardId: board._id }))
        setIsReplyOpen(true)
    }


    return <section className='post'>
        <div className="post-header">
            <div className='img-container'>
                <img className='profile-img-icon' src={require(`../assets/img/${byMember.imgUrl}.png`)} alt='profile img' />
                <p className="fullname">{byMember.fullname}</p>
            </div>
            <div className="time-menu-container">
                <p><Clock />{getFormattedDateTime(createdAt)}</p>
                <button onClick={() => openPostMenu()} className="btn btn-svg btn-menu"><Menu /></button>
            </div>
            {modalName && <PopUpModal setModalName={setModalName} modalName={modalName} task={task} group={{ id: groupId }} board={board} comment={comment} />}
        </div>
        <p className="comment-txt">{txt}</p>
        <div className="likes-container">
            <div className="img-container">
                {comment.likes && comment.likes.map((like, idx) => <img key={idx} className='profile-img-icon' src={require(`../assets/img/${like.imgUrl}.png`)} alt='profile img' />)}
            </div>
            <p>{comment.likes?.length > 0 ? 'Likes' : ''}</p>
        </div>
        <div className="reply-like-container">
            <div className="like-container">
                <button onClick={(ev) => animateLike(ev)} className={`btn-svg btn-like ${getIsCommentLiked() ? 'liked' : ''}`}><Like ref={likeRef} />Like</button>
            </div>
            <div className="reply-container">
                <button onClick={() => onReplyToComment()} className="btn btn-svg btn-reply"><Reply />Reply</button>
            </div>
        </div>
        {(isReplyOpen || comment?.replies?.length > 0) && <CommentReply comment={comment} commentIdx={commentIdx} task={task} groupId={groupId} board={board} />}
    </section>
}

const GetMemberImgFromId = (board, memberId) => {
    if (!board) return
    const imgUrl = board.members.find(member => member._id === memberId).imgUrl
    return <img key={memberId} className='profile-img profile-img-icon' src={require(`../assets/img/${imgUrl}.png`)} alt="" />
}

const ChatBox = ({ setIsChatOpen, task, groupId, board }) => {

    const dispatch = useDispatch()
    const textAreaRef = useRef()
    const [newText, setNewText] = useState('')
    const loggedinUser = useSelector(state => state.userModule.loggedinUser)

    const postComment = () => {
        let updatedTask
        // Build user identity (logged-in or persistent guest)
        let user = loggedinUser
        if (!user) {
            const guestId = localStorage.getItem('guestUserId') || utilService.makeId()
            localStorage.setItem('guestUserId', guestId)
            user = { _id: guestId, fullname: 'Guest', imgUrl: 'profile-img-guest' }
        }
        const comment = { id: utilService.makeId(), txt: newText, createdAt: Date.now(), byMember: { _id: user._id, fullname: user.fullname, imgUrl: user.imgUrl } }
        if (!task.comments) {
            updatedTask = { ...task, comments: [comment] }
            task.comments = [comment]
        }
        else {
            updatedTask = { ...task, comments: [comment, ...task.comments] }
            task.comments.unshift(comment)
        }
        setIsChatOpen(false)
        textAreaRef.current.value = ''
        dispatch(addComment({ task: updatedTask, groupId, boardId: board._id }))
    }

    return <section className="chat-box-open">
        <textarea autoFocus className="chat-box" ref={textAreaRef} onBlur={(ev) => !ev.target.value ? setIsChatOpen(false) : ''} onChange={(ev) => setNewText(ev.target.value)}></textarea>
        <button className="update-comment-btn" onClick={() => postComment()}>Update</button>
    </section>
}

const ReplyBox = ({ comment, commentIdx, task, groupId, board }) => {
    const dispatch = useDispatch()
    const textAreaRef = useRef()
    const [newText, setNewText] = useState('')
    const loggedinUser = useSelector(state => state.userModule.loggedinUser)

    const postReply = () => {
        // Build user identity (logged-in or persistent guest)
        let user = loggedinUser
        if (!user) {
            const guestId = localStorage.getItem('guestUserId') || utilService.makeId()
            localStorage.setItem('guestUserId', guestId)
            user = { _id: guestId, fullname: 'Guest', imgUrl: 'profile-img-guest' }
        }
        const reply = { id: utilService.makeId(), txt: newText, createdAt: Date.now(), byMember: { _id: user._id, fullname: user.fullname, imgUrl: user.imgUrl } }
        if (!comment.replies) {
            comment.replies = [reply]
            task.comments.splice(commentIdx, 1, comment)
        }
        else {
            comment.replies.unshift(reply)
            task.comments.splice(commentIdx, 1, comment)
        }
        textAreaRef.current.value = ''
        dispatch(addComment({ task, groupId, boardId: board._id }))
    }

    return <section className="reply-box">
        <textarea className="reply-textarea" ref={textAreaRef} onChange={(ev) => setNewText(ev.target.value)}></textarea>
        <button className="update-reply-btn" onClick={() => postReply()}>Reply</button>
    </section>
}

const CommentReply = ({ comment, task, commentIdx, groupId, board }) => {
    return <section className="comment-replies">
        {comment.replies && comment.replies.map(reply => <div className="comment-reply" key={reply.id}>
            <img className='profile-img-icon' src={require(`../assets/img/${reply.byMember.imgUrl}.png`)} alt="" />

            <div className="member-info-reply-container">
                <p className="member-fullname">{reply.byMember.fullname}</p>
                <p className="member-reply">{reply.txt}</p>
            </div>
        </div>)}
        <ReplyBox comment={comment} commentIdx={commentIdx} task={task} groupId={groupId} board={board} />
    </section>
}


