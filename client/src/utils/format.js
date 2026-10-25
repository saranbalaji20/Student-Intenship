export const formatDate = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

export const formatDateTime = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};

export const formatStipend = (amount) => {
    if (!amount || amount <= 0) return 'Unpaid';
    return `₹${Number(amount).toLocaleString('en-IN')} / month`;
};

export const daysUntil = (deadline) => {
    const diff = new Date(deadline).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const deadlineLabel = (deadline) => {
    const days = daysUntil(deadline);
    if (Number.isNaN(days)) return 'Deadline not announced';
    if (days < 0) return 'Applications closed';
    if (days === 0) return 'Closes today';
    if (days === 1) return 'Closes tomorrow';
    return `${days} days left`;
};

export const isClosed = (deadline) => {
    const days = daysUntil(deadline);
    return !Number.isNaN(days) && days < 0;
};

export const companyInitials = (company = '') =>
    company
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join('')
        .toUpperCase();

export const internshipImage = (internship = {}) => {
    if (internship.coverImage) return internship.coverImage;
    const seed = internship.slug || internship._id || 'internship';
    return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/675`;
};

export const modeClass = (mode) =>
    ({
        Remote: 'mode-remote',
        Hybrid: 'mode-hybrid',
        'On-site': 'mode-onsite',
    })[mode] || 'mode-remote';
