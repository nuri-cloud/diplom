import { useState, useContext, useEffect } from "react";
import "./AuthModal.scss";
import { registerRequest, confirmRequest, loginRequest } from "../../../api/auth.api.js";
import { AuthContext } from "../../context/AuthContext";
import closeIcon from "../../../assets/svg/close.svg";
import eyeIcon from "../../../assets/svg/ease.svg"; 
import eyeOffIcon from "../../../assets/svg/ease1.svg"; 

export default function AuthModal({ onClose }) {
  const { login } = useContext(AuthContext);
  const [step, setStep] = useState("auth"); 
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", repeat: "", code: "" });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: false });
  };

  const validate = () => {
    let newErrors = {};
    if (!isLoginMode) {
      if (!/^[a-zA-Zа-яА-ЯёЁ\s]+$/.test(form.name)) newErrors.name = true;
      if (form.password !== form.repeat) newErrors.repeat = true;
    }
    if (!form.email.includes("@")) newErrors.email = true;
    if (form.password.length < 8) newErrors.password = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async () => {
    if (!validate()) return;
    try {
      if (isLoginMode) {
        const res = await loginRequest({ email: form.email, password: form.password });
        login(res.data.user, res.data.token);
        setStep("success"); // Показываем поздравление
      } else {
        await registerRequest(form);
        setStep("code");
      }
    } catch (err) {
      alert("Ошибка! Проверьте данные или почту.");
    }
  };

  const handleConfirm = async () => {
    try {
      const res = await confirmRequest({ email: form.email, code: form.code });
      login(res.data.user, res.data.token);
      setStep("success");
    } catch {
      setErrors({ code: true });
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <button className="close-btn" onClick={onClose}><img src={closeIcon} alt="x"/></button>

        {step === "auth" && (
          <div className="auth-form">
            <h2>{isLoginMode ? "Вход" : "Регистрация"}</h2>
            {!isLoginMode && (
              <input name="name" className={errors.name ? "error" : ""} placeholder="Имя (буквы)" onChange={handleChange} />
            )}
            <input name="email" className={errors.email ? "error" : ""} placeholder="Email" onChange={handleChange} />
            <div className="password-field">
              <input name="password" type={showPass ? "text" : "password"} className={errors.password ? "error" : ""} placeholder="Пароль" onChange={handleChange} />
              <img src={showPass ? eyeOffIcon : eyeIcon} onClick={() => setShowPass(!showPass)} alt="eye" />
            </div>
            {!isLoginMode && (
              <input name="repeat" type="password" className={errors.repeat ? "error" : ""} placeholder="Повтор пароля" onChange={handleChange} />
            )}
            <button className="main-btn" onClick={handleAuth}>{isLoginMode ? "Войти" : "Продолжить"}</button>
            <p className="switch-text" onClick={() => setIsLoginMode(!isLoginMode)}>
              {isLoginMode ? "Нет аккаунта? Регистрация" : "Есть аккаунт? Войти"}
            </p>
          </div>
        )}

        {step === "code" && (
          <div className="auth-form">
            <h2>Введите код</h2>
            <input name="code" className={errors.code ? "error" : ""} placeholder="000000" onChange={handleChange} />
            <button className="main-btn" onClick={handleConfirm}>Подтвердить</button>
          </div>
        )}

        {step === "success" && (
          <div className="auth-form success-step">
            <div className="success-icon">🎉</div>
            <h2>Поздравляем!</h2>
            <p>Вы успешно зашли в систему.</p>
            <button className="main-btn" onClick={onClose}>Начать работу</button>
          </div>
        )}
      </div>
    </div>
  );
}