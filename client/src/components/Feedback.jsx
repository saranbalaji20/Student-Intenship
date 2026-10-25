import PropTypes from 'prop-types';

function Loading({ label = 'Loading…' }) {
    return (
        <div className="state-panel" role="status" aria-live="polite">
            <span className="spinner" aria-hidden="true" />
            <p>{label}</p>
        </div>
    );
}

export function ErrorBanner({ title = 'Something went wrong', message, onRetry }) {
    return (
        <div className="alert alert-error" role="alert">
            <div>
                <strong>{title}</strong>
                {message && <p>{message}</p>}
            </div>
            {onRetry && (
                <button type="button" className="btn btn-secondary btn-small" onClick={onRetry}>
                    Try again
                </button>
            )}
        </div>
    );
}

Loading.propTypes = {
    label: PropTypes.string,
};

ErrorBanner.propTypes = {
    title: PropTypes.string,
    message: PropTypes.string,
    onRetry: PropTypes.func,
};

export default Loading;
