import mysql, { FieldPacket, QueryResult, RowDataPacket } from "mysql2/promise";
import "dotenv/config";
import { getCurrentDate, getCurrentTime, getCurrentDateTime } from "./helper";

export const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "tbq_backend",
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

export const insertQuery = async (table: string, fields: string[], values: string[]): Promise<QueryResult | boolean> => {
  const now = getCurrentDateTime();

  if (fields.length != values.length) {
    console.log("Fields doesn't match Values");
    return false;
  }

  try {
    const query = `INSERT into ${table}(${fields.map((field) => "`" + field + "`").join(", ")}, \`created_at\`, \`updated_at\`) VALUES (${Array(
      fields.length + 2
    )
      .fill("?")
      .join(", ")})`;
    console.log("Insert Query:", query);
    console.log("Insert Values:", [...values, now, now].join(", "));
    const [result] = await db.execute(query, [...values, now, now]);
    return result;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const getQuery = async (
  table: string,
  where?: string,
  orders?: { field: string; dir: "ASC" | "DESC" | undefined }[]
): Promise<RowDataPacket[]> => {
  let query = `SELECT * FROM ${table}`;
  if (where) query += ` WHERE ${where}`;
  if (orders) query += ` ORDER BY ${orders.map((order) => order.field + " " + order.dir)}`;
  console.log("Get Query:", query);
  try {
    const [result] = await db.execute<RowDataPacket[]>(query);
    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const executeQuery = async (query: string, params: string[]): Promise<QueryResult | boolean> => {
  try {
    const [result] = await db.execute(query, params);
    return result;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export default db;
