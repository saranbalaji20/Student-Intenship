import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiUrl, fetchInternships } from '../api';
import { ErrorBanner } from '../components/Feedback';
import { formatDate, formatStipend, internshipImage } from '../utils/format';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ROLL_NUMBER_PATTERN = /^[A-Z0-9][A-Z0-9/_-]{2,19}$/i;
const NAME_PATTERN = /^[A-Za-z][A-Za-z .'-]*$/;

function validate(values) {
    const errors = {};
    const name = values.name.trim();
    const email = values.email.trim();
    const rollNumber = values.rollNumber.trim();

    if (!name) {
        errors.name = 'Student name is required';
    } else if (name.length < 2 || name.length > 80) {
        errors.name = 'Name must be between 2 and 80 characters';
    } else if (!NAME_PATTERN.test(name)) {
        errors.name = "Name may only contain letters, spaces, dots, hyphens and apostrophes";
    }

    if (!email) {
        errors.email = 'Email ID is required';
    } else if (!EMAIL_PATTERN.test(email)) {
        errors.email = 'Enter a valid email ID, for example student@college.edu';
    }

    if (!rollNumber) {
        errors.rollNumber = 'Roll number is required';
    } else if (!ROLL_NUMBER_PATTERN.test(rollNumber)) {
        errors.rollNumber = 'Use 3-20 letters, numbers, hyphen, underscore or slash';
    }

    if (!values.internship) {
        errors.internship = 'Please select an internship';
    }

    return errors;
}

function ApplicationForm() {
    const { id } = useParams();
    const [internships, setInternships] = useState([]);
    const [optionsStatus, setOptionsStatus] = useState('loading');
    const [optionsError, setOptionsError] = useState('');
    const [optionsReloadKey, setOptionsReloadKey] = useState(0);

    const [values, setValues] = useState({
        name: '',
        email: '',
        rollNumber: '',
        internship: id || '',
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [banner, setBanner] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(null);

    useEffect(() => {
        let isCurrent = true;
        setOptionsStatus('loading');
        setOptionsError('');

        fetchInternships()
            .then((data) => {
                if (!isCurrent) return;
                const list = data.internships || [];
                setInternships(list);
                setOptionsStatus('ready');

                setValues((current) => {
                    if (current.internship && list.some((item) => item._id === current.internship)) {
                        return current;
                    }
                    return { ...current, internship: list[0]?._id || '' };
                });
            })
            .catch((error) => {
                if (!isCurrent) return;
                setOptionsError(error.message);
                setOptionsStatus('error');
            });

        return () => {
            isCurrent = false;
        };
    }, [optionsReloadKey]);

    const selectedInternship = internships.find((item) => item._id === values.internship);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setValues((current) => ({ ...current, [name]: value }));
        setBanner('');
        setFieldErrors((current) => {
            if (!current[name]) return current;
            const next = { ...current };
            delete next[name];
            return next;
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const clientErrors = validate(values);
        if (Object.keys(clientErrors).length > 0) {
            setFieldErrors(clientErrors);
            setBanner('Please correct the highlighted fields before submitting.');
            return;
        }

        setSubmitting(true);
        setBanner('');
        setFieldErrors({});

        try {
            const response = await fetch(apiUrl('/applications'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    name: values.name.trim(),
                    email: values.email.trim(),
                    rollNumber: values.rollNumber.trim(),
                    internship: values.internship,
                }),
            });

            let payload = null;
            try {
                payload = await response.json();
            } catch {
                payload = null;
            }

            if (!response.ok) {
                const details = Array.isArray(payload?.errors) ? payload.errors : [];
                if (details.length > 0) {
                    setFieldErrors(
                        Object.fromEntries(details.map((detail) => [detail.field, detail.message]))
                    );
                }
                throw new Error(payload?.message || `Submission failed (${response.status})`);
            }

            setSubmitted(payload.application);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            setBanner(
                error instanceof TypeError
                    ? 'Could not reach the server. Check your connection and try again.'
                    : error.message
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="page narrow-page">
                <div className="alert alert-success" role="status">
                    <span className="alert-icon" aria-hidden="true">
                        ✓
                    </span>
                    <div>
                        <strong>Application submitted successfully!</strong>
                        <p>
                            We have emailed a confirmation to {submitted.email}. Keep your
                            application reference handy.
                        </p>
                    </div>
                </div>

                <section className="panel success-panel">
                    <p className="eyebrow">Application reference</p>
                    <h1>{submitted.internship?.title || 'Internship application'}</h1>
                    <p className="muted">
                        {submitted.internship?.company} · {submitted.internship?.location}
                    </p>

                    <dl className="success-details">
                        <div>
                            <dt>Student name</dt>
                            <dd>{submitted.name}</dd>
                        </div>
                        <div>
                            <dt>Email ID</dt>
                            <dd>{submitted.email}</dd>
                        </div>
                        <div>
                            <dt>Roll number</dt>
                            <dd>{submitted.rollNumber}</dd>
                        </div>
                        <div>
                            <dt>Status</dt>
                            <dd>
                                <span className="badge badge-status">{submitted.status}</span>
                            </dd>
                        </div>
                        <div>
                            <dt>Application ID</dt>
                            <dd className="mono">{submitted._id}</dd>
                        </div>
                        <div>
                            <dt>Submitted on</dt>
                            <dd>{formatDate(submitted.createdAt)}</dd>
                        </div>
                    </dl>

                    <div className="success-actions">
                        <Link to="/applications" className="btn btn-primary">
                            View my applications
                        </Link>
                        <Link to="/" className="btn btn-secondary">
                            Browse more internships
                        </Link>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="page narrow-page">
            <nav className="breadcrumb" aria-label="Breadcrumb">
                <Link to="/">Internships</Link>
                <span aria-hidden="true">/</span>
                {selectedInternship ? (
                    <Link to={`/internships/${selectedInternship._id}`}>{selectedInternship.title}</Link>
                ) : (
                    <span>Application</span>
                )}
                <span aria-hidden="true">/</span>
                <span>Apply</span>
            </nav>

            <header className="form-header">
                <p className="eyebrow">Application form</p>
                <h1>Tell us a little about yourself</h1>
                <p className="muted">
                    Your details go straight to the hiring team. All fields are required.
                </p>
            </header>

            {selectedInternship && (
                <div className="selected-strip">
                    <div className="selected-info">
                        <img
                            className="selected-thumb"
                            src={internshipImage(selectedInternship)}
                            alt=""
                            width="120"
                            height="120"
                            loading="lazy"
                        />
                        <div>
                            <span className="selected-label">Applying for</span>
                            <strong>{selectedInternship.title}</strong>
                            <span className="muted">
                                {selectedInternship.company} · {selectedInternship.location}
                            </span>
                        </div>
                    </div>
                    <div className="selected-meta">
                        <span>{formatStipend(selectedInternship.stipend)}</span>
                        <span>Apply by {formatDate(selectedInternship.deadline)}</span>
                    </div>
                </div>
            )}

            {optionsStatus === 'error' && (
                <ErrorBanner
                    title="Could not load internship options"
                    message={optionsError}
                    onRetry={() => setOptionsReloadKey((key) => key + 1)}
                />
            )}

            {banner && (
                <div className="alert alert-error" role="alert">
                    <div>
                        <strong>Could not submit application</strong>
                        <p>{banner}</p>
                    </div>
                </div>
            )}

            <form className="application-form" onSubmit={handleSubmit} noValidate>
                <div className="field">
                    <label htmlFor="name">Full name</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={values.name}
                        onChange={handleChange}
                        placeholder="e.g. Ananya Sharma"
                        autoComplete="name"
                        maxLength={80}
                        aria-invalid={Boolean(fieldErrors.name)}
                        aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                    />
                    {fieldErrors.name && (
                        <p className="field-error" id="name-error">
                            {fieldErrors.name}
                        </p>
                    )}
                </div>

                <div className="form-row">
                    <div className="field">
                        <label htmlFor="email">Email ID</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={values.email}
                            onChange={handleChange}
                            placeholder="student@college.edu"
                            autoComplete="email"
                            inputMode="email"
                            aria-invalid={Boolean(fieldErrors.email)}
                            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                        />
                        {fieldErrors.email && (
                            <p className="field-error" id="email-error">
                                {fieldErrors.email}
                            </p>
                        )}
                    </div>

                    <div className="field">
                        <label htmlFor="rollNumber">Roll number</label>
                        <input
                            id="rollNumber"
                            name="rollNumber"
                            type="text"
                            value={values.rollNumber}
                            onChange={handleChange}
                            placeholder="e.g. 22CS1042"
                            autoComplete="off"
                            maxLength={20}
                            aria-invalid={Boolean(fieldErrors.rollNumber)}
                            aria-describedby={fieldErrors.rollNumber ? 'roll-number-error' : undefined}
                        />
                        {fieldErrors.rollNumber && (
                            <p className="field-error" id="roll-number-error">
                                {fieldErrors.rollNumber}
                            </p>
                        )}
                    </div>
                </div>

                <div className="field">
                    <label htmlFor="internship">Selected internship</label>
                    <select
                        id="internship"
                        name="internship"
                        value={values.internship}
                        onChange={handleChange}
                        disabled={optionsStatus !== 'ready'}
                        aria-invalid={Boolean(fieldErrors.internship)}
                        aria-describedby={fieldErrors.internship ? 'internship-error' : undefined}
                    >
                        {optionsStatus !== 'ready' && <option value="">Loading internships…</option>}
                        {optionsStatus === 'ready' &&
                            internships.map((internship) => (
                                <option key={internship._id} value={internship._id}>
                                    {internship.title} — {internship.company}
                                </option>
                            ))}
                    </select>
                    {fieldErrors.internship && (
                        <p className="field-error" id="internship-error">
                            {fieldErrors.internship}
                        </p>
                    )}
                    <p className="field-hint">
                        You can change the role here before submitting your application.
                    </p>
                </div>

                <div className="form-footer">
                    <p className="muted small">
                        By submitting, you confirm that the information above is accurate.
                    </p>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submitting || optionsStatus !== 'ready'}
                    >
                        {submitting ? 'Submitting…' : 'Submit application'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ApplicationForm;
