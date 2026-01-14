import Bid from '../models/Bid.js';
import Gig from '../models/Gig.js';

export const createBid = async (req, res) => {
  try {
    const { gigId, message, price } = req.body;

    if (!gigId || !message || !price) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (price <= 0) {
      return res.status(400).json({ message: 'Price must be greater than 0' });
    }

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.status !== 'open') {
      return res.status(400).json({ message: 'Cannot bid on a gig that is already assigned' });
    }

    if (gig.ownerId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot bid on your own gig' });
    }

    const existingBid = await Bid.findOne({ gigId, freelancerId: req.user._id });
    if (existingBid) {
      return res.status(400).json({ message: 'You have already bid on this gig' });
    }

    const bid = new Bid({
      gigId,
      freelancerId: req.user._id,
      message,
      price
    });

    await bid.save();
    await bid.populate('freelancerId', 'name email');
    await bid.populate('gigId', 'title budget');

    res.status(201).json({
      message: 'Bid created successfully',
      bid
    });
  } catch (error) {
    console.error('Create bid error:', error);
    res.status(500).json({ message: 'Server error while creating bid' });
  }
};

export const getBidsByGig = async (req, res) => {
  try {
    const { gigId } = req.params;

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view bids for this gig' });
    }

    const bids = await Bid.find({ gigId })
      .populate('freelancerId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ bids });
  } catch (error) {
    console.error('Get bids error:', error);
    res.status(500).json({ message: 'Server error while fetching bids' });
  }
};

export const hireFreelancer = async (req, res) => {
  console.log('Hiring freelancer - Start');

  try {
    const { bidId } = req.params;
    const io = req.app.get('socketio');
    console.log('Hiring bid ID:', bidId);

    const bid = await Bid.findById(bidId);
    console.log('Found bid:', bid ? bid._id : 'null');

    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    if (bid.status !== 'pending') {
      console.log('Bid status is not pending:', bid.status);
      return res.status(400).json({ message: 'This bid is no longer pending' });
    }

    const gig = await Gig.findById(bid.gigId);
    console.log('Found gig:', gig ? gig._id : 'null');

    if (!gig) {
      return res.status(404).json({ message: 'Associated gig not found' });
    }

    if (gig.ownerId.toString() !== req.user._id.toString()) {
      console.log('Authorization failed - gig owner:', gig.ownerId, 'user:', req.user._id);
      return res.status(403).json({ message: 'Not authorized to hire for this gig' });
    }

    if (gig.status !== 'open') {
      console.log('Gig status is not open:', gig.status);
      return res.status(400).json({ message: 'This gig is already assigned' });
    }

    console.log('Updating gig status to assigned');
    gig.status = 'assigned';
    await gig.save();

    console.log('Updating bid status to hired');
    bid.status = 'hired';
    await bid.save();

    // Get all rejected bids before updating them
    const rejectedBids = await Bid.find(
      {
        gigId: bid.gigId,
        _id: { $ne: bidId },
        status: 'pending'
      }
    );
    console.log('Found', rejectedBids.length, 'bids to reject');

    const updateResult = await Bid.updateMany(
      {
        gigId: bid.gigId,
        _id: { $ne: bidId },
        status: 'pending'
      },
      { status: 'rejected' }
    );
    console.log('Update result:', updateResult);

    // Send real-time notification to hired freelancer
    console.log('Sending hired notification to:', bid.freelancerId.toString());
    io.to(bid.freelancerId.toString()).emit('hired', {
      message: `Congratulations! You have been hired for "${gig.title}"!`,
      type: 'hired',
      gigTitle: gig.title,
      gigId: gig._id,
      bidId: bid._id
    });

    // Send rejection notifications to other bidders
    console.log('Sending rejection notifications to', rejectedBids.length, 'freelancers');
    rejectedBids.forEach(rejectedBid => {
      io.to(rejectedBid.freelancerId.toString()).emit('bid_rejected', {
        message: `Unfortunately, you were not selected for "${gig.title}". Better luck next time!`,
        type: 'rejected',
        gigTitle: gig.title,
        gigId: gig._id,
        bidId: rejectedBid._id
      });
    });

    const updatedBid = await Bid.findById(bidId)
      .populate('freelancerId', 'name email')
      .populate('gigId', 'title');

    console.log('Hiring process completed successfully');
    res.json({
      message: 'Freelancer hired successfully',
      bid: updatedBid
    });

  } catch (error) {
    console.error('Hire freelancer error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error while hiring freelancer' });
  }
};

export const getMyBids = async (req, res) => {
  try {
    console.log('Fetching bids for user:', req.user._id);

    const bids = await Bid.find({ freelancerId: req.user._id })
      .populate('gigId', 'title budget status ownerId')
      .sort({ createdAt: -1 });

    console.log('Found', bids.length, 'bids for user');

    // Ensure each bid has populated gig data
    const populatedBids = bids.map(bid => ({
      _id: bid._id,
      gigId: bid.gigId,
      message: bid.message,
      price: bid.price,
      status: bid.status,
      createdAt: bid.createdAt,
      freelancerId: bid.freelancerId
    }));

    console.log('Returning populated bids');
    res.json({ bids: populatedBids });
  } catch (error) {
    console.error('Get my bids error:', error);
    res.status(500).json({ message: 'Server error while fetching your bids' });
  }
};
