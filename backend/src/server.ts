import app from "./app.js"
import prisma from "./utils/prisma.js";

const port = 3000;

async function start() {
    try {
        await prisma.$connect();
        console.log("✅ Prisma connected");

        app.listen(port, () => {
            console.log("Listening");
        });
    } catch (e) {
        console.error("Failed to connect:", e);
    }
}

start();