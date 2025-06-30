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
import ImageUpload from "@/components/ImageUpload"



interface Props extends Partial<Book>{
  type?: 'create' | 'update'
};

const AuthForm = ({
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
      rating:"",
      totalCopies:1,
      coverUrl:"",
      coverColor:"",
      videoUrl:"",
      summary:"",

    },
  });

  // 2. Define a submit handler.
  const handleSubmit: SubmitHandler<T> = async(data) => {
    const result = await onSubmit(data);

    if(result.success){
      toast("Success");
      router.push("/");
    }else{
      toast("Something Went wrong");
    }

  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-white">
        {isSignIn ? "Welcome back to Bookwise" : "Create your Library Account"}
      </h1>
        <p className="text-light-100">
          {isSignIn 
            ? "Access all the Books collections and stay updated" 
            : "Please complete all the fields and upload a valid university ID to gain access"}
        </p>
      <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 w-full">
        {Object.keys(defaultValues).map((field) => (
          <FormField
          key={field}
            control={form.control}
            name={field as Path<T>}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="capatilize">{FIELD_NAMES[field.name as keyof typeof FIELD_NAMES]}</FormLabel>
                <FormControl>
                {field.name === "universityCard" ? (
                      <ImageUpload onFileChange={field.onChange}/>
                    ) : (
                      <Input required type={FIELD_TYPES[field.name as keyof typeof FIELD_TYPES]} {...field} className="form-input"/>
                    )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <Button type="submit" className="form-btn">{isSignIn ? "Sign In" : "Sign Up"}</Button>
      </form>
    </Form>

      <p className="text-center text-base font-medium">
        {isSignIn ? "New to Bookwise? " : "Already have an account? "}

        <Link href={isSignIn ? "/sign-up" : "/sign-in"} className="font-bold text-primary">
          {isSignIn ? "Create an Account" : "Sign in"}
        </Link>
      </p>
    </div>
  )
}

export default AuthForm