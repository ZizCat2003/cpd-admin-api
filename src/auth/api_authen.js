const express = require("express");
const router = express.Router();
const user = require("./user");
const bcrypt = require("bcryptjs");
const constants = require("./constant");
const jwt = require("./jwt");

// Login
// router.post("/login", async (req, res) => {
//   const { username, password } = req.body;
//   let result = await user.findOne({ where: { username: username } });
//   if (result != null) {
//     if (bcrypt.compareSync(password, result.password)) {
//       const payload = { id: result.id, username, role: result.role || "normal" };
//       const token = jwt.sign(payload);
//       res.json({
//         result: constants.kResultOk,
//         token,
//         username,
//         message: result,
//       });
//     } else {
//       res.json({ result: constants.kResultNok, message: "Incorrect password" });
//     }
//   } else {
//     res.json({ result: constants.kResultNok, message: "Incorrect username" });
//   }
// });
// Backend - แก้ไข login route
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        result: constants.kResultNok,
        message: "Username and password are required",
      });
    }

    let result = await user.findOne({ where: { username: username } });

    if (result != null) {
      if (bcrypt.compareSync(password, result.password)) {
        const payload = {
          id: result.id,
          username: result.username,
          role: result.role || "normal",
        };

        const token = jwt.sign(
          payload,
          process.env.JWT_SECRET || "your-secret-key",
          {
            expiresIn: "24h",
          }
        );

        res.json({
          result: constants.kResultOk,
          token,
          username: result.username,
          user: {
            id: result.id,
            username: result.username,
            role: result.role || "normal",
          },
          message: "Login successful",
        });
      } else {
        res.status(401).json({
          result: constants.kResultNok,
          message: "Incorrect password",
        });
      }
    } else {
      res.status(401).json({
        result: constants.kResultNok,
        message: "Incorrect username",
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      result: constants.kResultNok,
      message: "Server error",
    });
  }
});

// router.get("/profile", jwt.verify, async (req, res) => {
//   const { username } = req;
//   const payload = { username, role: "normal" };
//   const token = jwt.sign(payload);
//   res.json({
//     result: "ok",
//     user: {
//       token,
//       username,
//       firstname: "Chaiyasit",
//       lastname: "T.",
//       email: "chaiyasit.t@codemobiles.com",
//       image: "/default_image.jpg",
//     },
//   });
// });
router.get("/profile", jwt.verify, async (req, res) => {
  try {
    const { id, username, role } = req.user; 

    const userResult = await user.findOne({
      where: { id },
      attributes: ["id", "username", "role"],
    });

    if (!userResult) {
      return res.status(404).json({
        result: constants.kResultNok,
        message: "User not found",
      });
    }

    res.json({
      result: constants.kResultOk,
      user: {
        id: userResult.id,
        username: userResult.username,
        role: userResult.role || "normal",
      },
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({
      result: constants.kResultNok,
      message: "Server error",
    });
  }
});

// Register
router.post("/register", async (req, res) => {
  try {
    req.body.password = bcrypt.hashSync(req.body.password, 8);
    let result = await user.create(req.body);
    res.json({ result: constants.kResultOk, message: JSON.stringify(result) });
  } catch (error) {
    res.json({
      result: constants.kResultNok,
      resultCode: "200",
      message: JSON.stringify(error),
    });
  }

  // Promise without async/await
  // user.create(req.body).then(result=>{
  //   res.json({result: constants.kResultOk, message: JSON.stringify(result)})
  // })
});

// Query all users
router.get("/users", async (req, res) => {
  let result = await user.findAll();
  res.json(result);
});

module.exports = router;
