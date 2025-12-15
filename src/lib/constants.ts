// Google Drive API configuration
export const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";
export const FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";

// File mapping limits
export const MAX_FILES_THRESHOLD = 20000; // Maximum files to map to prevent resource issues
export const BATCH_SIZE = 100; // Number of files to fetch per API call

// Permission role display
export const ROLE_LABELS: Record<string, string> = {
    owner: "Owner",
    organizer: "Organizer",
    fileOrganizer: "File Organizer",
    writer: "Editor",
    commenter: "Commenter",
    reader: "Viewer",
};

export const ROLE_COLORS: Record<string, string> = {
    owner: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    organizer: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    fileOrganizer: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
    writer: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    commenter: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    reader: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

export const TYPE_LABELS: Record<string, string> = {
    user: "User",
    group: "Group",
    domain: "Domain",
    anyone: "Anyone",
};
