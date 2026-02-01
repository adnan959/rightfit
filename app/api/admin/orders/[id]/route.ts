import { NextRequest, NextResponse } from "next/server";
import { getDummyOrderById } from "@/lib/dummy-data";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = getDummyOrderById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Generate file URLs (placeholder)
    const fileUrls = {
      cv: order.cv_file_path ? `/api/files/${order.cv_file_path}` : null,
      coverLetter: order.cover_letter_file_path
        ? `/api/files/${order.cover_letter_file_path}`
        : null,
      rewrittenCv: order.rewritten_cv_path
        ? `/api/files/${order.rewritten_cv_path}`
        : null,
    };

    return NextResponse.json({
      success: true,
      order,
      fileUrls,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const order = getDummyOrderById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // In a real app, this would update the database
    // For now, we just return the updated order
    const updatedOrder = { ...order, ...body };

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order" },
      { status: 500 }
    );
  }
}
