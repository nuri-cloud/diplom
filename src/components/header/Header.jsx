// src/components/header/Header.jsx
import { useState, useContext } from "react";
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

  const handleLogout = () => {
    logout();
    setOpenUser(false);
    navigate("/login");
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
          <div className="lang-switch">
            <button onClick={() => setOpenLang(!openLang)}>
              {lang} <img src={icon} alt="" />
            </button>
            {openLang && (
              <ul>
                {["RU", "KG", "EN"].map(l => (
                  <li key={l} onClick={() => { setLang(l); setOpenLang(false); }}>
                    {l}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {user ? (
            <div className="user-dropdown">
              <button onClick={() => setOpenUser(!openUser)}>
                <img src={people} alt="" />
                <span>{user.name}</span>
              </button>
              {openUser && (
                <ul>
                  <li onClick={handleLogout}>Выйти</li>
                </ul>
              )}
            </div>
          ) : (
            <button className="login-btn" onClick={() => setOpenAuth(true)}>
              <img src={people} alt="" />
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
