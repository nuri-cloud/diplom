// src/components/header/Header.jsx
import { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.scss";
import logo from "../../assets/svg/logo.svg";
import people from "../../assets/svg/people.svg";
import icon from "../../assets/svg/icon.svg";
import AuthModal from "./authModal/AuthModal";
import { AuthContext } from "../context/AuthContext";

function Header() {
  const { user, logout, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [lang, setLang] = useState("RU");
  const [openLang, setOpenLang] = useState(false);
  const [openAuth, setOpenAuth] = useState(false);
  const [openUser, setOpenUser] = useState(false);

  const langRef = useRef(null);
  const userRef = useRef(null);

  // Закрытие дропдаунов при клике вне их
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setOpenLang(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setOpenUser(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Закрытие модалки после успешной авторизации
  useEffect(() => {
    if (token && openAuth) {
      setOpenAuth(false);
    }
  }, [token]);

  const handleLogout = () => {
    logout();
    setOpenUser(false);
    navigate("/dashboard");
  };

  return (
    <header className="header">
      <div className="header__container">
        <Link to="/" className="header__logo">
          <img src={logo} alt="logo" />
        </Link>

        <nav className="header__nav">
          {token ? (
            <>
              <Link to="/dashboard">Дашборд</Link>
              <Link to="/logs">Логи</Link>
              <Link to="/settings">Настройки</Link>
            </>
          ) : (
            <>
              <a href="#about">О приложении</a>
              <a href="#features">Выгода</a>
              <a href="#problem">Проблема</a>
            </>
          )}
        </nav>

        <div className="header__right">
          <div className="lang-switch" ref={langRef}>
            <button onClick={() => setOpenLang(!openLang)}>
              {lang} <img src={icon} alt="" />
            </button>
            {openLang && (
              <ul className="lang-dropdown">
                {["RU", "KG", "EN"].map(l => (
                  <li 
                    key={l} 
                    onClick={() => { 
                      setLang(l); 
                      setOpenLang(false); 
                    }}
                    className={lang === l ? "active" : ""}
                  >
                    {l}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {token && user ? (
            <div className="user-dropdown" ref={userRef}>
              <button 
                className="user-btn" 
                onClick={() => setOpenUser(!openUser)}
              >
                <img src={people} alt="Пользователь" />
                <span>{user.name}</span>
                <img 
                  src={icon} 
                  alt="" 
                  className={`arrow ${openUser ? "open" : ""}`}
                />
              </button>
              {openUser && (
                <ul className="user-menu">
                  <li onClick={handleLogout} className="logout">
                    Выйти
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <button 
              className="login-btn" 
              onClick={() => setOpenAuth(true)}
            >
              <img src={people} alt="Вход" />
              Вход
            </button>
          )}
        </div>
      </div>

      {openAuth && <AuthModal onClose={() => setOpenAuth(false)} />}
    </header>
  );
}

export default Header;