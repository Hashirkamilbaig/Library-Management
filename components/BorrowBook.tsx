'use client';

import React, { useTransition } from 'react';
import { Button } from './ui/button';
import Image from "next/image";
import { toast } from 'sonner';
// Import BOTH server actions
import { borrowBook, unborrowBook } from '@/lib/actions/book';

interface Props {
  userId: string;
  bookId: string;
  // This new prop comes from the server
  isCurrentlyBorrowed: boolean;
  borrowingEligibility: {
    isEligible: boolean;
    message: string;
  };
}

const BorrowBook = ({ userId, bookId, isCurrentlyBorrowed, borrowingEligibility }: Props) => {
  // useTransition is the modern React hook for handling pending states from server actions
  const [isPending, startTransition] = useTransition();

  const handleAction = () => {
    startTransition(async () => {
      if (isCurrentlyBorrowed) {
        const result = await unborrowBook({ bookId, userId });
        if (result.success) {
          toast.success("Book returned successfully");
        } else {
          toast.error(result.error);
        }
      } else {
        if (!borrowingEligibility.isEligible) {
          toast.error(borrowingEligibility.message);
          return;
        }
        const result = await borrowBook({ bookId, userId });
        if (result.success) {
          toast.success("Book borrowed successfully");
        } else {
          toast.error(result.error);
        }
      }
    });
  };
  
  const buttonText = isCurrentlyBorrowed
    ? (isPending ? 'Returning...' : 'Unborrow Book')
    : (isPending ? 'Borrowing...' : 'Borrow Book');
  
  const isDisabled = isPending || (!isCurrentlyBorrowed && !borrowingEligibility.isEligible);

  return (
    <Button 
      className="book-overview_btn" 
      onClick={handleAction} 
      disabled={isDisabled}
      variant={isCurrentlyBorrowed ? "destructive" : "default"} // Optional: Style the unborrow button differently
    >
      <Image src="/icons/book.svg" alt="book" width={20} height={20} />
      <p className="font-bebas-neue text-xl text-dark-100">{buttonText}</p>
    </Button>
  );
}

export default BorrowBook;