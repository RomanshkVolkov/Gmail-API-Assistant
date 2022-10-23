import { Router } from 'express';
import Controller from '../Controllers/WspController';


export default class WspRouter {
    public router: Router;
    public controller: Controller;
    constructor() {
        this.router = Router();
        this.controller = new Controller();
        this.initializeRoutes(this.controller);
    }

    private initializeRoutes(controller: Controller) {
        this.router.get('/', controller.sendWspMessage);
    }
}