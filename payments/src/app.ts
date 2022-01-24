import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { errorHandler, NotFoundError, currentUser } from "@raventickets/common";
import { createChargeRouter } from "./routes/create";

const app = express();
app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.Node_ENV !== "test",
  })
);
app.use(currentUser);

app.use(createChargeRouter)

app.all("*", () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
