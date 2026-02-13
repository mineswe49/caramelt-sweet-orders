import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST upload product image
export async function POST(request: Request) {
  try {
    console.log("Starting image upload...");

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.error("No file provided");
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    console.log(`File received: ${file.name}, type: ${file.type}, size: ${file.size}`);

    // Validate file type
    if (!file.type.startsWith("image/")) {
      console.error(`Invalid file type: ${file.type}`);
      return NextResponse.json(
        { message: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error(`File too large: ${file.size}`);
      return NextResponse.json(
        { message: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    console.log("Creating Supabase client...");
    const supabase = await createClient();

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${timestamp}-${random}.${ext}`;
    console.log(`Generated filename: ${filename}`);

    // Convert File to Buffer for Supabase
    console.log("Converting file to buffer...");
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log(`Buffer created, size: ${buffer.length}`);

    // Upload to Supabase storage
    console.log("Uploading to Supabase storage (caramelt bucket)...");
    const { data, error } = await supabase.storage
      .from("caramelt")
      .upload(filename, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", JSON.stringify(error));
      return NextResponse.json(
        {
          message: error.message || "Failed to upload to storage",
          error: JSON.stringify(error)
        },
        { status: 500 }
      );
    }

    console.log("Upload successful, getting public URL...");
    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("caramelt").getPublicUrl(data.path);

    console.log(`Upload complete. Public URL: ${publicUrl}`);
    return NextResponse.json(
      { url: publicUrl, path: data.path },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading image:", error);
    const message =
      error instanceof Error ? error.message : "Failed to upload image";
    console.error("Final error message:", message);
    return NextResponse.json(
      { message, error: String(error) },
      { status: 500 }
    );
  }
}
