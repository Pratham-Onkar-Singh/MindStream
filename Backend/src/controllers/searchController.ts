import type { Request, Response } from "express";
import { Content } from "../models/Content.js";

export const searchContent = async (req: Request, res: Response) => {
    try {
        const { query, type, sortBy = 'relevance', collection } = req.query;
        const userId = req.userId;
        
        if(!query || typeof query !== 'string') {
            return res.status(400).json({
                message: "Invalid search query"
            })
        }

        const searchFilter: any = {
            userId,
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        };

        if(type && type !== 'all') {
            searchFilter.type = type;
        }

        // Filter by collection if provided
        if(collection && typeof collection === 'string') {
            searchFilter.collection = collection;
        }

        let sortOption: any = {};
        if(sortBy === 'date') {
            sortOption = { createdAt: -1 };
        } else if(sortBy === 'title') {
            sortOption = { title: 1 }
        } else {
            // For relevance, we'll use a custom scoring approach
            // Sort by: exact match first, then title match, then description match, then by date
            sortOption = { createdAt: -1 }; // Default to date for relevance
        }

        let contents = await Content.find(searchFilter)
            .sort(sortOption)
            .populate('tags')
            .exec();

        // If sorting by relevance, apply custom scoring
        if(sortBy === 'relevance') {
            const lowerQuery = query.toLowerCase();
            contents = contents.sort((a: any, b: any) => {
                const aTitle = (a.title || '').toLowerCase();
                const aDesc = (a.description || '').toLowerCase();
                const bTitle = (b.title || '').toLowerCase();
                const bDesc = (b.description || '').toLowerCase();

                // Calculate relevance scores
                let aScore = 0;
                let bScore = 0;

                // Exact title match gets highest score
                if (aTitle === lowerQuery) aScore += 1000;
                if (bTitle === lowerQuery) bScore += 1000;

                // Title starts with query
                if (aTitle.startsWith(lowerQuery)) aScore += 100;
                if (bTitle.startsWith(lowerQuery)) bScore += 100;

                // Title contains query
                if (aTitle.includes(lowerQuery)) aScore += 50;
                if (bTitle.includes(lowerQuery)) bScore += 50;

                // Description starts with query
                if (aDesc.startsWith(lowerQuery)) aScore += 20;
                if (bDesc.startsWith(lowerQuery)) bScore += 20;

                // Description contains query
                if (aDesc.includes(lowerQuery)) aScore += 10;
                if (bDesc.includes(lowerQuery)) bScore += 10;

                return bScore - aScore;
            });
        }
        
        res.status(200).json({
            count: contents.length,
            contents
        })

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ 
            message: "Failed to search content",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

