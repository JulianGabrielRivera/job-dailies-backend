const { Schema, model } = require("mongoose");

const monthsSchema = new Schema({
  month: {
    type: String,
  },
  owner: { type: Schema.Types.ObjectId, ref: "User" },
  // if month and owner to that month exists dont make

  jobsApplied: { type: Number, default: 0 },
  jobsRejected: { type: Number, default: 0 },
  daysApplied: { type: Number, default: 1 },
  jobsFollowedUp: { type: Number, default: 0 },
  lastDateApplied: { type: String },
});

const Month = model("Month", monthsSchema);

module.exports = Month;
