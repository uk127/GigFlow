import Gig from '../models/Gig.js';

export const getGigs = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    
    let query = { status: 'open' };
    
    if (search) {
      query.$text = { $search: search };
    }

    const gigs = await Gig.find(query)
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Gig.countDocuments(query);

    res.json({
      gigs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get gigs error:', error);
    res.status(500).json({ message: 'Server error while fetching gigs' });
  }
};

export const createGig = async (req, res) => {
  try {
    const { title, description, budget } = req.body;

    if (!title || !description || !budget) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (budget <= 0) {
      return res.status(400).json({ message: 'Budget must be greater than 0' });
    }

    const gig = new Gig({
      title,
      description,
      budget,
      ownerId: req.user._id
    });

    await gig.save();
    await gig.populate('ownerId', 'name email');

    res.status(201).json({
      message: 'Gig created successfully',
      gig
    });
  } catch (error) {
    console.error('Create gig error:', error);
    res.status(500).json({ message: 'Server error while creating gig' });
  }
};

export const getGigById = async (req, res) => {
  try {
    const { id } = req.params;

    const gig = await Gig.findById(id).populate('ownerId', 'name email');
    
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    res.json({ gig });
  } catch (error) {
    console.error('Get gig error:', error);
    res.status(500).json({ message: 'Server error while fetching gig' });
  }
};

export const updateGig = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, budget } = req.body;

    const gig = await Gig.findById(id);
    
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this gig' });
    }

    if (gig.status !== 'open') {
      return res.status(400).json({ message: 'Cannot update a gig that is already assigned' });
    }

    const updatedGig = await Gig.findByIdAndUpdate(
      id,
      { title, description, budget },
      { new: true, runValidators: true }
    ).populate('ownerId', 'name email');

    res.json({
      message: 'Gig updated successfully',
      gig: updatedGig
    });
  } catch (error) {
    console.error('Update gig error:', error);
    res.status(500).json({ message: 'Server error while updating gig' });
  }
};

export const deleteGig = async (req, res) => {
  try {
    const { id } = req.params;

    const gig = await Gig.findById(id);

    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this gig' });
    }

    if (gig.status !== 'open') {
      return res.status(400).json({ message: 'Cannot delete a gig that is already assigned' });
    }

    await Gig.findByIdAndDelete(id);

    res.json({ message: 'Gig deleted successfully' });
  } catch (error) {
    console.error('Delete gig error:', error);
    res.status(500).json({ message: 'Server error while deleting gig' });
  }
};

export const getMyGigs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const gigs = await Gig.find({ ownerId: req.user._id })
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Gig.countDocuments({ ownerId: req.user._id });

    res.json({
      gigs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get my gigs error:', error);
    res.status(500).json({ message: 'Server error while fetching your gigs' });
  }
};
