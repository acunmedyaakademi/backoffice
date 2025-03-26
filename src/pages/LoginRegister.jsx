import { useEffect, useState } from "react";
import { usePage } from "../Router";
import { supabase } from "../main";
import "../assets/css/LoginRegister.css"
import RotatingFoodCircle from "../pages/RotatingFoodCircle";

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
    const userInfo = Object.fromEntries(formData); // email password

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
    <div className="login-container">
      <div className="login-text-area">
        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
        <h1>
          <svg width="300" height="100" viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="150" cy="50" rx="100" ry="40" fill="#F4C7B8" />
            <text x="50%" y="50%" fontFamily="Georgia, serif" fontSize="60" fontWeight="bold" fill="#222"
              textAnchor="middle" alignmentBaseline="central">
              MUTFO
            </text>
          </svg>
        </h1>
        <form className="loginForm" autoComplete="off" onSubmit={handleSubmit}>
          <div className="login-content">
            <h3>Sign In</h3>
            <p>Sign in to stay connected.</p>
          </div>
          {isRegister && (
            <p>
              <input required type="text" name="name" placeholder="Ad soyad" />
            </p>
          )}
          <div className="input-parts">
            <div className="input-email">
              <span>Email</span>
              <input
                required
                type="email"
                name="email"
              />
            </div>
            <div className="input-password">
              <span>Password</span>
              <input
                required
                type="password"
                name="password"
              />
            </div>
          </div>
          <div className="loginBtn">
            <button>Sign in</button>
          </div>
        </form>
      </div>
      <div className="login-img-area flex items-center justify-center">
        <RotatingFoodCircle />
      </div>
    </div>
  );
}