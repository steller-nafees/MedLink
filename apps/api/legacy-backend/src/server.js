require("dotenv").config();

const app = require("./app");
const pool = require("./config/db");

const PORT = process.env.PORT || 3000;

async function startServer() 
{
    try 
    {
        const result = await pool.query("SELECT NOW()");

        console.log("✅ PostgreSQL connected successfully.");
        console.log("🕒 Database Time:", result.rows[0].now);

        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
        });
    } 

    catch (error) 
    {
        console.error("❌ Failed to connect to PostgreSQL.");
        console.error(error.message);
    }
}

startServer();