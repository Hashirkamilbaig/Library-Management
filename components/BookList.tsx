import React from "react";
import BookCard from "@/components/BookCard";

interface Props {
  title: string;
  books: Book[];
  containerClassName?: string;
  type?: string
}

const BookList = ({ title, books, containerClassName, type }: Props) => {

  if(books.length < 2 && type!= "BorrowedBooks") return;
  return (
    <section className={containerClassName}>
      <h2 className="font-bebas-neue text-4xl text-light-100">{title}</h2>

      <ul className="book-list">
        {books.map((book) => (
          <BookCard key={book.title} {...book} />
        ))}
      </ul>
    </section>
  );
};
export default BookList;