import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema/tables";

console.log("env ", process.env.DATABASE_URL);

export const db = drizzle(process.env.DATABASE_URL!, { schema });
