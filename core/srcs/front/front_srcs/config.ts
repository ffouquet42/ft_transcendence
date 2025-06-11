const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const API_BASE_URL = (
	isLocalhost
		? 'https://localhost:3000'
		: `https://${window.location.hostname}:3000`
);
