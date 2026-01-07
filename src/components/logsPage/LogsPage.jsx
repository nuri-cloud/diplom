import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getLogsRequest } from "../../api/auth.api";
import { AuthContext } from "../context/AuthContext";
import "./LogsPage.scss";

export default function LogsPage() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("all"); 
  const pageSize = 20;

  useEffect(() => {
    if (token) {
      fetchLogs(currentPage, filter);
    } else {
      setLoading(false);
    }
  }, [token, currentPage, filter]);
 

  const fetchLogs = async (page, levelFilter) => {
    try {
      setLoading(true);
      
      // Преобразуем фильтр в верхний регистр для API
      const apiFilter = levelFilter === "all" ? null : levelFilter.toUpperCase();
      
      const data = await getLogsRequest(page, pageSize, apiFilter);
      
      console.log("Logs data:", data); // Для отладки
      
      // Формат ответа: { total, page, page_size, logs }
      setLogs(data.logs || []);
      setTotal(data.total || 0);
      setTotalPages(Math.ceil((data.total || 0) / pageSize));
      
      setError("");
    } catch (err) {
      console.error("Ошибка загрузки логов:", err);
      setError(err.detail || err.message || "Ошибка загрузки логов");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1); // Сбрасываем на первую страницу при смене фильтра
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
          <p className="logs-count">Всего записей: {total}</p>
        </div>
        <button 
          className="refresh-btn" 
          onClick={() => fetchLogs(currentPage, filter)}
          disabled={loading}
        >
          🔄 Обновить
        </button>
      </div>

      {/* Фильтры */}
      <div className="filters">
        <button 
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => handleFilterChange("all")}
        >
          Все
        </button>
        <button 
          className={`filter-btn error ${filter === "error" ? "active" : ""}`}
          onClick={() => handleFilterChange("error")}
        >
          Ошибки
        </button>
        <button 
          className={`filter-btn warning ${filter === "warning" ? "active" : ""}`}
          onClick={() => handleFilterChange("warning")}
        >
          Предупреждения
        </button>
        <button 
          className={`filter-btn info ${filter === "info" ? "active" : ""}`}
          onClick={() => handleFilterChange("info")}
        >
          Информация
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Загрузка логов...</div>
      ) : (
        <>
          {logs.length === 0 ? (
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
              
              {logs.map((log) => (
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

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="page-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ← Назад
              </button>
              
              <div className="page-numbers">
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  // Показываем первую, последнюю, текущую и соседние страницы
                  if (
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        className={`page-num ${page === currentPage ? "active" : ""}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="page-dots">...</span>;
                  }
                  return null;
                })}
              </div>
              
              <button 
                className="page-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Вперед →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}