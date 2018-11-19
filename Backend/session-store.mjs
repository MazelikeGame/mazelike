import sql from "./sequelize";
import Sequelize from "sequelize";
import expressSession from "express-session";

// define a model for the sessions
let Session = sql.define("sessions", {
  id: {
    primaryKey: true,
    type: Sequelize.STRING
  },
  session: Sequelize.JSON
});

/**
 * Get a session from the db
 * @param sid The session id
 */
async function get(sid) {
  let dbSession = await Session.findByPk(sid);

  return dbSession && dbSession.session;
}

/**
 * Store a session in the db
 * @param sid The session id
 * @param session The session data
 */
async function set(sid, session) {
  let dbSession = await Session.findByPk(sid);

  if(dbSession) {
    dbSession.update({
      session
    });
  } else {
    Session.create({
      id: sid,
      session
    });
  }
}

/**
 * Destroy a session
 * @param sid The session id
 */
async function destroy(sid) {
  let dbSession = await Session.findByPk(sid);

  if(dbSession) {
    await dbSession.destroy();
  }
}

/**
 * Convert a function that returns a promise into a function that
 * calls a callback
 * @param fn 
 */
function callbackify(fn) {
  return async(...args) => {
    let callback = args.pop();

    try {
      callback(null, await fn(...args));
    } catch(err) {
      callback(err);
    }
  };
}

// Create the session store for express-session
let sessionStore = Object.assign(new expressSession.Store(), {
  get: callbackify(get),
  set: callbackify(set),
  destroy: callbackify(destroy)
});

export default sessionStore;