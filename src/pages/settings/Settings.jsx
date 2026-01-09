import { useState, useEffect, useContext } from "react";
import {
  getApiTokenRequest,
  rotateApiTokenRequest,
  getRolesRequest,
  setRetentionPolicyRequest
} from "../../api/auth.api";
import "./Settings.scss";
import { AuthContext } from "../../components/context/AuthContext";

export default function SettingsPage() {
  const { token, user } = useContext(AuthContext);
  
  // Проверка, является ли пользователь админом
  const isAdmin = user?.role === "admin" || user?.role === "ADMIN";
  
  // API Token
  const [apiToken, setApiToken] = useState(null);
  const [showToken, setShowToken] = useState(false);
  const [rotatingToken, setRotatingToken] = useState(false);
  
  // Roles
  const [roles, setRoles] = useState([]);
  
  // Retention Policy
  const [retentionDays, setRetentionDays] = useState(30);
  const [savingRetention, setSavingRetention] = useState(false);
  
  // Loading & Errors
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (token) {
      loadSettings();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Токен доступен всем
      const tokenData = await getApiTokenRequest().catch(() => null);
      setApiToken(tokenData?.api_token || null);
      
      // Роли только для админа
      if (isAdmin) {
        const rolesData = await getRolesRequest().catch(() => []);
        setRoles(rolesData || []);
        console.log("📦 Settings loaded (Admin):", { tokenData, rolesData });
      } else {
        console.log("📦 Settings loaded (User):", { tokenData });
      }
      
    } catch (err) {
      console.error("Ошибка загрузки настроек:", err);
      setError(err.message || "Ошибка загрузки настроек");
    } finally {
      setLoading(false);
    }
  };

  const handleRotateToken = async () => {
    if (!confirm("Вы уверены? Старый токен перестанет работать!")) {
      return;
    }
    
    try {
      setRotatingToken(true);
      setError("");
      setSuccessMessage("");
      
      const data = await rotateApiTokenRequest();
      
      console.log("🔄 Новый токен:", data);
      
      setApiToken(data.api_token);
      setSuccessMessage("API токен успешно обновлен!");
      setShowToken(true);
      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Ошибка ротации токена:", err);
      setError(err.message || "Ошибка обновления токена");
    } finally {
      setRotatingToken(false);
    }
  };

  const handleCopyToken = () => {
    if (apiToken) {
      navigator.clipboard.writeText(apiToken);
      setSuccessMessage("Токен скопирован в буфер обмена!");
      setTimeout(() => setSuccessMessage(""), 2000);
    }
  };

  const handleSaveRetention = async () => {
    try {
      setSavingRetention(true);
      setError("");
      setSuccessMessage("");
      
      await setRetentionPolicyRequest({ retention_days: retentionDays });
      
      setSuccessMessage(`Политика хранения установлена: ${retentionDays} дней`);
      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Ошибка сохранения политики:", err);
      setError(err.message || "Ошибка сохранения политики хранения");
    } finally {
      setSavingRetention(false);
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

  if (loading) {
    return (
      <div className="settings-container">
        <div className="loading">Загрузка настроек...</div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <h2>Настройки</h2>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      {/* API Token Section - доступен всем */}
      <section className="settings-section">
        <h3>🔑 API Токен</h3>
        <p className="section-description">
          Используйте этот токен для интеграции с внешними сервисами
        </p>
        
        <div className="token-container">
          <div className="token-display">
            <input 
              type={showToken ? "text" : "password"}
              value={apiToken || "Токен не создан"}
              readOnly
              className="token-input"
            />
            <button 
              className="toggle-btn"
              onClick={() => setShowToken(!showToken)}
              disabled={!apiToken}
            >
              {showToken ? "👁️" : "🔒"}
            </button>
            <button 
              className="copy-btn"
              onClick={handleCopyToken}
              disabled={!apiToken}
            >
              📋 Копировать
            </button>
          </div>
          
          <button 
            className="rotate-btn"
            onClick={handleRotateToken}
            disabled={rotatingToken}
          >
            {rotatingToken ? "⏳ Обновление..." : "🔄 Обновить токен"}
          </button>
        </div>
      </section>

      {/* Retention Policy Section - только для админа */}
      {isAdmin && (
        <section className="settings-section">
          <h3>🗄️ Политика хранения логов</h3>
          <p className="section-description">
            Установите период хранения логов в днях
          </p>
          
          <div className="retention-container">
            <div className="input-group">
              <label>Хранить логи (дней):</label>
              <input 
                type="number"
                min="1"
                max="365"
                value={retentionDays}
                onChange={(e) => setRetentionDays(parseInt(e.target.value) || 1)}
                className="retention-input"
              />
            </div>
            
            <button 
              className="save-btn"
              onClick={handleSaveRetention}
              disabled={savingRetention}
            >
              {savingRetention ? "💾 Сохранение..." : "💾 Установить политику"}
            </button>
          </div>
        </section>
      )}

      {/* Roles Section - только для админа */}
      {isAdmin && (
        <section className="settings-section">
          <h3>👥 Пользователи и роли</h3>
          <p className="section-description">
            Список пользователей в системе
          </p>
          
          {roles.length === 0 ? (
            <p className="empty-state">Пользователи не найдены</p>
          ) : (
            <div className="roles-list">
              {roles.map((user) => (
                <div key={user.id} className="role-item">
                  <div className="user-info">
                    <span className="user-email">{user.email}</span>
                    <span className="user-role">{user.role}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Refresh Button */}
      <button 
        className="refresh-all-btn"
        onClick={loadSettings}
        disabled={loading}
      >
        🔄 Обновить настройки
      </button>
    </div>
  );
}