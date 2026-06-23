import User from '../models/User.js';

export const toggleFavoriteHotel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const index = user.favoriteHotels.indexOf(id);
    let isFavorited = false;

    if (index === -1) {
      user.favoriteHotels.push(id);
      isFavorited = true;
    } else {
      user.favoriteHotels.splice(index, 1);
    }

    await user.save();
    res.json({ success: true, isFavorited, message: isFavorited ? 'Added to favorites' : 'Removed from favorites' });
  } catch (error) {
    next(error);
  }
};

export const toggleFavoriteHouse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const index = user.favoriteHouses.indexOf(id);
    let isFavorited = false;

    if (index === -1) {
      user.favoriteHouses.push(id);
      isFavorited = true;
    } else {
      user.favoriteHouses.splice(index, 1);
    }

    await user.save();
    res.json({ success: true, isFavorited, message: isFavorited ? 'Added to favorites' : 'Removed from favorites' });
  } catch (error) {
    next(error);
  }
};

export const getMyFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('favoriteHotels')
      .populate('favoriteHouses');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      favorites: {
        hotels: user.favoriteHotels,
        houses: user.favoriteHouses,
      },
    });
  } catch (error) {
    next(error);
  }
};
