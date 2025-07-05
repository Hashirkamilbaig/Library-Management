import { z } from "zod";

export const signUpSchema = z.object({
  fullName: z.string().min(3, { 
    message: "Full name must be at least 3 characters." 
  }),

  email: z.string().email({ 
    message: "Please enter a valid email address." 
  }),

  // Changed to a string for more flexibility (some IDs have letters/dashes).
  // Made it required with a minimum length.
  universityId: z.string().min(3, { 
    message: "Please enter your university ID number." 
  }),

  // This is the file path string from the upload. It must be required.
  // .min(1) is the best way to ensure a string is not empty.
  universityCard: z.string().min(1, { 
    message: "Please upload an image of your university ID card." 
  }),

  password: z.string().min(8, { 
    message: "Password must be at least 8 characters long." 
  }),
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const bookSchema = z.object({
  title: z.string().trim().min(2).max(255), // Match varchar(255)
  description: z.string().trim().min(10).max(1000),
  author: z.string().trim().min(2).max(255), // Match varchar(255)
  genre: z.string().trim().min(2).max(50),
  rating: z.coerce.number().min(1).max(5),
  totalCopies: z.coerce.number().int().positive().lte(10000),
  coverUrl: z.string().min(1, "Cover image is required"),
  // Fixed: Make coverColor required to match database schema
  coverColor: z.string()
    .trim()
    .min(1, "Cover color is required")
    .regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color like #FFFFFF"),
  videoUrl: z.string().min(1, "Video is required"),
  // Fixed: Changed to match database varchar constraint
  summary: z.string().trim().min(10).max(500), // Reasonable limit for varchar
});