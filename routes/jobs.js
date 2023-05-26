var express = require("express");
const isAuthenticated = require("../middleware/isAuthenticated");
var router = express.Router();
const Job = require("../models/Job.model");
const Month = require("../models/Month.model");
const User = require("../models/User.model");

/* GET home page. */

router.get("/all-jobs", isAuthenticated, async function (req, res, next) {
  try {
    const allJobs = await User.find({ _id: req.user._id }).populate("jobs");
    // console.log(allJobs.jobs.sort(), "hi");
    const months = await Month.find({ owner: req.user._id });
    console.log(months, "hi");
    res.json({ allJobs, months });
  } catch (err) {
    console.log(err);
  }
});
router.post("/create-job", isAuthenticated, async function (req, res, next) {
  const {
    companyName,
    jobRole,

    source,
    notes,
    recruiter,
    status,
    jobLink,
  } = req.body;
  let options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  let optionsTwo = {
    month: "long",
    day: "numeric",
    year: "numeric",
  };
  let optionsThree = {
    month: "long",
  };

  const newDate = new Date();
  console.log(newDate);
  const prevDate = newDate.getDate() - 1;
  console.log(prevDate, "prev");
  const month = newDate.toLocaleString("en-US", optionsThree);
  console.log(month);
  const date = newDate.toLocaleString("en-US", optionsTwo);
  console.log(month, "hey");
  try {
    const createdJob = await Job.create({
      companyName,
      jobRole,
      date: newDate.toLocaleString("en-US", options),
      source,
      notes,
      recruiter,
      status,
      jobLink,
      month: month,
      owner: req.user._id,
    });
    console.log(createdJob);
    const findMonth = await Month.findOne({
      month: month,
      owner: req.user._id,
    });
    if (!findMonth) {
      const createMonth = await Month.create({
        month: month,
        owner: req.user._id,
        lastDateApplied: date,
      });
    } else if (findMonth) {
      if (findMonth.lastDateApplied !== date) {
        const monthToUpdate = await Month.findOneAndUpdate(
          { month: createdJob.month, owner: req.user._id },
          { $inc: { daysApplied: 1 } },
          { new: true }
        );
        const dateToUpdate = await Month.findOneAndUpdate(
          { month: createdJob.month, owner: req.user._id },
          { lastDateApplied: date },
          { new: true }
        );
      }
    }
    const monthToUpdate = await Month.findOneAndUpdate(
      { month: createdJob.month, owner: req.user._id },
      { $inc: { jobsApplied: 1 } },
      { new: true }
    );

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { jobs: createdJob._id } },
      { new: true }
    ).populate("jobs");
    const months = await Month.find({ owner: req.user._id });
    console.log(months);
    res.json({ createdJob, updatedUser, months });

    // console.log(createdJob);
  } catch (err) {
    console.log(err);
  }
});
router.get("/details/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const findJob = await Job.findById(id);
    console.log(findJob);
    res.json(findJob);
  } catch (err) {
    console.log(err);
  }
});
router.get(
  "/phoneFollowUp/true/:id",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const findJob = await Job.findByIdAndUpdate(
        id,
        { phoneFollowUp: true },
        { new: true }
      );
      const updateFollowUpCount = await User.findByIdAndUpdate(
        req.user._id,
        { $inc: { totalFollowUps: +1 } },
        { new: true }
      );
      console.log(findJob);
      const updatedUser = await User.findById(req.user._id).populate("jobs");
      res.json({ updatedUser, findJob });
    } catch (err) {
      console.log(err);
    }
  }
);
router.get(
  "/emailFollowUp/true/:id",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const findJob = await Job.findByIdAndUpdate(
        id,
        { emailFollowUp: true },
        { new: true }
      );
      const updateFollowUpCount = await User.findByIdAndUpdate(
        req.user._id,
        { $inc: { totalFollowUps: +1 } },
        { new: true }
      );
      console.log(findJob);
      const updatedUser = await User.findById(req.user._id).populate("jobs");
      res.json({ updatedUser, findJob });
    } catch (err) {
      console.log(err);
    }
  }
);
router.get(
  "/inPersonFollowUp/true/:id",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const findJob = await Job.findByIdAndUpdate(
        id,
        { inPersonFollowUp: true },
        { new: true }
      );
      const updateFollowUpCount = await User.findByIdAndUpdate(
        req.user._id,
        { $inc: { totalFollowUps: +1 } },
        { new: true }
      );
      console.log(findJob);
      const updatedUser = await User.findById(req.user._id).populate("jobs");
      res.json({ updatedUser, findJob });
    } catch (err) {
      console.log(err);
    }
  }
);
router.get(
  "/phoneFollowUp/false/:id",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const findJob = await Job.findByIdAndUpdate(
        id,
        { phoneFollowUp: false },
        { new: true }
      );
      const updateFollowUpCount = await User.findByIdAndUpdate(
        req.user._id,
        { $inc: { totalFollowUps: -1 } },
        { new: true }
      );

      const updatedUser = await User.findById(req.user._id).populate("jobs");
      res.json({ updatedUser, findJob, updatedUser });
    } catch (err) {
      console.log(err);
    }
  }
);
router.get(
  "/emailFollowUp/false/:id",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const findJob = await Job.findByIdAndUpdate(
        id,
        { emailFollowUp: false },
        { new: true }
      );
      console.log(findJob);
      const updateFollowUpCount = await User.findByIdAndUpdate(
        req.user._id,
        { $inc: { totalFollowUps: -1 } },
        { new: true }
      );
      const updatedUser = await User.findById(req.user._id).populate("jobs");
      res.json({ updatedUser, findJob, updatedUser });
    } catch (err) {
      console.log(err);
    }
  }
);
router.get(
  "/inPersonFollowUp/false/:id",
  isAuthenticated,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const findJob = await Job.findByIdAndUpdate(
        id,
        { inPersonFollowUp: false },
        { new: true }
      );
      console.log(findJob);
      const updateFollowUpCount = await User.findByIdAndUpdate(
        req.user._id,
        { $inc: { totalFollowUps: -1 } },
        { new: true }
      );
      const updatedUser = await User.findById(req.user._id).populate("jobs");
      res.json({ updatedUser, findJob, updatedUser });
    } catch (err) {
      console.log(err);
    }
  }
);
router.get("/dailygoals", isAuthenticated, async function (req, res, next) {
  console.log("hi");
  try {
    const newDate = new Date();

    let options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const todayJobs = await Job.find({
      date: newDate.toLocaleString("en-US", options),
      owner: req.user._id,
    });
    console.log(todayJobs, "today");
    res.json(todayJobs);
  } catch (err) {
    console.log(err);
  }
});

