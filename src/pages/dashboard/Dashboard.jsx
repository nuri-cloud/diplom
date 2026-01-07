export default function Dashboard() {
    return (
      <>
        <h2>Dashboard</h2>
  
        <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
          <Card title="Всего логов" value="12 430" />
          <Card title="Ошибки" value="340" color="var(--error)" />
          <Card title="Warning" value="980" color="var(--warning)" />
        </div>
      </>
    );
  }
  
  function Card({ title, value, color }) {
    return (
      <div style={{
        background: "white",
        padding: 20,
        borderRadius: 8,
        minWidth: 180
      }}>
        <p>{title}</p>
        <h2 style={{ color }}>{value}</h2>
      </div>
    );
  }
  