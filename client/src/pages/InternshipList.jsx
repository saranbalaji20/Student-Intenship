import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchInternships } from '../api';
import InternshipCard from '../components/InternshipCard';
import Loading, { ErrorBanner } from '../components/Feedback';

const MODES = ['All', 'Remote', 'Hybrid', 'On-site'];

function InternshipList() {
    const [internships, setInternships] = useState([]);
    const [status, setStatus] = useState('loading');
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [mode, setMode] = useState('All');
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let isCurrent = true;
        setStatus('loading');
        setError('');

        fetchInternships()
            .then((data) => {
                if (!isCurrent) return;
                setInternships(data.internships || []);
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

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();

        return internships.filter((internship) => {
            const matchesMode = mode === 'All' || internship.mode === mode;
            const matchesSearch =
                !term ||
                [internship.title, internship.company, internship.location, ...internship.skills]
                    .join(' ')
                    .toLowerCase()
                    .includes(term);

            return matchesMode && matchesSearch;
        });
    }, [internships, search, mode]);

    const companyCount = new Set(internships.map((internship) => internship.company)).size;
    const remoteCount = internships.filter((internship) => internship.mode === 'Remote').length;

    return (
        <div className="page">
            <section className="list-section" id="openings">
                <div className="section-heading">
                    <div>
                        <h2>Open internships</h2>
                        <p>Every role below is accepting applications right now.</p>
                    </div>
                    <span className="result-count">
                        {status === 'ready' ? `${filtered.length} of ${internships.length}` : '—'} roles
                    </span>
                </div>

                <div className="filters">
                    <label className="search-field">
                        <span className="sr-only">Search internships</span>
                        <svg viewBox="0 0 24 24" aria-hidden="true" className="search-icon">
                            <circle cx="11" cy="11" r="7" />
                            <path d="m20 20-3.5-3.5" />
                        </svg>
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search by role, company, location or skill"
                        />
                    </label>

                    <div className="filter-chips" role="group" aria-label="Filter by work mode">
                        {MODES.map((option) => (
                            <button
                                key={option}
                                type="button"
                                className={mode === option ? 'chip active' : 'chip'}
                                aria-pressed={mode === option}
                                onClick={() => setMode(option)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                {status === 'loading' && <Loading label="Fetching open internships…" />}

                {status === 'error' && (
                    <ErrorBanner
                        title="Could not load internships"
                        message={error}
                        onRetry={() => setReloadKey((key) => key + 1)}
                    />
                )}

                {status === 'ready' && filtered.length === 0 && (
                    <div className="state-panel">
                        <h3>No internships match your filters</h3>
                        <p>Try a different keyword or switch the work mode filter.</p>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                                setSearch('');
                                setMode('All');
                            }}
                        >
                            Clear filters
                        </button>
                    </div>
                )}

                {status === 'ready' && filtered.length > 0 && (
                    <div className="card-grid">
                        {filtered.map((internship) => (
                            <InternshipCard key={internship._id} internship={internship} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default InternshipList;
