import { useState, useEffect, useContext } from "react";
import { getAnalyticsRequest, getLogsRequest } from "../../api/auth.api";
import { AuthContext } from "../../components/context/AuthContext";
import "./Dashboard.scss";

export default function Dashboard() {
  const { token } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Загружаем аналитику и последние логи параллельно
      const [analyticsData, logsData] = await Promise.all([
        getAnalyticsRequest(),
        getLogsRequest(1, 10)
      ]);
      
      setAnalytics(analyticsData);
      setLogs(logsData.items || logsData.results || logsData || []);
      setError("");
    } catch (err) {
      console.error("Ошибка загрузки данных:", err);
      setError(err.detail || err.message || "Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="dashboard">
        <h2>Добро пожаловать!</h2>
        <p>Войдите в аккаунт, чтобы увидеть аналитику и логи</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard">
        <h2>Dashboard</h2>
        <p>Загрузка данных...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

      {error && <div className="error-message">{error}</div>}

      {analytics ? (
        <>
          <div className="stats-grid">
            <Card 
              title="Всего логов" 
              value={analytics.logs_volume || 0} 
            />
            <Card 
              title="Всего ошибок" 
              value={analytics.errors_per_day?.reduce((sum, day) => sum + day.count, 0) || 0}
              color="#e74c3c" 
            />
            <Card 
              title="Источников" 
              value={analytics.top_sources?.length || 0} 
              color="#3498db"
            />
            <Card 
              title="За последний день" 
              value={analytics.errors_per_day?.[analytics.errors_per_day.length - 1]?.count || 0}
              color="#f39c12" 
            />
          </div>

          <div className="analytics-grid">
            {/* Ошибки по дням */}
            {analytics.errors_per_day && analytics.errors_per_day.length > 0 && (
              <div className="chart-card">
                <h3>Ошибки по дням</h3>
                <div className="bar-chart">
                  {analytics.errors_per_day.map((day, index) => {
                    const maxCount = Math.max(...analytics.errors_per_day.map(d => d.count));
                    const height = (day.count / maxCount) * 100;
                    
                    return (
                      <div key={index} className="bar-wrapper">
                        <div 
                          className="bar" 
                          style={{ height: `${height}%` }}
                          title={`${day.count} ошибок`}
                        >
                          <span className="bar-value">{day.count}</span>
                        </div>
                        <span className="bar-label">
                          {new Date(day.date).toLocaleDateString('ru', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Топ источников */}
            {analytics.top_sources && analytics.top_sources.length > 0 && (
              <div className="chart-card">
                <h3>Топ источников логов</h3>
                <div className="sources-list">
                  {analytics.top_sources.map((source, index) => {
                    const maxCount = Math.max(...analytics.top_sources.map(s => s.count));
                    const width = (source.count / maxCount) * 100;
                    
                    return (
                      <div key={index} className="source-item">
                        <div className="source-info">
                          <span className="source-name">{source.source}</span>
                          <span className="source-count">{source.count}</span>
                        </div>
                        <div className="source-bar-bg">
                          <div 
                            className="source-bar" 
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {logs.length > 0 && (
            <div className="recent-logs">
              <h3>Последние логи</h3>
              <div className="logs-list">
                {logs.map((log, index) => (
                  <LogItem key={log.id || index} log={log} />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="stats-grid">
          <Card title="Всего логов" value="—" />
          <Card title="Ошибки" value="—" color="#e74c3c" />
          <Card title="Источников" value="—" color="#3498db" />
        </div>
      )}
    </div>
  );
}

function Card({ title, value, color }) {
  return (
    <div className="stat-card">
      <p className="stat-title">{title}</p>
      <h2 className="stat-value" style={{ color }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </h2>
    </div>
  );
}

function LogItem({ log }) {
  const getLevelColor = (level) => {
    const colors = {
      error: "#e74c3c",
      warning: "#f39c12",
      info: "#3498db",
      debug: "#95a5a6"
    };
    return colors[level?.toLowerCase()] || "#333";
  };

  return (
    <div className="log-item">
      <span 
        className="log-level" 
        style={{ backgroundColor: getLevelColor(log.level) }}
      >
        {log.level || "INFO"}
      </span>
      <span className="log-message">{log.message || log.description}</span>
      <span className="log-time">
        {log.created_at ? new Date(log.created_at).toLocaleString('ru') : "—"}
      </span>
    </div>
  );
}