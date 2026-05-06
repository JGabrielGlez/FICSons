import * as EnrollmentService from "../services/enrollment.service.js";

export const EnrollmentController = {
  async getMyEnrollments(req, res) {
    try {
      const userId = req.user && req.user.id;
      if (!userId) return res.status(401).json({ error: "unauthenticated" });
      const items = await EnrollmentService.getMyEnrollments(userId);
      return res.json(items);
    } catch (err) {
      console.error("[EnrollmentController] getMyEnrollments error:", err);
      return res.status(500).json({
        error: "Internal server error",
        details: err && err.message ? err.message : "unknown error",
        code: err && err.code ? err.code : null,
      });
    }
  },

  async requestEnrollment(req, res) {
    try {
      const userId = req.user && req.user.id;
      if (!userId) return res.status(401).json({ error: "unauthenticated" });
      const { courseId } = req.body || {};
      if (!courseId)
        return res.status(400).json({ error: "courseId is required" });

      const result = await EnrollmentService.requestEnrollment(
        userId,
        courseId,
      );
      return res.json(result);
    } catch (err) {
      console.error("[EnrollmentController] requestEnrollment error:", err);
      if (err && err.status === 404)
        return res.status(404).json({ error: "course not found" });
      return res.status(500).json({
        error: "Internal server error",
        details: err && err.message ? err.message : "unknown error",
        code: err && err.code ? err.code : null,
      });
    }
  },

  async canEnroll(req, res) {
    try {
      const userId = req.user && req.user.id;
      if (!userId) return res.status(401).json({ error: "unauthenticated" });
      const courseId = req.params.id;
      if (!courseId)
        return res.status(400).json({ error: "course id required" });

      const result = await EnrollmentService.checkPrerequisites(
        userId,
        courseId,
      );
      return res.json({ allowed: result.allowed, missing: result.missing });
    } catch (err) {
      console.error("[EnrollmentController] canEnroll error:", err);
      return res.status(500).json({
        error: "Internal server error",
        details: err && err.message ? err.message : "unknown error",
        code: err && err.code ? err.code : null,
      });
    }
  },

  async cancelEnrollment(req, res) {
    try {
      const userId = req.user && req.user.id;
      if (!userId) return res.status(401).json({ error: "unauthenticated" });
      const enrollmentId = req.params.id;
      if (!enrollmentId)
        return res.status(400).json({ error: "enrollment id required" });

      const ok = await EnrollmentService.dropEnrollment(enrollmentId, userId);
      if (!ok) return res.status(404).json({ error: "enrollment not found" });
      return res.json({ dropped: true });
    } catch (err) {
      console.error("[EnrollmentController] cancelEnrollment error:", err);
      return res.status(500).json({
        error: "Internal server error",
        details: err && err.message ? err.message : "unknown error",
        code: err && err.code ? err.code : null,
      });
    }
  },
};
