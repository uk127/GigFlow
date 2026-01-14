import express from 'express';
import { getGigs, createGig, getGigById, updateGig, deleteGig, getMyGigs } from '../controllers/gigController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', getGigs);
router.get('/my-gigs', auth, getMyGigs);
router.post('/', auth, createGig);
router.get('/:id', getGigById);
router.put('/:id', auth, updateGig);
router.delete('/:id', auth, deleteGig);

export default router;
