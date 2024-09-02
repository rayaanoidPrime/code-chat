import { embedRepo } from "./embed";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env.local",
});

async function seedDb() {
  // await embedRepo("https://github.com/niledatabase/nile-js", [
  //   "javascript",
  //   "typescript",
  // ]);
  await embedRepo("https://github.com/socketio/socket.io-chat-platform", [
    "javascript",
    "typescript",
  ]);
}

seedDb();
