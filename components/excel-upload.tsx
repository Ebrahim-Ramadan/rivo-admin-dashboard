"use client";

import type React from "react";
import { useState } from "react";
import { read, utils } from "xlsx";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { BatchPush } from "@/app/actions";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import LoadingDots from "./LoadingDots";

// Define the schema here, to ensure it's available in this scope
const frameSchema = z.object({
  name: z.string().min(1),
  price: z.string().min(1),
  sizes: z.array(z.string()),
  type: z.string().min(1),
  categories: z.array(z.string()),
  color:  z.array(z.string()),
  desc: z.string().min(1),
  images: z.array(z.string()),
  keywords: z.array(z.string()),
});
type FrameSchema = z.infer<typeof frameSchema>;

export function ExcelUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null);
  const [validatedFrames, setValidatedFrames] = useState<FrameSchema[] | null>(null);
  const [invalidFramesCount, setInvalidFramesCount] = useState<number>(0);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setValidatedFrames(null); // Reset previous validation results
    setInvalidFramesCount(0);
    setFileInfo({ name: file.name, size: file.size });

    try {
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet);

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
      const firstRow = jsonData[0] as Record<string, any>;
      const missingColumns = requiredColumns.filter(
        (column) => !firstRow?.hasOwnProperty(column),
      );

      if (missingColumns.length > 0) {
        toast.error(
          `Missing required columns: ${missingColumns.join(", ")}. Please check your Excel file.`,
        );
        setIsUploading(false);
        event.target.value = "";
        setFileInfo(null);
        return;
      }

      const frames = jsonData.map((row: any) => {
        const frame: FrameSchema = {
          name: (row.name || "").trim(),
          price: (row.price?.toString() || "").trim(),
          sizes: (row.sizes || "")
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean),
          type: (row.type || "").trim(),
          categories: (row.categories || "")
            .split(",")
            .map((c: string) => c.trim())
            .filter(Boolean),
          color: (row.color || "") // Updated to split into an array
            .split(",")
            .map((c: string) => c.trim())
            .filter(Boolean),
          desc: (row.desc || "").trim(),
          images: (row.images || "")
            .split(",")
            .map((i: string) => i.trim())
            .filter(Boolean),
          keywords: (row.keywords || "")
            .split(",")
            .map((k: string) => k.trim())
            .filter(Boolean),
        };
        return frame;
      });

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
          `${invalidFrames.length} number of frames failed validation. check for the criteria with the developer (me).`,
        );
        setInvalidFramesCount(invalidFrames.length);
      } else {
        setInvalidFramesCount(0);
      }

      if (validFrames.length === 0 && invalidFrames.length > 0) {
        toast.error("No valid frames found in the uploaded file.");
        setValidatedFrames(null);
        return;
      }

      setValidatedFrames(validFrames);
    } catch (error: any) {
      console.error("Error processing Excel file:", error);
      toast.error(`Error processing Excel file: ${error.message}`);
      setValidatedFrames(null);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handlePushToDatabase = async () => {
    if (!validatedFrames || validatedFrames.length === 0) {
      toast.error("No valid frames to upload.");
      return;
    }

    setIsUploading(true);
    try {
      const resUpload = await BatchPush(validatedFrames);
      if (resUpload.success) {
        toast.success(`Successfully uploaded ${resUpload.importedCount} frames`);
        setValidatedFrames(null);
        setFileInfo(null);
      } else {
        toast.error("Failed to upload frames.");
      }
    } catch (error: any) {
      console.error("Error during BatchPush:", error);
      toast.error(`Error during BatchPush: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold border-t-2 py-4">or Upload Excel Files</h2>
      <div className="flex flex-col gap-2 ">
      {fileInfo && (
        <div className="text-sm font-bold text-green-600">
          Valid File `{fileInfo.name}`
          <br />
          <p className="text-xs">{(fileInfo.size / 1024).toFixed(2)} KB</p>
        </div>
      )}
      {validatedFrames && validatedFrames.length > 0 && (
        <div className=" flex flex-col gap-2 border-b-2 border-gray-300 pb-4">
          <p className="text-sm text-green-600">
            {validatedFrames.length} frames validated successfully.
          </p>
          {invalidFramesCount > 0 && (
            <p className="text-sm text-red-600">
              {invalidFramesCount} frames failed validation.
            </p>
          )}
          <Button onClick={handlePushToDatabase} disabled={isUploading}>
            Push to Database
          </Button>
        </div>
      )}
      </div>
      <div className="flex items-center ">
  {/* Hidden file input */}
  <input
    type="file"
    accept=".xlsx, .xls"
    onChange={handleFileUpload}
    disabled={isUploading}
    id="file-upload"
    className="hidden"
  />

  {/* Custom file upload button with icon */}
  <label
    htmlFor="file-upload"
    className={`w-full flex items-center justify-center py-2 text-sm font-medium rounded-lg cursor-pointer ${
      isUploading ? "bg-gray-300 cursor-not-allowed" : "bg-black/90 hover:bg-black/80"
    }`}
  >
    {/* Custom icon (you can replace this with your own icon or SVG) */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
      />
    </svg>
    <span className="ml-2 text-white">Upload File</span>
  </label>
</div>
      {isUploading &&   <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-90 z-50">
  <LoadingDots />
</div>}
      <p className="text-xs text-gray-500">
  Upload an Excel file with columns: name, price, sizes, type,
  categories, color, desc, images, keywords. Separate multiple values in
  a cell with commas. No empty values are allowed.
</p>
    </div>
  );
}
