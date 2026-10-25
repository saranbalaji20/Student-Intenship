import { Link, NavLink } from 'react-router-dom';

const linkClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');

function Navbar() {
    return (
        <header className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="brand">
                    <span className="brand-mark" aria-hidden="true">
                        IP
                    </span>
                    <span className="brand-copy">
                        <strong>Internship Portal</strong>
                        <small>Find your next opportunity</small>
                    </span>
                </Link>

                <nav className="nav-links" aria-label="Main navigation">
                    <NavLink to="/" end className={linkClass}>
                        Internships
                    </NavLink>
                    <NavLink to="/applications" className={linkClass}>
                        Applications
                    </NavLink>
                </nav>
            </div>
        </header>
    );
}

export default Navbar;
