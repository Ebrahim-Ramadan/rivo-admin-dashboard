"use server";

import type { Frame, SearchResult } from "@/types/frame";
import { z } from "zod";
// import { frames as importedFrames } from '@/lib/combined.js';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, deleteDoc, getDoc, query, where, getDocs } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const frameSchema = z.object({
  name: z.string().min(1),
  price: z.string().min(1),
  sizes: z.array(z.string()),
  type: z.string().min(1),
  categories: z.array(z.string()),
  color: z.array(z.string()),
  desc: z.string().min(1),
  images: z.array(z.string()),
  keywords: z.array(z.string()),
});


export async function createFrame(
  frame: Omit<Frame, "id">,
): Promise<{ success: boolean; id?: string; error?: string, firsttype?: string, firstsize?: string, firstcolor?: string }> {
  try {
    const validation = frameSchema.safeParse(frame);
    if (!validation.success) {
      return { success: false, error: validation.error.message };
    }
    console.log('frame',frame)
    const frameWithPriority = { ...frame, priority: true };

    
    const framesCollection = collection(db, "frames"); // Replace 'frames' with your collection name
    const newDocRef = doc(framesCollection); // Create a new document reference with an auto-generated ID
    const id = newDocRef.id; // Get the auto-generated ID
    
    await setDoc(newDocRef, { ...frameWithPriority, id }); // Set the data for the new document

    return { success: true , id, firsttype:frame.type, firstsize: frame.sizes[0], firstcolor : frame.color[0] };
  } catch (error: any) {
    console.error("Error creating frame:", error);
    return { success: false, error: `Failed to create frame: ${error.message}` };
  }
}

export async function deleteFrame(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, "frames", id); // Replace 'frames' with your collection name
    await deleteDoc(docRef);

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting frame:", error);
    return { success: false, error: `Failed to delete frame: ${error.message}` };
  }
}

export async function updateFrame(
  id: string,
  frame: Partial<Frame>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, "frames", id); // Replace 'frames' with your collection name
    await setDoc(docRef, frame, { merge: true }); // Use merge to update only the specified fields

    return { success: true };
  } catch (error: any) {
    console.error("Error updating frame:", error);
    return { success: false, error: `Failed to update frame: ${error.message}` };
  }
}

export async function searchFrames(id: string): Promise<SearchResult> {
  try {
    const docRef = doc(db, "frames", id); // Replace 'frames' with your collection name
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as Frame;
      return {
        frames: [data],
        total: 1,
      };
    } else {
      return { frames: [], total: 0 }; // Frame not found
    }
  } catch (error: any) {
    console.error("Error searching frames:", error);
    return { frames: [], total: 0 };
  }
}

export async function BatchPush(
  importedFrames: any[],
): Promise<{ success: boolean; importedCount?: number; error?: string }> {
  try {

    if (!Array.isArray(importedFrames)) {
      console.error("Error: JSON data is not an array.");
      return { success: false, error: "JSON data is not an array." };
    }

    const framesCollection = collection(db, "frames"); // Replace 'frames' with your collection name

    // Use Promise.all to await all setDoc operations
    await Promise.all(
      importedFrames.map(async (frame, index) => {
        const id = `${Date.now()}_${index}`;
        const docRef = doc(framesCollection, id); // Create a document reference with the generated ID
        const frameWithPriority = { ...frame, priority: true };
        await setDoc(docRef, { ...frameWithPriority, id }); // Set the data for the new document
      }),
    );

    return { success: true, importedCount: importedFrames.length };
  } catch (error: any) {
    console.error("Error batch inserting frames:", error);
    return {
      success: false,
      error: `Failed to batch insert frames: ${error.message}`,
    };
  }
}



// Fetch product details by document ID
export async function getProductDetails(docId : any) {
  try {
    const docRef = doc(db, "frames", docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      let data = docSnap.data();
      data.id = docSnap.id;
       // Convert keys to lowercase and trim spaces
       data = Object.keys(data).reduce((acc, key) => {
        const normalizedKey = key.trim().toLowerCase();
        //   @ts-ignore
        acc[normalizedKey] = data[key];
        return acc;
      }, {});

      if (data.images && typeof data.images == 'string') data.images = data.images.split(',').map(item => item.trim());


      return data;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error fetching product details:', error);
    return false;
  }
}
