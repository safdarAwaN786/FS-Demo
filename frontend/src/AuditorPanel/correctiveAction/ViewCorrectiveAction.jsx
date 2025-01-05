
import style from './ActionOnCorrective.module.css'
import { useEffect, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2';
import { BsArrowLeftCircle } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import Slider from 'rc-slider';
import { setSmallLoading } from '../../redux/slices/loading';
import html2pdf from 'html2pdf.js';
import dayjs from 'dayjs';

const formatDate = (date) => {
    const newDate = new Date(date);
    const formatDate = newDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
    return formatDate;
}

function ViewCorrectiveAction() {

    const [showBox, setShowBox] = useState(false);
    const [actionData, setActionData] = useState(null);
    const [dataToShow, setDataToShow] = useState(null);
    const user = useSelector(state => state.auth?.user);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const idToWatch = useSelector(state => state.idToProcess);



    const [correctiveAnswers, setCorrectiveAnswers] = useState([]);
    const [dataToSend, setDataToSend] = useState(null);

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
                        pdf.setFontSize(15);
                        const address = `Address : ${user.Company.Address}`;
                        const pageWidth = pdf.internal.pageSize.getWidth();
                        const margins = 1; // Adjust margins as needed
                        const maxWidth = pageWidth - margins * 2; // Calculate usable width
                        const wrappedAddress = pdf.splitTextToSize(address, maxWidth);
                        
                        pdf.text(wrappedAddress, 1, (pdf.internal.pageSize.getHeight() / 2) + 0.5);
                        
                        pdf.setLineWidth(0.1); // Example line width
                        pdf.line(0.1, (pdf.internal.pageSize.getHeight() / 2) + 1, pdf.internal.pageSize.getWidth() - 0.2, (pdf.internal.pageSize.getHeight() / 2) + 1)
                        pdf.text("Checklist ID", 1, (pdf.internal.pageSize.getHeight() / 2) + 1.5);
                        pdf.text(`${dataToSend?.Report?.ConductAudit?.Checklist?.ChecklistId}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 1.5);
                        pdf.text("Corrective Action By", 1, (pdf.internal.pageSize.getHeight() / 2) + 1.8);
                        pdf.text(`${dataToSend.CorrectionBy}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 1.8);
                        pdf.text("Corrective Action Date", 1, (pdf.internal.pageSize.getHeight() / 2) + 2.1);
                        pdf.text(`${formatDate(dataToSend.CorrectionDate)}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 2.1);
                        pdf.text("Revision Number", 1, (pdf.internal.pageSize.getHeight() / 2) + 2.4);
                        pdf.text(`${dataToSend.Report?.ConductAudit?.Checklist?.RevisionNo}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 2.4);
                        // if (dataToSend.Report?.ConductAudit?.Checklist?.Status == 'Approved') {

                        //     pdf.text("Checklist Approved By", 1, (pdf.internal.pageSize.getHeight() / 2) + 2.7);
                        //     pdf.text(`${dataToSend.Report?.ConductAudit?.Checklist?.ApprovedBy}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 2.7);
                        //     pdf.text("Approval Date", 1, (pdf.internal.pageSize.getHeight() / 2) + 3.0);
                        //     pdf.text(`${formatDate(dataToSend.Report?.ConductAudit?.Checklist?.ApprovalDate)}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 3.0);
                        // }
                        // if (dataToSend.ReviewedBy) {

                        //     pdf.text("Reviewed By", 1, (pdf.internal.pageSize.getHeight() / 2) + 3.3);
                        //     pdf.text(`${dataToSend.ReviewedBy}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 3.3);
                        //     pdf.text("Reviewed Date", 1, (pdf.internal.pageSize.getHeight() / 2) + 3.6);
                        //     pdf.text(`${formatDate(dataToSend.ReviewDate)}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 3.6);
                        // }
                    } catch (error) {
                        console.log(error);
                    }
                } else {
                    pdf.setFontSize(15)
                    pdf.text('Powered By Feat Technology', (pdf.internal.pageSize.getWidth() / 2) - 1.3, 0.5);
                    pdf.setFontSize(10);
                    pdf.text(`${user.Company.CompanyName}`, pdf.internal.pageSize.getWidth() - 2, 0.3);
                    pdf.text(`Action By : ${dataToSend.CorrectionBy}`, pdf.internal.pageSize.getWidth() - 2, 0.5);
                    pdf.text(`Checklist Revision No :${dataToSend.Report?.ConductAudit?.Checklist?.RevisionNo}`, pdf.internal.pageSize.getWidth() - 2, 0.7);
                    pdf.text(`Action Date : ${formatDate(dataToSend.CorrectionDate)}`, pdf.internal.pageSize.getWidth() - 2, 0.9);
                }
            }
        }).save();

    };

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
    console.log(dataToSend);

    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readCorrectiveActionById/${idToWatch}`).then((response) => {
            setActionData(response.data.data)
            setDataToSend(response.data.data)
            setCorrectiveAnswers(response.data.data.Answers);
            dispatch(setSmallLoading(false))
            if (response.data.data == undefined) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Report is not Created for this Audit yet!',
                    confirmButtonText: 'OK.'

                }).then((result) => {
                    if (result.isConfirmed) {
                        dispatch(updateTabData({ ...tabData, Tab: 'Corrective Action Plan' }))

                    }
                })
            }

        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
    }, [])

    return (
        <>
            <div className={`${style.parent} mx-auto`}>
                <div className={`${style.subparent} mx-2 mx-sm-4 mt-5 mx-lg-5`}>
                    <div className='mx-lg-5 px-4 mx-md-4 mx-2  mb-1 '>
                        <BsArrowLeftCircle onClick={(e) => {
                            dispatch(updateTabData({ ...tabData, Tab: 'Corrective Action Plan' }))
                        }} className='fs-3 text-danger mx-1' role='button' />
                    </div>
                    <div className={`${style.headers} d-flex justify-content-start ps-3 align-items-center `}>
                        <div className={style.spans}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div className={`${style.heading} ms-3 `}>
                            Corrective Action
                        </div>
                    </div>
                    <form id='printable' className='bg-white' encType='multipart/form-data' onSubmit={(event) => {
                        event.preventDefault();
                    }}>
                        {correctiveAnswers?.map((correctiveAnswer, index) => {
                            return (
                                <div style={{
                                    borderRadius: '6px',
                                    width: '700px'
                                }} className='bg-white mx-auto my-4 p-2'>
                                    <div className='d-flex bg-light p-3 justify-content-center flex-column '>
                                        <div style={{
                                            width: '100%'
                                        }} className=' me-3 d-flex flex-column'>
                                            <input autoComplete='off' value={correctiveAnswer.question.question.questionText} style={{
                                                borderRadius: '0px'
                                            }} name='questionText' placeholder='Untitled Question' className='border-0  border-secondary bg-light mt-2 mb-3 w-100 p-3' required readOnly />

                                        </div>
                                        <div>
                                            {correctiveAnswer.question.question.ComplianceType === 'GradingSystem' && (
                                                <div className='d-flex flex-row flex-wrap'>
                                                    <p className='my-2 fw-bold'> Selected Value : {correctiveAnswer.question?.GradingSystemAnswer}</p>
                                                    <div className='d-flex w-100 justify-content-between'>
                                                        <span>1</span>
                                                        <span>10</span></div>
                                                    <Slider
                                                        value={correctiveAnswer.question.GradingSystemAnswer}
                                                        min={1} // Set your lower value
                                                        max={10} // Set your higher value
                                                        step={1} // Set the step size
                                                        {...(correctiveAnswer.question.question.Required ? { required: true } : {})} readOnly />
                                                </div>
                                            )}
                                            {correctiveAnswer.question.question.ComplianceType === 'Yes/No' && (
                                                <div className='d-flex flex-row flex-wrap'>

                                                    <input autoComplete='off' checked={correctiveAnswer.question.YesNoAnswer === 'Yes'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`Yes-${index}`} autocomplete="off" readOnly />
                                                    <label class="btn btn-outline-success m-2" for={`Yes-${index}`}>Yes</label>

                                                    <input autoComplete='off' checked={correctiveAnswer.question.YesNoAnswer === 'No'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`No-${index}`} autocomplete="off" readOnly />
                                                    <label class="btn btn-outline-danger m-2" for={`No-${index}`}>No</label>
                                                    <input autoComplete='off' checked={correctiveAnswer.question.YesNoAnswer === 'N/A'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`N/A-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-secondary m-2" for={`N/A-${index}`}>N/A</label>
                                                </div>
                                            )}
                                            {correctiveAnswer.question.question.ComplianceType === 'Safe/AtRisk' && (
                                                <div className='d-flex flex-row flex-wrap'>

                                                    <input autoComplete='off' checked={correctiveAnswer.question.SafeAtRiskAnswer === 'Safe'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`Safe-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-success m-2" for={`Safe-${index}`}>Safe</label>

                                                    <input autoComplete='off' checked={correctiveAnswer.question.SafeAtRiskAnswer === 'At Risk'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`At Risk-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-danger m-2" for={`At Risk-${index}`}>At Risk</label>
                                                    <input autoComplete='off' checked={correctiveAnswer.question.SafeAtRiskAnswer === 'N/A'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`N/A-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-secondary m-2" for={`N/A-${index}`}>N/A</label>
                                                </div>
                                            )}

                                            {correctiveAnswer.question.question.ComplianceType === 'Pass/Fail' && (
                                                <div className='d-flex flex-row flex-wrap'>

                                                    <input autoComplete='off' checked={correctiveAnswer.question.PassFailAnswer === 'Pass'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`Pass-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-success m-2" for={`Pass-${index}`}>Pass</label>

                                                    <input autoComplete='off' checked={correctiveAnswer.question.PassFailAnswer === 'Fail'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`Fail-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-danger m-2" for={`Fail-${index}`}>Fail</label>
                                                    <input autoComplete='off' checked={correctiveAnswer.question.PassFailAnswer === 'N/A'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`N/A-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-secondary m-2" for={`N/A-${index}`}>N/A</label>
                                                </div>
                                            )}
                                            {correctiveAnswer.question.question.ComplianceType === 'Compliant/NonCompliant' && (
                                                <div className='d-flex flex-row flex-wrap'>

                                                    <input autoComplete='off' checked={correctiveAnswer.question.CompliantNonCompliantAnswer === 'Compliant'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`Compliant-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-success m-2" for={`Compliant-${index}`}>Compliant</label>

                                                    <input autoComplete='off' checked={correctiveAnswer.question.CompliantNonCompliantAnswer === 'Non-Compliant'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`Non-Compliant-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-danger m-2" for={`Non-Compliant-${index}`}>Non-Compliant</label>
                                                    <input autoComplete='off' checked={correctiveAnswer.question.CompliantNonCompliantAnswer === 'N/A'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`N/A-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-secondary m-2" for={`N/A-${index}`}>N/A</label>
                                                </div>
                                            )}
                                            {correctiveAnswer.question.question.ComplianceType === 'Good/Fair/Poor' && (
                                                <div className='d-flex flex-row flex-wrap'>

                                                    <input autoComplete='off' checked={correctiveAnswer.question.GoodFairPoorAnswer === 'Good'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`Good-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-success m-2" for={`Good-${index}`}>Good</label>
                                                    <input autoComplete='off' checked={correctiveAnswer.question.GoodFairPoorAnswer === 'Fair'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`Fair-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-warning m-2" for={`Fair-${index}`}>Fair</label>

                                                    <input autoComplete='off' checked={correctiveAnswer.question.GoodFairPoorAnswer === 'Poor'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`Poor-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-danger m-2" for={`Poor-${index}`}>Poor</label>
                                                    <input autoComplete='off' checked={correctiveAnswer.question.GoodFairPoorAnswer === 'N/A'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`N/A-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-secondary m-2" for={`N/A-${index}`}>N/A</label>
                                                </div>
                                            )}

                                            {correctiveAnswer.question.question.ComplianceType === 'Conform/MinorNonComform/MajorNonConform/CriticalNonConform/Observation' && (
                                                <div className='d-flex flex-row flex-wrap'>

                                                    <input autoComplete='off' checked={correctiveAnswer.question.ConformObservationAnswer === 'Conform'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`Conform-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-success m-2" for={`Conform-${index}`}>Conform</label>
                                                    <input autoComplete='off' checked={correctiveAnswer.question.ConformObservationAnswer === 'Minor Non-Conform'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`Minor Non-Conform-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-warning m-2" for={`Minor Non-Conform-${index}`}>Minor Non-Conform</label>

                                                    <input autoComplete='off' checked={correctiveAnswer.question.ConformObservationAnswer === 'Major Non-Conform'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`Major Non-Conform-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-danger m-2" for={`Major Non-Conform-${index}`}>Major Non-Conform</label>
                                                    <input autoComplete='off' checked={correctiveAnswer.question.ConformObservationAnswer === 'Critical Non-Conform'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`Critical Non-Conform-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-primary m-2" for={`Critical Non-Conform-${index}`}>Critical Non-Conform</label>

                                                    <input autoComplete='off' checked={correctiveAnswer.question.ConformObservationAnswer === 'Observation'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`Observation-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-info m-2" for={`Observation-${index}`}>Observation</label>
                                                    <input autoComplete='off' checked={correctiveAnswer.question.ConformObservationAnswer = 'N/A'} type="radio" class="btn-check" name={correctiveAnswer.question.question._id} id={`N/A-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-secondary m-2" for={`N/A-${index}`}>N/A</label>
                                                </div>
                                            )}
                                            <textarea value={correctiveAnswer.question.Remarks} rows={3} className='w-100 p-2 my-2' placeholder='Remarks...' required />
                                        </div>

                                        <div style={{
                                            width: '100%'
                                        }} className=' mt-2 d-flex flex-row'>
                                            <div style={{
                                                width: '80%'
                                            }}>
                                                {correctiveAnswer.question.EvidenceDoc && (

                                                    <div className='d-flex flex-column w-50'>
                                                        <label>Evidence Document :</label>
                                                        <a onClick={() => {
                                                            handleDownloadImage(correctiveAnswer.question.EvidenceDoc)
                                                        }} className='btn btn-outline-danger' >Download</a>
                                                    </div>
                                                )}
                                            </div>
                                            <p className='mx-2 mt-1' style={{
                                                fontFamily: 'Inter',
                                                color: 'black'
                                            }}>Required</p>
                                            <label className={style.switch}>
                                                <input autoComplete='off' checked={correctiveAnswer.question.question?.Required} className='ms-3' name='Required' type="checkbox" readOnly />
                                                <span className={`${style.slider} ${style.round}`} ></span>
                                            </label>
                                        </div>
                                        <div className='row p-3 mt-4'>
                                            <div className='col-lg-6 col-md-12'>
                                                <p className='fw-bold'>Target Date : </p>
                                                <input placeholder='write here..' value={dayjs(correctiveAnswer?.TargetDate).format('DD/MM/YYYY')} rows={4} className='w-100 border-0 p-2 m-2' type='text' required />
                                            </div>
                                            <div className='col-lg-6 col-md-12'>
                                                <p className='fw-bold'>Correction : </p>
                                                <textarea placeholder='write here..' name='Correction' value={correctiveAnswer?.Correction} rows={4} className='w-100 border-0 p-2 m-2' type='text' required readOnly />
                                            </div>
                                            <div className='col-lg-6 col-md-12'>
                                                <p className='fw-bold'>Corrective Action : </p>
                                                <textarea placeholder='write here..' value={correctiveAnswer?.CorrectiveAction} rows={4} className='w-100 border-0 p-2 m-2' type='text' required readOnly />
                                            </div>
                                            <div className='col-lg-6 col-md-12'>
                                                <p className='fw-bold'>Root Cause : </p>
                                                <textarea placeholder='write here..' value={correctiveAnswer?.RootCause} rows={4} className='w-100 border-0 p-2 m-2' type='text' required readOnly />
                                            </div>
                                            {correctiveAnswer?.CorrectiveDoc && (
                                                <div className='col-lg-6 col-md-12'>
                                                    <p><b>Corrective Document : </b></p>
                                                    <a onClick={() => {
                                                        handleDownloadImage(correctiveAnswer?.CorrectiveDoc)
                                                    }} className='btn btn-danger py-2 mt-3 mx-2 w-100'  >Download</a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </form>
                    <div className={`${style.btn} px-lg-4 px-2 d-flex justify-content-center`}>
                        <button onClick={downloadPDF} type='button' >Download</button>
                    </div>
                </div>
            </div>
            {
                showBox ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>{dataToShow}</p>
                            <div className={style.alertbtns}>
                                <button style={{
                                    marginLeft: '120px',
                                    marginTop: '25px'
                                }} onClick={() => {
                                    setShowBox(false)

                                }} className={style.btn1}>Ok.</button>




                            </div>
                        </div>
                    </div> : null
            }

        </>
    )
}

export default ViewCorrectiveAction
