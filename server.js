const app = require("./backend/app");
const { port } = require("./backend/config");

app.listen(port, () => {
  console.log(`Recipe backend listening on http://localhost:${port}`);
});
