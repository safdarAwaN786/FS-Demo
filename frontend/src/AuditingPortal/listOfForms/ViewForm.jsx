import style from './CreateForm.module.css'
import { useEffect, useRef, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { BsTextParagraph, BsFillGrid3X3GapFill, BsGrid3X3, BsArrowLeftCircle } from "react-icons/bs"
import html2pdf from 'html2pdf.js';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setSmallLoading } from '../../redux/slices/loading';
import dayjs from 'dayjs';

function ViewForm() {

    const [alert, setalert] = useState(false);
    const [dataToSend, setDataToSend] = useState(null);
    const alertManager = () => {
        setalert(!alert)
    }
    const [questions, setQuestions] = useState([]);
    const user = useSelector(state => state.auth.user);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const [downloading, setDownloading] = useState(false)
    const idToWatch = useSelector(state => state.idToProcess);
    const downloadPDF = async () => {
        var element = document.getElementById('printable');
        var opt = {
            margin: [1.3, 0.2, 0.5, 0.2],
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
                        // pdf.text("Document Id", 1, (pdf.internal.pageSize.getHeight() / 2) + 1.5);
                        // pdf.text(`${dataToSend.ChecklistId}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 1.5);
                        pdf.text("Created By", 1, (pdf.internal.pageSize.getHeight() / 2) + 1.8);
                        pdf.text(`${dataToSend.CreatedBy}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 1.8);
                        pdf.text("Creation Date", 1, (pdf.internal.pageSize.getHeight() / 2) + 2.1);
                        pdf.text(`${dayjs(dataToSend.CreationDate).format('DD/MM/YYYY')}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 2.1);
                        pdf.text("Revision Number", 1, (pdf.internal.pageSize.getHeight() / 2) + 2.4);
                        pdf.text(`${dataToSend.RevisionNo}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 2.4);
                        if (dataToSend.Status == 'Approved') {
                            pdf.text("Approved By", 1, (pdf.internal.pageSize.getHeight() / 2) + 2.7);
                            pdf.text(`${dataToSend.ApprovedBy}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 2.7);
                            pdf.text("Approval Date", 1, (pdf.internal.pageSize.getHeight() / 2) + 3.0);
                            pdf.text(`${dayjs(dataToSend.ApprovalDate).format('DD/MM/YYYY')}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 3.0);
                        }
                        if (dataToSend.ReviewedBy) {
                            pdf.text("Reviewed By", 1, (pdf.internal.pageSize.getHeight() / 2) + 3.3);
                            pdf.text(`${dataToSend.ReviewedBy}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 3.3);
                            pdf.text("Reviewed Date", 1, (pdf.internal.pageSize.getHeight() / 2) + 3.6);
                            pdf.text(`${dayjs(dataToSend.ReviewDate).format('DD/MM/YYYY')}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 3.6);
                        }
                    } catch (error) {
                        console.log(error);
                    }
                } else {
                    pdf.setFontSize(15)
                    pdf.text('Powered By Feat Technology', (pdf.internal.pageSize.getWidth() / 2) - 1.3, 0.5);
                    pdf.setFontSize(10);
                    pdf.text(`${user.Company.CompanyName}`, pdf.internal.pageSize.getWidth() - 2, 0.3);
                    pdf.text('Form Data', pdf.internal.pageSize.getWidth() - 2, 0.5);
                    pdf.text(`Revision No :${dataToSend.RevisionNo}`, pdf.internal.pageSize.getWidth() - 2, 0.7);
                    pdf.text(`Creation : ${dayjs(dataToSend.CreationDate).format('DD/MM/YYYY')}`, pdf.internal.pageSize.getWidth() - 2, 0.9);
                }
            }
        }).save();
    };


    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-form-by-id/${idToWatch}`).then((res) => {
            setDataToSend(res.data.form);
            setQuestions(res.data.form.questions);
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


    return (
        <>

            <div className={style.parent}>
                <div className={`${style.form} mt-5 `}>
                    <div className='d-flex flex-row bg-white px-lg-3  px-2 py-2'>
                        <BsArrowLeftCircle
                            role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                                {
                                    dispatch(updateTabData({ ...tabData, Tab: 'Master List of Records/Forms' }))
                                }
                            }} />

                    </div>
                    <div className={style.headers}>
                        <div className={style.spans}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div className={style.para}>
                            View Form
                        </div>

                    </div>
                    <div className={`${style.sec1}  px-3`}>
                        <form encType='multipart/form-data' onSubmit={(event) => {
                            event.preventDefault();
                            alertManager();
                        }}>
                                <div className='w-100'>
                                    <p className='text-black'>Department</p>
                                    <div>
                                        <input autoComplete='off' value={dataToSend?.Department.DepartmentName} className='w-100' name='FormDescription' type="text" readOnly />
                                    </div>
                                </div>
                                <div className='w-100'>
                                    <p className='text-black'>Document Type</p>
                                    <div>
                                        <input autoComplete='off' value={dataToSend?.DocumentType} className='w-100' name='FormDescription' type="text" readOnly />
                                    </div>
                                </div>
                            <div id='printable'  className={`${style.sec1}`}>
                                <div className='w-100'>
                                    <p className='text-black'>Maintenance Frequency</p>
                                    <div>
                                        <input autoComplete='off' value={dataToSend?.MaintenanceFrequency} className='w-100' name='FormDescription' type="text" readOnly />
                                    </div>
                                </div>
                                <div className='w-100'>
                                    <p className='text-black'>Form Name</p>
                                    <div>

                                        <input autoComplete='off' value={dataToSend?.FormName} className='w-100' name='FormName' type="text" readOnly />
                                    </div>
                                </div>
                                <div className='w-100'>
                                    <p className='text-black'>Form Description</p>
                                    <div>
                                        <input autoComplete='off' value={dataToSend?.FormDescription} className='w-100' name='FormDescription' type="text" readOnly />
                                    </div>
                                </div>
                                {questions.map((question, index) => {
                                    return (
                                        <div style={{
                                            borderRadius: '6px'
                                        }} className='bg-white my-4 p-3'>
                                            <div className='d-flex bg-white justify-content-between '>
                                                <div style={{
                                                    width: '100%'
                                                }} className=' me-3 d-flex flex-column'>
                                                    <input autoComplete='off' value={dataToSend?.questions[index]?.questionText} style={{
                                                        borderRadius: '0px'
                                                    }} name='questionText' className='border-bottom border-secondary bg-light mt-2 mb-3 w-100 p-3' readOnly />

                                                </div>

                                            </div>


                                            {(questions[index].questionType === 'ShortText' || questions[index].questionType === 'LongText') && (
                                                <div>


                                                </div>

                                            )}

                                            {(questions[index].questionType === 'Multiplechoicegrid') && (
                                                <>

                                                    <div className={`${style.gridCover}`}>
                                                        <table className='table table-bordered'>
                                                            <thead>
                                                                <tr>
                                                                    <th style={{
                                                                        minWidth: '120px'
                                                                    }}>R\C</th>
                                                                    {questions[index]?.columns.map((column, colIndex) => {
                                                                        return (
                                                                            <th style={{
                                                                                minWidth: '80px'
                                                                            }}>
                                                                                <input autoComplete='off' value={dataToSend?.questions[index].columns[colIndex].colTitle} className={`bg-light border-bottom border-secondary d-inline py-0 px-1 mx-1 ${style.noRadius}`} type='text' required readOnly />
                                                                            </th>
                                                                        )
                                                                    })}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {questions[index]?.rows?.map((row, rowIndex) => {
                                                                    return (

                                                                        <tr>
                                                                            <td>
                                                                                <span>{rowIndex + 1}.</span>
                                                                                <input autoComplete='off' value={dataToSend?.questions[index].rows[rowIndex].rowTitle} name='rowTitle' type='text' style={{
                                                                                    borderRadius: '0px'
                                                                                }} className='bg-light border-bottom border-secondary  px-2 py-0 d-inline' readOnly />
                                                                            </td>
                                                                            {questions[index]?.columns.map((colnum, colIndex) => {
                                                                                return (
                                                                                    <td>
                                                                                        <input autoComplete='off' className='mx-2' style={{
                                                                                            width: '20px',
                                                                                            height: '20px'
                                                                                        }} name={`R${rowIndex}`} type='radio' readOnly />
                                                                                    </td>
                                                                                )
                                                                            })}
                                                                        </tr>
                                                                    )
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                </>
                                            )}

                                            {(questions[index].questionType === 'Checkboxgrid') && (
                                                <>
                                                    <div className={`${style.gridCover}`}>
                                                        <table className='table table-bordered'>
                                                            <thead>
                                                                <tr>
                                                                    <th style={{
                                                                        minWidth: '120px'
                                                                    }}>R\C</th>
                                                                    {questions[index]?.columns.map((column, colIndex) => {
                                                                        return (
                                                                            <th style={{
                                                                                minWidth: '80px'
                                                                            }}>
                                                                                <input autoComplete='off' value={dataToSend?.questions[index].columns[colIndex].colTitle} className={`bg-light border-bottom border-secondary d-inline py-0 px-1 mx-1 ${style.noRadius}`} type='text' required readOnly />
                                                                            </th>
                                                                        )
                                                                    })}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {questions[index]?.rows?.map((row, rowIndex) => {
                                                                    return (

                                                                        <tr>
                                                                            <td>
                                                                                <span>{rowIndex + 1}.</span>
                                                                                <input autoComplete='off' value={dataToSend?.questions[index].rows[rowIndex].rowTitle} name='rowTitle' type='text' style={{
                                                                                    borderRadius: '0px'
                                                                                }} className='bg-light border-bottom border-secondary  px-2 py-0 d-inline' readOnly />
                                                                            </td>
                                                                            {questions[index]?.columns.map((colnum, colIndex) => {
                                                                                return (
                                                                                    <td>
                                                                                        <input autoComplete='off' className='mx-2' style={{
                                                                                            width: '20px',
                                                                                            height: '20px'
                                                                                        }} type='checkbox' readOnly />
                                                                                    </td>
                                                                                )
                                                                            })}
                                                                        </tr>
                                                                    )
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </>
                                            )}
                                            {(questions[index].questionType === 'Dropdown' || questions[index].questionType === 'Checkbox' || questions[index].questionType === 'Multiplechoice') && (
                                                <div className=' d-flex flex-column'>
                                                    {questions[index]?.options?.map((option, optindex) => {
                                                        return (

                                                            <div className='my-2 d-flex flex-row'>


                                                                <span>{optindex + 1}.</span>

                                                                <input autoComplete='off' type='text' value={dataToSend?.questions[index]?.options[optindex].optionText} style={{
                                                                    borderRadius: '0px'
                                                                }} name='optionText' className='bg-light border-bottom border-secondary w-50 px-2 py-0 d-inline' readOnly />
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )}

                                            {questions[index].questionType === 'Linearscale' && (
                                                <div className=' d-flex flex-column'>

                                                    <div className='d-flex flex-row '>
                                                        <div className='d-flex flex-column'>
                                                            <span>Low :</span>

                                                            <span className='m-2 fw-bold'>{dataToSend?.questions[index].minValue}</span>
                                                        </div>
                                                        <div className='d-flex flex-column'>
                                                            <span>-</span>

                                                            <span className='m-2'>To</span>
                                                        </div>
                                                        <div className='d-flex flex-column'>
                                                            <span>High :</span>
                                                            <span className='m-2 fw-bold'>{dataToSend?.questions[index].maxValue}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <div className='my-2 mt-4 d-flex justify-content-end'>
                                                <p className='mx-2 mt-1' style={{
                                                    fontFamily: 'Inter',
                                                    color: 'black'
                                                }}>Required</p>
                                                <label className={style.switch}>
                                                    <input autoComplete='off' className='ms-3' name='IsPass' type="checkbox" checked={dataToSend?.questions[index].Required} />
                                                    <span className={`${style.slider} ${style.round}`} ></span>
                                                </label>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </form>
                        <div className={style.btns}>
                            <button onClick={() => {
                                downloadPDF();
                            }} className='mt-3' type='button'>Download</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ViewForm
