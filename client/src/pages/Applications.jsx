import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchApplications } from '../api';
import Loading, { ErrorBanner } from '../components/Feedback';
import { companyInitials, formatDateTime, formatStipend } from '../utils/format';

function Applications() {
    const [applications, setApplications] = useState([]);
    const [status, setStatus] = useState('loading');
    const [error, setError] = useState('');
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let isCurrent = true;
        setStatus('loading');
        setError('');

        fetchApplications()
            .then((data) => {
                if (!isCurrent) return;
                setApplications(data.applications || []);
                setStatus('ready');
            })
            .catch((requestError) => {
                if (!isCurrent) return;
                setError(requestError.message);
                setStatus('error');
            });

        return () => {
            isCurrent = false;
        };
    }, [reloadKey]);

    return (
        <div className="page">
            <header className="page-header">
                <div>
                    <p className="eyebrow">Application tracker</p>
                    <h1>Submitted applications</h1>
                    <p className="muted">
                        Every application stored through the portal, newest first. Use this view to
                        confirm that the API saved your submission.
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setReloadKey((key) => key + 1)}
                    disabled={status === 'loading'}
                >
                    Refresh
                </button>
            </header>

            <p className="demo-note">
                Demo view: anyone with the link can see applications. In a production portal this
                page would be protected by student and placement-cell authentication.
            </p>

            {status === 'loading' && <Loading label="Loading applications…" />}

            {status === 'error' && (
                <ErrorBanner
                    title="Could not load applications"
                    message={error}
                    onRetry={() => setReloadKey((key) => key + 1)}
                />
            )}

            {status === 'ready' && applications.length === 0 && (
                <div className="state-panel">
                    <h3>No applications yet</h3>
                    <p>Once a student applies, the application will appear here.</p>
                    <Link to="/" className="btn btn-primary">
                        Browse internships
                    </Link>
                </div>
            )}

            {status === 'ready' && applications.length > 0 && (
                <>
                    <p className="result-count">{applications.length} application(s)</p>
                    <div className="application-list">
                        {applications.map((application) => (
                            <article key={application._id} className="application-card">
                                <div className="card-header">
                                    <span className="company-avatar" aria-hidden="true">
                                        {companyInitials(application.internship?.company || 'IP')}
                                    </span>
                                    <div className="card-heading">
                                        <h2>{application.name}</h2>
                                        <p className="company-location">
                                            {application.rollNumber} · {application.email}
                                        </p>
                                    </div>
                                    <span className={`badge status-${application.status}`}>
                                        {application.status.replace('-', ' ')}
                                    </span>
                                </div>

                                <div className="application-role">
                                    <span className="selected-label">Applied for</span>
                                    {application.internship ? (
                                        <Link to={`/internships/${application.internship._id}`}>
                                            {application.internship.title} ·{' '}
                                            {application.internship.company}
                                        </Link>
                                    ) : (
                                        <span>Internship removed</span>
                                    )}
                                </div>

                                <dl className="card-meta application-meta">
                                    <div>
                                        <dt>Location</dt>
                                        <dd>{application.internship?.location || '—'}</dd>
                                    </div>
                                    <div>
                                        <dt>Stipend</dt>
                                        <dd>
                                            {application.internship
                                                ? formatStipend(application.internship.stipend)
                                                : '—'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt>Applied on</dt>
                                        <dd>{formatDateTime(application.createdAt)}</dd>
                                    </div>
                                </dl>
                            </article>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default Applications;
