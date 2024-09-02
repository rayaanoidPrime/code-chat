import { Nile } from "@niledatabase/server";

export async function GET(req: Request) {
  try {
    const nile = await Nile();
    const result = await nile.db.query(
      `SELECT id, name from "tenants" ORDER BY Updated DESC limit 10`
    );

    const tenants = result.rows;

    return new Response(JSON.stringify({ tenants }), { status: 200 });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return new Response(JSON.stringify({ tenants: [] }), { status: 500 });
  }
}
