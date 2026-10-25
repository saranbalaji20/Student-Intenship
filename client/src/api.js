const rawApiOrigin = import.meta.env.VITE_API_URL || '';
const API_ORIGIN = rawApiOrigin.replace(/\/+$/, '');

/**
 * Builds an absolute API URL when VITE_API_URL is configured (deployed frontend)
 * and falls back to the relative path handled by the Vite dev proxy locally.
 */
export const apiUrl = (path) => `${API_ORIGIN}/api${path}`;

export class ApiError extends Error {
    constructor(message, status, details = []) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.details = details;
    }
}

export async function request(path, options = {}) {
    const { headers, ...rest } = options;

    const response = await fetch(apiUrl(path), {
        ...rest,
        headers: {
            Accept: 'application/json',
            ...(rest.body ? { 'Content-Type': 'application/json' } : {}),
            ...headers,
        },
    });

    let payload = null;
    try {
        payload = await response.json();
    } catch {
        payload = null;
    }

    if (!response.ok) {
        throw new ApiError(
            payload?.message || `Request failed with status ${response.status}`,
            response.status,
            payload?.errors || []
        );
    }

    return payload;
}

export const fetchInternships = (params = {}) => {
    const query = new URLSearchParams(
        Object.entries(params).filter(([, value]) => value)
    ).toString();
    return request(`/internships${query ? `?${query}` : ''}`);
};

export const fetchInternship = (id) => request(`/internships/${id}`);

export const fetchApplications = () => request('/applications');
