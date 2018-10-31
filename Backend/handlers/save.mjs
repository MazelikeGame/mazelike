export default function saveHandler(sock, floor) {
  sock.on("save", async() => {
    await floor.save();
    sock.emit("save-complete");
  });
}