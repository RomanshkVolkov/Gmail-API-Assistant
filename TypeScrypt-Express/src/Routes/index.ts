import express, { Router } from 'express';
import WspRouter from './Wsp.routes';

export default class RouterAPI {
    public router: Router;
    public wspRouter: WspRouter;
    constructor() {
        this.router = express.Router();
        this.wspRouter = new WspRouter();
        this.initializeRoutes(
            this.wspRouter
        );
    }

    private initializeRoutes(
        wspRouter: WspRouter
    ) {
        this.router.use('/wsp', wspRouter.router);
    }
}