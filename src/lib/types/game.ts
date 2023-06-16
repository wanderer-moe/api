export interface Subfolder {
    name: string;
    path: string;
    fileCount: number;
    lastUploaded: number;
}

export interface Game {
    name: string;
    path: string;
    tags: string[];
    totalFiles: number;
    lastUploaded: number;
    subfolders: Subfolder[];
}

export interface Location {
    name: string;
    path: string;
    fileCount: number;
    popularity: number;
    lastUploaded: number;
}
