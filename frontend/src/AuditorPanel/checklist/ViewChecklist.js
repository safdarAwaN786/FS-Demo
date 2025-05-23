import style from './CreateChecklist.module.css'
import { useEffect, useRef, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { BsArrowLeftCircle } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setSmallLoading } from '../../redux/slices/loading';
import html2pdf from 'html2pdf.js';
import dayjs from 'dayjs'
import jsPDF from 'jspdf';

function ViewChecklist() {

    const [alert, setalert] = useState(false);
    const [dataToSend, setDataToSend] = useState({});
    const user = useSelector(state => state.auth?.user);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const idToWatch = useSelector(state => state.idToProcess);
    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/getChecklistById/${idToWatch}`).then((response) => {
            setDataToSend(response.data.data);
            setQuestions(response.data.data.ChecklistQuestions)
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

    const downloadPDF = async () => {
        var element = document.getElementById('printable');
        var opt = {
            margin: [1.3, 0, 0, 0],
            filename: `${user.Department.DepartmentName}-doc.pdf`,
            enableLinks: false,
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
            image: { type: 'jpeg', quality: 0.8 },  // Adjusted image quality
            html2canvas: { scale: 5, useCORS: true, logging: true },  // Higher scale and useCORS for images
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        console.log(element);
        if (element) {
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
                            const pageWidth = pdf.internal.pageSize.getWidth();
                            // pass the data URL to the pdf.addImage method
                            console.log(pageWidth);

                            pdf.addImage(dataURL, 'JPEG', ((pageWidth - 3) / 2), 2.5, 3, 3);
                            pdf.setFontSize(20);
                            pdf.text(`${user.Company.CompanyName}`, ((pageWidth - pdf.getTextWidth(user.Company.CompanyName)) / 2), (pdf.internal.pageSize.getHeight() / 2));
                            pdf.setFontSize(15)
                            const address = `${user.Company.Address}`;
                            const margins = 1; // Adjust margins as needed
                            const maxWidth = pageWidth - margins * 2; // Calculate usable width
                            const wrappedAddress = pdf.splitTextToSize(address, maxWidth);

                            const yStart = (pdf.internal.pageSize.getHeight() / 2) + 0.4; // Starting Y position


                            wrappedAddress.forEach((line, index) => {
                                const textWidth = pdf.getTextWidth(line);
                                pdf.text(line, (pageWidth - textWidth) / 2, yStart + index * 0.25);
                            });


                            // pdf.setLineWidth(0.1); // Example line width
                            // pdf.line(0.1, (pdf.internal.pageSize.getHeight() / 2) + 1, pdf.internal.pageSize.getWidth() - 0.2, (pdf.internal.pageSize.getHeight() / 2) + 1)
                            pdf.text("Document Id", 1, (pdf.internal.pageSize.getHeight() / 2) + 1.5);
                            pdf.text(`${dataToSend.ChecklistId}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 1.5);
                            pdf.text("Created By", 1, (pdf.internal.pageSize.getHeight() / 2) + 1.8);
                            pdf.text(`${dataToSend.CreatedBy}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 1.8);
                            pdf.text("Creation Date", 1, (pdf.internal.pageSize.getHeight() / 2) + 2.1);
                            pdf.text(`${dayjs(dataToSend.CreationDate).format('DD/MM/YYYY')}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 2.1);
                            if (dataToSend.ReviewedBy) {
                                pdf.text("Reviewed By", 1, (pdf.internal.pageSize.getHeight() / 2) + 2.4);
                                pdf.text(`${dataToSend.ReviewedBy}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 2.4);
                                pdf.text("Reviewed Date", 1, (pdf.internal.pageSize.getHeight() / 2) + 2.7);
                                pdf.text(`${dayjs(dataToSend.ReviewDate).format('DD/MM/YYYY')}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 2.7);
                            }
                            if (dataToSend.Status == 'Approved') {
                                pdf.text("Approved By", 1, (pdf.internal.pageSize.getHeight() / 2) + 3.0);
                                pdf.text(`${dataToSend.ApprovedBy}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 3.0);
                                pdf.text("Approval Date", 1, (pdf.internal.pageSize.getHeight() / 2) + 3.3);
                                pdf.text(`${dayjs(dataToSend.ApprovalDate).format('DD/MM/YYYY')}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 3.3);
                            }
                            pdf.text("Revision Number", 1, (pdf.internal.pageSize.getHeight() / 2) + 3.6);
                            pdf.text(`${dataToSend.RevisionNo}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 3.6);
                        } catch (error) {
                            console.log(error);
                        }
                    } else {
                        pdf.setFontSize(15)
                        pdf.text('Checklist', (pdf.internal.pageSize.getWidth() / 2) - 1.3, 0.5);
                        pdf.setFontSize(10);
                        pdf.text(`${user.Company.CompanyName}`, pdf.internal.pageSize.getWidth() - 2, 0.3);
                        pdf.text(`Checklist ID : ${dataToSend.ChecklistId}`, pdf.internal.pageSize.getWidth() - 2, 0.7);
                        pdf.text(`Revision No :${dataToSend.RevisionNo}`, pdf.internal.pageSize.getWidth() - 2, 0.9);
                        if (dataToSend.Status == 'Approved') {
                            pdf.text(`Issue Date : ${dayjs(dataToSend.ApprovalDate).format('DD/MM/YYYY')}`, pdf.internal.pageSize.getWidth() - 2, 1.1);
                        }
                    }
                }
            }).save();
        }
    };





    const alertManager = () => {
        setalert(!alert)
    }

    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        setDataToSend({ ...dataToSend, ChecklistQuestions: questions })
    }, [questions])



    return (
        <>
            <div className={`${style.parent} mx-auto`}>
                <div className={`${style.subparent} mx-2 mx-sm-4 mt-5 mx-lg-5`}>
                    <div className='d-flex flex-row bg-white px-lg-5 mx-lg-5 mx-3 px-2 py-2'>
                        <BsArrowLeftCircle
                            role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                                {
                                    dispatch(updateTabData({ ...tabData, Tab: 'Internal Audit Check List' }))
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
                            View Checklist
                        </div>
                    </div>
                    <form encType='multipart/form-data' onSubmit={(event) => {
                        event.preventDefault();
                        if (dataToSend.ChecklistQuestions.length > 0) {
                            alertManager();

                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Sorry..',
                                text: 'Kindly Add at least one Clause.',
                                confirmButtonText: 'OK.'
                            })
                        }
                    }}>
                        <div className={`${style.myBox} pb-4`}>
                            <div className={style.formDivider}>
                                <div className={style.sec2}>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p>Title</p>
                                        </div>
                                        <div className="border border-dark-subtle">
                                            <input
                                                type="text"
                                                className="form-control form-control-lg"
                                                name="title"
                                                autoComplete="off"
                                                placeholder="Enter title"
                                                required
                                                readOnly
                                                value={dataToSend?.title}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className={style.sec1}>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p>Document Type</p>
                                        </div>
                                        <div className='border border-dark-subtle'>
                                            <input autoComplete='off' value={dataToSend?.DocumentType} className='w-100 text-black' type="text" readOnly />
                                        </div>
                                    </div>
                                </div>
                                <div className={style.sec2}>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p>Department</p>
                                        </div>
                                        <div className='border border-dark-subtle'>
                                            <input autoComplete='off' value={dataToSend?.Department?.DepartmentName} className='w-100 text-black' name='FormDescription' type="text" readOnly />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div id='printable' className={`${style.formDivider} flex-column justify-content-center`}>
                                {questions?.map((question, index) => {
                                    return (
                                        <div style={{
                                            borderRadius: '6px',
                                            width: '600px',
                                            boxSizing: 'border-box'
                                        }} className='bg-white mx-auto my-4 p-3'>
                                            <div className='d-flex bg-white justify-content-center flex-column '>
                                                <div style={{
                                                    width: '100%'
                                                }} className=' me-3 d-flex flex-column'>

                                                    <div className={`custom-input-like-scrollable border-0  border-secondary bg-light mt-2 mb-3 w-100 p-3`}>
                                                        {question.questionText}
                                                    </div>


                                                </div>
                                                <div>
                                                    <b>Compliance Type :</b> {question.ComplianceType}
                                                </div>
                                                <div style={{
                                                    width: '100%'
                                                }} className=' mt-2 d-flex flex-row'>
                                                    <div style={{
                                                        width: '80%'
                                                    }}>
                                                    </div>
                                                    <p className='mx-2 mt-1' style={{
                                                        fontFamily: 'Inter',
                                                        color: 'black'
                                                    }}>Required</p>
                                                    <label className={`${style.switch} `}>
                                                        {/* <input autoComplete='off' checked={question?.Required} className='ms-3' type="checkbox" readOnly /> */}
                                                        {question?.Required ? (
                                                            <span className={`${style.viewSlider} d-flex justify-content-end align-items-center ${style.round}`} ><div className={style.checked}></div></span>
                                                        ) : (
                                                            <span className={`${style.viewSlider} d-flex justify-content-start align-items-center ${style.round}`} ><div className={style.unChecked}></div></span>
                                                        )}
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
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
        </>
    )
}

export default ViewChecklist
