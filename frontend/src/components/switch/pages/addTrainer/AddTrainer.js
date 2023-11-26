import SideBar from '../../components/sidebar/SideBar'
import style from './AddTrainer.module.css'
import edit from '../../assets/images/addEmployee/edit.svg'
import profile from '../../assets/images/addEmployee/prof.svg'
import ProfileUser from '../../components/profileUser/ProfileUser'

function AddTrainer() {
    return (
        <div className={style.parent}>
            <div className={style.sidebar}>
                <SideBar />
            </div>
            <div className={style.form}>
               <ProfileUser />
                <div className={style.headers}>
                    <div className={style.spans}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <div className={style.para}>
                        Add Trainer
                    </div>

                </div>
                <div className={style.profile}>
                    <img src={profile} alt="" />
                    <div>
                        <img src={edit} alt="" />
                    </div>
                </div>
                <div className={style.sec1}>
                    <div>
                        <input type="text" placeholder='Name here' />
                        <img style={{width:'20px',height:'20px',cursor:'pointer'}} src={profile} alt="" />
                    </div>
                    <div className={style.btns}>
                        <button>Upload Documents</button>
                        <button>Submit</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddTrainer
