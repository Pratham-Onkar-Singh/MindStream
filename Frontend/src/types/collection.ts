export interface CollectionSummary {
    _id: string;
    name: string;
    description?: string;
    icon: string;
    color: string;
    contentCount: number;
    isDefault: boolean;
    parentCollection?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface CollectionTreeNode extends CollectionSummary {
    children: CollectionTreeNode[];
    depth: number;
}
