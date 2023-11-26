import SideBar from '../../components/sidebar/SideBar'
import style from './AprovementTable2.module.css'
import search from '../../assets/images/employees/Search.svg'
import add from '../../assets/images/employees/Application Add.svg'
import ProfileUser from '../../components/profileUser/ProfileUser'


function AprovementTable2() {
    let sample = {
        station: 'New York',
        jobTitle: 'Software Engineer',
        Supervisor: 'Taskeen',
        department: 'Taskeen',
    }
    let data = [
        sample,
        sample,
        sample,
        sample,
        sample,
        sample,
        sample,
        sample,
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
                        <div className={style.sec2}>
                            <img src={add} alt="" />
                            <p>Add New</p>
                        </div>
                    </div>
                </div>
                <div className={style.tableParent}>

                    <table className={style.table}>
                        <tr className={style.headers}>
                            <td>Station</td>
                            <td>job title</td>
                            <td>Supervisor</td>
                            <td>Department</td>
                            <td>Action</td>
                            <td></td>
                            <td></td>
                        </tr>
                        {
                            data.map((employee, i) => {
                                return (
                                    <tr className={style.tablebody} key={i}>
                                        <td className={style.textStyle2}>{employee.station}</td>
                                        <td className={style.textStyle3}>{employee.jobTitle}</td>
                                        <td className={style.textStyle3}>{employee.Supervisor}</td>
                                        <td className={style.textStyle3}>{employee.department}</td>
                                        <td ><button className={style.viewBtn}>View</button>
                                        </td>
                                        <td >
                                            <button className={style.viewBtn2}>Approve</button>
                                            <button className={style.orangebtn}>Disapprove</button>
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

export default AprovementTable2
