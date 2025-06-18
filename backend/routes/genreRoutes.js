import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import {
  createGenre,
  updateGenre,
  deleteGenre,
  getGenres,
  getGenreByIdOrSlug
} from "../controllers/genreController.js";
// import {
//   createGenreValidator,
//   updateGenreValidator,
//   genreIdOrSlugValidator
// } from "../validators/genreValidators.js";
// import validate from "../middleware/validate.js";
const router = express.Router();

router.post("/", createGenre);
router.get("/", getGenres);
router.get("/:idOrSlug", getGenreByIdOrSlug);
router.put("/:idOrSlug", updateGenre);
router.delete("/:idOrSlug", deleteGenre);

export default router;