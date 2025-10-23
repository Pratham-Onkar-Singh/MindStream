import type { Request, Response } from "express";
import { Content } from "../models/Content.js";

export const searchContent = async (req: Request, res: Response) => {
    try {
        const { query, type, sortBy = 'relevance' } = req.query;
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

        let sortOption: any = {};
        if(sortBy === 'date') {
            sortOption = { createdAt: -1 };
        } else if(sortBy === 'title') {
            sortOption = { title: 1 }
        } else {
            // relevance sorting based on text score (provided by mongoDB)
            sortOption = { score: { $meta: 'textScore' } };
            searchFilter.$text = { $search: query };
        }

        const contents = await Content.find(searchFilter)
            .sort(sortOption)
            .populate('tags')
            .exec();
        
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

