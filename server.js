import { createApp } from "./src/app.js";
import { loadLocalEnv } from "./src/env.js";

loadLocalEnv();

const dev = process.argv.includes("--dev");
const port = Number(process.env.PORT) || 3000;
const app = await createApp({ dev });

app.listen(port, () => {
  console.log(`Product manage app listening on http://localhost:${port}`);
});
