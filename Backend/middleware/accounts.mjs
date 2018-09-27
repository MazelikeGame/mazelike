import userFn from "../models/user";
import sql from "../sequelize";

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
  next();
}