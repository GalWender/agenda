import { Logo } from '../cmps/logo'
import { checkUsername, login, signup } from '../store/user/user.action'
import { useDispatch, useSelector } from 'react-redux'
import { Fragment, useEffect, useRef, useState } from 'react'
import { NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { useForm } from '../hooks/useForm'
import { ReactComponent as RightArrowSvg } from '../assets/icons/right-arrow.svg'
import { eventBusService } from '../services/event-bus.service'
import { MdDoNotDisturbAlt } from 'react-icons/md'


export const LoginSignup = () => {

  const params = useParams()
  const navigate = useNavigate()
  const loggedinUser = useSelector(store => store.userModule.loggedinUser)

  useEffect(() => {
    if (params['*'] !== 'login' && params['*'] !== 'signup') navigate('/auth/login')
    if (loggedinUser) navigate('/workspace/home')
  }, [params])

  return (
    <section className="login-signup">
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </section>
  )
}

const Signup = () => {

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [signupFields, handleSignupChange] = useForm({
    fullname: '',
    username: '',
    password: '',
  })

  const [validMail, setIsMailValid] = useState(null)

  const onUserSignup = (ev) => {
    ev.preventDefault()
    const { username } = signupFields
    const isMailValid = /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/.test(username)
    if (!validMail) return setIsMailValid(isMailValid)
    const user = signupFields
    user.imgUrl = 'profile-img-guest'
    dispatch(signup(signupFields))
    navigate('/workspace/home')
  }

  const { username, fullname, password } = signupFields
  return (
    <section className="signup">
      <div className="flex signup-split-container">
        <div className="signup-content-wrapper">
          <div className="signup-content">
            <div className="signup-titles">
              <h1 className="title">Welcome to agenda.com</h1>
              <h2 className="sub-title">Get started - it's free. No credit card needed.</h2>
            </div>
            <form className="flex column form form-user-login-signup"
              onSubmit={(ev) => onUserSignup(ev)}>
              {validMail !== true ?
                <Fragment>
                  <label className="label label-username" htmlFor="username">Enter email</label>
                  <input className={`input input-username ${validMail !== false ? '' : 'error'}`}
                    name="username"
                    type="text"
                    onFocus={() => setIsMailValid(null)}
                    value={username}
                    placeholder="name@company.com"
                    onChange={handleSignupChange} />
                  <div className={`mail-error ${validMail !== false ? '' : 'error'}`}>Please enter a valid email address</div>
                </Fragment>
                :
                <Fragment>
                  <label className="label label-fullname valid-mail" htmlFor="fullname">Full Name</label>
                  <input className="input input-fullname valid-mail"
                    name="fullname"
                    type="text"
                    value={fullname}
                    onChange={handleSignupChange}
                  />
                  <label className="label label-username valid-mail" htmlFor="password">Create a password</label>
                  <input className="input input-password valid-mail"
                    name="password"
                    type="password"
                    value={password}
                    onChange={handleSignupChange}
                  />
                </Fragment>
              }
              <input type="submit" hidden />
              <button className="btn btn-svg btn-next">Continue</button>
            </form>
            {validMail !== true &&
              <Fragment>
                <div className="flex justify-center align-center login-signup-separator split-line">
                  <span className="separator-line"></span>
                  <h2>OR</h2>
                  <span className="separator-line"></span>
                </div>
                {/* <button className="btn btn-login-google">
                  <img className="img img-login-logo" src="https://cdn.monday.com/images/logo_google_v2.svg" aria-hidden="true" alt="google" />
                  <span>Continue with Google</span>
                </button> */}
                <div className="suggest-signup">
                  <span className="suggest-signup-prefix">Already have an account?</span>
                  <NavLink to='/auth/login'>Log in</NavLink>
                </div>
              </Fragment>}
          </div>
        </div>
        <div className="side-img-wrapper">
          <div className="img-container">
            <img className="img" src="https://dapulse-res.cloudinary.com/image/upload/monday_platform/signup/soft-welcome.png" alt="welcome" />
          </div>
          <div className="side-text-wrapper side-text">
            Trusted by <b>152,000+</b> customers worldwide
          </div>
        </div>
      </div>
    </section>
  )
}

const Login = () => {

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [isUsernameVerified, setUserNameVerified] = useState(false)

  const [loginFields, handleLoginChange] = useForm({
    username: '',
    password: '',
  })

  const unsubscribeRef = useRef()

  useEffect(() => {
    unsubscribeRef.current = eventBusService.on('username-verify', (isVerified) => {
      setUserNameVerified(isVerified)
    })
    return () => { unsubscribeRef.current() }
  })

  useEffect(() => {
    if (isUsernameVerified === 'LOGGEDIN_SUCCESSFULLY') {
      navigate('/workspace/home')
    }
  })

  const onUserLogin = (ev) => {
    ev.preventDefault()
    const { username, password } = loginFields
    if (isUsernameVerified !== 'VERIFIED' && password === '') {
      dispatch(checkUsername(username))
    }
    if (isUsernameVerified === 'VERIFIED' || isUsernameVerified === 'INVALID_CREDS') {
      dispatch(login(loginFields))
    }
  }

  return (
    <Fragment>
      <Header />
      <section className="flex align-center column login">
        {isUsernameVerified === 'VERIFIED' ?
          <h1 className="title"><span>Log</span>In</h1> :
          <h1 className="title">Log in to your account</h1>}
        {isUsernameVerified === 'NOT_FOUND' &&
          <div className="flex align-center username-not-found">
            <div className="icon icon-svg"><MdDoNotDisturbAlt /></div>
            <div className="flex column align-center not-found-txt">
              <span className="msg">We couldn't find this email. Would you like to</span>
              <NavLink to='/auth/signup'>sign up instead?</NavLink>
            </div>
          </div>}
        {isUsernameVerified === 'INVALID_CREDS' &&
          <div className="flex align-center username-not-found">
            <div className="icon icon-svg"><MdDoNotDisturbAlt /></div>
            <div className="flex column align-center not-found-txt">
              <span className="msg">Invalid password</span>
            </div>
          </div>}
        <form className="flex column form form-user-login-signup"
          onSubmit={(ev) => onUserLogin(ev)}>
          {isUsernameVerified === 'VERIFIED' ?
            <label className="label-username verified" htmlFor="username">Email</label>
            :
            <label className="label-username" htmlFor="username">Enter your work email address</label>
          }
          <input className="input input-username"
            name="username"
            type="text"
            value={loginFields.username}
            placeholder="Example@company.com"
            onChange={handleLoginChange}
          />
          {(isUsernameVerified === 'VERIFIED' || isUsernameVerified === 'INVALID_CREDS') &&
            <Fragment>
              <label className="label-username verified" htmlFor="password">Password</label>
              <input className="input input-password"
                name="password"
                type="password"
                value={loginFields.password}
                placeholder="password"
                onChange={handleLoginChange}
              />
            </Fragment>
          }
          <input type="submit" hidden />
          {(isUsernameVerified === 'VERIFIED' || isUsernameVerified === 'INVALID_CREDS') ?
            <button className="btn btn-svg btn-next"><span>Log</span>In<RightArrowSvg /></button>
            :
            <button className="btn btn-svg btn-next">Next<RightArrowSvg /></button>
          }
        </form>
        {/* <div className="flex justify-center align-center login-signup-separator split-line">
          <span className="separator-line"></span>
          <h2>Or Sign in with</h2>
          <span className="separator-line"></span>
        </div>
        <button className="btn btn-login-google">
          <img className="img img-login-logo" src="https://cdn.monday.com/images/logo_google_v2.svg" aria-hidden="true" alt="" />
          <span>Google</span>
        </button> */}
        <div className="suggest-signup">
          <span className="suggest-signup-prefix">Don't have an account yet?</span>
          <NavLink to='/auth/signup'>Sign up</NavLink>
        </div>
      </section>
    </Fragment>
  )
}

const Header = () => {
  return (
    <header className="main-header main-layout full">
      <div className="main-header-container main-layout">
        <Logo />
      </div>
    </header>
  )
}