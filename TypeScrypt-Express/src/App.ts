import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import RouterAPI from "./Routes/index";
import Cron from "./tools/cron";


export default class App {
    public app: Express;
    public port: number;
    public routerAPI: RouterAPI;
    public cron: Cron;



    constructor() {
        this.app = express();
        this.port = Number(process.env.PORT) || 4000;
        this.cron = new Cron();
        this.routerAPI = new RouterAPI();

        this.initializeMiddlewares();
        this.initializeRouters(this.routerAPI);
    }

    private initializeMiddlewares() {
        this.app.use(cors());
        this.app.use(express.json());
        dotenv.config();
    }

    private initializeRouters(routerAPI: any) {
        this.app.use('/api/v1', routerAPI.router);
    }




}

