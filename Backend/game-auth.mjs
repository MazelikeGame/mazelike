import User from "./models/user";
import session from 'express-session';
import sessionStore from "./session-store";

//Note if we add https: cookie: { secure: true }
export let sessionMiddleware = session({
  secret: 'mazelike',
  resave: true,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 365 // save cookies for 1 year
  }
});

export default function initAuth(io) {
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

      next();
    });
  });
}
