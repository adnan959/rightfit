import { NextRequest, NextResponse } from "next/server";
import { getDummyOrders, getDummyOrderById } from "@/lib/dummy-data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let orders = getDummyOrders();

    // Filter by status
    if (status && status !== "all") {
      orders = orders.filter((o) => o.status === status);
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      orders = orders.filter(
        (o) =>
          o.full_name.toLowerCase().includes(searchLower) ||
          o.email.toLowerCase().includes(searchLower)
      );
    }

    // Sort by created_at descending
    orders.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const total = orders.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedOrders = orders.slice(start, start + limit);

    return NextResponse.json({
      success: true,
      orders: paginatedOrders,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Missing id or status" },
        { status: 400 }
      );
    }

    // In a real app, this would update the database
    // For now, we just return success
    const order = getDummyOrderById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: { ...order, status },
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order" },
      { status: 500 }
    );
  }
}
