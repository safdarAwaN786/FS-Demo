import style from './Input.module.css'
import SideBar from '../../components/sidebar/SideBar'
import add from '../../assets/images/employees/Application Add.svg'
import ProfileUser from '../../components/profileUser/ProfileUser'
import Select from '../../components/select/Select'

function Input() {

    let data = [
        {
            trainName: 'Intro To Computing',

        },
        {
            trainName: 'Intro To Computing',

        },
        {
            trainName: 'Intro To Computing',

        },
        {
            trainName: 'Intro To Computing',

        },
        {
            trainName: 'Intro To Computing',

        },
        {
            trainName: 'Intro To Computing',

        },
        {
            trainName: 'Intro To Computing',

        },
        {
            trainName: 'Intro To Computing',

        },
    ]
    let next = 'Next page >>'
    return (
        <div className={style.parent}>
            <div className={style.sidebar}>
                <SideBar />
            </div>
            <ProfileUser />
            <div className={style.subparent}>
                <div className={style.searchbar}>
                    <div className={style.sec1}>
                        <Select name='Select a Year' data={['2020', '2021', '2022']} />
                        <Select name='Select a Month' data={['Januaury', 'Januaury', 'Januaury']} />
                    </div>
                    <div className={style.sec2}>
                        <img src={add} alt="" />
                        <p>Add New</p>
                    </div>
                </div>
                <div className={style.septrate}>
                    <div className={style.sec3}>
                        <img src={add} alt="" />
                        <p>Add New</p>
                    </div>
                </div>
                <div className={style.tableParent2}>
                    <table className={style.table}>
                        <tr className={style.headers}>
                            <td>Training Name</td>
                            <td>Week 1</td>
                            <td>Week 2</td>
                            <td>Week 3</td>
                            <td>Week 4</td>
                        </tr>
                        {
                            data.map((obj, i) => {
                                return (
                                    <tr className={style.tablebody} key={i}>
                                        <td>
                                            <p>{obj.trainName}</p>
                                        </td>
                                        <td>
                                            <input type="checkbox" />
                                        </td>
                                        <td>
                                            <input type="checkbox" />
                                        </td>
                                        <td>
                                            <input type="checkbox" />
                                        </td>
                                        <td>
                                            <input type="checkbox" />
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

export default Input
