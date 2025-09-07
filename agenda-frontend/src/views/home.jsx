import { useSelector } from 'react-redux'
import { NavLink, useNavigate } from 'react-router-dom'
import bgImg from '../assets/img/home-bg-img.jpg'
import { Logo } from '../cmps/logo'
import { BsStars } from 'react-icons/bs'



export const Home = () => {

    const navigate = useNavigate()

    const moveToWorkspace = () => {
        navigate(`/workspace/home`)
    }

    return (
        <section className="home">
            <Header />
            <div className="home-bg-div">
                <img className='bg-img' src={bgImg} alt='stars' />
                <div className="home-hero main-layout">
                    <h2>A platform for company
                        <br />tasks managment
                    </h2>
                    <button onClick={moveToWorkspace} className="btn-get-started-big">Get Started
                        <div className='svg svg-icon arrow-right'>
                            <svg width="10" height="14" viewBox="0 0 9 7" ><path fillRule="evenodd" clipRule="evenodd" d="M4.628.616a.5.5 0 1 0-.64.768L6.203 3.23H.5a.5.5 0 0 0 0 1h5.612L3.988 6a.5.5 0 1 0 .64.769l3.23-2.693a.5.5 0 0 0 0-.768L4.628.616z"></path></svg>
                        </div>
                    </button>
                    <p className='home-btn-txt'>Free use, no limit <BsStars /> Start your own agenda </p>
                </div>
            </div>
            <Footer />
        </section>
    )
}

const Header = () => {
    const loggedinUser = useSelector(state => state.userModule.loggedinUser)
    const navigate = useNavigate()
    return (
        <header className="main-header">
            <div className="main-header-container main-layout">
                <Logo />
                <nav className="header-nav">
                    {!loggedinUser && <NavLink to="/auth/login">Log in</NavLink>}
                    <button className="btn-get-started" onClick={() => navigate(`/workspace/home`)}>
                        Get Started
                        <div className='svg svg-icon arrow-right'>
                            <svg width="10" height="14" viewBox="0 0 9 7" ><path fillRule="evenodd" clipRule="evenodd" d="M4.628.616a.5.5 0 1 0-.64.768L6.203 3.23H.5a.5.5 0 0 0 0 1h5.612L3.988 6a.5.5 0 1 0 .64.769l3.23-2.693a.5.5 0 0 0 0-.768L4.628.616z"></path></svg>
                        </div>
                    </button>
                </nav>
            </div>
        </header>
    )
}

const Footer = () => {
    return <footer className="main-footer">
        <Logo />
    </footer>
}
