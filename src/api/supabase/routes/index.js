import { Router } from "express";
import config from "../../../config/config";
import institutosRoutes from "./institutos.routes";
import coursesRoutes from "./courses.routes"; 

const routeApi = (app) => {
  const router = Router();
  const api = config.API_URL;
  app.use('/api', router);

  router.use('/institutos', institutosRoutes);
  router.use('/courses', coursesRoutes); // 
};

export default routeApi; // 