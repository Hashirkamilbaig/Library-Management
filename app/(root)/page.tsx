import { auth } from "@/auth";
import BookList from "@/components/BookList";
import BookOverview from "@/components/BookOverview";
import { db } from "@/database/drizzle";
import { books, users } from "@/database/schema";
import { desc } from "drizzle-orm";

const Home = async () => {
  const session = await auth();
  const latestBooks = (await db.select().from(books).limit(10).orderBy(desc(books.createdAt))) as Book[];

  // If there are no books, render a fallback UI instead of crashing.
  if (latestBooks.length === 0) {
    return (
      <div className="text-center mt-28">
        <h1 className="text-2xl font-bold">Welcome to the Library!</h1>
        <p>There are currently no books in the collection.</p>
      </div>
    );
  }

  // If books exist, render the page as intended.
  return (
    <>
      <BookOverview userId={session?.user?.id as string} {...latestBooks[0]} />
      
      <BookList
        title="Latest Books"
        books={latestBooks.slice(1)}
        containerClassName="mt-28"
      />
    </>
  );
};

export default Home;