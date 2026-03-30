'use client'

import { useCurrentUser } from "@/hooks/useHook"
import axios from "axios"
import { useEffect } from "react"

const page = () => {

      const { email, isLoaded } = useCurrentUser()
  


  const fetchAccounts = async () => {

    if (!isLoaded || !email) return
    try {
      const newemail = { email }
      const response = await axios.get("http://localhost:8080/api/accounts/",{ params: newemail })
     
      console.log(response)
    } catch (error) {
      console.error("Error fetching accounts:", error)
    }
  }

  useEffect(() => {
    if (isLoaded && email) return
    fetchAccounts()
  }, [isLoaded, email])
  

  
  return (
    <div>all</div>
  )
}

export default page