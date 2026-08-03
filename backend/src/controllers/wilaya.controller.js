import Wilaya from '../models/Wilaya.js';

export const getWilayas = async (req, res, next) => {
  try {
    const wilayas = await Wilaya.find({}).sort({ code: 1, name: 1 });
    res.json({ success: true, wilayas });
  } catch (error) {
    next(error);
  }
};

export const addWilaya = async (req, res, next) => {
  try {
    const { name, code } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const exists = await Wilaya.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Wilaya already exists' });
    }

    let finalCode = code;
    if (!finalCode) {
      const maxCode = await Wilaya.findOne({}).sort({ code: -1 });
      finalCode = maxCode && maxCode.code ? maxCode.code + 1 : 1;
    }

    const wilaya = await Wilaya.create({ name, code: finalCode });
    res.status(201).json({ success: true, wilaya });
  } catch (error) {
    next(error);
  }
};
