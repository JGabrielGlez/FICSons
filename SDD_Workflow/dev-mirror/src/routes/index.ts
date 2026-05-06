import { Router } from "express";
import enroll from "./enroll";
import submitEvaluation from "./submit-evaluation";
import updateRole from "./update-role";

const router = Router();
router.use(enroll);
router.use(submitEvaluation);
router.use(updateRole);

export default router;
