import type { Request, Response } from "express";
import { cloudinary } from "../config/cloudinary.js";
import { File } from "../models/File.js";
import { Content } from "../models/Content.js";
import type { UploadApiResponse } from "cloudinary";


// you use this type on req, but you have to handle middleware in uploadRoutes.ts  
// interface FileRequest extends Request {
//     file?: Express.Multer.File;
// }

export const createSingleFile = async (req: Request, res: Response) => {
    try {
        console.log('Upload request received:', {
            hasFile: !!req.file,
            userId: req.userId,
            body: req.body
        });

        if(!req.file) {
            return res.status(400).json({
                message: "No file provided"
            })
        }
        if(!req.file.buffer) {
            return res.status(400).json({ 
                message: "File buffer undefined/not available. Check multer configuration. " 
            });
        }

        // Determine resource type based on file MIME type
        const mimeType = req.file.mimetype;
        let resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto';
        
        // PDFs can be uploaded as 'image' type to enable better viewing/preview capabilities
        if (mimeType === 'application/pdf') {
            resourceType = 'image'; // Upload PDF as image type for better preview support
        } else if (mimeType.includes('document') || 
            mimeType.includes('text') ||
            mimeType.includes('application/zip') ||
            mimeType.includes('application/x-zip')) {
            resourceType = 'raw';
        } else if (mimeType.startsWith('image/')) {
            resourceType = 'image';
        } else if (mimeType.startsWith('video/')) {
            resourceType = 'video';
        } else if (mimeType.startsWith('audio/')) {
            resourceType = 'video'; // Cloudinary uses 'video' for audio files
        }

        const opts: any = {
            folder: 'second-brain/uploads',
            resource_type: resourceType,
            // public_id: 'custom-id' // TODO: add cutom nameing to files ussing Date.now()
        };

        console.log('Starting Cloudinary upload...', { 
            filename: req.file.originalname, 
            mimeType, 
            resourceType 
        });
        const result = await new Promise<UploadApiResponse>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(opts, (err, uploaded) => {
                if (err) {
                    console.error('Cloudinary upload stream error:', err);
                    return reject(err);
                }
                if (!uploaded) return reject(new Error('Upload failed: no result returned'));
                resolve(uploaded);
            });
            stream.end(req.file!.buffer);
        });

        console.log('Cloudinary upload successful:', result.secure_url);

        // Use the secure_url directly - PDFs uploaded as 'image' type will be viewable
        let viewableUrl = result.secure_url;

        const file = await File.create({
            filename: req.file.originalname,
            url: viewableUrl,
            publicId: result.public_id,
            resourceType: result.resource_type,
            format: result.format,
            bytes: result.bytes,
            width: result.width,
            height: result.height,
        })

        console.log('File record created:', file._id);

        // Create content entry for the uploaded file
        const { title, description, collection } = req.body;
        const content = await Content.create({
            title: title || req.file.originalname,
            type: "file",
            link: viewableUrl,
            description: description || undefined,
            tags: [],
            collection: collection || undefined,
            userId: req.userId
        });

        console.log('Content record created:', content._id);

        res.status(200).json({ 
            file,
            content,
            message: "File uploaded successfully!"
        })
    } catch (err) {
        console.error('Upload error:', err);
        // @ts-ignore
        return res.status(500).json({ error: err.message || 'Internal server error' });
    }
}

