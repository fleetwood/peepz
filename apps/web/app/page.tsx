"use client"

import Login from "@/components/Login"
import Feed from "@/components/feed/Feed"
import Main from "@/components/layout/Main"
import { PersonClient } from "@peeps/client"
import { clientEnv } from "@peeps/config/env"

const personClient = PersonClient.createHttp({
  baseUrl: clientEnv.APP_URL,
})

export default function HomePage() {
  const persons = personClient.useList()

  return (
      <Main>
        <Login />
        <Feed />
      </Main>
  )
}
