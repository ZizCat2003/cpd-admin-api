const jwt = require("jsonwebtoken");
var secret_key = "@Cpd_clinic";

module.exports = {
  sign: (payload) => {
    return jwt.sign(payload, secret_key);
  },
  verify: (req, res, next) => {
    var token = req.headers.authorization
      ? req.headers.authorization.split(" ")[1]
      : null;
    if (!token)
      return res
        .status(403)
        .json({ auth: false, message: "No token provided." });

    jwt.verify(token, secret_key, function (err, decoded) {
      if (err) {
        if (err.name == "TokenExpiredError") {
          return res
            .status(401)
            .json({ auth: false, message: "token expired" });
        } else {
          return res.status(500).json({ auth: false, message: err });
        }
      }

      // if everything good, save to request for use in other routes
      req.user = {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role,
      };

      req.id = decoded.id;
      req.username = decoded.username;
      req.role = decoded.role;

      next();
    });
  },
};
