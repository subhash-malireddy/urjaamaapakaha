import { neon } from "@neondatabase/serverless";
import { fileURLToPath } from "url";
const DATABASE_URL = process.env.DATABASE_URL;

async function createTables() {
  const sql = neon(DATABASE_URL);

  try {
    // Create extensions
    await sql`CREATE EXTENSION IF NOT EXISTS citext;`;
    // btree_gist enables efficient indexing for range queries and multi-column conditions
    await sql`CREATE EXTENSION IF NOT EXISTS btree_gist;`;

    // Execute each table creation as a separate query
    await sql`
            CREATE TABLE IF NOT EXISTS device (
                id VARCHAR(255) PRIMARY KEY,
                mac_address VARCHAR(17) NOT NULL UNIQUE,
                ip_address INET NOT NULL UNIQUE,
                alias VARCHAR(60) UNIQUE NOT NULL,
                is_archived BOOLEAN DEFAULT FALSE,
                previous_aliases VARCHAR(60)[]
            );
        `;

    await sql`
            CREATE TABLE IF NOT EXISTS usage (
                id BIGSERIAL PRIMARY KEY,
                user_email CITEXT NOT NULL,
                start_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                end_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                estimated_use_time TIMESTAMPTZ,
                consumption NUMERIC(10,2) NOT NULL DEFAULT 0.00,
                charge NUMERIC(10,2) NOT NULL DEFAULT 0.00,
                device_id VARCHAR(255) NOT NULL,
                CONSTRAINT fk_usage_device FOREIGN KEY (device_id) REFERENCES device (id) ON DELETE RESTRICT,
                CONSTRAINT check_end_date_after_start_date CHECK (end_date >= start_date)
            );
        `;

    await sql`
            CREATE TABLE IF NOT EXISTS active_device (
                device_id VARCHAR(255) PRIMARY KEY,
                usage_record_id BIGINT NOT NULL UNIQUE,
                CONSTRAINT fk_active_device_device FOREIGN KEY (device_id) REFERENCES device (id) ON DELETE RESTRICT,
                CONSTRAINT fk_active_device_usage FOREIGN KEY (usage_record_id) REFERENCES usage (id) ON DELETE RESTRICT
            );
        `;

    // Create GiST index for user email + timerange queries
    await sql`
            CREATE INDEX IF NOT EXISTS idx_usage_user_timerange ON usage 
            USING GIST (user_email, tstzrange(start_date, end_date));
        `;

    console.log("Tables created successfully!");
  } catch (error) {
    console.error("Error creating tables:", error);
  }
}

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  createTables()
    .then(() => console.log("Script completed!"))
    .catch((err) => console.error("Script failed:", err));
}

export { createTables };
