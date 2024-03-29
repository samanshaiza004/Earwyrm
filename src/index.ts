import { Elysia } from "elysia";
import {connection} from "./collection/mysql";

const app = new Elysia().get("/", () => connection.user.findMany()).listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