router.post("/edit/true/:id", isAuthenticated, async function (req, res, next) {
  try {
    const { id } = req.params;
    const updateEdit = await Job.findByIdAndUpdate(
      id,
      { edit: true },
      { new: true }
    );
    const allJobs = await User.find({ _id: req.user._id }).populate("jobs");
    console.log(allJobs, "hi");
    console.log(updateEdit);
    res.json({ updateEdit, allJobs });
  } catch (err) {
    console.log(err);
  }
});
router.post(
  "/edit/false/:id",
  isAuthenticated,
  async function (req, res, next) {
    try {
      const { editJob, companyName, notes, jobRole, status, job } = req.body;
      console.log(companyName, "hi");
      console.log(editJob, jobRole);
      console.log(job);
      const { id } = req.params;
      const updateEdit = await Job.findByIdAndUpdate(
        id,
        {
          edit: false,
          companyName: editJob.companyName
            ? editJob.companyName
            : job.companyName,
          jobRole: editJob.jobRole ? editJob.jobRole : job.jobRole,
          notes: editJob.notes ? editJob.notes : job.notes,
          status: editJob.status ? editJob.status : job.status,
        },
        { new: true }
      );
      const allJobs = await User.find({ _id: req.user._id }).populate("jobs");
      console.log(allJobs, "hi");
      console.log(updateEdit);
      res.json({ updateEdit, allJobs });
    } catch (err) {
      console.log(err);
    }
  }
);
router.get("/delete-job/:id", isAuthenticated, async function (req, res, next) {
  try {
    const { id } = req.params;
    let optionsThree = {
      month: "long",
    };
    const newDate = new Date();

    const month = newDate.toLocaleString("en-US", optionsThree);
    console.log(month);

    const deletedJob = await Job.findByIdAndDelete(id);
    const myJobs = await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: {
          jobs: deletedJob._id,
        },
      },
      { new: true }
    ).populate("jobs");
    const monthRejectedUpdate = await Month.findOneAndUpdate(
      {
        month: month,
        owner: req.user._id,
      },
      {
        $inc: {
          jobsRejected: 1,
        },
      },
      { new: true }
    );
    const myJobsAgain = await User.findByIdAndUpdate(
      req.user._id,
      {
        $inc: {
          totalJobsRejected: +1,
        },
      },
      { new: true }
    ).populate("jobs");
    console.log(myJobsAgain);
    console.log(deletedJob);
    console.log(myJobs);
    const months = await Month.find({ owner: req.user._id });

    res.json({ deletedJob, myJobsAgain, months });
  } catch (err) {
    console.log(err);
  }
});

router.post("/search", isAuthenticated, async (req, res, next) => {
  const searchedTerm = req.body.companyName;
  if (searchedTerm) {
    const searchJob = await Job.find({
      companyName: searchedTerm,
      owner: req.user._id,
    });
    res.json(searchJob);
  } else {
    const searchJob = await Job.find({ owner: req.user._id });
    console.log(searchJob);
    res.json(searchJob);
  }
});

module.exports = router;
