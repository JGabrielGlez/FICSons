import { Router } from "express";
import config from "../../../config/config";
import institutosRoutes from "./institutos.routes";
import coursesRoutes from "./courses.routes"; 
import enrollmentRoutes from "../../app-core/routes/enrollment.routes.js";

const routeApi = (app) => {
  const router = Router();
  const api = config.API_URL;
  app.use('/api', router);

  router.use('/institutos', institutosRoutes);
  router.use('/courses', coursesRoutes); // 
  router.use('/', enrollmentRoutes);
};

export default routeApi; // 