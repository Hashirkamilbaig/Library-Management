import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { signOut } from '@/auth'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from '@/lib/utils'
import { Session } from 'next-auth'


const Header = ({session} : {session: Session}) => {
  return (
    <header className='my-10 flex justify-between gap-5'>
      <Link href="/">
        <Image src="/icons/logo.svg" alt='logo' width={40} height={40}/>
      </Link>

      <ul className='flex flex-row  items-center gap-8'>
        <li>
          <form action={async () =>{
            'use server';

            await signOut();
          }}
          className='mb-10'
          >
            <Button>Logout</Button>
          </form>
          </li>
          <li className='mb-10'>
          <Link href="/my-profile">
            <Avatar>
              <AvatarFallback className='bg-amber-100 text-black'>{getInitials(session?.user?.name || "KB")}</AvatarFallback>
            </Avatar>
          </Link>
        </li>
      </ul>
    </header>
  )
}

export default Header