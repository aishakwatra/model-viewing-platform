import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";
import archiver from "archiver";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get("url");
  const fileName = searchParams.get("name") || "model";

  if (!fileUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    // 1. Parse Path
    const urlObj = new URL(fileUrl);
    const pathParts = urlObj.pathname.split("/public/");
    if (pathParts.length < 2) throw new Error("Invalid URL");
    
    const fullStoragePath = decodeURIComponent(pathParts[1]);
    const pathSegments = fullStoragePath.split("/");
    const bucketName = pathSegments[0];
    const folderPath = pathSegments.slice(1, -1).join("/");

    // 2. Recursive File Listing
    const allFiles: { name: string; path: string; relativePath: string }[] = [];
    
    async function fetchFileList(prefix: string) {
      const { data, error } = await supabase.storage.from(bucketName).list(prefix, { limit: 100 });
      if (error) throw error;
      if (data) {
        for (const item of data) {
          if (item.id === null) {
            // Folder: recurse
            await fetchFileList(`${prefix}/${item.name}`);
          } else {
            // File: add to list
            const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
            allFiles.push({
              name: item.name,
              path: fullPath,
              relativePath: fullPath.replace(`${folderPath}/`, "")
            });
          }
        }
      }
    }
    await fetchFileList(folderPath);

    if (allFiles.length === 0) {
      return NextResponse.json({ error: "No files found" }, { status: 404 });
    }

    // 3. Create Streaming Response
    const archive = archiver('zip', { zlib: { level: 5 } }); // Level 5 is a good balance of speed/compression

    // Convert the Archiver Node Stream into a Web Stream for Next.js
    const stream = new ReadableStream({
      start(controller) {
        archive.on('data', (chunk) => controller.enqueue(chunk));
        archive.on('end', () => controller.close());
        archive.on('error', (err) => controller.error(err));
      }
    });

    // 4. Start Processing in "Background" (as the stream sends)
    (async () => {
      try {
        for (const file of allFiles) {
           // Fetch the file using the public URL (faster than supabase.download for streaming)
           const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(file.path);
           
           if (publicUrlData?.publicUrl) {
             const response = await fetch(publicUrlData.publicUrl);
             if (response.ok && response.body) {
               // Read file content
               const arrayBuffer = await response.arrayBuffer();
               const buffer = Buffer.from(arrayBuffer);
               // Add to zip stream
               archive.append(buffer, { name: file.relativePath });
             }
           }
        }
        await archive.finalize();
      } catch (err) {
        console.error("Archiving error:", err);
        archive.abort();
      }
    })();

    // 5. Return the stream immediately
    return new NextResponse(stream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${fileName}.zip"`,
      },
    });

  } catch (error: any) {
    console.error("Zip Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}