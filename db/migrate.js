const fs = require("fs");
const path = require("path");
const pool = require("../config/dbConnection");

const schemaPath = path.join(__dirname, "schema.sql");
const schema = fs.readFileSync(schemaPath, "utf8");

async function runMigrations() {
  try {
    await pool.query(schema);
    console.log("✅ Database schema created successfully");
  } catch (error) {
    console.error("❌ Error creating schema:", error.message);
  } finally {
    process.exit();
  }
}

runMigrations();
