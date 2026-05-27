import mongoose from 'mongoose';
import { IUser } from '../types';
export type IUserDocument = IUser & mongoose.Document & {
    comparePassword(candidatePassword: string): Promise<boolean>;
};
declare const _default: mongoose.Model<IUserDocument, {}, {}, {}, mongoose.Document<unknown, {}, IUserDocument, {}, {}> & IUser & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}> & {
    comparePassword(candidatePassword: string): Promise<boolean>;
} & Required<{
    _id: string & mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map