
import style from './DecisionTreeMembers.module.css'
import Search from '../../assets/images/employees/Search.svg'
import { useEffect, useState } from 'react'
import axios from "axios";
import { BsArrowLeftCircle } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setSmallLoading } from '../../redux/slices/loading';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import { changeId } from '../../redux/slices/idToProcessSlice';

function DecisionTreeTeams() {

    const [teams, setTeams] = useState(null);
    const [showBox, setShowBox] = useState(false);
    const [dataToShow, setDataToShow] = useState(null);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const [decisionTree, setDecisionTree] = useState(null);
    const user = useSelector(state => state.auth?.user);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const idToWatch = useSelector(state => state.idToProcess);

    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-decision-tree/${idToWatch}`).then((response) => {
            setDecisionTree(response.data.data);
            setTeams(response.data.data?.ConductHaccp.Teams?.slice(startIndex, endIndex));
            dispatch(setSmallLoading(false))
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
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
        setTeams(decisionTree?.ConductHaccp.Teams?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])


    const search = (event) => {
        if (event.target.value !== "") {
            const searchedList = decisionTree?.ConductHaccp.Teams.filter((obj) =>
            obj.DocumentId.includes(event.target.value)
        )
            setTeams(searchedList);
        } else {
            setTeams(decisionTree?.ConductHaccp.Teams.slice(startIndex, endIndex))
        }
    }

   

    return (
        <>
            <div className='d-flex flex-row bg-white px-lg-5   px-2 py-2'>
                <BsArrowLeftCircle
                    role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                        {
                            dispatch(updateTabData({ ...tabData, Tab: 'Identify CCP/OPRP' }))
                        }
                    }} />
            </div>
            <div className={`${style.searchbar} mt-1`}>
                <div className={style.sec1}>
                    <img src={Search} alt="" />
                    <input autoComplete='off' onChange={search} type="text" placeholder='Search Member by name' />
                </div>
            </div>
            <div className={style.tableParent}>
                {!teams || teams?.length === 0 ? (
                    <div className='w-100 d-flex align-items-center justify-content-center'>
                        <p className='text-center'>No any Records Available here.</p>
                    </div>
                ) : (
                    <table className={style.table}>
                        <tr className={style.headers}>
                            <td>Team Id</td>
                            <td>Document Type</td>
                            <td>Created By</td>
                            <td>Creation Date</td>
                            <td>Members</td>
                        </tr>
                        {
                            teams?.map((team, i) => {
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
                                        }}>{team.DocumentId}</p></td>
                                        <td className={style.simpleContent}>{team.DocumentType}</td>
                                        <td>{team.CreatedBy}</td>
                                        <td>{dayjs(team.CreationDate).format('DD/MM/YYYY')}</td>
                                        <td><button onClick={() => {
                                            dispatch(changeId(team._id));
                                            dispatch(updateTabData({...tabData, Tab : 'decisionTreeTeamMembers'}))
                                        }} className='btn btn-outline-danger p-1 '>View</button></td>
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
                {decisionTree?.conductedHACCP?.Teams?.length > endIndex && (
                    <button onClick={nextPage}>
                        next{'>> '}
                    </button>
                )}
            </div>

            {
                showBox && (

                    <div class={style.alertparent}>
                        <div class={style.alert}>

                            <p class={style.msg}>{dataToShow}</p>

                            <div className={style.alertbtns}>

                                <button style={{
                                    marginLeft: '120px',
                                    marginTop: '25px'
                                }} onClick={() => {
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

export default DecisionTreeTeams
