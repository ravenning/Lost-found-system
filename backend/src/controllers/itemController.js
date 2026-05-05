const Item = require('../models/Item');
const Notification = require('../models/Notification');

const createItem = async (req, res) => {
  try {
    const { title, description, type, category, location, date, categorySpecificFields } = req.body;
    
    let parsedFields = categorySpecificFields;
    if (typeof categorySpecificFields === 'string') {
      try { parsedFields = JSON.parse(categorySpecificFields); } catch (e) {}
    }

    // Duplicate detection based on category specific fields
    if (parsedFields && Object.keys(parsedFields).length > 0) {
      const activeItems = await Item.find({ 
        type, 
        category, 
        status: { $in: ['LOST', 'FOUND'] } 
      });

      for (let item of activeItems) {
        if (item.categorySpecificFields) {
          for (let key in parsedFields) {
            if (item.categorySpecificFields.get(key) === parsedFields[key]) {
              return res.status(409).json({ message: `Possible duplicate found based on ${key}` });
            }
          }
        }
      }
    }

    const images = req.files ? req.files.map(file => ({
      url: file.path,
      public_id: file.filename,
    })) : [];

    const item = await Item.create({
      userId: req.user._id,
      title,
      description,
      type,
      category,
      categorySpecificFields: parsedFields || {},
      location,
      date,
      images,
      status: type,
    });

    // Match detection
    const oppositeType = type === 'LOST' ? 'FOUND' : 'LOST';
    const potentialMatches = await Item.find({
      type: oppositeType,
      category: category,
      status: { $in: ['LOST', 'FOUND'] }
    });

    if (potentialMatches.length > 0) {
      const notifications = potentialMatches.map(match => ({
        recipientId: match.userId,
        type: 'NEW_MATCH',
        title: 'New Potential Match!',
        message: `A new ${type} item was posted in ${category} that might match your item: ${match.title}.`,
        link: `/items/${item._id}`
      }));
      await Notification.insertMany(notifications);
      
      await Notification.create({
        recipientId: req.user._id,
        type: 'NEW_MATCH',
        title: 'Matches Found',
        message: `We found ${potentialMatches.length} existing items that might match your post.`,
        link: `/` 
      });
    }

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getItems = async (req, res) => {
  try {
    const { type, category, status } = req.query;
    let query = {};
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;

    const items = await Item.find(query).populate('userId', 'email role isTrusted');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('userId', 'email role isTrusted');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    const { title, description, location, date, status } = req.body;
    
    if (title) item.title = title;
    if (description) item.description = description;
    if (location) item.location = location;
    if (date) item.date = date;

    if (status && status !== item.status) {
      if (!item.transitionStatus(status)) {
        return res.status(400).json({ message: `Invalid status transition from ${item.status} to ${status}` });
      }
    }

    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    await item.deleteOne();
    res.json({ message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markResolved = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!item.transitionStatus('RESOLVED')) {
      return res.status(400).json({ message: `Invalid status transition from ${item.status} to RESOLVED` });
    }

    await item.save();
    res.json({ message: 'Item marked as resolved', item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createItem, getItems, getItemById, updateItem, deleteItem, markResolved };
