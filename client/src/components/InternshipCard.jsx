
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
    companyInitials,
    deadlineLabel,
    formatStipend,
    internshipImage,
    isClosed,
    modeClass,
} from '../utils/format';

function InternshipCard({ internship }) {
    const closed = isClosed(internship.deadline);

    return (
        <article className="internship-card">
            <div
                className="card-media"
                style={{
                    position: 'relative',
                    width: '100%',
                    height: 'clamp(160px, 25vw, 220px)',
                    overflow : 'hidden',
                    margin: '10px'
                }}
            >
                <img
                    src={internshipImage(internship)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    style={{
                        display: 'block',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        borderRadius:'16px'
                    }}
                />

                <span
                    className={`badge card-media-badge ${modeClass(
                        internship.mode
                    )}`}
                >
                    {internship.mode}
                </span>
            </div>

            <div className="card-body">
                <div className="card-header">
                    <span className="company-avatar" aria-hidden="true">
                        {companyInitials(internship.company)}
                    </span>

                    <div className="card-heading">
                        <p className="company-name">
                            {internship.company}
                        </p>

                        <p className="company-location">
                            {internship.location} · {internship.mode}
                        </p>
                    </div>
                </div>

                <h3 className="card-title">
                    <Link to={`/internships/${internship._id}`}>
                        {internship.title}
                    </Link>
                </h3>

                <p className="card-description">
                    {internship.description}
                </p>

                <ul className="tag-row" aria-label="Skills">
                    {internship.skills.slice(0, 4).map((skill) => (
                        <li key={skill} className="tag">
                            {skill}
                        </li>
                    ))}
                </ul>

                <dl className="card-meta">
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

                <div className="card-footer">
                    <span className={closed ? 'deadline closed' : 'deadline'}>
                        {deadlineLabel(internship.deadline)}
                    </span>

                    <Link
                        to={`/internships/${internship._id}`}
                        className="btn btn-secondary btn-small"
                    >
                        View details
                    </Link>
                </div>
            </div>
        </article>
    );
}

InternshipCard.propTypes = {
    internship: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        slug: PropTypes.string,
        title: PropTypes.string.isRequired,
        company: PropTypes.string.isRequired,
        location: PropTypes.string,
        coverImage: PropTypes.string,
        mode: PropTypes.string,
        stipend: PropTypes.number,
        duration: PropTypes.string,
        description: PropTypes.string,
        skills: PropTypes.arrayOf(PropTypes.string),
        openings: PropTypes.number,
        deadline: PropTypes.string,
    }).isRequired,
};

export default InternshipCard;
