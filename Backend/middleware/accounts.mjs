import User from "../models/user";
import qs from "querystring";


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
   *
   * Usage:
   * if(res.loginRedirect()) {
   *  return;
   * }
   * @param url Optional url to use other than the current url
   * @return true if the user was redirected
   */
  res.loginRedirect = (url) => {
    if(!req.user) {
      let returnUrl = qs.escape(url || req.originalUrl);
      res.redirect(`/account/login?returnUrl=${returnUrl}`);
      return true;
    }

    return false;
  };

  next();
}
