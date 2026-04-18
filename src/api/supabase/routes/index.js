    import { Router } from "express";
    import config from '../../../config/config';

    // importar las rutas
    import institutosRoutes from '../routes/institutos.routes';
    const routerApi = (app)=>{
        const router = Router();
        const api = config.API_URL;
        app.use(api, router);

        // Routes
        router.use('/institutos',institutosRoutes);
        return router;
    }

    module.exports = routerApi;