const express = require("express");
const PORT = process.env.PORT || 3000;

const app = express();
if (process.env.NODE_ENV === "production") {
  console.log("Production build...");
  app.use(express.static("build"));
}
console.log(`Port is ${PORT}`);
app.listen(PORT, () => console.log("Server is ready"));

app.get("/getvodinfo/:id", (req, res) => {
  const id = req.params.id;
  console.log(id);
});
