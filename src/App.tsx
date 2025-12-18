import { Container, CssBaseline, Typography } from '@mui/material';
import './App.css';
import UserManagement from './features/users/UserManagement';

function App() {
  return (
    <>
      <CssBaseline />
      <div className="app-shell">
        <Container maxWidth="lg">
          <header className="app-header">
            <Typography variant="h4" fontWeight={800}>
              Admin Dashboard
            </Typography>
          </header>
          <UserManagement />
        </Container>
      </div>
    </>
  );
}

export default App;
