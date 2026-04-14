import { createAdminClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "jdgames2026";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function badRequest(msg) {
  return NextResponse.json({ error: msg }, { status: 400 });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { password, action, table, data, id } = body;

    // Verify admin password
    if (password !== ADMIN_PASSWORD) {
      return unauthorized();
    }

    const supabase = createAdminClient();

    // ── READ (admin-only tables like whitelist_applications) ──
    if (action === "list") {
      const { data: rows, error } = await supabase
        .from(table)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) return badRequest(error.message);
      return NextResponse.json({ data: rows });
    }

    // ── CREATE ──
    if (action === "create") {
      const { data: row, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();

      if (error) return badRequest(error.message);
      return NextResponse.json({ data: row });
    }

    // ── UPDATE ──
    if (action === "update") {
      if (!id) return badRequest("Missing id for update");

      // server_info always uses id = 1
      const matchCol = table === "server_info" ? { id: 1 } : { id };

      const { data: row, error } = await supabase
        .from(table)
        .update(data)
        .match(matchCol)
        .select()
        .single();

      if (error) return badRequest(error.message);
      return NextResponse.json({ data: row });
    }

    // ── DELETE ──
    if (action === "delete") {
      if (!id) return badRequest("Missing id for delete");

      const { error } = await supabase
        .from(table)
        .delete()
        .match({ id });

      if (error) return badRequest(error.message);
      return NextResponse.json({ success: true });
    }

    return badRequest("Unknown action: " + action);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
