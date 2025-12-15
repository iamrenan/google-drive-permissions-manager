import { openDB, IDBPDatabase } from "idb";
import { FileMapping, MappedFile } from "./types";

const DB_NAME = "drive-permissions-manager";
const DB_VERSION = 1;
const STORE_NAME = "file-mappings";

interface DriveDB {
    [STORE_NAME]: {
        key: string;
        value: FileMapping;
    };
}

let dbPromise: Promise<IDBPDatabase<DriveDB>> | null = null;

function getDB() {
    if (!dbPromise) {
        dbPromise = openDB<DriveDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            },
        });
    }
    return dbPromise;
}

export async function saveFileMapping(
    userEmail: string,
    mapping: FileMapping
): Promise<void> {
    const db = await getDB();
    await db.put(STORE_NAME, mapping, userEmail);
}

export async function getFileMapping(
    userEmail: string
): Promise<FileMapping | undefined> {
    const db = await getDB();
    return db.get(STORE_NAME, userEmail);
}

export async function clearFileMapping(userEmail: string): Promise<void> {
    const db = await getDB();
    await db.delete(STORE_NAME, userEmail);
}

export async function updateFileMappingPartial(
    userEmail: string,
    files: MappedFile[],
    totalCount: number,
    mappingComplete: boolean
): Promise<void> {
    const db = await getDB();
    const existing = await db.get(STORE_NAME, userEmail);

    const updatedMapping: FileMapping = {
        files: existing ? [...existing.files, ...files] : files,
        lastUpdated: new Date().toISOString(),
        totalCount,
        mappingComplete,
        userEmail,
    };

    await db.put(STORE_NAME, updatedMapping, userEmail);
}

export async function isMappingStale(
    userEmail: string,
    maxAgeMs: number = 24 * 60 * 60 * 1000 // 24 hours default
): Promise<boolean> {
    const mapping = await getFileMapping(userEmail);
    if (!mapping) return true;

    const lastUpdated = new Date(mapping.lastUpdated).getTime();
    const now = Date.now();

    return now - lastUpdated > maxAgeMs;
}
