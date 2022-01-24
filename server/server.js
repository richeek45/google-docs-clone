const mongoose = require("mongoose");
const Document = require("./Document");
const dotenv = require('dotenv').config();

const DATABASE = process.env.DATABASE_URL.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
)
 
mongoose.connect(
  DATABASE
).then(() => console.log('DB connection successful!'));

const io = require("socket.io")(3001, {
  cors: {
    origin: "http://localhost:3000",
    method: ["GET", "POST"],
  },
});

// http://localhost:3000/documents/e1fdd01e-5bbc-4d2a-90da-d809e541d44e

io.on("connection", (socket) => {
  socket.on("get-document", async (documentId) => {
    const data = "";
    const document = await findOrCreateDocument(documentId);
    socket.join(documentId);
    socket.emit("load-document", document.data);

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data) => {
      await Document.findByIdAndUpdate(documentId, { data });
    });
  });

  console.log("connected");
});

const defaultValue = "";
async function findOrCreateDocument(id) {
  if (id == null) return;

  const document = await Document.findById(id);
  if (document) return document;
  return await Document.create({ _id: id, data: defaultValue });
}
