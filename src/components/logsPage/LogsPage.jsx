import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getLogsRequest } from "../../api/auth.api";
import { AuthContext } from "../context/AuthContext";
import "./LogsPage.scss";

export default function LogsPage() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [allLogs, setAllLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) {
      fetchAllLogs();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchAllLogs = async () => {
    try {
      setLoading(true);
      setError("");
      
      let page = 1;
      let allFetchedLogs = [];
      let hasMore = true;
      
      // Загружаем все страницы
      while (hasMore) {
        console.log(`📥 Загрузка страницы ${page}...`);
        const data = await getLogsRequest(page, 100); // По 100 за раз
        
        if (data.logs && data.logs.length > 0) {
          allFetchedLogs = [...allFetchedLogs, ...data.logs];
          console.log(`✅ Загружено ${data.logs.length} логов (всего: ${allFetchedLogs.length})`);
          
          // Если получили меньше чем запрашивали, значит это последняя страница
          if (data.logs.length < 100) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }
      }
      
      console.log(`🎉 Всего загружено логов: ${allFetchedLogs.length}`);
      setAllLogs(allFetchedLogs);
      
    } catch (err) {
      console.error("❌ Ошибка загрузки логов:", err);
      setError(err.message || "Ошибка загрузки логов");
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
      <div className="logs-container">
        <h2>Доступ ограничен</h2>
        <p>Логи доступны только авторизованным пользователям</p>
      </div>
    );
  }

  return (
    <div className="logs-container">
      <div className="logs-header">
        <div>
          <h2>Логи системы</h2>
          <p className="logs-count">Всего записей: {allLogs.length}</p>
        </div>
        <button 
          className="refresh-btn" 
          onClick={fetchAllLogs}
          disabled={loading}
        >
          🔄 Обновить
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Загрузка всех логов...</div>
      ) : (
        <>
          {allLogs.length === 0 ? (
            <div className="empty-state">
              <p>Логов не найдено</p>
            </div>
          ) : (
            <div className="logs-table">
              <div className="table-header">
                <div className="col-level">Уровень</div>
                <div className="col-source">Источник</div>
                <div className="col-message">Сообщение</div>
                <div className="col-time">Время</div>
                <div className="col-action"></div>
              </div>
              
              {allLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="table-row"
                  onClick={() => navigate(`/logs/${log.id}`)}
                >
                  <div className="col-level">
                    <span 
                      className="level-badge"
                      style={{ backgroundColor: getLevelColor(log.level) }}
                    >
                      {log.level}
                    </span>
                  </div>
                  <div className="col-source">
                    <code>{log.source}</code>
                  </div>
                  <div className="col-message" title={log.message}>
                    {log.message}
                  </div>
                  <div className="col-time">
                    {new Date(log.timestamp).toLocaleString('ru', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </div>
                  <div className="col-action">
                    <span className="view-icon">👁️</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}