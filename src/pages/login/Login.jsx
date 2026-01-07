// import { useState, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import { AuthContext } from "../../components/context/AuthContext";
// import { loginRequest } from "../../api/auth.api";

// export default function Login() {
//   const { login } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     email: "",
//     password: "",
//   });

//   const handleLogin = async () => {
//     try {
//       const res = await loginRequest(form);

//       // 🔥 ВАЖНО
//       login(res.data.user, res.data.access_token);

//       navigate("/");
//     } catch (e) {
//       alert("Неверный email или пароль");
//     }
//   };

//   return (
//     <div className="login-page">
//       <h2>С возвращением 👋</h2>

//       <input
//         placeholder="Email"
//         value={form.email}
//         onChange={(e) => setForm({ ...form, email: e.target.value })}
//       />

//       <input
//         type="password"
//         placeholder="Пароль"
//         value={form.password}
//         onChange={(e) => setForm({ ...form, password: e.target.value })}
//       />

//       <button onClick={handleLogin}>Войти</button>
//     </div>
//   );
// }
