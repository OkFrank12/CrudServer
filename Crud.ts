import http from "http";
import dataBase from "./backend/data.json";
import fs from "fs";
import path from "path";

interface iDataEntry {
  id: number;
  course: string;
}

// let dataEntry: iDataEntry[] = [
//   {
//     id: 1,
//     course: "Node",
//   },
//   {
//     id: 2,
//     course: "React",
//   },
// ];

let dataEntry: iDataEntry[] = dataBase;

interface iData {
  message: string;
  name: string;
  status: number;
  success: boolean;
  data: iDataEntry | iDataEntry[] | null;
}

let data: iData = {
  message: "Request Not Found",
  name: "Request error",
  status: 404,
  success: false,
  data: null,
};

const dataPath = path.join(__dirname, "backend", "data.json");
const port: number = 5055;

const server: http.Server<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
> = http.createServer(
  (
    req: http.IncomingMessage,
    res: http.ServerResponse<http.IncomingMessage>
  ) => {
    const { method, url } = req;

    let body: any = [];

    req.on("data", (chunk) => {
      body.push(chunk);
      console.log(chunk);
      console.log(body);
    });

    req.on("data", () => {
      //Reading from Static DB
      if (method === "GET" && url === "/") {
        data.message = "Reading from DataBase";
        data.name = "GET Request";
        data.status = 200;
        data.success = true;
        data.data = dataEntry;
      } //Writing from Static DB
      else if (method === "POST" && url === "/") {
        dataEntry.push(JSON.parse(body));

        fs.writeFile(dataPath, JSON.stringify(dataEntry), () => {
          console.log("Done writing...");
        });

        data.message = "Writing to DataBase";
        data.name = "POST Request";
        data.status = 201;
        data.success = true;
        data.data = dataEntry;
        //Single from Static DB;
      } else if (method === "GET") {
        let id = req.url?.split("/")[1];
        console.log(id);

        data.message = "Reading Single Item from DataBase";
        data.name = "GET-ONE Request";
        data.status = 200;
        data.success = true;
        data.data = dataEntry[parseInt(id!) - 1];
        //Deleting from Static DB
      } else if (method === "DELETE") {
        let id = parseInt(req.url?.split("/")[1]!) - 1;
        let value = dataEntry.filter((el: any) => {
          return el.id !== id;
        });

        console.log(value);

        data.message = `Deleting "${dataEntry[id].course}" from DataBase`;
        data.name = "DELETE-ONE Request";
        data.status = 201;
        data.success = true;
        data.data = value;

        //Updating from Static DB
      } else if (method === "PATCH") {
        const { course } = JSON.parse(body);
        let id = parseInt(req.url?.split("/")[1]!) - 1;

        dataEntry[id].course = course;

        data.message = `Updating "${dataEntry[id].course}" from DataBase`;
        data.name = "UPDATE-ONE Request";
        data.status = 201;
        data.success = true;
        data.data = dataEntry;
        //Reading and Show Errors
      } else {
        data.message = "Request Not Found";
        data.name = "Request error";
        data.status = 404;
        data.success = false;
        data.data = null;
      }

      res.writeHead(data.status, {
        "content-type": "application/json",
      });
      res.end(JSON.stringify(data));
    });
  }
);

server.listen(port, () => {
  console.log("Server is listening...");
});
