import { Router } from "express";
import {
  getAlumni,
  getAlumniById,
  updateAlumniProfile,
} from "../controllers/alumni.controller.js";
import verifyJwt from "../middleware/auth.middleware.js";
import { requireAlumni } from "../middleware/role.middleware.js";

const router = Router();

// Public discovery endpoints
router.route("/").get(getAlumni);
router.route("/:id").get(getAlumniById);

// Protected alumni profile update
router.route("/profile").put(verifyJwt, requireAlumni, updateAlumniProfile);

export default router;
