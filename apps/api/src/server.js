require("dotenv").config();

const app = require("./app");
const pool = require("./infrastructure/database/postgres");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    const result = await pool.query("SELECT NOW()");

    console.log("✅ Database connected successfully.");
    console.log("🕒 Database Time:", result.rows[0].now);

    app.listen(PORT, () => {
      console.log(`🚀 MedLink API running on ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Database connection failed");
    console.error(error.message);

    const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
    if (
      error.code === "ENOTFOUND" &&
      databaseUrl?.includes(".supabase.co") &&
      databaseUrl.includes("@db.")
    ) {
      console.error(
        "Direct Supabase database hosts are often IPv6-only. Use the Supabase pooler connection string instead."
      );
      console.error(
        "Supabase dashboard: Project Settings > Database > Connection string > Transaction pooler."
      );
      console.error(
        "Set DATABASE_URL to the pooler URL, usually on port 6543, and keep DB_SSL=true."
      );
    }
  }
}

startServer();
