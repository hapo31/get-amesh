import amesh from "./get-amesh";
import { writeFile } from "fs";

(async () => {
  writeFile("output.png", await amesh(), err => {
    if (err) {
      console.error(err);
      return;
    }
  });
})();
