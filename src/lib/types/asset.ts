export interface Asset {
    id: number;
    name: string;
    game: string;
    asset_category: string;
    tags: string;
    url: string;
    status: string;
    uploaded_by: string;
    uploaded_date: string;
    view_count?: number;
    download_count?: number;
    file_size: number;
}
