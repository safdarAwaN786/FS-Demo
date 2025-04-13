import style from './Trainers.module.css'
import Search from '../../assets/images/employees/Search.svg'
import add from '../../assets/images/employees/Application Add.svg'
import { useEffect, useState } from 'react'
import axios from "axios";
import profile from '../../assets/images/addEmployee/prof.svg';
import { useDispatch, useSelector } from 'react-redux'
import { updateTabData } from '../../redux/slices/tabSlice'
import { changeId } from '../../redux/slices/idToProcessSlice';
import { setSmallLoading } from '../../redux/slices/loading';
import Swal from 'sweetalert2';


function Trainers() {
    const [trainersList, setTrainersList] = useState(null);
    const [popUpData, setPopUpData] = useState(null);
    const [showBox, setShowBox] = useState(false);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const [allDataArr, setAllDataArr] = useState(null);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);
    const handleDownloadImage = async (imageURL) => {
        try {
            if (imageURL) {

                dispatch(setSmallLoading(true))
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/download-image`, {
                    params: {
                        url: imageURL,
                    },
                    responseType: 'blob' // Specify the response type as 'blob' to handle binary data
                });


                let blob;

                blob = new Blob([response.data]);
                // }

                // Create a temporary anchor element
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);

                // Set the download attribute and suggested filename for the downloaded image
                link.download = `${user.Department.DepartmentName}-FSMS${imageURL.substring(imageURL.lastIndexOf('.'))}`;

                // Append the anchor element to the document body and click it to trigger the download
                document.body.appendChild(link);
                dispatch(setSmallLoading(false))
                link.click();
                // Clean up by removing the temporary anchor element
                document.body.removeChild(link);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'OOps..',
                    text: 'No any file uploaded here!'
                })
            }
        } catch (error) {
            dispatch(setSmallLoading(false))
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        }

    };
    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readTrainer`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            dispatch(setSmallLoading(false))
            setAllDataArr(response.data.data);
            setTrainersList(response.data.data.slice(startIndex, endIndex));
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
        setTrainersList(allDataArr?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])

    const search = (event) => {
        if (event.target.value !== "") {
            setTrainersList(allDataArr.filter((obj) =>
                obj.UserId.includes(event.target.value) || obj.Name.includes(event.target.value)
            ));
        } else {
            setTrainersList(allDataArr?.slice(startIndex, endIndex))
        }
    }

    return (
        <>
                <div className={style.searchbar}>
                    <div className={style.sec1}>
                        <img src={Search} alt="" />
                        <input autoComplete='off' onChange={search} type="text" placeholder='Search Trainer by name or id' />
                    </div>
                    {tabData.Creation && (
                        <div onClick={() => {
                            dispatch(updateTabData({ ...tabData, Tab: 'addTrainer' }));
                        }} className={style.sec2} >
                            <img src={add} alt="" />
                            <p>Add Trainer</p>
                        </div>
                    )}
                </div>
                <div className={style.tableParent2}>

                    {!trainersList || trainersList?.length === 0 ? (
                        <div className='w-100 d-flex align-items-center justify-content-center'>
                            <p className='text-center'>No any Records Available here.</p>
                        </div>
                    ) : (

                        <table className={style.table}>
                            <tr className={style.headers}>
                                {/* <td>Trainer Code</td> */}
                                <td>Name</td>
                                <td>Age</td>
                                <td>Email</td>
                                <td>Experience</td>
                                <td>Qualification</td>
                                <td>Speciality</td>
                                <td>Documents</td>
                                {/* <td>Action</td> */}
                                <td style={{width : '200px'}}>Action</td>
                            </tr>
                            {
                                trainersList?.map((trainer, i) => {
                                    return (
                                        <tr className={style.tablebody} key={i}>
                                            {/* <td>
                                                <p>{trainer.UserId}</p>
                                            </td> */}
                                            <td><div style={{
                                                width: "40px",
                                                height: "40px",
                                                borderRadius: "50%",
                                                overflow: "hidden",
                                                backgroundImage: `url(${profile})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                            }}>
                                                <img style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover"
                                                }} onError={(e) => {
                                                    e.target.style.display = 'none'; // Hide the img tag on error
                                                }} src={trainer.TrainerImage || profile} alt={profile} />

                                            </div>{trainer.Name}</td>
                                            <td>{trainer.Age}</td>
                                            <td>{trainer.Email}</td>
                                            <td>{trainer.Experience}</td>
                                            <td>{trainer.Qualification}</td>
                                            <td >
                                                <p style={{
                                                    cursor: "pointer"
                                                }} onClick={() => {
                                                    setPopUpData(trainer.Specialities);
                                                    setShowBox(true);
                                                }} className={style.view}>View</p>
                                            </td>
                                            <td >
                                                <button onClick={() => {
                                                    handleDownloadImage(trainer.TrainerDocument)
                                                }} style={{
                                                    cursor: "pointer"
                                                }} className={`${style.download} btn btn-outline-primary`}>Download</button>
                                            </td>

                                            {/* <td >
                                                <button style={{
                                                    cursor: "pointer"
                                                }} className={`${style.emailbtn} btn btn-outline-primary`}>Send Email</button>
                                            </td> */}
                                            <td style={{width : '200px'}}><a onClick={() => {
                                                dispatch(updateTabData({ ...tabData, Tab: 'assignTabsToTrainer' }));
                                                dispatch(changeId(trainer._id));
                                            }} type='button' className='btn btn-outline-success p-1'>Assign Tabs</a></td>
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
         

            {
                showBox && (

                    <div class={style.alertparent}>
                        <div class={style.alert}>
                        <div className='overflow-y-handler'>
                            <p class={style.msg}>{popUpData}</p>
                            </div>

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

export default Trainers
