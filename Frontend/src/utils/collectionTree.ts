import type { CollectionSummary, CollectionTreeNode } from "../types/collection";

/**
 * Builds a hierarchical tree structure from a flat list of collections
 */
export const buildCollectionTree = (collections: CollectionSummary[]): CollectionTreeNode[] => {
    const nodeMap = new Map<string, CollectionTreeNode>();
    const roots: CollectionTreeNode[] = [];

    // First pass: Create nodes
    collections.forEach((collection) => {
        nodeMap.set(collection._id, {
            ...collection,
            children: [],
            depth: 0
        });
    });

    // Second pass: Build tree structure
    nodeMap.forEach((node) => {
        if (node.parentCollection) {
            const parent = nodeMap.get(node.parentCollection);
            if (parent) {
                parent.children.push(node);
            } else {
                // Parent not found, treat as root
                roots.push(node);
            }
        } else {
            // No parent, it's a root node
            roots.push(node);
        }
    });

    // Third pass: Calculate depths and sort
    const assignDepth = (nodes: CollectionTreeNode[], depth: number) => {
        // Sort alphabetically at each level
        nodes.sort((a, b) => a.name.localeCompare(b.name));
        
        nodes.forEach((node) => {
            node.depth = depth;
            if (node.children.length > 0) {
                assignDepth(node.children, depth + 1);
            }
        });
    };

    assignDepth(roots, 0);

    return roots;
};

/**
 * Flattens a tree structure into a single array (depth-first order)
 */
export const flattenCollectionTree = (tree: CollectionTreeNode[]): CollectionTreeNode[] => {
    const result: CollectionTreeNode[] = [];

    const traverse = (nodes: CollectionTreeNode[]) => {
        nodes.forEach((node) => {
            result.push(node);
            if (node.children.length > 0) {
                traverse(node.children);
            }
        });
    };

    traverse(tree);
    return result;
};

/**
 * Get all descendant IDs for each collection (for filtering)
 */
export const buildDescendantMap = (tree: CollectionTreeNode[]): Map<string, string[]> => {
    const map = new Map<string, string[]>();

    const collectDescendants = (node: CollectionTreeNode): string[] => {
        const descendants: string[] = [];

        node.children.forEach((child) => {
            descendants.push(child._id);
            const childDescendants = collectDescendants(child);
            descendants.push(...childDescendants);
        });

        map.set(node._id, descendants);
        return descendants;
    };

    tree.forEach((root) => collectDescendants(root));

    return map;
};
