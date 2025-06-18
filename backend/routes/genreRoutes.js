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

router.post("/", isAuth, createGenre);
router.get("/", getGenres);
router.get("/:idOrSlug", getGenreByIdOrSlug);
router.put("/:id", isAuth, updateGenre);
router.delete("/:id", isAuth, deleteGenre);

export default router;