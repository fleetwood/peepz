"use client"

import Login from "@/components/Login"
import Feed from "@/components/feed/Feed"
import Main from "@/components/layout/Main"

export default function HomePage() {

  return (
      <Main>
        <Login />
        <Feed />
      </Main>
  )
}
