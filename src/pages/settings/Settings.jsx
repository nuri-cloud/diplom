import { useState, useEffect } from "react";
import { getSettingsRequest, updateSettingsRequest } from "../../api/auth.api";

export default function Settings() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getSettingsRequest().then(setSettings);
  }, []);

  const save = () => {
    updateSettingsRequest({ retention_days: Number(settings.retention_days) })
      .then(() => alert("Настройки сохранены!"))
      .catch(err => alert("Ошибка: " + err.message));
  };

  if (!settings) return "Загрузка...";

  return (
    <div className="settings-container">
      <h1>Настройки</h1>
      <div className="card">
        <label>Срок хранения логов (дней)</label>
        <input 
          type="number" 
          value={settings.retention_days} 
          onChange={e => setSettings({...settings, retention_days: e.target.value})} 
        />
        <p>Роли: {settings.roles?.join(", ")}</p>
        <button className="main-btn" onClick={save}>Сохранить</button>
      </div>
    </div>
  );
}