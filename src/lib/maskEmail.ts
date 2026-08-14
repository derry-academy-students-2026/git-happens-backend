/**
 * Redacts the local-part of an email address for safe logging.
 * @param email Email address to mask.
 * @returns Masked email string.
 */
export function maskEmail(email: string): string {
	const normalizedEmail = email.trim().toLowerCase();
	const atIndex = normalizedEmail.indexOf("@");

	if (atIndex <= 0) {
		return "****";
	}

	const domain = normalizedEmail.slice(atIndex + 1);
	if (domain.length === 0) {
		return "****";
	}

	return `****@${domain}`;
}
