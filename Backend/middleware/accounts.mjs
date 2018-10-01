import userFn from "../models/user";
import sql from "../sequelize";
import qs from "querystring";

let User = userFn(sql);

// Get the user model for the current user
export default async function userMiddleware(req, res, next) {
  if(req.session && req.session.authenticated) {
    req.user = await User.findOne({
      where: {
        username: req.session.username
      }
    });
  }

  res.loginRedirect = (url) => {
    if(!req.user) {
      let returnUrl = "";

      if(url) {
        returnUrl = `?returnUrl=${qs.escape(url || req.originalUrl)}`;
      }

      res.redirect(`/account/login${returnUrl}`);
    }
  };
  
  next();
}