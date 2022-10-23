import App from "./src/App";

const appClass = new App();

const app = appClass.app;


try {
    app.listen(appClass.port, () => {
        console.log(`Server running on port ${appClass.port}`);
    });
} catch (error) {
    console.log(error);
}
