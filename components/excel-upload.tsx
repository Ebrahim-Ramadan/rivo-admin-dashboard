"use client";

import type React from "react";
import { useState } from "react";
import { read, utils } from "xlsx";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { BatchPush } from "@/app/actions";
import { z } from "zod";

// Define the schema here, to ensure it's available in this scope
export const frameSchema = z.object({
  name: z.string().min(1),
  price: z.string().min(1),
  sizes: z.array(z.string()),
  type: z.string().min(1),
  categories: z.array(z.string()),
  color: z.string().min(1),
  desc: z.string().min(1),
  images: z.array(z.string()),
  keywords: z.array(z.string()),
});
export type FrameSchema = z.infer<typeof frameSchema>;

export function ExcelUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet);
      console.log("jsonData", jsonData);

      // Check if all required columns exist
      const requiredColumns = [
        "name",
        "price",
        "sizes",
        "type",
        "categories",
        "color",
        "desc",
        "images",
        "keywords",
      ];
      const firstRow = jsonData[0] as Record<string, any>; // Type assertion
      const missingColumns = requiredColumns.filter(
        (column) => !firstRow?.hasOwnProperty(column),
      );

      if (missingColumns.length > 0) {
        toast.error(
          `Missing required columns: ${missingColumns.join(", ")}. Please check your Excel file.`,
        );
        setIsUploading(false);
        event.target.value = "";
        return;
      }

      const frames = jsonData.map((row: any) => {
        const frame: FrameSchema = {
          name: row.name || "",
          price: row.price?.toString() || "",
          sizes: (row.sizes || "").split(",").map((s: string) => s.trim()),
          type: row.type || "",
          categories: (row.categories || "")
            .split(",")
            .map((c: string) => c.trim()),
          color: row.color || "",
          desc: row.desc || "",
          images: (row.images || "").split(",").map((i: string) => i.trim()),
          keywords: (row.keywords || "").split(",").map((k: string) =>
            k.trim(),
          ),
        };
        return frame;
      });

      console.log("frames", frames);

      const validationResults = frames.map((frame, index) => {
        const result = frameSchema.safeParse(frame);
        return {
          index,
          success: result.success,
          frame: result.success ? result.data : null,
          error: !result.success ? result.error : null,
        };
      });

      const validFrames = validationResults
        .filter((r) => r.success)
        .map((r) => r.frame) as FrameSchema[];
      const invalidFrames = validationResults.filter((r) => !r.success);

      if (invalidFrames.length > 0) {
        console.error("Invalid frames:", invalidFrames);
        invalidFrames.forEach((invalidFrame) => {
          console.error(
            `Frame at index ${invalidFrame.index} failed validation:`,
            invalidFrame.error,
          );
        });
        toast.error(
          `${invalidFrames.length} frames failed validation. Check console for details.`,
        );
      }

      if (validFrames.length === 0 && invalidFrames.length > 0) {
        toast.error("No valid frames found in the uploaded file.");
        return;
      }
      console.log("validFrames", validFrames);

      // const result = await BatchPush(validFrames);
      //
      // if (result.success) {
      //   toast.success(`Successfully imported ${result.importedCount} frames`);
      // } else {
      //   toast.error(result.error || "Failed to import frames");
      // }
    } catch (error: any) {
      console.error("Error processing Excel file:", error);
      toast.error(`Error processing Excel file: ${error.message}`);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Bulk Import Frames</h2>
      <div className="flex items-center space-x-2">
        <Input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
        {isUploading && <p className="text-sm text-gray-500">Uploading...</p>}
      </div>
      <p className="text-sm text-gray-500">
        Upload an Excel file with columns: name, price, sizes, type,
        categories, color, desc, images, keywords. Separate multiple values in
        a cell with commas.
      </p>
    </div>
  );
}
