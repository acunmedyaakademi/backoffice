import { useEffect, useState } from "react";
import { usePage } from "../Router";
import { supabase } from "../main";
import "../assets/css/LoginRegister.css"
import loginImage from '../assets/img/login.svg';

export default function LoginRegister() {
  const [isRegister, setRegister] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const { navigate } = usePage();

  useEffect(() => {
    setErrorMessage(null);
  }, [isRegister]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(e.target);
    const userInfo = Object.fromEntries(formData); // { email, password }

    if (isRegister) {
      setErrorMessage("Kayıt işlemi devre dışı.");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: userInfo.email,
      password: userInfo.password
    });

    if (error) {
      console.error(error.message);
      setErrorMessage("Giriş başarısız: " + error.message);
    } else {
      navigate("/dashboard");
    }
  }

  return (
    <div className="container">
      <div className="login-text-area">
        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

        <form className="loginForm" autoComplete="off" onSubmit={handleSubmit}>
          <h1>
            <svg width="300" height="100" viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="150" cy="50" rx="120" ry="40" fill="#F4C7B8" />
              <text x="50%" y="50%" font-family="Georgia, serif" font-size="48" font-weight="bold" fill="#222"
                text-anchor="middle" alignment-baseline="central">
                MUTFO
              </text>
            </svg>

          </h1>
          <h2>Giriş yap</h2>
          {isRegister && (
            <p>
              <input required type="text" name="name" placeholder="Ad soyad" />
            </p>
          )}
          <p className="input-parts">
            <span>E-posta adresi</span>
            <input
              required
              type="email"
              name="email"
            />
          </p>
          <p className="input-parts">
            <span>Şifre</span>
            <input
              required
              type="password"
              name="password"
            />
          </p>
          <p>
            <button className="loginBtn" >{isRegister ? "Kayıt" : "Giriş Yap"}</button>
          </p>
        </form>
      </div>
      <div className="login-img-area">
        <img src={loginImage} alt="Login" />
      </div>
    </div>
  );
}
