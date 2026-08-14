require("dotenv").config();

const app = require("./app");
const pool = require("./infrastructure/database/postgres");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    const result = await pool.query("SELECT NOW()");

    console.log("✅ PostgreSQL connected successfully.");
    console.log("🕒 Database Time:", result.rows[0].now);

    app.listen(PORT, () => {
      console.log(`🚀 MedLink API running on ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Database connection failed");
    console.error(error.message);
  }
}

startServer();