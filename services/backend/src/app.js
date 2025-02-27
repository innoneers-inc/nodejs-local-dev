const path = require("node:path");

require("./config")(path.resolve(__dirname, "../app.yaml"));

const { isBoom, boomify } = require("boom");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { ImagesRouter, AuthRouter } = require("./routes");

const app = express();


app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

app.use(express.json());

// Base route `/apis` wraps both `/users` and `/products`
const ApisRouter = express.Router();

ApisRouter.use("/auth", AuthRouter);
ApisRouter.use("/images", ImagesRouter);

app.use("/apis", ApisRouter)

app.use([
  function boomifyErrorHandler(err, req, res, next) {
    if (!isBoom(err)) {
      return next(boomify(err, { statusCode: err.statusCode || 500 }));
    }
    next(err);
  },
  function errorReporting(err, req, res, next) {
    if (err.output.statusCode >= 500) {
      // report error to Cloud Error Reporting
    }
    // propagate error to the next middleware in the stack
    next(err);
  },
  function clientHandler(err, req, res, next) {
    const { output, data = {} } = err;

    res.status(output.statusCode).json({
      error: {
        ...output.payload,
        ...data,
      },
    });
  },
]);

const PORT = parseInt(process.env.PORT) || 8080;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log("Press Ctrl+C to quit.");
});

module.exports = app;
