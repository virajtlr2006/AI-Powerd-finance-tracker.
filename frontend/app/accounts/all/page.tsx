'use client'

import React, { useEffect, useState } from 'react'
import { Account } from '../../../../backend/db/schema'
import axios from 'axios'
import { useCurrentUser } from '@/hooks/useHook'
import { useRouter } from 'next/navigation'

const page = () => {

  // 💾 State to store all accounts
  const [allAccounts, setallAccounts] = useState<Account[] | null>(null)
  
  // 🧭 Next.js router for navigation
  const router = useRouter()

  // 👤 Get current user's email and loading state
  const {isLoaded,email} = useCurrentUser()
  // console.log(email);

  // 🔄 Fetch accounts when user is loaded
  useEffect(() => {
    GetALlAccounts()
  }, [isLoaded,email])
  

  // 📡 Async function to fetch all accounts from API
  const GetALlAccounts = async () => {
    // console.log(email)
    // ⏳ Wait for user to load and email to be available
    if(!isLoaded || !email) {
      return
    }
    // 🌐 Make API call to backend with user email
    const response = await axios.post("http://localhost:8080/api/accounts/" , { email })
  
    // console.log(response.data.allAccounts);
    // ✅ Update state with fetched accounts
    setallAccounts(response.data.allAccounts)
  }


  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">All Accounts</h1>
      {allAccounts === null ? (
        // ⏳ Show loading message while fetching
        <p className="text-center text-gray-600 border border-gray-300 rounded-lg p-4 bg-white">Loading accounts...</p>
      ) : allAccounts.length > 0 ? (
        <ul className="space-y-4">
          {allAccounts.map((account) => (
            <a key={account.acc_no} href={`/accounts/${account.acc_no}`} className="block">
              {/* 🏦 Display account name */}
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{account.name}</h3>
              {/* 🏢 Display institution */}
              <p className="text-gray-600 border-t border-gray-200 pt-2">Institution: {account.institution}</p>
              {/* 📊 Display account type */}
              <p className="text-gray-600">Type: {account.type}</p>
              {/* 💰 Display account balance */}
              <p className="text-gray-800 font-semibold mt-2">Balance: ${account.balance}</p>
            </a>
          ))}
        </ul>
      ) : (
        // ❌ Show message when no accounts found
        <p className="text-center text-gray-600 border border-gray-300 rounded-lg p-4 bg-white">No accounts found.</p>
      )}
    </div>
  )
}

export default page