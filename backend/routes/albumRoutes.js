import express from 'express'
const router = express.Router();

import {albumUpload} from "../middleware/uploadMiddleware.js"
import {createAlbum, getAllAlbums, getAlbumById, deleteAlbum, updateAlbum} from '../controllers/albumController.js';

router.route('/')
.post(albumUpload,createAlbum)
.get(getAllAlbums);

router.route('/:id')
.get(getAlbumById)
.put(updateAlbum)
.delete(deleteAlbum);
router.get('/', (req, res)=>{res.send("hello")})

export default router;