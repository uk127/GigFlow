import express from 'express';
import { createBid, getBidsByGig, hireFreelancer, getMyBids } from '../controllers/bidController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, createBid);
router.get('/my-bids', auth, getMyBids);
router.get('/:gigId', auth, getBidsByGig);
router.patch('/:bidId/hire', auth, hireFreelancer);

export default router;
