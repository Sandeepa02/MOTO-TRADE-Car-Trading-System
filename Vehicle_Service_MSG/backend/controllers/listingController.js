const Listing = require('../models/Listing');

// @desc    Get all active listings
// @route   GET /api/listings
// @access  Public/Private
const getListings = async (req, res) => {
    try {
        const listings = await Listing.find().sort({ createdAt: -1 });
        res.status(200).json(listings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a listing
// @route   POST /api/listings
// @access  Private (Seller only)
const createListing = async (req, res) => {
    try {
        const { title, price, category, description, image, sellerName } = req.body;
        
        const listing = await Listing.create({
            title,
            price,
            category,
            description,
            image: image || undefined,
            sellerName,
            sellerId: req.userId
        });
        
        res.status(201).json(listing);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a listing
// @route   PUT /api/listings/:id
// @access  Private
const updateListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        
        if (!listing) return res.status(404).json({ message: 'Listing not found' });
        if (listing.sellerId.toString() !== req.userId) {
            return res.status(401).json({ message: 'Not authorized to edit this listing' });
        }

        const updatedListing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedListing);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a listing
// @route   DELETE /api/listings/:id
// @access  Private
const deleteListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        
        if (!listing) return res.status(404).json({ message: 'Listing not found' });
        if (listing.sellerId.toString() !== req.userId) {
            return res.status(401).json({ message: 'Not authorized to delete this listing' });
        }

        await listing.deleteOne();
        res.status(200).json({ id: req.params.id, message: 'Listing deleted' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getListings,
    createListing,
    updateListing,
    deleteListing
};
