import SideBar from '../../components/sidebar/SideBar'
import style from './ComputTraining.module.css'
import search from '../../assets/images/employees/Search.svg'
import add from '../../assets/images/employees/Application Add.svg'
import avatar from '../../assets/images/employees/Avatar.png'
import ProfileUser from '../../components/profileUser/ProfileUser'


function ComputTraining() {
    let data = [
        'Intro To Computing',
        'Intro To Computing',
        'Intro To Computing',
        'Intro To Computing',
        'Intro To Computing',
        'Intro To Computing',
        'Intro To Computing',
        'Intro To Computing',
    ]
    let next = 'Next page >>'
    return (
        <div className={style.parent}>
            <div className={style.sidebar}>
                <SideBar />
            </div>
            <div className={style.subparent}>
                <ProfileUser />
                <div className={style.searchbar}>
                    <div className={style.sec1}>
                        <img src={search} alt="" />
                        <input type="text" placeholder='Search Employee by name or id' />
                    </div>
                    <div className='d-flex'>
                        <button className={style.bluebtn}>
                            Planned Trainings
                        </button>
                        <div className={style.sec2}>
                            <img src={add} alt="" />
                            <p>Add New</p>
                        </div>
                    </div>
                </div>
                <div className={style.tableParent}>

                    <table className={style.table}>
                        <tr className={style.headers}>
                            <td>Employee Code</td>
                            <td>Name</td>
                            <td>CNIC</td>
                            <td>Phone Number</td>
                        </tr>
                        {
                            data.map((employee, i) => {
                                return (
                                    <tr className={style.tablebody} key={i}>
                                        <td className={style.simpleContent}>{i}</td>
                                        <td className={style.simpleContent}>{employee}</td>
                                        <td className={style.click}>Click Here
                                        </td>
                                        <td className={style.click}>Click Here
                                        </td>
                                    </tr>
                                )

                            })
                        }
                    </table>
                </div>
                <div className={style.next}>
                    <button>
                        {next}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ComputTraining
