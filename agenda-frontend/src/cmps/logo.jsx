import { useNavigate } from 'react-router-dom'
import logoIcon from '../assets/icons/agenda-logo-color.svg'

export const Logo = () => {

    const navigate = useNavigate()

    return <div onClick={() => navigate('/')} className="logo">
        <img src={logoIcon} />
        <h1>agenda</h1>
    </div>
}