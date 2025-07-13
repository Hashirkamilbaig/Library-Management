import BookList from "@/components/BookList";
import { db } from "@/database/drizzle";
import { books, borrowRecords } from "@/database/schema";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";

const Profile = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  const borrowedBooks = userId ? (await db
    .select({
      book : books
    })
    .from(borrowRecords)
    .innerJoin(books, eq(borrowRecords.bookId, books.id))
    .where(
      and(
        eq(borrowRecords.userId, userId),
        eq(borrowRecords.status, 'BORROWED')
      )
    )).map(r => r.book) as Book[] : [];

  console.log(`borrowed books are:`, borrowedBooks);
  console.log(`number of borrowed books:`, borrowedBooks.length);
  return (
    <>
      <BookList title="My Borrowed Books" books={borrowedBooks} type="BorrowedBooks"/>
    </>
  );
};

export default Profile;