import express from "express"
import { connect_mongodb, Content, Link, User } from "./db.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

import dotenv from "dotenv";
import { authMiddleware } from "./middlewares/auth.js";
import { generateRandomHash } from "./utils/hashGenerator.js";
dotenv.config();
import cors from "cors"

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET ?? "";
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set.");
}

// connect to mongodb database
connect_mongodb();

// signup endpoint
app.post('/api/v1/signup', async (req, res) => {
    const { name, username, email, password } = req.body;
    
    if(!name || !username || !email || !password) {
        return res.status(400).json({ // Changed from 404 to 400
            message: "All fields are required!"
        })
    }
    
    const existingusername = await User.findOne({username});
    if(existingusername) {
        return res.status(409).json({ // Changed from 404 to 409 (Conflict)
            message: "username already exists!"
        })
    }
    
    const existingEmail = await User.findOne({email});
    if(existingEmail) {
        return res.status(404).json({
            message: "User with this email already exists!"
        })
    }
    
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword  = await bcrypt.hash(password, salt);

    try {
        await User.create({name, email, username, password:hashedPassword});
        res.status(200).json({
            message: "User created!"
        })
    } catch (error) {
        console.error();
        console.log(error);
        res.status(400).json({
            message: "Wasn't able to create user!"
        })
    }
    
});

// signin endpoint
app.post('/api/v1/signin', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await User.findOne({email});

        if(!user) {
            return res.status(404).json({
                message: "Invalid email or password!"
            })
        }

        const hashedPassword = user.password;
        const passwordMatched = await bcrypt.compare(password, hashedPassword);

        if(passwordMatched) {
            const token = jwt.sign({
                userId: user._id
            }, JWT_SECRET);
            res.json({token});
        } else {
            res.status(401).json({
                message: "Invalid email or password!"
            })
        }
    } catch(err) {
        res.status(500).json({
            message: "Server error: !",
            // @ts-ignore
            error: err.message
        })
    }
});

// creating, getting and deleting content:
app.post('/api/v1/content', authMiddleware, async (req, res) => {
    const { type, link, title, description } = req.body;

    if(!type || !title) {
        return res.status(400).json({
            message: "All fields are required!"
        })
    }

    try {
        const content = await Content.create({ 
            title,
            type,
            link,
            description,
            tags: [],
            // @ts-ignore
            userId: req.userId
        });
        // console.log(content._id);
        res.status(200).json(content._id);
    } catch (error) {
        res.status(401).json({
            message: "Was not able to add content!"
        })
    }
});

app.get('/api/v1/content', authMiddleware, async (req, res) => {
    // @ts-ignore
    const userId = req.userId;
    // console.log(userId);
    try {
        const contents = await Content.find({userId}).populate("userId", "username");
        res.status(200).json({contents});
    } catch (error) {
        res.status(400).json({
            message: "Coudn't get your contents :("
        })
    }
});

app.delete('/api/v1/content', authMiddleware, async (req, res) => {
    const contentId = req.body.contentId;

    try {
        const result = await Content.deleteOne({ 
            _id: contentId,
            // @ts-ignore 
            userId: req.userId 
        })

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Content not found" });
        }
        
        res.status(200).json({
            message: "Content deleted successfully :)"
        })
    } catch (error) {
        res.status(404).json({
            message: "Unable to delete content :("
        })
    }
});

// creating, deleting, getting shareable Links:
app.post('/api/v1/brain/share', authMiddleware, async (req, res) => {
    const { share } = req.body;
    const userId = req.userId;
    if(share) {
        const alreadyHashed = await Link.find({userId});
        console.log(alreadyHashed);
        
        if(alreadyHashed && alreadyHashed.length > 0) {
            return res.status(200).json({
                message: "Link already exists",
                link: alreadyHashed
            })
        }
        let hash = generateRandomHash(10);
        while((await Link.find({hash})).length > 0) {
            hash = generateRandomHash(10);
        }
        await Link.create({
            hash,
            userId
        })
        res.status(200).json({
            message: "Link created successfully!",
            hash
        })
    } else {
        const { hash } = req.body;
        if(hash) {
            const result = await Link.deleteOne({
                userId,
                hash
            })

            if(result.deletedCount === 0) {
                return res.status(404).json({
                    message: "Link not found or already deleted!"
                })
            }
            return res.status(200).json({
                message: "Link deleted successfully!"
            })
        } else {
            res.status(404).json({
                message: "Please provide the link to delete :("
            })
        }
    }
})

app.get('/api/v1/brain/:shareLink', async (req, res) => {
    const hash = req.params.shareLink;
    try {
        const link = await Link.find({hash})
        console.log(link);
        
        const userId = link && link.length > 0 && link[0] ? link[0].userId : null;
        if(!userId) {
            return res.status(404).json({
                message: "Coudn't find the link"
            })
        }

        // console.log(link);

        const content = await Content.find({userId});
        const user = await User.find({
            _id: userId
        })
        // cleaner way:
        // const contents = await 
        if(!user[0]) {
            return res.status(404).json({message: "User not found"});
        }
        res.status(200).json({username: user[0].username, content});
    } catch (error) {
        console.error();
        res.status(400).json({
            message: "Coudn't get the link"
        })
    }

})

app.listen(3000);