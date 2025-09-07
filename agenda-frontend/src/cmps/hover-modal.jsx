import { useEffect } from "react";

export const HoverModal = ({ task, modalHoverName, setModalHoverName, board, currMemberId }) => {
console.log('entered:')
    const closeModal = () => {
        setTimeout(() => {
            console.log('left:')
            setModalHoverName(null)
        }, 100);
    }

    useEffect(() => {
        document.body.addEventListener('click', closeModal)
        document.body.classList.add('pop-up-modal-open')
        return () => {
            document.body.removeEventListener('click', closeModal)
            document.body.classList.remove('pop-up-modal-open')
        }
    })

    switch (modalHoverName) {
        case 'FILE':
            return <section className='file-hover-modal'>
                <img src={task.files} alt="" />
                <h4>{task.title}</h4>
            </section>
        case 'MEMBER':
            return <section className="member-hover-modal">
                {GetMemberImgFromId(board, currMemberId)}
                <div className="container">
                    <h4 className="name">{getMemberNameFromId(board, currMemberId)}</h4>
                    <h4>{getMemberTasksFormId(board, currMemberId)} Assigned tasks</h4>
                </div>
            </section>

        default: return console.error('cannot open modal!')
    }
}

const GetMemberImgFromId = (board, memberId) => {
    const imgUrl = (memberId !== 'Guest') ?
        board.members.find(member => member._id === memberId).imgUrl : 'profile-img-guest'
    return <img key={memberId} className='profile-img-icon-hover' src={require(`../assets/img/${imgUrl}.png`)} alt="" />
}

const getMemberNameFromId = (board, memberId) => {
    return board.members.find(member => member._id === memberId).fullname
}

const getMemberTasksFormId = (board, memberId) => {
    const tasks = board.groups.map(group => group.tasks).flat()
    return tasks.reduce(
        (acc, task) => (task.memberIds?.includes(memberId)) ?
            acc + 1 : acc, 0)
}