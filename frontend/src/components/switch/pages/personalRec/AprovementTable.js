import SideBar from '../../components/sidebar/SideBar'
import style from './AprovementTable.module.css'
import search from '../../assets/images/employees/Search.svg'
import add from '../../assets/images/employees/Application Add.svg'
import ProfileUser from '../../components/profileUser/ProfileUser'


function AprovementTable() {
    let sample = {
        trainingName: 'Intro To Computing',
        venue: 'Jphar Hall',
        month: 'Januaury',
        duration: '3 weeks',
        department: 'IT',
        Time: '2:00 to 4:00 PM',
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
                            <td>Training Name</td>
                            <td>Venue</td>
                            <td>Duration</td>
                            <td>Month</td>
                            <td>Time</td>
                            <td>Department</td>
                            <td>Action</td>
                            <td>Action</td>
                        </tr>
                        {
                            data.map((employee, i) => {
                                return (
                                    <tr className={style.tablebody} key={i}>
                                        <td className={style.textStyle1}>{employee.trainingName}</td>
                                        <td className={style.textStyle2}>{employee.venue}</td>
                                        <td className={style.textStyle3}>{employee.duration}</td>
                                        <td className={style.textStyle3}>{employee.month}</td>
                                        <td className={style.textStyle3}>{employee.Time}</td>
                                        <td className={style.textStyle3}>{employee.department}</td>
                                        <td ><button className={style.viewBtn}>View</button>
                                        </td>
                                        <td ><button className={style.orangebtn}>Assign training</button>
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

export default AprovementTable
