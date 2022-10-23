import cron from 'node-cron';

import WspController from '../Controllers/WspController';
import gmailService from '../Middlewares/GmailMiddleware';

const wspController = new WspController();


export default class Cron {
    constructor() {
        this.initializeCron();
    }

    private initializeCron() {
        // cron.schedule('*/10 * * * * *', () => {
        //     console.log('running a task wspSendMessage');
        //     wspController.sendWspMessage();
        // });

        cron.schedule('*/50 * * * * *', async () => {
            console.log('running a task wspSendMessage');
            await gmailService().then().catch((err) => { console.log(err) });
            console.log('\n\n\n')
        });
    }
}
/*
cron.schedule('*5 * * * *', async () => {
    console.log('-----------------------------------------------------------------------');
    console.log('Running getProductosFavoritosHome Cron Job');
    await wspController.sendWspMessage();
    console.log('\n\n Finished Cron Job');
});

*/
