import mongoose from 'mongoose';
import { ISubscription } from '../types';
export type ISubscriptionDocument = ISubscription & mongoose.Document;
declare const _default: mongoose.Model<ISubscriptionDocument, {}, {}, {}, mongoose.Document<unknown, {}, ISubscriptionDocument, {}, {}> & ISubscription & mongoose.Document<mongoose.Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
    _id: string & mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Subscription.d.ts.map