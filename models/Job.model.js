const { Schema, model } = require("mongoose");

const jobSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    companyName: {
      type: String,
      required: true,
    },
    jobRole: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      required: true,
    },
    recruiter: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    jobLink: {
      type: String,
      required: true,
    },
    month: {
      type: String,
      required: true,
    },
    emailFollowUp: {
      type: Boolean,
      default: false,
    },

    phoneFollowUp: {
      type: Boolean,
      default: false,
    },
    inPersonFollowUp: {
      type: Boolean,
      default: false,
    },
    followUp: {
      type: Boolean,
      default: false,
    },
    edit: {
      type: Boolean,
      default: false,
    },
  },
  {
    timeseries: true,
    timestamps: true,
  }
);

const Job = model("Job", jobSchema);

module.exports = Job;
