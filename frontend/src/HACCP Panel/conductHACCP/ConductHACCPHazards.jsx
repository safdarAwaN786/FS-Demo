
import style from './AddHACCPRiskAssessment.module.css'
import { useEffect, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { BsArrowLeftCircle } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setSmallLoading } from '../../redux/slices/loading';
import html2pdf from 'html2pdf.js';

const formatDate = (date) => {
    const newDate = new Date(date);
    const formatDate = newDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
    return formatDate;
}

function ConductHACCPHazards() {

    const [dataToSend, setDataToSend] = useState(null);
    const [alert, setalert] = useState(false);
    const [teamsToShow, setTeamsToShow] = useState(null);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const [selectedProcess, setSelectedProcess] = useState(null);
    const alertManager = () => {
        setalert(!alert)
    }
    const user = useSelector(state => state.auth?.user);
    const idToWatch = useSelector(state => state.idToProcess);


    const downloadPDF = async () => {
        var element = document.getElementById('printable');
        var opt = {
            margin: [1.3, 0, 0, 0],
            filename: `${user.Department.DepartmentName}-doc.pdf`,
            enableLinks: false,
            pagebreak: { mode: 'avoid-all' },
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 4 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().from(element).set(opt).toPdf().get('pdf').then(async function (pdf) {
            pdf.insertPage(1);

            var totalPages = pdf.internal.getNumberOfPages();
            //print current pdf width & height to console
            console.log("getHeight:" + pdf.internal.pageSize.getHeight());
            console.log("getWidth:" + pdf.internal.pageSize.getWidth());
            for (var i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFillColor(0, 0, 0);
                if (i === 1) {
                    try {
                        console.log(user.Company.CompanyLogo);
                        const response = await fetch(user.Company.CompanyLogo);
                        const blob = await response.blob();
                        const imageBitmap = await createImageBitmap(blob);
                        // create a canvas element and draw the image bitmap on it
                        const canvas = document.createElement('canvas');
                        canvas.width = imageBitmap.width;
                        canvas.height = imageBitmap.height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(imageBitmap, 0, 0);
                        // get the data URL of the canvas
                        const dataURL = canvas.toDataURL('image/jpeg');
                        // pass the data URL to the pdf.addImage method
                        pdf.addImage(dataURL, 'JPEG', 1, 2.5, 3, 3);
                        pdf.setFontSize(20);
                        pdf.text(`Company : ${user.Company.CompanyName}`, (1), (pdf.internal.pageSize.getHeight() / 2));
                        pdf.setFontSize(15)
                        pdf.text(`Address : ${user.Company.Address}`, (1), (pdf.internal.pageSize.getHeight() / 2) + 0.5);
                        pdf.setLineWidth(0.1); // Example line width
                        pdf.line(0.1, (pdf.internal.pageSize.getHeight() / 2) + 1, pdf.internal.pageSize.getWidth() - 0.2, (pdf.internal.pageSize.getHeight() / 2) + 1)
                        pdf.text("Document Id", 1, (pdf.internal.pageSize.getHeight() / 2) + 1.5);
                        pdf.text(`${dataToSend.DocumentId}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 1.5);
                        pdf.text("Created By", 1, (pdf.internal.pageSize.getHeight() / 2) + 1.8);
                        pdf.text(`${dataToSend.CreatedBy}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 1.8);
                        pdf.text("Creation Date", 1, (pdf.internal.pageSize.getHeight() / 2) + 2.1);
                        pdf.text(`${formatDate(dataToSend.CreationDate)}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 2.1);
                        pdf.text("Revision Number", 1, (pdf.internal.pageSize.getHeight() / 2) + 2.4);
                        pdf.text(`${dataToSend.RevisionNo}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 2.4);
                        if (dataToSend.Status == 'Approved') {

                            pdf.text("Approved By", 1, (pdf.internal.pageSize.getHeight() / 2) + 2.7);
                            pdf.text(`${dataToSend.ApprovedBy}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 2.7);
                            pdf.text("Approval Date", 1, (pdf.internal.pageSize.getHeight() / 2) + 3.0);
                            pdf.text(`${formatDate(dataToSend.ApprovalDate)}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 3.0);
                        }
                        if (dataToSend.ReviewedBy) {

                            pdf.text("Reviewed By", 1, (pdf.internal.pageSize.getHeight() / 2) + 3.3);
                            pdf.text(`${dataToSend.ReviewedBy}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 3.3);
                            pdf.text("Reviewed Date", 1, (pdf.internal.pageSize.getHeight() / 2) + 3.6);
                            pdf.text(`${formatDate(dataToSend.ReviewDate)}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 3.6);
                        }
                    } catch (error) {
                        console.log(error);
                    }
                } else {
                    pdf.setFontSize(15)
                    pdf.text('Powered By Feat Technology', (pdf.internal.pageSize.getWidth() / 2) - 1.3, 0.5);
                    pdf.setFontSize(10);
                    pdf.text(`${user.Company.CompanyName}`, pdf.internal.pageSize.getWidth() - 2, 0.3);
                    pdf.text('HACCP Risk Assessment', pdf.internal.pageSize.getWidth() - 2, 0.5);
                    pdf.text(`${dataToSend.DocumentId}`, pdf.internal.pageSize.getWidth() - 2, 0.7);
                    pdf.text(`Revision No :${dataToSend.RevisionNo}`, pdf.internal.pageSize.getWidth() - 2, 0.9);
                    pdf.text(`Creation : ${formatDate(dataToSend.CreationDate)}`, pdf.internal.pageSize.getWidth() - 2, 1.1);
                }
            }
        }).save();

    };


    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-conduct-haccp/${idToWatch}`).then((res) => {
            setDataToSend(res.data.data)
            dispatch(setSmallLoading(false));
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
    }, [])


    useEffect(() => {
        if (selectedProcess) {
            let hazardsArray = []
            console.log(selectedProcess);
            selectedProcess.ProcessDetails?.map((processObj) => {
                const { _id, subProcesses, ...rest } = processObj; // Extract _id property
                hazardsArray.push({ ...rest, type: 'Biological', Process: processObj._id });
                hazardsArray.push({ ...rest, type: 'Chemical', Process: processObj._id });
                hazardsArray.push({ ...rest, type: 'Physical', Process: processObj._id });
                hazardsArray.push({ ...rest, type: 'Halal', Process: processObj._id });
                hazardsArray.push({ ...rest, type: 'Allergen', Process: processObj._id });;

                if (processObj.subProcesses?.length > 0) {
                    processObj.subProcesses.map((subProcess) => {
                        const { _id, subProcesses, ...rest } = subProcess; // Extract _id property
                        hazardsArray.push({ ...rest, type: 'Biological', Process: subProcess._id });
                        hazardsArray.push({ ...rest, type: 'Chemical', Process: subProcess._id });
                        hazardsArray.push({ ...rest, type: 'Physical', Process: subProcess._id });
                        hazardsArray.push({ ...rest, type: 'Halal', Process: subProcess._id });
                        hazardsArray.push({ ...rest, type: 'Allergen', Process: subProcess._id });
                    })
                }
            })
            setDataToSend({ ...dataToSend, Hazards: hazardsArray })
        }
    }, [selectedProcess])


    return (
        <>
            <div className={`${style.parent} mx-auto`}>
                <div className={`${style.subparent} mx-2 mx-sm-4 mt-5 mx-lg-5`}>
                    <div className='d-flex flex-row bg-white px-lg-5 mx-lg-5 mx-3 px-2 py-2'>
                        <BsArrowLeftCircle
                            role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                                {
                                    dispatch(updateTabData({ ...tabData, Tab: 'Conduct Risk Assessment' }))
                                }
                            }} />
                    </div>
                    <div className={`${style.headers} d-flex justify-content-start ps-3 align-items-center `}>
                        <div className={style.spans}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div className={`${style.heading} ms-3 `}>
                            Conduct HACCP Risk assessment
                        </div>
                    </div>
                    <form encType='multipart/form-data' onSubmit={(event) => {
                        event.preventDefault();
                        // alertManager();
                    }}>
                        <div className={`${style.myBox} bg-light pb-3`}>
                            <div className={style.formDivider}>
                                <div className={style.sec1}>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p>Document Type</p>
                                        </div>
                                        <div style={{
                                            border: '1px solid silver'
                                        }}>
                                            <input autoComplete='off' value={dataToSend?.DocumentType} type='text' className='w-100 text-dark' readOnly />
                                        </div>
                                    </div>
                                    {dataToSend?.Teams?.length > 0 && (
                                        <div className='w-75 mx-4 d-flex flex-column justify-content-start'>
                                            <div className={style.para}>
                                                <p>Selected Teams</p>
                                            </div>
                                            {dataToSend?.Teams?.map((team, i) => {
                                                return (
                                                    <div className='d-flex flex-row '>
                                                        <p style={{
                                                            fontFamily: 'Inter'
                                                        }}> {i + 1} : {team.DocumentId}</p>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                                <div className={style.sec2}>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p>Department</p>
                                        </div>
                                        <div style={{
                                            border: '1px solid silver'
                                        }}>
                                            <input autoComplete='off' value={dataToSend?.Department.DepartmentName} type='text' className='w-100 text-dark' readOnly />
                                        </div>
                                    </div>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p>Process</p>
                                        </div>
                                        <div style={{
                                            border: '1px solid silver'
                                        }}>
                                            <input autoComplete='off' value={dataToSend?.Process.ProcessName} type='text' className='w-100 text-dark' readOnly />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div id='printable'>
                                {dataToSend?.Hazards?.map((hazard, index) => {
                                    return (
                                        <>
                                            <div className={`${style.headers2} d-flex justify-content-start ps-3 mt-4 align-items-center `}>
                                                <div className={style.spans}>
                                                    <span></span>
                                                    <span></span>
                                                    <span></span>
                                                </div>
                                                <div className={`${style.heading} ms-3 `}>
                                                    {hazard.Process.ProcessNum}: {hazard?.Process?.Name}
                                                </div>
                                            </div>
                                            <div className='bg-white p-1 mx-lg-5 mx-2'>
                                                <div className='bg-light p-4 my-4'>
                                                    <div className='d-flex justify-content-end'>
                                                        <div className={style.colorBox}>
                                                            <span className={`${hazard.SignificanceLevel < 5
                                                                ? 'bg-success'
                                                                : hazard.SignificanceLevel > 4 &&
                                                                    hazard.SignificanceLevel < 15
                                                                    ? 'bg-primary'
                                                                    : hazard.SignificanceLevel > 14
                                                                        ? 'bg-danger'
                                                                        : ''
                                                                }`} style={{
                                                                    display: 'block',
                                                                    width: '20px',
                                                                    height: '20px',
                                                                    borderRadius: '20px'
                                                                }}></span>
                                                        </div>
                                                    </div>
                                                    <h4 style={{
                                                        fontFamily: 'Inter'
                                                    }} className='text-center'>{hazard.type} Hazard</h4>
                                                    <div className='row'>
                                                        <div className='col-lg-6 col-md-12 p-2'>
                                                            <textarea value={hazard?.Description} rows={3} type='text' name='Description' className='w-100 p-2 my-3  border-0' placeholder='Description' required readOnly />
                                                            <input autoComplete='off' value={hazard?.ControlMeasures} type='text' name='ControlMeasures' placeholder='Control Measurres' className='w-100 p-2 my-3  border-0' required readOnly />
                                                        </div>
                                                        <div className='col-lg-6 col-md-12 p-2'>
                                                            <select value={hazard?.Occurence} className='p-2 my-2 w-100 border-0' name='Occurence' style={{ width: "100%" }} required>
                                                                <option value="" selected disabled>{hazard?.Occurence}</option>


                                                                {/* <option value={1}>1</option>
                                                            <option value={2}>2</option>
                                                            <option value={3}>3</option>
                                                            <option value={4}>4</option>
                                                            <option value={5}>5</option> */}

                                                            </select>
                                                            <select value={hazard?.Severity} className='p-2 my-3 w-100 border-0' name='Severity' style={{ width: "100%" }} required>
                                                                <option value="" selected disabled>{hazard?.Severity}</option>


                                                                {/* <option value={1}>1</option>
                                                            <option value={2}>2</option>
                                                            <option value={3}>3</option>
                                                            <option value={4}>4</option>
                                                            <option value={5}>5</option> */}

                                                            </select>
                                                            <input autoComplete='off' type='number' value={hazard.SignificanceLevel} placeholder='Significance Score (Occurence x Severity)' className='w-100 p-2 my-3  border-0' readOnly />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )
                                })}
                            </div>

                        </div>
                    </form>
                    <div className={`${style.btn} px-lg-4 px-2 d-flex justify-content-center`}>
                        <button onClick={downloadPDF} type='button' >Download</button>
                    </div>
                </div>
            </div>
            {
                alert ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>Do you want to submit this information?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    alertManager();
                                }} className={style.btn1}>Submit</button>
                                <button onClick={alertManager} className={style.btn2}>Cancel</button>
                            </div>
                        </div>
                    </div> : null
            }

        </>
    )
}

export default ConductHACCPHazards
