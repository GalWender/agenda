import { Component } from 'react'
import { eventBusService } from '../services/event-bus.service'
import { HiCheck } from 'react-icons/hi'
import { GrClose } from 'react-icons/gr'

export class UserMsg extends Component {

    removeEvent

    state = {
        msg: null
    }

    componentDidMount() {
        this.removeEvent = eventBusService.on('show-user-msg', (msg) => {
            this.setState({ msg })
            setTimeout(() => {
                this.setState({ msg: null })
            }, 3500)
        })
    }

    componentWillUnmount() {
        this.removeEvent()
    }

    render() {
        const { msg } = this.state
        if (!msg) return <></>
        const msgClass = msg.type || ''
        return (
            <section className={'user-msg ' + msgClass}>
                {msg.type === 'success' && <HiCheck />}
                {this.state.msg.txt}
                <button className='btn btn-svg btn-close-user-msg' onClick={() => { this.setState({ msg: null }) }}>
                <GrClose className='close-user-msg' />
                </button>
            </section>
        )
    }
}
