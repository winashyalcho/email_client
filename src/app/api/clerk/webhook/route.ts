import { db } from "@/server/db";
import { NextResponse } from "next/server";


export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Clerk sends event object with `data` field having user info
    const clerkUser = body.data;

    if (!clerkUser || !clerkUser.id) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Extract primary email safely
    const primaryEmailObj = (clerkUser.email_addresses || []).find(
      (emailObj: any) => emailObj.id === clerkUser.primary_email_address_id
    );
    const email = primaryEmailObj?.email_address || null;

    // Parse timestamps for createdAt (milliseconds to Date)
    const createdAt = clerkUser.created_at
      ? new Date(clerkUser.created_at)
      : undefined;

    // Compose full name
    const name = [clerkUser.first_name, clerkUser.last_name].filter(Boolean).join(" ") || null;

    // Upsert user in DB (update if exists, else create)
    const user = await db.user.upsert({
      where: { id: clerkUser.id },
      update: {
        name,
        email,
        image: clerkUser.image_url || clerkUser.profile_image_url || null,
        createdAt,
        // If you have emailVerified info, parse and add here
      },
      create: {
        id: clerkUser.id,
        name,
        email,
        image: clerkUser.image_url || clerkUser.profile_image_url || null,
        createdAt,
      },
    });

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error("Error handling Clerk webhook:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
