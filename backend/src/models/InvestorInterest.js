import mongoose from 'mongoose';

// An investor's "I'm interested" request on a project; read by the land owner in their space.
const investorInterestSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'InvestmentProject', required: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, // the project's owner
    investor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // when sent while logged in
    name: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    email: { type: String, default: '', trim: true, maxlength: 120 },
    amount: { type: Number, min: 0 }, // what the investor could put in (DZD), optional
    message: { type: String, required: true, maxlength: 2000 },
    seen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const InvestorInterest = mongoose.model('InvestorInterest', investorInterestSchema);
export default InvestorInterest;
