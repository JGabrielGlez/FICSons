import { Router } from "express";
import evaluationRoutes from "./evaluation.routes.js";

const routerAppCore = (app) => {
  const router = Router();

  // Todos los endpoints del core se montan bajo /api
  app.use("/api", router);

  // Módulo de evaluaciones (Responsable: Miguel)
  router.use("/", evaluationRoutes);

  return router;
};

export default routerAppCore;
