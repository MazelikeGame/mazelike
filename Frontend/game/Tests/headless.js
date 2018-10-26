/* global jasmine __print__ __close__ */

if(typeof window.__print__ === "function") {
  jasmine.getEnv().addReporter({
    specDone: (result) => {
      let errors = "";
      for(let error of result.failedExpectations) {
        errors += `\n${error.stack}`;
      }

      __print__(result.status === "passed", `${result.description}${errors}`);
    },

    jasmineDone: () => {
      __close__();
    }
  });
}