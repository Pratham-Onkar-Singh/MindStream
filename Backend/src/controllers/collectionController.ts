import { json, type Request, type Response } from "express";
import { Collection } from "../models/Collection.js";
import { Content } from "../models/Content.js";

// getting all collections of a User
export const getUserCollections = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;

        const collections = await Collection.find({userId}).sort({ createdAt: -1 })


        // get all collections which are related to current collections
        const collectionCount = await Promise.all(
            collections.map(async (collection) => {
                const contentCount = await Content.countDocuments({
                    userId,
                    collection: collection._id
                });

                const plain = collection.toObject();

                return {
                    ...plain,
                    parentCollection: plain.parentCollection || null,
                    contentCount
                };
            })
        );

        res.json({
            success: true,
            collections: collectionCount
        });
    } catch (error) {
        console.error('GET collections error:', error);
        res.status(500).json({
            message: 'Failed to fetch collections',
            error: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

// creating a new collection
export const createCollection = async (req: Request, res: Response) => {
    try {
        const { name, description, icon, color, parentCollection, isDefault } = req.body;
        const userId = req.userId;

        if(!name) {
            return res.status(400).json({
                message: "Collection name is required!"
            });
        }

        const existingCollection = await Collection.findOne({ userId, name });
        if(existingCollection) {
            return res.status(400).json({
                message: "Collection with this name already exists!"
            })
        }

        const collection = await Collection.create({
            name,
            description,
            icon: icon || '📁',
            color: color || '#6B7280',
            parentCollection,
            userId
        });

        res.status(201).json({
            success: true,
            message: "Collection created successfully!",
            collection
        });
    } catch (error) {
        console.error('Create collection error:', error);
        res.status(500).json({
            message: 'Failed to create collection',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// updating existing collection
export const updateCollection = async (req: Request, res: Response) => {
    try {
        const { collectionId } = req.params;
        const { name, description, icon, color } = req.body;
        const userId = req.userId;

        const collection = await Collection.findOne({
            _id: collectionId,
            userId
        });

        if(!collection) {
            return res.status(404).json({
                message: "Collection not found"
            });
        }

        // dont allow updating default collections
        if(collection.isDefault && name) {
            return res.status(400).json({
                message: 'Cannot rename default collection'
            });
        }

        if(name) collection.name = name;
        if(description) collection.description = description;
        if(icon) collection.icon = icon
        if(color) collection.color = color;

        await collection.save();

        res.status(201).json({
            success: true,
            message: "Collection updated successfully",
            collection
        })

    } catch (error) {
        console.error('Update collection error:', error);
        res.status(500).json({
            message: 'Failed to update collection',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// deleting collection
export const deleteCollection = async (req: Request, res: Response) => {
    try {
        const { collectionId } = req.params;
        const { deleteAll = 'false' } = req.query; 
        const userId = req.userId;

        const collection = await Collection.findOne({
            userId,
            _id: collectionId
        })

        if(!collection) {
            return res.status(404).json({
                message: "Collection not found"
            })
        }

        if(collection?.isDefault) {
            return res.status(400).json({
                message: "Cannot delete default collection"
            })
        }

        if(deleteAll === 'true') {
            // Delete all: collection + all descendant collections + all content in them
            console.log(`Deleting collection ${collection.name} and all its descendants and content`);
            
            // find all descendant collections recursively
            const findDescendants = async (parentId: string): Promise<string[]> => {
                const children = await Collection.find({ userId, parentCollection: parentId });
                const childIds = children.map(c => c._id.toString());
                
                const allDescendants = [...childIds];
                for (const childId of childIds) {
                    const grandChildren = await findDescendants(childId);
                    allDescendants.push(...grandChildren);
                }
                
                return allDescendants;
            };
            
            const descendantIds = await findDescendants(collectionId as string);
            const allCollectionIds = [collectionId, ...descendantIds];
            
            // delete all content in these collections
            await Content.deleteMany({
                collection: { $in: allCollectionIds },
                userId
            });
            
            // delete all descendant collections
            await Collection.deleteMany({
                _id: { $in: allCollectionIds },
                userId
            });
        } else {
            // delete only this collection: move children up and remove collection from content
            console.log(`Deleting collection ${collection.name}, propagating children upward`);
            
            // move child collections to this collection's parent
            await Collection.updateMany(
                { parentCollection: collectionId, userId },
                { $set: { parentCollection: collection.parentCollection || null } }
            );
            
            // remove collection reference from content (making them uncategorized)
            await Content.updateMany(
                { collection: collectionId, userId },
                { $unset: { collection: 1 } }
            );
            
            // delete the collection
            await Collection.deleteOne({
                userId,
                _id: collectionId
            });
        }

        res.status(200).json({
            success: true,
            message: deleteAll === 'true' 
                ? `Collection and all nested collections/content deleted successfully`
                : `Collection deleted, children propagated upward and content uncategorized`
        })
    } catch (error) {
        console.error('Delete collection error:', error);
        res.status(500).json({
            message: 'Failed to delete collection',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// getting all content in a collection
export const getCollectionContent = async (req: Request, res: Response) => {
    try {
        const { collectionId } = req.params;
        const userId = req.userId;

        const collection = await Collection.findOne({
            _id: collectionId,
            userId
        })

        if(!collection) {
            return res.status(404).json({
                message: 'Collection not found'
            })
        }

        const contents = await Content.find({
            collection: collectionId,
            userId
        })
            .sort({ createdAt: -1 })

        res.json({
            success: true,
            collection,
            contents
        })
    } catch (error) {
        console.error('Error gettign collection content:', error);
        res.status(500).json({
            message: 'Failed to fetch collection content',
            error: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

// move all content to collection
export const moveContentToCollection = async (req: Request, res: Response) => {
    try {
        const { contentId } = req.params;
        const { collectionId } = req.body;
        const userId = req.userId;

        const content = await Content.findOne({
            _id: contentId,
            userId
        });

        if(!content) {
            return res.status(404).json({
                message: "Content not found"
            });
        }

        if(collectionId) {
            const collection = await Collection.findOne({ collectionId, userId });
            
            if(!collection) {
                return res.status(404).json({
                    message: 'Collection not found'
                });
            }
        }

        content.collection = collectionId || undefined;
        await content.save();

        res.json({
            succcess: true,
            message: 'Content moved successfully',
            content
        })
    } catch (error) {
        console.error('Error moving content:', error);
        res.status(500).json({
            message: 'Failed to move content',
            error: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}


