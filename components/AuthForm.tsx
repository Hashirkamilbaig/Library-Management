"use client"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { DefaultValues, FieldValues, Path, SubmitHandler, UseFormReturn, useForm } from "react-hook-form"
import React from 'react'
import { ZodType } from "zod"
import Link from "next/link"
import { FIELD_NAMES, FIELD_TYPES } from "@/constants"
// CHANGE 1: It's good practice to rename the import to match the filename for clarity.
import FileUpload from "./FileUpload" 
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Props<T extends FieldValues>{
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<{success: boolean, error?: string}>;
  type: "SIGN-IN" | "SIGN-UP"
};

const AuthForm = <T extends FieldValues>({
  type, 
  schema, 
  defaultValues, 
  onSubmit,
}: Props<T>) => {
  const router = useRouter();
  const isSignIn = type === "SIGN-IN";
  const form: UseFormReturn<T> = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  })

  const handleSubmit: SubmitHandler<T> = async(data) => {
    const result = await onSubmit(data);

    if(result.success){
      toast.success("Success! Redirecting...");
      router.push("/");
    } else {
      // Assuming your onSubmit function returns a specific error message
      toast.error(result.error || "Something went wrong. Please try again.");
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
          {Object.keys(defaultValues).map((fieldName) => (
            <FormField
              key={fieldName}
              control={form.control}
              name={fieldName as Path<T>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize">{FIELD_NAMES[field.name as keyof typeof FIELD_NAMES]}</FormLabel>
                  <FormControl>
                  {field.name === "universityCard" ? (
                      // =============================================================
                      // CHANGE 2: Use the new FileUpload component and provide its props
                      // This is the fix for the "Change undefined" bug.
                      // =============================================================
                      <FileUpload 
                        onFileChange={field.onChange} 
                        value={field.value} 
                        type="image"
                        accept="image/png, image/jpeg, image/webp"
                        placeholder="Upload University ID Card"
                        folder="/university-cards/"
                        variant="dark" // Your form has a dark theme
                      />
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

export default AuthForm;