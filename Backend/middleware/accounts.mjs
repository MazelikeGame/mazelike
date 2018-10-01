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

  /**
   * Redirect the user to /account/login if they are not logged in
   * @param url Optional url to use other than the current url
   */
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