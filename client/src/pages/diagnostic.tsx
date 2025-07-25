export default function Diagnostic() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ff0000',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      fontSize: '24px',
      fontWeight: 'bold'
    }}>
      <h1>DIAGNOSTIC PAGE WORKING</h1>
      <p>Current time: {new Date().toLocaleTimeString()}</p>
      <p>Route: /</p>
      <p>Component: Diagnostic</p>
    </div>
  );
}