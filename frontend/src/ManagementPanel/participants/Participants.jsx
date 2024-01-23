
import style from './Participants.module.css'
import Search from '../../assets/images/employees/Search.svg'
import add from '../../assets/images/employees/Application Add.svg'
import { useEffect, useState } from 'react'
import axios from "axios";
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setSmallLoading } from '../../redux/slices/loading';
import Swal from 'sweetalert2';

function Participants() {
    const [participantsList, setParticipantsList] = useState(null);
    const [showBox, setShowBox] = useState(false);
    const [dataToShow, setDataToShow] = useState(null);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const [allDataArr, setAllDataArr] = useState(null);
    const user = useSelector(state => state.auth.user);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();


    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-all-participants`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            setAllDataArr(response.data.data)
            setParticipantsList(response.data.data.slice(startIndex, endIndex));
            dispatch(setSmallLoading(false))
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon : 'error',
                title : 'OOps..',
                text : 'Something went wrong, Try Again!'
            })
        })
    }, [])


    const nextPage = () => {
        setStartIndex(startIndex + 8);
        setEndIndex(endIndex + 8);
    }

    const backPage = () => {
        setStartIndex(startIndex - 8);
        setEndIndex(endIndex - 8);
    }

    useEffect(() => {
        setParticipantsList(allDataArr?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])


    const search = (event) => {
        if (event.target.value !== "") {
            const searchedList = allDataArr.filter((obj) =>
                obj.ParticipantId.includes(event.target.value) || obj?.Name?.includes(event.target.value)
            )
            
            setParticipantsList(searchedList);
        } else {
            setParticipantsList(allDataArr?.slice(startIndex, endIndex))
        }
    }


    return (
        <>

            <>

                <div className={style.searchbar}>
                    <div className={style.sec1}>
                        <img src={Search} alt="" />
                        <input autoComplete='off' onChange={search} type="text" placeholder='Search Participant by name' />
                    </div>
                    {tabData?.Creation && (

                        <div className={style.sec2} onClick={() => {
                            dispatch(updateTabData({...tabData, Tab : 'addParticipant'}))
                            
                        }}>
                            <img src={add} alt="" />
                            <p>Add New</p>
                        </div>
                    )}
                </div>
                <div className={style.tableParent}>
                    {!participantsList || participantsList?.length === 0 ? (
                        <div className='w-100 d-flex align-items-center justify-content-center'>
                            <p className='text-center'>No any Records Available here.</p>
                        </div>
                    ) : (

                        <table className={style.table}>
                            <tr className={style.headers}>
                                <td>Participant ID</td>
                                <td>Name</td>
                                <td>Email</td>
                                <td>Designation</td>
                                <td>Contact No.</td>
                                <td>Department</td>
                                <td>Role in Team</td>

                            </tr>
                            {
                                participantsList?.map((participant, i) => {
                                    return (
                                        <tr className={style.tablebody} key={i}>
                                            <td ><p style={{
                                                backgroundColor: "#f0f5f0",
                                                padding: "2px 5px",
                                                borderRadius: "10px",
                                                fontFamily: "Inter",
                                                fontSize: "12px",
                                                fontStyle: "normal",
                                                fontWeight: "400",
                                                lineHeight: "20px",
                                            }}>{participant.ParticipantId}</p></td>
                                            <td className={style.simpleContent}>{participant.Name}</td>
                                            <td>{participant.Email}</td>
                                            <td>{participant.Designation}</td>
                                            <td>{participant.ContactNo}</td>
                                            <td>{participant.Department}</td>
                                            <td>{participant.RoleInTeam}</td>



                                        </tr>

                                    )

                                })
                            }
                        </table>
                    )}
                </div>
                <div className={style.Btns}>
                    {startIndex > 0 && (

                        <button onClick={backPage}>
                            {'<< '}Back
                        </button>
                    )}
                    {allDataArr?.length > endIndex && (

                        <button onClick={nextPage}>
                            next{'>> '}
                        </button>
                    )}
                </div>
            </>





            {
                showBox && (

                    <div class={style.alertparent}>
                        <div class={style.alert}>

                            <p class={style.msg}>{dataToShow}</p>

                            <div className={style.alertbtns}>

                                <button style={{
                                    marginLeft : '120px',
                                    marginTop : '25px'
                                }}  onClick={() => {
                                    setShowBox(false);

                                }} className={style.btn2}>OK</button>

                            </div>
                        </div>
                    </div>
                )
            }

        </>
    )
}

export default Participants
