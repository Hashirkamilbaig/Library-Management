"use server";

import { db } from "@/database/drizzle";
import { books, borrowRecords } from "@/database/schema";
import { and, eq, sql } from "drizzle-orm";
import dayjs from "dayjs";
import { revalidatePath } from "next/cache";

interface BookActionParams {
  userId: string;
  bookId: string;
}

// --- REFACTORED borrowBook FUNCTION (uses a transaction) ---
export const borrowBook = async (params: BookActionParams) => {
  const { userId, bookId } = params;

  try {
    await db.transaction(async (tx) => {
      // Get the book and lock the row to prevent race conditions
      const bookResult = await tx
        .select({ availableCopies: books.availableCopies })
        .from(books)
        .where(eq(books.id, bookId))
        .for("update") // Important for preventing multiple users from borrowing the last copy
        .limit(1);

      if (!bookResult.length || bookResult[0].availableCopies <= 0) {
        throw new Error("Book is not available for borrowing.");
      }

      // Decrement available copies
      await tx
        .update(books)
        .set({ availableCopies: sql`${books.availableCopies} - 1` })
        .where(eq(books.id, bookId));

      // Create the borrow record
      const dueDate = dayjs().add(7, "day").format("YYYY-MM-DD");
      await tx.insert(borrowRecords).values({
        userId,
        bookId,
        dueDate,
        status: "BORROWED",
      });
    });

    // Tell Next.js to refresh data on these pages
    revalidatePath(`/books/${bookId}`); // Or whatever your book page URL is
    revalidatePath("/my-profile");

    return { success: true };
  } catch (error: any) {
    console.error("Error borrowing book:", error);
    return {
      success: false,
      error: error.message || "An error occurred while borrowing the book",
    };
  }
};

export const unborrowBook = async (params: BookActionParams) => {
  const { userId, bookId } = params;

  try {
    await db.transaction(async (tx) => {
      // Find and update the active borrow record
      const updatedRecord = await tx
        .update(borrowRecords)
        .set({
          status: "RETURNED",
          returnDate: dayjs().format("YYYY-MM-DD"),
        })
        .where(
          and(
            eq(borrowRecords.userId, userId),
            eq(borrowRecords.bookId, bookId),
            eq(borrowRecords.status, "BORROWED")
          )
        )
        .returning({ id: borrowRecords.id });

      if (updatedRecord.length === 0) {
        throw new Error("No active borrow record found to return.");
      }

      // Increment the available copies count for the book
      await tx
        .update(books)
        .set({ availableCopies: sql`${books.availableCopies} + 1` })
        .where(eq(books.id, bookId));
    });

    revalidatePath(`/books/${bookId}`);
    revalidatePath("/my-profile");

    return { success: true };
  } catch (error: any) {
    console.error("Error returning book:", error);
    return {
      success: false,
      error: error.message || "An error occurred while returning the book.",
    };
  }
};