import { useEffect, useState } from "react";
import { Link, usePage } from "../Router";
import { supabase } from "../main";

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
      navigate("/dashboard"); // ✅ Doğru yönlendirme
    }
  }

  return (
    <>
      
      {/* <p>
        Kullanıcı bilgilerin ile sisteme giriş yapabilirsin. Eğer bilgilerini
        hatırlamıyorsan{" "}
        <Link href="/sifremi-unuttum">şifreni sıfırla</Link>yabilirsin.
      </p> */}

      {/* <p>
        <label>
          <input
            type="checkbox"
            onChange={() => setRegister(!isRegister)}
            checked={isRegister}
          />{" "}
          Yeni kayıt oluyorum.
        </label>
      </p> */}

      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      <form autoComplete="off" onSubmit={handleSubmit}>
        <h2>Giriş yap</h2>
        {isRegister && (
          <p>
            <input required type="text" name="name" placeholder="Ad soyad" />
          </p>
        )}
        <p>
          <input
            required
            type="email"
            name="email"
            placeholder="E-posta adresi"
          />
        </p>
        <p>
          <input
            required
            type="password"
            name="password"
            placeholder="Şifre"
          />
        </p>
        <p>
          <button>{isRegister ? "Kayıt" : "Giriş Yap"}</button>
          {/* {!isRegister ? (
            <Link href="/sifremi-unuttum" className="btn btn-ghost">
              Şifremi unuttum
            </Link>
          ) : (
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setRegister(false)}
            >
              Vazgeç
            </button>
          )} */}
        </p>
      </form>
    </>
  );
}
