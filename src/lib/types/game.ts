export interface Game {
    id: number;
    name: string;
    asset_count: number;
    asset_categories: string; // comma separated category1,category2,category3
    category_count: number;
    last_updated: string;
    has_generator: boolean;
}
