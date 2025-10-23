import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Define interface for User methods
interface IUserMethods {
    comparePassword(candidatePassword: string): Promise<boolean>;
}

// Define interface for User document
interface IUser {
    name: string;
    email: string;
    username: string;
    password: string;
    brainLink?: string;
    isBrainPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Define User model type
type UserModel = mongoose.Model<IUser, {}, IUserMethods>;

const UserSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    brainLink: {
        type: String,
        unique: true,
        sparse: true  // Allows null values while maintaining uniqueness for non-null
    },
    isBrainPublic: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
    // Only hash if password is new or modified
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

export const User = mongoose.model<IUser, UserModel>("User", UserSchema);
