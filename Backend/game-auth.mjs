import sessionStore from "./session-store";
import session from 'express-session';
import User from "./models/user";
import sql from "./sequelize";


export default function initAuth(io) {
  // setup sessions with socket io
  let sessionMiddleware = session({
    secret: 'mazelike',
    resave: true,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 365 // save cookies for 1 year
    }
  });

  io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, async() => {
      if(!socket.request.session) {
        next(new Error("Not authenitcated"));
        return;
      }

      socket.user = await User.findOne({
        where: {
          username: socket.request.session.username
        }
      });

      if(!socket.user) {
        next(new Error("Not authenitcated"));
        return;
      }

      next();
    });
  });
}
