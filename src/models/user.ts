import mongoose, { Document, Model } from 'mongoose';
import AuthService from '@src/services/auth.service'

export interface User {
    _id?: string;
    name: string,
    email: string,
    password: string
}
export enum CUSTOM_VALIDATION {
    DUPLICATED = 'DUPLICATED'
}
const schema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: { type: String, required: true },

    },
    {
        toJSON: {
            transform: (_, ret): void => {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
            },
        },
    }
);
interface UserModel extends Omit<User, '_id'>, Document { }

schema.path('email').validate(async (email: string) => {
    const emailCounts = await mongoose.models.User.countDocuments({ email })
    return !emailCounts;
}, 'already exists in database', CUSTOM_VALIDATION.DUPLICATED);

schema.pre<UserModel>('save', async function (): Promise<void> {
    if (!this.password || !this.isModified('password')) {
        return;
    }
    try {
        this.password = await AuthService.hashPassword(this.password)
    } catch (err) {
        console.error(`Error hashing the password for the user ${this.name}`)
    }
});

export const User: Model<UserModel> = mongoose.model<UserModel>('User', schema);


