import express from "express";
import getAmesh from "./get-amesh";

const port = parseInt(process.env.PORT || "3000");

const app = express();

app.listen(port);

app.get("/amesh", async (req, res, next) => {
  const image = await getAmesh(new Date());

  if (image) {
    res.header("Content-Type", "image/png");
    res.send(image);
  } else {
    res.status(500);
  }
});
