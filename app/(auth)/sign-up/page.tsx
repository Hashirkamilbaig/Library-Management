"use client"
import AuthForm from '@/components/AuthForm'
import { signUpSchema } from '@/lib/validations'
import React from 'react'

const SignUp = () => {
  return (
    <AuthForm
      type="SIGN-UP"
      schema={signUpSchema}
      defaultValues={{
        email: "",
        password: "",
        fullName: "",
        universityId: "",
        universityCard: "",
      }}
      onSubmit={()=>{}}
    />
  )
}

export default SignUp