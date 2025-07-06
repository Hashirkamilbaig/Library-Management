"use client"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { DefaultValues, FieldValues, Path, SubmitHandler, UseFormReturn, useForm } from "react-hook-form"
import React from 'react'
import { ZodType, z } from "zod"
import Link from "next/link"
import { FIELD_NAMES, FIELD_TYPES } from "@/constants"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { bookSchema } from "@/lib/validations"
import ImageUpload from "@/components/FileUpload"
import { Textarea } from "@/components/ui/textarea"
import FileUpload from "@/components/FileUpload"
import ColorPicker from "../ColorPicker"
import { createBook } from "@/lib/admin/actions/book"



interface Props extends Partial<Book>{
  type?: 'create' | 'update'
};

const BookForm = ({
  type, 
  ... book
}: Props) => {
  const router = useRouter();
  // 1. Define your form.
  
  const form = useForm<z.infer<typeof bookSchema>>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title:"",
      description:"",
      author:"",
      genre:"",
      rating:1,
      totalCopies:1,
      coverUrl:"",
      coverColor: "#000000",
      videoUrl:"",
      summary:"",

    },
  });

  // 2. Define a submit handler.
  const onSubmit = async(values: z.infer<typeof bookSchema>) => {
    console.log("Form submitted successfully:", values);
    const result = await createBook(values);

    if(result.success){
      toast.success("Book Created Successfully! Redirecting...");
      router.push(`/admin/books/${result.data.id}`);
    }else{
      toast.success("Error Creating Book!");
    }
  };

  return (
    
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name={"title"}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1">
                <FormLabel className="text-base font-normal text-dark-500">Book title</FormLabel>
                <FormControl>
                      <Input required placeholder="Book title" {...field} className="book-form_input"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={"author"}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1">
                <FormLabel className="text-base font-normal text-dark-500">Book author</FormLabel>
                <FormControl>
                      <Input required placeholder="Book author" {...field} className="book-form_input"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={"genre"}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1">
                <FormLabel className="text-base font-normal text-dark-500">Book genre</FormLabel>
                <FormControl>
                      <Input required placeholder="Book genre" {...field} className="book-form_input"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={"rating"}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1">
                <FormLabel className="text-base font-normal text-dark-500">Book rating</FormLabel>
                <FormControl>
                      <Input type="number" min={1} max={5} placeholder="Book rating" {...field} className="book-form_input"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={"totalCopies"}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1">
                <FormLabel className="text-base font-normal text-dark-500">Total copies</FormLabel>
                <FormControl>
                      <Input type="number" min={1} max={10000} placeholder="Total copies" {...field} className="book-form_input"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={"coverUrl"}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1">
                <FormLabel className="text-base font-normal text-dark-500">Book Image</FormLabel>
                <FormControl>
                  <FileUpload 
                    onFileChange={field.onChange} 
                    value={field.value} 
                    type="image"
                    accept="image/png, image/jpeg, image/webp"
                    placeholder="Upload University ID Card"
                    folder="/books/covers/"
                    variant="light" // Your form has a dark theme
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={"coverColor"}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1">
                <FormLabel className="text-base font-normal text-dark-500">Primary Color</FormLabel>
                <FormControl>
                      <ColorPicker onPickerChange={field.onChange} value={field.value}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={"description"}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1">
                <FormLabel className="text-base font-normal text-dark-500">Book description</FormLabel>
                <FormControl>
                      <Textarea placeholder="Book description" {...field} rows={10} className="book-form_input"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={"videoUrl"}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1">
                <FormLabel className="text-base font-normal text-dark-500">Book video</FormLabel>
                <FormControl>
                <FileUpload
                  type="video"
                  accept="video/mp4, video/quicktime"
                  placeholder="Upload a course trailer"
                  folder="/books/videos/"
                  variant="light"
                  onFileChange={field.onChange}
                  value={field.value}
                />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={"summary"}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1">
                <FormLabel className="text-base font-normal text-dark-500">Book summary</FormLabel>
                <FormControl>
                      <Textarea placeholder="Book summary" {...field} rows={5} className="book-form_input"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="book-form_btn text-white">
            Add book to library
          </Button>

      </form>
    </Form>
  )
}

export default BookForm