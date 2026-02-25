/**
 * Error classes for Pankit
 */

export class PankitError extends Error {
	constructor(
		message: string,
		public code?: string,
		public statusCode?: number,
	) {
		super(message);
		this.name = "PankitError";
	}
}

export class AuthenticationError extends PankitError {
	constructor(message: string) {
		super(message, "AUTH_ERROR", 401);
		this.name = "AuthenticationError";
	}
}

export class GitHubError extends PankitError {
	constructor(message: string, statusCode?: number) {
		super(message, "GITHUB_ERROR", statusCode);
		this.name = "GitHubError";
	}
}

export class DownloadError extends PankitError {
	constructor(message: string) {
		super(message, "DOWNLOAD_ERROR");
		this.name = "DownloadError";
	}
}

export class ExtractionError extends PankitError {
	constructor(message: string) {
		super(message, "EXTRACTION_ERROR");
		this.name = "ExtractionError";
	}
}

export class SkillsMigrationError extends PankitError {
	constructor(message: string) {
		super(message, "SKILLS_MIGRATION_ERROR");
		this.name = "SkillsMigrationError";
	}
}
