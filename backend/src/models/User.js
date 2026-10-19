import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: [true, 'Full name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ['customer', 'owner', 'seller', 'investor', 'admin'],
      default: 'customer',
    },
    avatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    // Google sign-in ("sub" of the Google ID token)
    googleId: { type: String, index: true, sparse: true, select: false },
    // Password reset: SHA-256 of the emailed token, valid until resetPasswordExpire
    resetPasswordToken: { type: String, select: false, index: { sparse: true } },
    resetPasswordExpire: { type: Date, select: false },
    // Tokens (JWT) issued before this date are rejected
    passwordChangedAt: { type: Date, select: false },
    favoriteHotels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' }],
    favoriteHouses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'House' }],
    // Investors: saved investment projects and what they look for ("projects for you")
    savedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'InvestmentProject' }],
    investorPrefs: {
      wilayas: [String],
      assetTypes: [String],
      projectTypes: [String],
      maxBudget: { type: Number, default: 0 }, // DZD, 0 = no limit
    },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  if (!this.isNew) this.passwordChangedAt = new Date();
  next();
});

// Compare a plain password with the hash
userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

/** True when the JWT (iat in seconds) was issued before the last password change. */
userSchema.methods.changedPasswordAfter = function (iat) {
  // JWT times are whole seconds: a token from the same second as the change (the new one) stays valid
  return Boolean(this.passwordChangedAt && iat < Math.floor(this.passwordChangedAt.getTime() / 1000));
};

const User = mongoose.model('User', userSchema);
export default User;
