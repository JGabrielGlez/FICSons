// Dev mirror route: enroll (placeholder)
import { Router } from "express";
const router = Router();
router.post("/enroll", (req, res) =>
  res.json({ message: "enroll mirror placeholder" }),
);
export default router;
