import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import InternshipList from './pages/InternshipList';
import InternshipDetails from './pages/InternshipDetails';
import ApplicationForm from './pages/ApplicationForm';
import Applications from './pages/Applications';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
    return (
        <div className="app-shell">
            <Navbar />
            <main className="app-main">
                <Routes>
                    <Route path="/" element={<InternshipList />} />
                    <Route path="/internships/:id" element={<InternshipDetails />} />
                    <Route path="/internships/:id/apply" element={<ApplicationForm />} />
                    <Route path="/applications" element={<Applications />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
            <footer className="app-footer">
                <span>Student Internship Portal</span>
            </footer>
        </div>
    );
}

export default App;
