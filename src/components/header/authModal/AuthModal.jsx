import { useState, useContext } from "react";
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
  const [showRepeatPass, setShowRepeatPass] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", repeat: "", code: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: false });
    setErrorMessage("");
  };

  const validate = () => {
    let newErrors = {};
    if (!isLoginMode) {
      if (!form.name.trim()) {
        newErrors.name = true;
      } else if (!/^[a-zA-Zа-яА-ЯёЁ\s]+$/.test(form.name)) {
        newErrors.name = true;
      }
      if (form.password !== form.repeat) {
        newErrors.repeat = true;
      }
    }
    if (!form.email.includes("@") || !form.email.includes(".")) {
      newErrors.email = true;
    }
    if (form.password.length < 8) {
      newErrors.password = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleAuth = async () => {
  if (!validate()) {
    setErrorMessage("Пожалуйста, заполните все поля корректно");
    return;
  }
  
  setLoading(true);
  setErrorMessage("");
  
  try {
    if (isLoginMode) {
      console.log("🔐 Попытка входа с:", { email: form.email.trim() });
      
      const res = await loginRequest({ 
        email: form.email.trim(), 
        password: form.password 
      });
      
      console.log("✅ Ответ сервера:", res);
      
      const token = res.access_token;
      
      if (token) {
        const user = {
          email: form.email.trim(),
          name: form.email.split('@')[0]
        };
        
        console.log("✅ Сохраняем:", { user, token });
        
        login(user, token);
        setTimeout(() => onClose(), 100);
      } else {
        console.error("❌ Токен не найден в ответе:", res);
        setErrorMessage("Ошибка получения токена авторизации");
      }
    } else {
      // 🔥 РЕГИСТРАЦИЯ
      console.log("📝 Регистрация с данными:", {
        email: form.email.trim(),
        name: form.name.trim(),
        password: "***"
      });
      
      await registerRequest({
        email: form.email.trim(),
        name: form.name.trim(),
        password: form.password
      });
      
      console.log("✅ Регистрация успешна, переход к вводу кода");
      console.log("🔑 Пароль сохранен в форме:", form.password ? "Да" : "Нет");
      
      // ✅ НЕ ОЧИЩАЕМ ПАРОЛЬ! Он нужен для автологина
      setStep("code");
    }
  } catch (err) {
    console.error("Auth error:", err);
    
    const message = err.detail || 
                   err.message ||
                   (isLoginMode ? "Неверный email или пароль" : "Ошибка регистрации. Возможно, email уже используется");
    setErrorMessage(message);
  } finally {
    setLoading(false);
  }
};

const handleConfirm = async () => {
  if (!form.code || form.code.length !== 6) {
    setErrors({ code: true });
    setErrorMessage("Введите 6-значный код");
    return;
  }

  setLoading(true);
  setErrorMessage("");

  try {
    console.log("📤 Подтверждение кода:", { email: form.email, code: form.code });
    
    // Шаг 1: Подтверждаем email
    await confirmRequest({ 
      email: form.email, 
      code: form.code 
    });
    
    console.log("✅ Email подтвержден успешно");
    
    // Шаг 2: Проверяем, что пароль есть
    if (!form.password) {
      console.error("❌ Пароль потерян!");
      setErrorMessage("Ошибка: пароль не сохранен. Пожалуйста, войдите вручную");
      setIsLoginMode(true);
      setStep("auth");
      return;
    }
    
    console.log("🔐 Автоматический вход после подтверждения...");
    console.log("📧 Email:", form.email.trim());
    console.log("🔑 Пароль сохранен:", form.password ? "Да" : "Нет");
    
    // Шаг 3: Автоматически логиним пользователя
    const loginRes = await loginRequest({
      email: form.email.trim(),
      password: form.password
    });
    
    console.log("✅ Ответ loginRequest:", loginRes);
    
    if (loginRes.access_token) {
      const user = {
        email: form.email.trim(),
        name: form.name.trim() || form.email.split('@')[0]
      };
      
      console.log("✅ Сохраняем токен и пользователя:", { user, token: loginRes.access_token });
      
      login(user, loginRes.access_token);
      
      // Закрываем модалку
      setTimeout(() => {
        onClose();
      }, 100);
    } else {
      console.error("❌ Токен не найден в ответе loginRequest");
      throw new Error("Не удалось получить токен авторизации");
    }
    
  } catch (err) {
    console.error("❌ Ошибка в handleConfirm:", err);
    setErrors({ code: true });
    setErrorMessage(err.detail || err.message || "Ошибка подтверждения. Попробуйте войти вручную");
  } finally {
    setLoading(false);
  }
};
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (step === "auth") {
        handleAuth();
      } else if (step === "code") {
        handleConfirm();
      }
    }
  };

  const switchMode = () => {
    setIsLoginMode(!isLoginMode);
    setErrors({});
    setErrorMessage("");
    setForm({ name: "", email: "", password: "", repeat: "", code: "" });
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} disabled={loading}>
          <img src={closeIcon} alt="Закрыть"/>
        </button>

        {step === "auth" && (
          <div className="auth-form">
            <h2>{isLoginMode ? "Вход" : "Регистрация"}</h2>
            
            {!isLoginMode && (
              <input 
                name="name" 
                className={errors.name ? "error" : ""} 
                placeholder="Имя (только буквы)" 
                value={form.name}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
            )}
            
            <input 
              name="email" 
              type="email"
              className={errors.email ? "error" : ""} 
              placeholder="Email" 
              value={form.email}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            
            <div className="password-field">
              <input 
                name="password" 
                type={showPass ? "text" : "password"} 
                className={errors.password ? "error" : ""} 
                placeholder="Пароль (минимум 8 символов)" 
                value={form.password}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
              <img 
                src={showPass ? eyeOffIcon : eyeIcon} 
                onClick={() => setShowPass(!showPass)} 
                alt="Показать пароль"
                className="eye-icon"
              />
            </div>
            
            {!isLoginMode && (
              <div className="password-field">
                <input 
                  name="repeat" 
                  type={showRepeatPass ? "text" : "password"} 
                  className={errors.repeat ? "error" : ""} 
                  placeholder="Повторите пароль" 
                  value={form.repeat}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                />
                <img 
                  src={showRepeatPass ? eyeOffIcon : eyeIcon} 
                  onClick={() => setShowRepeatPass(!showRepeatPass)} 
                  alt="Показать пароль"
                  className="eye-icon"
                />
              </div>
            )}

            {errorMessage && <p className="error-message">{errorMessage}</p>}
            
            <button 
              className="main-btn" 
              onClick={handleAuth}
              disabled={loading}
            >
              {loading ? "Загрузка..." : (isLoginMode ? "Войти" : "Продолжить")}
            </button>
            
            <p className="switch-text" onClick={switchMode}>
              {isLoginMode ? "Нет аккаунта? Регистрация" : "Есть аккаунт? Войти"}
            </p>
          </div>
        )}

        {step === "code" && (
          <div className="auth-form">
            <h2>Введите код</h2>
            <p className="info-text">Код отправлен на {form.email}</p>
            <input 
              name="code" 
              type="text"
              maxLength="6"
              className={errors.code ? "error" : ""} 
              placeholder="000000" 
              value={form.code}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <button 
              className="main-btn" 
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? "Проверка..." : "Подтвердить"}
            </button>
            <p className="switch-text" onClick={() => setStep("auth")}>
              Назад к регистрации
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="auth-form success-step">
            <div className="success-icon">🎉</div>
            <h2>Поздравляем!</h2>
            <p>Вы успешно {isLoginMode ? "вошли" : "зарегистрировались"} в систему.</p>
            <button className="main-btn" onClick={onClose}>Начать работу</button>
          </div>
        )}
      </div>
    </div>
  );
} 