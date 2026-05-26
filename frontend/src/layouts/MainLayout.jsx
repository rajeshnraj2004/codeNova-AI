import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GradientBlobs from '../components/GradientBlobs';

const MainLayout = ({ children, showFooter = true }) => (
  <div className="relative min-h-screen bg-bg">
    <GradientBlobs />
    <Navbar />
    <main className="relative z-10 pt-16">{children}</main>
    {showFooter && <Footer />}
  </div>
);

export default MainLayout;
