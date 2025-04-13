import style from './TrainingsRef.module.css'
import Search from '../../assets/images/employees/Search.svg'
import add from '../../assets/images/employees/Application Add.svg'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from "axios";
import { useDispatch, useSelector } from 'react-redux'
import Cookies from 'js-cookie'
import { updateTabData } from '../../redux/slices/tabSlice'
import { setSmallLoading } from '../../redux/slices/loading'
import Swal from 'sweetalert2'

function TrainingsRef() {
    const [trainingsList, setTrainingsList] = useState(null);
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
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readTraining`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            dispatch(setSmallLoading(false))
            setAllDataArr(response.data.data)
            setTrainingsList(response.data.data.slice(startIndex, endIndex));
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
        setTrainingsList(allDataArr?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])

    const search = (event) => {
        if (event.target.value !== "") {
            console.log(event.target.value);

            const searchedList = allDataArr.filter((obj) =>

                obj.TrainingCode.includes(event.target.value) || obj.TrainingName.includes(event.target.value)
            )
            console.log(searchedList);
            setTrainingsList(searchedList);
        } else {
            setTrainingsList(allDataArr?.slice(startIndex, endIndex))
        }
    }


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


    return (
        <>


                <div className={style.searchbar}>
                    <div className={style.sec1}>
                        <img src={Search} alt="" />
                        <input autoComplete='off' onChange={search} type="text" placeholder='Search Training by name' />
                    </div>
                    {tabData?.Creation && (
                        <div className={style.sec2} onClick={() => {
                            dispatch(updateTabData({ ...tabData, Tab: 'addTraining' }));
                        }}>
                            <img src={add} alt="" />
                            <p>Add New</p>
                        </div>
                    )}
                </div>
                <div className={style.tableParent}>
                    {!trainingsList || trainingsList?.length === 0 ? (
                        <div className='w-100 d-flex align-items-center justify-content-center'>
                            <p className='text-center'>No any Records Available here.</p>
                        </div>
                    ) : (
                        <table className={style.table}>
                            <tr className={style.headers}>
                                {/* <td>Training ID</td> */}
                                <td>Training Name</td>
                                <td>Description</td>
                                <td>Evaluation Criteria </td>
                                <td>Documents</td>
                            </tr>
                            {
                                trainingsList?.map((training, i) => {
                                    return (
                                        <tr className={style.tablebody} key={i}>
                                            {/* <td ><p style={{
                                                backgroundColor: "#f0f5f0",
                                                padding: "2px 5px",
                                                borderRadius: "10px",
                                                fontFamily: "Inter",
                                                fontSize: "12px",
                                                fontStyle: "normal",
                                                fontWeight: "400",
                                                lineHeight: "20px",
                                            }}>{training.TrainingCode}</p></td> */}
                                            <td className={style.simpleContent}>{training.TrainingName}</td>
                                            <td>
                                                <p onClick={() => {
                                                    console.log("clicked")
                                                    setShowBox(true);
                                                    setDataToShow(training.Description)
                                                }} className={style.click}>View</p>
                                            </td>
                                            <td>
                                                <p onClick={() => {
                                                    setShowBox(true);
                                                    setDataToShow(training.EvaluationCriteria)
                                                }} className={style.click}>View</p>
                                            </td>
                                            <td>
                                                <button className='btn px-3 py-1 btn-outline-primary' onClick={() => { handleDownloadImage(training.TrainingMaterial) }} >Download</button>
                                            </td>
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
                            <p class={style.msg}>{dataToShow}</p>
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

export default TrainingsRef
