import { Link } from 'react-router-dom';

function NotFound() {
    return (
        <div className="page narrow-page">
            <div className="state-panel">
                <p className="eyebrow">404</p>
                <h1>Page not found</h1>
                <p>The page you are looking for does not exist or has moved.</p>
                <Link to="/" className="btn btn-primary">
                    Back to internships
                </Link>
            </div>
        </div>
    );
}

export default NotFound;
