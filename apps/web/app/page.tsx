"use client"

import { clientEnv } from "@peeps/config/env"
import { PersonClient } from "@peeps/client"
import Login from "@/components/Login"

const personClient = PersonClient.createHttp({
  baseUrl: clientEnv.APP_URL,
})

export default function HomePage() {
  const persons = personClient.useList()

  return (
    <main>
      <h1>Peeps</h1>
      <Login />
      <pre>{JSON.stringify(persons.data, null, 2)}</pre>
    </main>
  )
}
