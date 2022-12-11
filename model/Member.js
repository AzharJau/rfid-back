const mongoose = require("mongoose");

const MemberSchema = new mongoose.Schema(
  {
    memberId: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: String,
    lastName: String,
    course: String,
    address: String,
    rfidBadgeNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    imagePic: String,
    expireAt: {
            type: Date,
            default:null,


  }
  },
  { timestamps: true }
);
MemberSchema.index({ "expireAt": 1 }, { expireAfterSeconds: 0 });
module.exports = mongoose.model("Member", MemberSchema);
