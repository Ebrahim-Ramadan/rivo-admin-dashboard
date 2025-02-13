"use client";

import type React from "react";
import { useState } from "react";
import { read, utils } from "xlsx";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { BatchPush } from "@/app/actions";
import { frameSchema } from "@/app/actions";
import { z } from "zod";

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

      const frames = jsonData.map((row: any) => ({
        name: row.name || "",
        price: row.price?.toString() || "",
        sizes: (row.sizes || "").split(",").map((s: string) => s.trim()),
        type: row.type || "",
        categories: (row.categories || "").split(",").map((c: string) => c.trim()),
        color: row.color || "",
        desc: row.desc || "",
        images: (row.images || "").split(",").map((i: string) => i.trim()),
        keywords: (row.keywords || "").split(",").map((k: string) => k.trim()),
      }));

      const validationResults = frames.map((frame, index) => {
        const result = frameSchema.safeParse(frame);
        return {
          index,
          result,
          frame,
        };
      });

      const validFrames = validationResults
        .filter((res) => res.result.success)
        .map((res) => res.frame);

      const invalidFrames = validationResults.filter(
        (res) => !res.result.success,
      );

      if (invalidFrames.length > 0) {
        invalidFrames.forEach((invalidFrame) => {
          const error = invalidFrame.result.error as z.ZodError;
          const errorMessage = error.errors
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ");

          toast.error(
            `Row ${invalidFrame.index + 1} has errors: ${errorMessage}`,
            { duration: 5000 },
          );
        });
      }

      if (validFrames.length === 0 && invalidFrames.length > 0) {
        toast.error("No valid frames found in the uploaded file.");
        return;
      }

      const result = await BatchPush(validFrames);

      if (result.success) {
        toast.success(`Successfully imported ${result.importedCount} frames`);
      } else {
        toast.error(result.error || "Failed to import frames");
      }
    } catch (error) {
      console.error("Error processing Excel file:", error);
      toast.error("Error processing Excel file");
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
