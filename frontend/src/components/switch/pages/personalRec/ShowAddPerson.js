import ProfileUser from '../../components/profileUser/ProfileUser'
import style from './ShowAddPersom.module.css'
import SideBar from '../../components/sidebar/SideBar'

function ShowAddPersom() {
    return (
        <div className={style.parent}>
            <div className={style.sidebar}>
                <SideBar />
            </div>
            <ProfileUser />
            <div className={style.subparent}>
                <div className={style.formDivider}>
                    <div className={style.sec1}>
                        <div className={style.headers}>
                            <div className={style.spans}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            <div className={style.para}>
                                Employee Details
                            </div>
                        </div>

                        <div className={style.card1bodyp}>
                            <div className={style.card1body}>
                                <div style={{ width: '70%', }} className='d-flex justify-content-start align-items-start'>
                                    <p className={style.paraincard}>Station</p>
                                </div>
                                <div className={style.inputp}>
                                    <input type="text" value='New York' />
                                </div>
                            </div>
                            <div className={style.card1body}>
                                <div style={{ width: '70%', }} className='d-flex justify-content-start align-items-start'>
                                    <p className={style.paraincard}>Job Title</p>
                                </div>
                                <div className={style.inputp}>
                                    <input type="text" value='Software Engineer' />
                                </div>
                            </div>
                            <div className={style.card1body}>
                                <div style={{ width: '70%', }} className='d-flex justify-content-start align-items-start'>
                                    <p className={style.paraincard}>Department</p>
                                </div>
                                <div className={style.inputp}>
                                    <input type="text" value='Computer Science' />
                                </div>
                            </div>
                            <div className={style.card1body}>
                                <div style={{ width: '70%', }} className='d-flex justify-content-start align-items-start'>
                                    <p className={style.paraincard}>Section</p>
                                </div>
                                <div className={style.inputp}>
                                    <input type="text" value='Senior' />
                                </div>
                            </div>
                            <div className={style.card1body}>
                                <div style={{ width: '70%', }} className='d-flex justify-content-start align-items-start'>
                                    <p className={style.paraincard}>Supervisor</p>
                                </div>
                                <div className={style.inputp}>
                                    <input type="text" value='Muhammad Ali' />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={style.sec2}>
                        <div className={style.sec1p1}>
                            <div className={style.headers}>
                                <div className={style.spans}>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                                <div className={style.para}>
                                    Employement Terms
                                </div>
                            </div>
                            <div className={style.term}>
                                <p>Permanent</p>
                            </div>

                        </div>
                        <div className={style.sec1p2}>
                            <div className={style.headers}>
                                <div className={style.spans}>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                                <div className={style.para}>
                                    Salary
                                </div>

                            </div>
                            <div className={style.card1bodyp}>
                                <div className={style.card1body}>
                                    <div style={{ width: '70%', }} className='d-flex justify-content-start align-items-start'>
                                        <p className={style.paraincard}>Cross Salary</p>
                                    </div>
                                    <div className={style.inputp}>
                                        <input type="text" />
                                    </div>
                                </div>
                                <div className={style.card1body}>
                                    <div style={{ width: '70%', }} className='d-flex justify-content-start align-items-start'>
                                        <p className={style.paraincard}>Next Salary</p>
                                    </div>
                                    <div className={style.inputp}>
                                        <input type="text" />
                                    </div>
                                </div>
                            <p className={style.salary}>Basic Salary</p>
                            </div>

                        </div>
                    </div>
                </div>
                <div className={style.btn}>
                    <button>Next Page</button>
                </div>
            </div>
        </div>
    )
}

export default ShowAddPersom
