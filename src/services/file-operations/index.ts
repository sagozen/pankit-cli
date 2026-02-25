/**
 * File operations service - file system operations
 */

export { FileScanner } from "./file-scanner.js";
export { ManifestWriter, type FileTrackInfo } from "./manifest-writer.js";
export {
	scanDirectoryTree,
	filterItemsByPatterns,
	flattenSelectedItems,
	getPankitDirectories,
	createDefaultSelection,
	type DirectoryItem,
	type SelectionState,
} from "./directory-selector.js";
export {
	scanPankitDirectory,
	readPankitMetadata,
	getPankitSetup,
	type PankitMetadata,
} from "./pankit-scanner.js";
export { OwnershipChecker, type OwnershipCheckResult } from "./ownership-checker.js";
