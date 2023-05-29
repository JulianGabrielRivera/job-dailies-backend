// ask

const router = require("express").Router();

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const User = require("../models/User.model");
const Token = require("../models/Token.model");
const crypto = require("crypto");
const sendEmail = require("../services/sendMail");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const isAuthenticated = require("../middleware/isAuthenticated");
const fileUploader = require("../config/cloudinary.config");
const { error } = require("console");

const saltRounds = 10;

router.post("/signup", (req, res, next) => {
  // input name,pw,email

  const { signUpObject, profileImage } = req.body;
  console.log(signUpObject, profileImage);
  // Check if email or password or name are provided as empty string
  if (signUpObject.email === "" || signUpObject.password === "") {
    res.status(400).json({ message: "Provide email, password and name" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(signUpObject.email)) {
    res.status(400).json({ message: "Provide a valid email address." });
    return;
  }

  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(signUpObject.password)) {
    res.status(400).json({
      message:
        "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.",
    });
    return;
  }

  User.findOne({ email: signUpObject.email }).then((foundUser) => {
    if (foundUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }
    const salt = bcrypt.genSaltSync(saltRounds);

    const hashedPassword = bcrypt.hashSync(signUpObject.password, salt);

    return User.create({
      email: signUpObject.email,
      password: hashedPassword,
      firstName: signUpObject.firstName,
      lastName: signUpObject.lastName,
      profilePicture: profileImage,

      // emailToken: crypto.randomBytes(64).toString('hex'),
      // isVerified: false,
    })
      .then((createdUser) => {
        // Deconstruct the newly created user object to omit the password
        // We should never expose passwords publicly
        console.log(createdUser);
        const { email, firstName, lastName, profilePicture } = createdUser;

        // Create a new object that doesn't expose the password
        const user = { email, firstName, lastName, profilePicture };

        // Send a json response containing the user object
        res.status(201).json({ user: user });
        console.log(user);
      })
      .catch((err) => console.log(err));
  });
});
router.post(
  "/profile-pic",
  fileUploader.single("profilePicture"),
  async (req, res, next) => {
    res.json({ profileImage: req.file.path });
    console.log("File", req.file);
  }
);

router.post("/login", (req, res, next) => {
  // parsing the body from front end

  const { email, password } = req.body;
  console.log(email);
  // Check if email or password are provided as empty string
  if (email === "" || password === "") {
    res.status(400).json({ message: "Provide email and password." });
    return;
  }
  User.findOne({ email })
    .then((foundUser) => {
      console.log(foundUser);
      if (!foundUser) {
        // If the user is not found, send an error response
        res.status(401).json({ message: "User not found." });
        return;
      }
      // Compare the provided password with the one saved in the database
      const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

      if (passwordCorrect) {
        // parsing  id email and name // parsing out of founduser
        const {
          email,
          firstName,
          lastName,
          _id,
          jobs,
          totalFollowUps,
          totalJobsApplied,
          totalJobsRejected,
        } = foundUser;

        // Create an object that will be set as the token payload
        const payload = {
          email,
          firstName,
          lastName,
          _id,
          jobs,
          totalFollowUps,
          totalJobsApplied,
          totalJobsRejected,
        };
        // const payload = foundUser.toObject();

        // token has the whole payload encrypted inside of it
        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          algorithm: "HS256",
          expiresIn: "6h",
        });

        // Send the token as the response
        res.status(200).json({ authToken: authToken });
      } else {
        res.status(401).json({ message: "Unable to authenticate the user" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Internal Server Error" });
    });
});

router.post("/password-link", async (req, res, next) => {
  try {
    const emailSchema = Joi.object({
      email: Joi.string().email().required().label("Email"),
    });

    let user = await User.findOne({ email: req.body.email });
    console.log(user);
    let token = await Token.findOne({ userId: user._id });
    if (!token) {
      token = await Token.create({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      });
    }
    console.log(user.email);
    const url = `${process.env.BASE_URL}/auth/password/${user._id}/${token.token}/`;
    await sendEmail(user.email, "Password Reset", url);

    res
      .status(200)
      .send({ message: "Password reset link sent to your email account" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});
// verify password reset link
router.get("/password/:id/:token", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    const userUpdate = await User.findOneAndUpdate(
      { _id: req.params.id },
      { verified: false }
    );
    if (!user) return res.status(400).send({ message: "Invalid link" });

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send({ message: "Invalid link" });

    res.status(200).send("Valid Url");
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});
//  set new password
router.post("/password/:id/:token", async (req, res) => {
  try {
    // const passwordSchema = Joi.object({
    //   password: passwordComplexity().required().label("Password"),
    // });
    // const { error } = passwordSchema.validate(req.body);
    // if (error)
    //   return res.status(400).send({ message: error.details[0].message });

    const user = await User.findOne({ _id: req.params.id });
    console.log(user);
    console.log(req.body.password);
    // if (!user) return res.status(400).send({ message: "Invalid link" });
    // conosle.log(user);
    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    console.log(token);
    if (!token) return res.status(400).send({ message: "Invalid link" });

    if (!user.verified) {
      const salt = await bcrypt.genSaltSync(saltRounds);
      const hashPassword = await bcrypt.hashSync(req.body.password, salt);
      console.log(hashPassword);

      const userUpdate = await User.findOneAndUpdate(
        { _id: req.params.id },
        { password: hashPassword, verified: true }
      );
      const tokenDeleted = await Token.findOneAndDelete({
        userId: user._id,
        token: req.params.token,
      });
    }

    res.status(200).send({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.post("/save-new-password", isAuthenticated, (req, res) => {
  const { oldPassword, email, newPassword } = req.body;
  console.log(oldPassword, email, newPassword);
  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(newPassword)) {
    res.status(400).json({
      message:
        "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.",
    });
    return;
  }
  User.findOne({ email }).then((foundUser) => {
    console.log(foundUser);
    if (!foundUser) {
      // If the user is not found, send an error response
      res.status(401).json({ message: "User not found." });
      return;
    }
    // Compare the provided password with the one saved in the database
    const passwordCorrect = bcrypt.compareSync(oldPassword, foundUser.password);

    if (passwordCorrect) {
      const salt = bcrypt.genSaltSync(saltRounds);
      if (newPassword === oldPassword) {
        res.status(400).json({ message: "You cannot use previous password." });
        return;
      }
      const hashedPassword = bcrypt.hashSync(newPassword, salt);
      User.findByIdAndUpdate(
        req.user._id,
        { password: hashedPassword },
        { new: true }
      )
        .then((updatedUser) => {
          console.log(updatedUser);
          res.json({ message: "success" });
        })
        .catch((err) => [console.log(err)]);
      // parsing  id email and name // parsing out of founduser
    } else {
      res.status(400).json({ message: "Current password did not match" });
    }
  });
});
router.post("/change-email", isAuthenticated, async (req, res) => {
  console.log(req.body.email, req.user._id);

  try {
    if (req.body.email === "") {
      return;
    }
    const updateUser = await User.findOneAndUpdate(
      { _id: req.user._id },
      { email: req.body.email },
      { new: true }
    );
    res.json({ updateUser });
  } catch (err) {
    res.json(err);
    console.log(err);
  }
});

router.get("/delete-profile", isAuthenticated, async (req, res, next) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user._id);
    console.log(deletedUser);
    res.json(deletedUser);
  } catch (err) {
    console.log(error);
  }
});
router.get("/verify", isAuthenticated, async (req, res, next) => {
  // <== CREATE NEW ROUTE

  // If JWT token is valid the payload gets decoded by the
  // isAuthenticated middleware and made available on `req.payload`
  const user = await User.findById(req.user._id).populate("jobs");
  console.log(`req.payload`, user);
  // Send back the object with user data
  // previously set as the token payload

  res.status(200).json(user);
});

module.exports = router;
