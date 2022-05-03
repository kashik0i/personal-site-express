import express from "express";
import { Server, Socket } from "socket.io";
import cors from "cors";
import * as http from "http";
import { Message, User } from "./model";
export class ChatServer {
  private users = Array<User>();
  private messages = Array<Message>();
  public static readonly PORT: number = 3030;
  private app: express.Application;
  private server: http.Server;
  private io: Server;
  private port: string | number;

  constructor() {
    this.createApp();
    this.config();
    this.createServer();
    this.sockets();
    this.listen();
  }

  private createApp(): void {
    this.app = express();
    this.app.use(cors());
  }

  private createServer(): void {
    this.server = http.createServer(this.app);
  }

  private config(): void {
    this.port = process.env.PORT || ChatServer.PORT;
  }

  private sockets(): void {
    // this.io = Server.listen(this.server, { origins: "*:*" });
    this.io = new Server(this.server, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    });
  }

  private listen(): void {
    this.server.listen(this.port, () => {
      console.log("Running server on port %s", this.port);
    });

    this.io.on("connection", (socket: Socket) => {
      socket.emit("connected", {
        ok: true,
        id: socket.id,
      });
      // socket.on("global", (msg) => {
      //   console.log("reeeeeeeeeee", msg);
      //   socket.to("global").emit(msg);
      // });
      socket.on("private message", (anotherSocketId, msg) => {
        socket.to(anotherSocketId).emit("private message", socket.id, msg);
      });
      // console.log("Connected client on port %s.", this.port);
      // socket.on("message", (m: Message) => {
      //   console.log("[server](message): %s", m);
      //   this.io.emit("message", m);
      // });
      socket.on("createGuestUser", (username: string, callback: Function) => {
        console.log("Socket (server-side): received username:", username);
        const res = {
          ok: true,
          username,
          room: "global",
        };
        this.createGuestUser(username);
        socket.join("global");
        socket.to("global").emit("a user has connected");
        callback(res);
      });
      socket.on(
        "message",
        (to: string, message: Message, callback: Function) => {
          console.log(`user ${message.from} sent ${message.content} to ${to}`);
          var res;
          if (!message || !message.content || !message.from)
            res = {
              ok: false,
              message: message,
            };
          else {
            res = {
              ok: true,
              message: message,
            };
            this.pushMessage(message);
            socket.to(to).emit("message", to, socket.id, message);
            console.log("sent");
          }
          callback(res);
        }
      );
      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });
  }
  public pushMessage(message: Message) {
    this.messages.push(message);
    console.log(message);
  }
  public createGuestUser(username: string) {
    const guest = new User(username);
    this.users.push(guest);
    console.log(this.users);
  }
  public getApp(): express.Application {
    return this.app;
  }
}
