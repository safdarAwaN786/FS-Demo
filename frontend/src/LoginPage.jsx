import axios from "axios";
import style from "./MainPage.module.css";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import { logInUser } from "./redux/slices/authSlice";
import { setLoading } from "./redux/slices/loading";
import { ScaleLoader } from "react-spinners";

export default function LoginPage() {
  const [credentials, setCredentials] = useState(null);
  const [showPassword, setShowPassword] = useState(false); // State variable to toggle password visibility
  const loggedIn = useSelector((state) => state.auth.loggedIn);
  const dispatch = useDispatch();
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const loading = useSelector((state) => state.loading);
  const navigate = useNavigate();
  useEffect(() => {
    const userToken = Cookies.get("userToken");
    if (loggedIn) {
      navigate("/quality-and-maintenance");
    }
    if (userToken) {
      axios
        .get(`${process.env.REACT_APP_BACKEND_URL}/get-user`, {
          headers: { Authorization: `Bearer ${userToken}` },
        })
        .then((response) => {
          dispatch(logInUser(response.data.data));
          dispatch(setLoading(false));
        })
        .catch((error) => {
          dispatch(setLoading(false));
          console.error("Error fetching user data:", error);
        });
    } else {
      dispatch(setLoading(false));
    }
  }, []);

  const makeRequest = () => {
    console.log(credentials);
    if (credentials) {
      dispatch(setLoading(true));
      axios
        .post(`${process.env.REACT_APP_BACKEND_URL}/user/login`, credentials)
        .then((response) => {
          const { Token } = response.data;
          Cookies.set("userToken", Token);
          dispatch(logInUser(null));
          Swal.fire({
            title: "Success",
            text: "Logged In Successfully",
            icon: "success",
            confirmButtonText: "Go!",
          });
        })
        .catch((error) => {
          console.log(error);
          dispatch(setLoading(false));
          console.log(error.response?.status);
          console.log(error.response?.data.message);
          if (
            error.response?.status === 401 ||
            error.response?.status === 400 ||
            error.response?.status === 403
          ) {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: error.response.data.message,
              confirmButtonText: "OK.",
            });
          } else if (error.response?.status === 500) {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Sorry, Try Again Please !",
              confirmButtonText: "OK.",
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Wrong Credentials !",
              confirmButtonText: "OK.",
            });
          }
        });
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Kindly Provide Credentials",
        confirmButtonText: "OK.",
      });
    }
  };

  return (
    <>
      {loading && (
        <div className={style.loaderContainer}>
          <div className={style.loaderInner}>
            <ScaleLoader
              color="#eb5757"
              cssOverride={{}}
              height={35}
              loading
              margin={2}
              radius={5}
              width={8}
            />
          </div>
        </div>
      )}
      <div
        style={{
          height: "100vh",
          fontFamily: "Poppins",
          backgroundColor: "#3E8968"
        }}
        className="w-100 ps-lg-5 pe-lg-3 m-auto pt-lg-4 pb-lg-3 ps-2 pt-2 row"
      >
        <div className="col-lg-6 col-md-6 bg-light rounded col-12 p-lg-5 p-md-4 d-flex justify-content-center align-items-center p-2">
          <img
            src="https://res.cloudinary.com/dlpm25stx/image/upload/v1747509273/fsq-log-removebg-preview_zyrlat.png"
            alt="Feat Tech Solution"
          />
          {/* <h1
            style={{
              fontFamily: "Poppins",
            }}
            className="fw-bold text-center my-4"
          >
            Food Safety and Quality Compliance
          </h1> */}
        </div>
        <div className="col-lg-6 col-md-6 bg-light rounded col-12 p-lg-5 p-md-4 d-flex justify-content-center align-items-center p-lg-5 p-3">
          <div
            style={{
              boxShadow: "2px 5px 20px rgb(197, 197, 197)",
              borderRadius: "8px",
            }}
            className="bg-white mx-lg-5 mx-2 px-lg-5 px-4 py-5 mx-auto"
          >
            <h3>Welcome! We're thrilled you're here.</h3>
            <p>Please sign in to your account and start adventure</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                makeRequest();
              }}
            >
              <div className="my-3 mt-5">
                <p className="my-0">username</p>
                <input
                  onChange={(e) => {
                    setCredentials({
                      ...credentials,
                      [e.target.name]: e.target.value,
                    });
                  }}
                  style={{
                    borderRadius: "5px",
                    border: "2px solid #d5d6f0",
                  }}
                  type="text"
                  name="userName"
                  className="w-100 p-1 "
                  required
                />
              </div>
              <div className="my-3">
                <p className="my-0">Password</p>
                <div
                  style={{
                    borderRadius: "5px",
                    border: "2px solid #d5d6f0",
                  }}
                  className="d-flex flex-row align-items-center w-100"
                >
                  <input
                    style={{
                      // Add the following styles to prevent the border color from changing on focus
                      outline: "none", // Remove the default focus outline
                      boxShadow: "none", // Remove any box shadow on focus
                    }}
                    onChange={(e) => {
                      setCredentials({
                        ...credentials,
                        [e.target.name]: e.target.value,
                      });
                    }}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="w-100 border-0 p-1"
                    required
                  />
                  {showPassword ? (
                    <AiFillEyeInvisible
                      onClick={togglePasswordVisibility}
                      style={{
                        cursor: "pointer",
                      }}
                      className="fs-4 me-1"
                    />
                  ) : (
                    <AiFillEye
                      onClick={togglePasswordVisibility}
                      style={{
                        cursor: "pointer",
                      }}
                      className="fs-4 me-1"
                    />
                  )}
                </div>
              </div>
              <button type="sumit" style={{backgroundColor: '#1E5B67', borderColor: '#1E5B67'}} className="btn btn-danger py-2 w-100 mt-5 ">
                Sign in
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
