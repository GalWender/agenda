import { Link } from "react-router-dom"
import fistBumpGif from '../assets/img/fist-bump.gif'

export const Inbox = () => {
    return <section className="inbox">
        <div>
            <h1>Inbox</h1>
            <p>Catch up on updates from all your boards. <Link>Learn more</Link></p>
        </div>
        <span className="inbox-toggle-mode"><a className="active">Open</a> / <a className="" id="inbox-all-updates-link">All Updates</a></span>
        <img src={fistBumpGif} width={320} height={320} alt="" />
        <p>Fist Bumb!</p>
        <p>Your inbox is empty, We'll let you know when we get news</p>
    </section>
}