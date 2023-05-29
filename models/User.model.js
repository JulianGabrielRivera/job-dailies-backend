const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      unique: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      //   required: true,
      //   default:
      //     "https://us.123rf.com/450wm/urfandadashov/urfandadashov1806/urfandadashov180600503/150540180-profile-pic-vector-icon-isolated-on-transparent-background-profile-pic-logo-concept.jpg",
    },
    password: {
      type: String,
      required: true,
    },
    jobs: [{ type: Schema.Types.ObjectId, ref: "Job" }],
    totalFollowUps: {
      type: Number,
      default: 0,
    },
    totalJobsApplied: {
      type: Number,
      default: 0,
    },
    totalJobsRejected: {
      type: Number,
      default: 0,
    },
    jobsPerDay: {
      type: Number,
      required: true,
      default: 0,
    },
    verified: { type: Boolean, default: false },
  },

  {
    timeseries: true,
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
