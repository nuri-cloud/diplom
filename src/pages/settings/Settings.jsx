import { useState, useEffect, useContext } from "react";
import { getSettingsRequest, updateSettingsRequest } from "../../api/auth.api";
import { AuthContext } from "../../components/context/AuthContext";
import "./Settings.scss";

export default function Settings() {
  const { token } = useContext(AuthContext);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (token) {
      getSettingsRequest()
        .then(setSettings)
        .catch(err => {
          console.error("Ошибка загрузки:", err);
          setError(err.detail || err.message || "Ошибка загрузки настроек");
        });
    }
  }, [token]);

  const save = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      await updateSettingsRequest({ 
        retention_days: Number(settings.retention_days) 
      });
      setSuccess("Настройки успешно сохранены!");
      
      // Убираем сообщение через 3 секунды
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Ошибка сохранения:", err);
      const message = err.detail || err.message || "Ошибка сохранения";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="settings-container">
        <h2>Доступ ограничен</h2>
        <p>Настройки доступны только авторизованным пользователям</p>
      </div>
    );
  }

  if (!settings) return <div className="settings-container">Загрузка...</div>;

  return (
    <div className="settings-container">
      <h1>Настройки</h1>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="card">
        <label>Срок хранения логов (дней)</label>
        <input 
          type="number" 
          min="1"
          max="365"
          value={settings.retention_days} 
          onChange={e => setSettings({...settings, retention_days: e.target.value})} 
          disabled={loading}
        />
        
        <div className="info-section">
          <p><strong>Роли:</strong> {settings.roles?.join(", ")}</p>
          {settings.api_tokens && settings.api_tokens.length > 0 && (
            <>
              <p><strong>API токены:</strong> {settings.api_tokens.length} шт.</p>
              <div className="tokens-list">
                {settings.api_tokens.map((token, index) => (
                  <div key={index} className="token-item">
                    <code>{token}</code>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        
        <button 
          className="main-btn" 
          onClick={save}
          disabled={loading}
        >
          {loading ? "Сохранение..." : "Сохранить"}
        </button>
      </div>
    </div>
  );
}