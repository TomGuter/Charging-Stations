import moduleApp from "./server";
import https from "https"
import fs from "fs"

const port = process.env.PORT

const startServer = async () => {
  try {
    const app = await moduleApp();
    if(process.env.NODE_ENV != "production"){
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  }
  else{
      const prop= {
        key: fs.readFileSync("./client-key.pem"),
        cert: fs.readFileSync("./client-cert.pem")
      }
      https.createServer(prop,app).listen(port)
  }
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();