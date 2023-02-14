const { validationResult } = require("express-validator");

module.exports = {
  handleErrors(templateFunc, dataCB) {
    return async (req, res, next) => {
      const errors = validationResult(req);
      // console.log(errors);
      if (!errors.isEmpty()) {
        let data = {};
        if (dataCB) {
          data = await dataCB(req);
        }
        return res.send(templateFunc({ errors, ...data }));
      }
      next();
    };
  },
  requireAuth(req, res, next) {
    if (!req.session.userId) {
      return res.redirect("/signin");
    }
    next();
  },
};
