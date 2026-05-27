import { Request, Response, NextFunction } from 'express';
import { IUserDocument } from '../models/User';
declare global {
    namespace Express {
        interface Request {
            user?: IUserDocument;
        }
    }
}
export declare const auth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map