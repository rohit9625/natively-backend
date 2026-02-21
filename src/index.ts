import "dotenv/config";
import express from "express";
import translateRoute from "./routes/translate.route.js";


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/v1", translateRoute);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
