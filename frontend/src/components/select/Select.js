import style from './Select.module.css'
import arrow from '../../assets/images/addEmployee/arrow.svg'
import { useState } from 'react'
function Select(props) {
    const [isOpen, setisOpen] = useState(false)
    const toggle = () => {
        setisOpen(!isOpen)
    }

    return (
        <div className={style.parent} onClick={toggle}>
            <p >{props.name}</p>
            <img className={isOpen ? style.rotater : style.norotater} src={arrow} alt="" />
            {
                isOpen ? <div className={style.opts}>
                    {props.data.map((opt, i) => {
                        return (
                            <p key={i}>{opt}</p>
                        )
                    })}
                </div> : null
            }

        </div>
    )
}

export default Select
