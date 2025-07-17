import React from "react";
import Image from "next/image";
import BookCover from "@/components/BookCover";
import BorrowBook from "@/components/BorrowBook";
import { db } from "@/database/drizzle";
import { users, borrowRecords } from "@/database/schema"; // Ensure borrowRecords is imported
import { and, eq } from "drizzle-orm";

// Assuming you have a 'Book' type defined elsewhere, e.g., in types/index.ts
// For example:
// type Book = { id: string; title: string; ...etc }

interface Props extends Book {
  userId: string;
}

/**
 * BookOverview is a Server Component responsible for displaying book details
 * and fetching user-specific data like borrowing status and eligibility.
 */
const BookOverview = async ({
  // Book properties
  id,
  title,
  author,
  genre,
  rating,
  totalCopies,
  availableCopies,
  description,
  coverColor,
  coverUrl,
  // User-specific properties
  userId,
}: Props) => {

  const [user, borrowRecord] = await Promise.all([
    db.query.users.findFirst({
      where: eq(users.id, userId),
    }),
    // Checks if an *active* borrow record exists for this specific user and book.
    db.query.borrowRecords.findFirst({
      where: and(
        eq(borrowRecords.bookId, id),
        eq(borrowRecords.userId, userId),
        eq(borrowRecords.status, "BORROWED")
      ),
    }),
  ]);

  const isCurrentlyBorrowed = !!borrowRecord;

  const borrowingEligibility = {
    isEligible: availableCopies > 0 && user?.status === "APPROVED",
    message:
      availableCopies <= 0
        ? "This book is currently unavailable."
        : user?.status !== "APPROVED"
        ? "Your account is not approved to borrow books."
        : "", // No error message if eligible
  };

  return (
    <section className="book-overview">
      <div className="flex flex-1 flex-col gap-5">
        <h1>{title}</h1>

        <div className="book-info">
          <p>
            By <span className="font-semibold text-light-200">{author}</span>
          </p>
          <p>
            Category{" "}
            <span className="font-semibold text-light-200">{genre}</span>
          </p>
          <div className="flex flex-row gap-1">
            <Image src="/icons/star.svg" alt="star" width={22} height={22} />
            <p>{rating}</p>
          </div>
        </div>

        <div className="book-copies">
          <p>
            Total Books <span>{totalCopies}</span>
          </p>
          <p>
            Available Books <span>{availableCopies}</span>
          </p>
        </div>

        <p className="book-description">{description}</p>

        {/* We only render the action button if a user is found */}
        {user && (
          <BorrowBook
            bookId={id}
            userId={userId}
            borrowingEligibility={borrowingEligibility}
            // This is the crucial new prop that tells the button its state
            isCurrentlyBorrowed={isCurrentlyBorrowed}
          />
        )}
      </div>

      <div className="relative flex flex-1 justify-center">
        <div className="relative">
          <BookCover
            variant="wide"
            className="z-10"
            coverColor={coverColor}
            coverImage={coverUrl}
          />
          <div className="absolute left-16 top-10 rotate-12 opacity-40 max-sm:hidden">
            <BookCover
              variant="wide"
              coverColor={coverColor}
              coverImage={coverUrl}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookOverview;