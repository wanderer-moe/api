export interface Asset {
    id: number;
    name: string;
    game: string;
    asset: string;
    tags: string;
    url: string;
    verified: string;
    uploadedBy: string;
    uploadedDate: string;
    viewCount?: number;
    downloadCount?: number;
    fileSize: number;
}
