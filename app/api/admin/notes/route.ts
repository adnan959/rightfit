import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import type { ReviewNoteInsert, NoteType } from "@/lib/db/types";

// POST - Create a new note
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { submission_id, note_type, content, is_pinned = false } = body;

    if (!submission_id || !content) {
      return NextResponse.json(
        { error: "submission_id and content are required" },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured() || !supabaseAdmin) {
      // For JSON mode, we don't support notes yet
      return NextResponse.json(
        { error: "Notes require Supabase to be configured" },
        { status: 501 }
      );
    }

    const noteData: ReviewNoteInsert = {
      submission_id,
      note_type: (note_type as NoteType) || "general",
      content,
      is_pinned,
    };

    const { data, error } = await supabaseAdmin
      .from("review_notes")
      .insert(noteData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log activity
    await supabaseAdmin.from("activity_log").insert({
      submission_id,
      action: "note_added",
      description: `Added ${note_type || "general"} note`,
      actor: "admin",
    });

    return NextResponse.json({
      success: true,
      note: data,
    });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}

// PATCH - Update a note
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, content, is_pinned } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Note ID is required" },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return NextResponse.json(
        { error: "Notes require Supabase to be configured" },
        { status: 501 }
      );
    }

    const updates: Record<string, unknown> = {};
    if (content !== undefined) updates.content = content;
    if (is_pinned !== undefined) updates.is_pinned = is_pinned;

    const { data, error } = await supabaseAdmin
      .from("review_notes")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      note: data,
    });
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a note
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Note ID is required" },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return NextResponse.json(
        { error: "Notes require Supabase to be configured" },
        { status: 501 }
      );
    }

    const { error } = await supabaseAdmin
      .from("review_notes")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
