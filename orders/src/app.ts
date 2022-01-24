import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { errorHandler, NotFoundError, currentUser } from "@raventickets/common";

import { indexOrderRouter } from "./routes/index";
import { deleteOrderRouter } from "./routes/delete";
import { showOrderRouter } from "./routes/show";
import { createOrderRouter } from "./routes/create";

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

app.use(createOrderRouter);
app.use(deleteOrderRouter);
app.use(indexOrderRouter);
app.use(showOrderRouter);

app.all("*", () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
