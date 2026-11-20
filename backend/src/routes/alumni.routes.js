import { Router } from "express";
import {
  getAlumni,
  getAlumniById,
  updateAlumniProfile,
} from "../controllers/alumni.controller.js";
import verifyJwt from "../middleware/auth.middleware.js";
import { requireAlumni } from "../middleware/role.middleware.js";

const router = Router();

router.route("/").get(getAlumni);
router.route("/:id").get(getAlumniById);

router.route("/profile").put(verifyJwt, requireAlumni, updateAlumniProfile);

export default router;
