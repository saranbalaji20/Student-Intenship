import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchInternship } from '../api';
import Loading, { ErrorBanner } from '../components/Feedback';
import {
    companyInitials,
    deadlineLabel,
    formatDate,
    formatStipend,
    internshipImage,
    isClosed,
    modeClass,
} from '../utils/format';

function InternshipDetails() {
    const { id } = useParams();
    const [internship, setInternship] = useState(null);
    const [status, setStatus] = useState('loading');
    const [error, setError] = useState('');
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let isCurrent = true;
        setStatus('loading');
        setError('');

        fetchInternship(id)
            .then((data) => {
                if (!isCurrent) return;
                setInternship(data.internship);
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
    }, [id, reloadKey]);

    if (status === 'loading') {
        return <Loading label="Loading internship details…" />;
    }

    if (status === 'error') {
        return (
            <div className="page narrow-page">
                <ErrorBanner
                    title={error.includes('not found') ? 'Internship not found' : 'Could not load this internship'}
                    message={error}
                    onRetry={() => setReloadKey((key) => key + 1)}
                />
                <Link to="/" className="btn btn-secondary">
                    Back to internships
                </Link>
            </div>
        );
    }

    const closed = isClosed(internship.deadline);

    return (
        <div className="page">
            <nav className="breadcrumb" aria-label="Breadcrumb">
                <Link to="/">Internships</Link>
                <span aria-hidden="true">/</span>
                <span>{internship.title}</span>
            </nav>

            <div className="detail-cover">
                <img
                    src={internshipImage(internship)}
                    alt=""
                    width="1200"
                    height="675"
                    decoding="async"
                />
            </div>

            <header className="detail-hero">
                <div className="detail-heading">
                    <span className="company-avatar large" aria-hidden="true">
                        {companyInitials(internship.company)}
                    </span>
                    <div>
                        <div className="badge-row">
                            <span className={`badge ${modeClass(internship.mode)}`}>{internship.mode}</span>
                            <span className="badge badge-neutral">{internship.location}</span>
                            {closed && <span className="badge badge-closed">Closed</span>}
                        </div>
                        <h1>{internship.title}</h1>
                        <p className="detail-company">
                            {internship.company} · Posted {formatDate(internship.createdAt)}
                        </p>
                    </div>
                </div>

                <dl className="detail-quickfacts">
                    <div>
                        <dt>Stipend</dt>
                        <dd>{formatStipend(internship.stipend)}</dd>
                    </div>
                    <div>
                        <dt>Duration</dt>
                        <dd>{internship.duration}</dd>
                    </div>
                    <div>
                        <dt>Openings</dt>
                        <dd>{internship.openings}</dd>
                    </div>
                </dl>
            </header>

            <div className="detail-layout">
                <div className="detail-content">
                    <section className="panel">
                        <h2>About the role</h2>
                        <p>{internship.description}</p>
                    </section>

                    {internship.responsibilities.length > 0 && (
                        <section className="panel">
                            <h2>What you will do</h2>
                            <ul className="check-list">
                                {internship.responsibilities.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </section>
                    )}

                    <section className="panel">
                        <h2>Skills we look for</h2>
                        <ul className="tag-row">
                            {internship.skills.map((skill) => (
                                <li key={skill} className="tag">
                                    {skill}
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="panel">
                        <h2>Eligibility</h2>
                        <p>{internship.eligibility}</p>
                    </section>
                </div>

                <aside className="apply-panel">
                    <p className={closed ? 'deadline closed' : 'deadline'}>
                        {deadlineLabel(internship.deadline)}
                    </p>
                    <h2>{closed ? 'Applications closed' : 'Ready to apply?'}</h2>
                    <p>
                        {closed
                            ? `The deadline for this role was ${formatDate(internship.deadline)}.`
                            : `Submit your details before ${formatDate(internship.deadline)}. It only takes a minute.`}
                    </p>

                    {closed ? (
                        <button type="button" className="btn btn-primary btn-block" disabled>
                            Applications closed
                        </button>
                    ) : (
                        <Link
                            to={`/internships/${internship._id}/apply`}
                            className="btn btn-primary btn-block"
                        >
                            Apply now
                        </Link>
                    )}

                    <Link to="/" className="text-link">
                        ← Back to all internships
                    </Link>
                </aside>
            </div>
        </div>
    );
}

export default InternshipDetails;
