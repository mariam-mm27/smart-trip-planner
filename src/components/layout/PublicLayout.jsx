import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';

const appShellStyle = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
};

export default function PublicLayout() {
  return (
    <div style={appShellStyle}>
      <Navbar />

      <div style={{ flex: 1 }}>
        <Outlet />
      </div>

      <Footer />
    </div>
  );
}
