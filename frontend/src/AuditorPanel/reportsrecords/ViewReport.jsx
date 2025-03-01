
import style from './RecordReport.module.css'
import { useEffect, useRef, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2';
import { BsArrowLeftCircle } from 'react-icons/bs';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import Slider from 'rc-slider';
import { setSmallLoading } from '../../redux/slices/loading';
import html2pdf from 'html2pdf.js';


function ViewReport() {

    const [showBox, setShowBox] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [dataToShow, setDataToShow] = useState(null);
    const [dataToSend, setDataToSend] = useState(null)
    const userToken = Cookies.get('userToken');
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const idToWatch = useSelector(state => state.idToProcess)
    const user = useSelector(state => state.auth.user)
    const [auditData, setAuditData] = useState(null);
    const [answers, setAnswers] = useState([]);
    const formatDate = (date) => {
        const newDate = new Date(date);
        const formatDate = newDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
        return formatDate;
    }


    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readReportById/${idToWatch}`).then((response) => {
            setReportData(response.data.data)
            setDataToSend(response.data.data)
            setAuditData(response.data.data.ConductAudit)
            setAnswers(response.data.data.ConductAudit.Answers);
            dispatch(setSmallLoading(false))
            if (response.data.data == undefined) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Report is not Created for this Audit yet!',
                    confirmButtonText: 'OK.'
                }).then((result) => {
                    if (result.isConfirmed) {
                        dispatch(updateTabData({ ...tabData, Tab: 'Non-Conformity Report' }))
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
    }, []);

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
                        pdf.text(`Company : ${user.Company.CompanyName}`, 1, (pdf.internal.pageSize.getHeight() / 2));
                        pdf.setFontSize(15);
                        const address = `Address : ${user.Company.Address}`;
                        const pageWidth = pdf.internal.pageSize.getWidth();
                        const margins = 1; // Adjust margins as needed
                        const maxWidth = pageWidth - margins * 2; // Calculate usable width
                        const wrappedAddress = pdf.splitTextToSize(address, maxWidth);

                        pdf.text(wrappedAddress, 1, (pdf.internal.pageSize.getHeight() / 2) + 0.5);

                        pdf.setFontSize(15);
                        pdf.setLineWidth(0.1); // Example line width
                        pdf.line(0.1, (pdf.internal.pageSize.getHeight() / 2) + 1, pdf.internal.pageSize.getWidth() - 0.2, (pdf.internal.pageSize.getHeight() / 2) + 1)
                        pdf.text("Checklist Id", 1, (pdf.internal.pageSize.getHeight() / 2) + 1.5);
                        pdf.text(`${dataToSend.ConductAudit.Checklist.ChecklistId}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 1.5);
                        pdf.text("Report By", 1, (pdf.internal.pageSize.getHeight() / 2) + 1.8);
                        pdf.text(`${dataToSend.ReportBy}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 1.8);
                        pdf.text("Report Date", 1, (pdf.internal.pageSize.getHeight() / 2) + 2.1);
                        pdf.text(`${formatDate(dataToSend.ReportDate)}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 2.1);
                        pdf.text("Revision Number", 1, (pdf.internal.pageSize.getHeight() / 2) + 2.4);
                        pdf.text(`${dataToSend.ConductAudit.Checklist.RevisionNo}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 2.4);
                        // if (dataToSend.ConductAudit.Checklist.Status == 'Approved') {
                        //     pdf.text("Approved By", 1, (pdf.internal.pageSize.getHeight() / 2) + 2.7);
                        //     pdf.text(`${dataToSend.ConductAudit.Checklist.ApprovedBy}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 2.7);
                        //     pdf.text("Approval Date", 1, (pdf.internal.pageSize.getHeight() / 2) + 3.0);
                        //     pdf.text(`${formatDate(dataToSend.ApprovalDate)}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 3.0);
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
                    pdf.text('Non Conformance Report', (pdf.internal.pageSize.getWidth() / 2) - 1.3, 0.5);
                    pdf.setFontSize(10);
                    pdf.text(`${user.Company.CompanyName}`, pdf.internal.pageSize.getWidth() - 2, 0.3);
                    pdf.text(`Checklist ID : ${dataToSend.ConductAudit.Checklist.ChecklistId}`, pdf.internal.pageSize.getWidth() - 2, 0.5);
                    pdf.text(`Revision No : ${dataToSend.ConductAudit.Checklist.RevisionNo}`, pdf.internal.pageSize.getWidth() - 2, 0.7);
                    if (dataToSend.ConductAudit.Checklist.Status == 'Approved') {   
                        pdf.text(`Issue Date : ${formatDate(dataToSend.ConductAudit.Checklist.ApprovalDate)}`, pdf.internal.pageSize.getWidth() - 2, 0.9);
                    }
                }
            }
        }).save();
    };
    return (
        <>
            <div className={`${style.parent} mx-auto`}>
                <div className={`${style.subparent} mx-2 mx-sm-4 mt-5 mx-lg-5`}>
                    <div className='mx-lg-5 px-4 mx-md-4 mx-2  mb-1 '>
                        <BsArrowLeftCircle onClick={(e) => {
                            dispatch(updateTabData({ ...tabData, Tab: 'Non-Conformity Report' }))
                        }} className='fs-3 text-danger mx-1' role='button' />
                    </div>
                    <div className={`${style.headers} d-flex justify-content-start ps-3 align-items-center `}>
                        <div className={style.spans}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div className={`${style.heading} ms-3 `}>
                            Non Conformance Report
                        </div>
                    </div>
                    <form id='printable' className='bg-white' encType='multipart/form-data' onSubmit={(event) => {
                        event.preventDefault();
                    }}>
                        {answers?.map((answer, index) => {
                            return (
                                <div style={{
                                    borderRadius: '6px',
                                    width: '700px'
                                }} className='bg-white mx-auto my-4 p-2'>
                                    <div className='d-flex bg-light p-3 justify-content-center flex-column '>
                                        <div style={{
                                            width: '100%'
                                        }} className=' me-3 d-flex flex-row'>
                                            <input autoComplete='off' value={answer.question.questionText} style={{
                                                borderRadius: '0px'
                                            }} name='questionText' placeholder='Untitled Question' className='border-0  border-secondary bg-light mt-2 mb-3 w-100 p-3' required readOnly />
                                            <input autoComplete='off' checked={reportData.SelectedAnswers?.some((ansObj) => ansObj.Answer._id === answer._id)} style={{
                                                cursor: 'pointer'
                                            }} className='mt-2' type='checkbox' />
                                        </div>
                                        <div>
                                            {answer.question.ComplianceType === 'GradingSystem' && (
                                                <div className='d-flex flex-row flex-wrap'>
                                                    <p className='my-2 fw-bold'> Selected Value : {answers[index]?.GradingSystemAnswer}</p>
                                                    <div className='d-flex w-100 justify-content-between'>
                                                        <span>1</span>
                                                        <span>10</span></div>
                                                    <Slider
                                                        value={answers[index].GradingSystemAnswer}
                                                        min={1} // Set your lower value
                                                        max={10} // Set your higher value
                                                        step={1} // Set the step size
                                                        {...(answer.question.Required ? { required: true } : {})} readOnly />
                                                </div>
                                            )}
                                            {answer.question.ComplianceType === 'Yes/No' && (
                                                <div className='d-flex flex-row flex-wrap'>

                                                    <input autoComplete='off' checked={answers[index].YesNoAnswer === 'Yes'} type="radio" class="btn-check" name={answer.question._id} id={`Yes-${index}`} autocomplete="off" readOnly />
                                                    <label class="btn btn-outline-success m-2" for={`Yes-${index}`}>Yes</label>

                                                    <input autoComplete='off' checked={answers[index].YesNoAnswer === 'No'} type="radio" class="btn-check" name={answer.question._id} id={`No-${index}`} autocomplete="off" readOnly />
                                                    <label class="btn btn-outline-danger m-2" for={`No-${index}`}>No</label>
                                                    <input autoComplete='off' checked={answers[index].YesNoAnswer === 'N/A'} type="radio" class="btn-check" name={answer.question._id} id={`N/A-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-secondary m-2" for={`N/A-${index}`}>N/A</label>
                                                </div>
                                            )}
                                            {answer.question.ComplianceType === 'Safe/AtRisk' && (
                                                <div className='d-flex flex-row flex-wrap'>
                                                    <input autoComplete='off' checked={answers[index].SafeAtRiskAnswer === 'Safe'} type="radio" class="btn-check" name={answer.question._id} id={`Safe-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-success m-2" for={`Safe-${index}`}>Safe</label>
                                                    <input autoComplete='off' checked={answers[index].SafeAtRiskAnswer === 'At Risk'} type="radio" class="btn-check" name={answer.question._id} id={`At Risk-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-danger m-2" for={`At Risk-${index}`}>At Risk</label>
                                                    <input autoComplete='off' checked={answers[index].SafeAtRiskAnswer === 'N/A'} type="radio" class="btn-check" name={answer.question._id} id={`N/A-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-secondary m-2" for={`N/A-${index}`}>N/A</label>
                                                </div>
                                            )}

                                            {answer.question.ComplianceType === 'Pass/Fail' && (
                                                <div className='d-flex flex-row flex-wrap'>
                                                    <input autoComplete='off' checked={answers[index].PassFailAnswer === 'Pass'} type="radio" class="btn-check" name={answer.question._id} id={`Pass-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-success m-2" for={`Pass-${index}`}>Pass</label>
                                                    <input autoComplete='off' checked={answers[index].PassFailAnswer === 'Fail'} type="radio" class="btn-check" name={answer.question._id} id={`Fail-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-danger m-2" for={`Fail-${index}`}>Fail</label>
                                                    <input autoComplete='off' checked={answers[index].PassFailAnswer === 'N/A'} type="radio" class="btn-check" name={answer.question._id} id={`N/A-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-secondary m-2" for={`N/A-${index}`}>N/A</label>
                                                </div>
                                            )}
                                            {answer.question.ComplianceType === 'Compliant/NonCompliant' && (
                                                <div className='d-flex flex-row flex-wrap'>

                                                    <input autoComplete='off' checked={answers[index].CompliantNonCompliantAnswer === 'Compliant'} type="radio" class="btn-check" name={answer.question._id} id={`Compliant-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-success m-2" for={`Compliant-${index}`}>Compliant</label>

                                                    <input autoComplete='off' checked={answers[index].CompliantNonCompliantAnswer === 'Non-Compliant'} type="radio" class="btn-check" name={answer.question._id} id={`Non-Compliant-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-danger m-2" for={`Non-Compliant-${index}`}>Non-Compliant</label>
                                                    <input autoComplete='off' checked={answers[index].CompliantNonCompliantAnswer === 'N/A'} type="radio" class="btn-check" name={answer.question._id} id={`N/A-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-secondary m-2" for={`N/A-${index}`}>N/A</label>
                                                </div>
                                            )}
                                            {answer.question.ComplianceType === 'Good/Fair/Poor' && (
                                                <div className='d-flex flex-row flex-wrap'>

                                                    <input autoComplete='off' checked={answers[index].GoodFairPoorAnswer === 'Good'} type="radio" class="btn-check" name={answer.question._id} id={`Good-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-success m-2" for={`Good-${index}`}>Good</label>
                                                    <input autoComplete='off' checked={answers[index].GoodFairPoorAnswer === 'Fair'} type="radio" class="btn-check" name={answer.question._id} id={`Fair-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-warning m-2" for={`Fair-${index}`}>Fair</label>

                                                    <input autoComplete='off' checked={answers[index].GoodFairPoorAnswer === 'Poor'} type="radio" class="btn-check" name={answer.question._id} id={`Poor-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-danger m-2" for={`Poor-${index}`}>Poor</label>
                                                    <input autoComplete='off' checked={answers[index].GoodFairPoorAnswer === 'N/A'} type="radio" class="btn-check" name={answer.question._id} id={`N/A-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-secondary m-2" for={`N/A-${index}`}>N/A</label>
                                                </div>
                                            )}

                                            {answer.question.ComplianceType === 'Conform/MinorNonComform/MajorNonConform/CriticalNonConform/Observation' && (
                                                <div className='d-flex flex-row flex-wrap'>

                                                    <input autoComplete='off' checked={answers[index].ConformObservationAnswer === 'Conform'} type="radio" class="btn-check" name={answer.question._id} id={`Conform-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-success m-2" for={`Conform-${index}`}>Conform</label>
                                                    <input autoComplete='off' checked={answers[index].ConformObservationAnswer === 'Minor Non-Conform'} type="radio" class="btn-check" name={answer.question._id} id={`Minor Non-Conform-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-warning m-2" for={`Minor Non-Conform-${index}`}>Minor Non-Conform</label>

                                                    <input autoComplete='off' checked={answers[index].ConformObservationAnswer === 'Major Non-Conform'} type="radio" class="btn-check" name={answer.question._id} id={`Major Non-Conform-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-danger m-2" for={`Major Non-Conform-${index}`}>Major Non-Conform</label>
                                                    <input autoComplete='off' checked={answers[index].ConformObservationAnswer === 'Critical Non-Conform'} type="radio" class="btn-check" name={answer.question._id} id={`Critical Non-Conform-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-primary m-2" for={`Critical Non-Conform-${index}`}>Critical Non-Conform</label>

                                                    <input autoComplete='off' checked={answers[index].ConformObservationAnswer === 'Observation'} type="radio" class="btn-check" name={answer.question._id} id={`Observation-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-info m-2" for={`Observation-${index}`}>Observation</label>
                                                    <input autoComplete='off' checked={answers[index].ConformObservationAnswer = 'N/A'} type="radio" class="btn-check" name={answer.question._id} id={`N/A-${index}`} autocomplete="off" />
                                                    <label class="btn btn-outline-secondary m-2" for={`N/A-${index}`}>N/A</label>
                                                </div>
                                            )}
                                            <textarea value={answers[index].Remarks} rows={3} className='w-100 p-2 my-2' placeholder='Remarks...' required />
                                        </div>
                                        {reportData?.SelectedAnswers.some((ansObj) => ansObj.Answer._id === answer._id) && (
                                            <div>
                                                <label>Target Date : </label>
                                                <input autoComplete='off' value={formatDate((reportData?.SelectedAnswers?.find((ansObj) => ansObj.Answer._id === answer._id)).TargetDate)} type='text' className='p-2' required />
                                            </div>
                                        )}
                                        <div style={{
                                            width: '100%'
                                        }} className=' mt-2 d-flex flex-row'>
                                            <div style={{
                                                width: '80%'
                                            }}>
                                                {answers[index].EvidenceDoc && (

                                                    <div className='d-flex flex-column w-50'>
                                                        <label>Evidence Document :</label>
                                                        <a href={answers[index].EvidenceDoc} className='btn btn-outline-danger' download>Download</a>
                                                    </div>
                                                )}
                                            </div>
                                            <p className='mx-2 mt-1' style={{
                                                fontFamily: 'Inter',
                                                color: 'black'
                                            }}>Required</p>
                                            <label className={style.switch}>
                                                <input autoComplete='off' checked={answer.question?.Required} className='ms-3' name='Required' type="checkbox" readOnly />
                                                <span className={`${style.slider} ${style.round}`} ></span>
                                            </label>
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

export default ViewReport
