export function sanitizeHTML(str: string): string {
	const div = document.createElement('div');
	div.textContent = str;
	return div.innerHTML;
} 