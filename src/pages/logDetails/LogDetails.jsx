import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLogByIdRequest } from "../../api/auth.api";
import { AuthContext } from "../../components/context/AuthContext";
import "./LogDetails.scss";

export default function LogDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token && id) {
      fetchLog();
    } else {
      setLoading(false);
    }
  }, [token, id]);

  const fetchLog = async () => {
    try {
      setLoading(true);
      const data = await getLogByIdRequest(id);
      setLog(data);
      setError("");
    } catch (err) {
      console.error("Ошибка загрузки лога:", err);
      setError(err.detail || err.message || "Ошибка загрузки лога");
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level) => {
    const colors = {
      error: "#e74c3c",
      warning: "#f39c12",
      info: "#3498db",
      debug: "#95a5a6"
    };
    return colors[level?.toLowerCase()] || "#333";
  };

  if (!token) {
    return (
      <div className="log-details-container">
        <h2>Доступ ограничен</h2>
        <p>Детали лога доступны только авторизованным пользователям</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="log-details-container">
        <button className="back-btn" onClick={() => navigate("/logs")}>
          ← Назад к логам
        </button>
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="log-details-container">
        <button className="back-btn" onClick={() => navigate("/logs")}>
          ← Назад к логам
        </button>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="log-details-container">
        <button className="back-btn" onClick={() => navigate("/logs")}>
          ← Назад к логам
        </button>
        <div className="empty-state">Лог не найден</div>
      </div>
    );
  }

  return (
    <div className="log-details-container">
      <button className="back-btn" onClick={() => navigate("/logs")}>
        ← Назад к логам
      </button>

      <div className="log-card">
        <div className="log-header">
          <div>
            <h2>Лог #{log.id}</h2>
            <span 
              className="level-badge"
              style={{ backgroundColor: getLevelColor(log.level) }}
            >
              {log.level}
            </span>
          </div>
          <div className="log-time">
            {new Date(log.timestamp).toLocaleString('ru', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
        </div>

        <div className="log-body">
          <div className="info-section">
            <h3>Информация</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Источник:</label>
                <code>{log.source}</code>
              </div>
              <div className="info-item">
                <label>ID:</label>
                <span>{log.id}</span>
              </div>
              <div className="info-item full-width">
                <label>Сообщение:</label>
                <p className="message">{log.message}</p>
              </div>
            </div>
          </div>

          {log.stack_trace && (
            <div className="stack-section">
              <h3>Stack Trace</h3>
              <pre className="stack-trace">{log.stack_trace}</pre>
            </div>
          )}

          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div className="metadata-section">
              <h3>Метаданные</h3>
              <pre className="metadata">{JSON.stringify(log.metadata, null, 2)}</pre>
            </div>
          )}

          {(!log.stack_trace && (!log.metadata || Object.keys(log.metadata).length === 0)) && (
            <div className="empty-section">
              <p>Дополнительная информация отсутствует</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}