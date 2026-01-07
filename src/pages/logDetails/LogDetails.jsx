export default function LogDetails() {
  return (
    <>
      <h2>Log details</h2>

      <pre
        style={{
          background: "#0f172a",
          color: "#e5e7eb",
          padding: 20,
          marginTop: 20,
        }}
      >
        {`ERROR
  JWT expired
  auth-service
  2025-01-10 12:30`}
      </pre>
    </>
  );
}
