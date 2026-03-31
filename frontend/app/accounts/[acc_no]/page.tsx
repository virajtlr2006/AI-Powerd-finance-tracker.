'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Account } from '../../../../backend/db/schema'
import { useParams } from 'next/navigation'
import { useCurrentUser } from '@/hooks/useHook'

const page = () => {

  const [account, setAccount] = useState<Account | null>(null)
  const [error, setError] = useState<string | null>(null)

  const {acc_no} = useParams()
  const {email,isLoaded} = useCurrentUser()

  useEffect(() => {
    if(!isLoaded || !email) {
      return
    }
    if (acc_no) {
      GetSingleAccount(Number(acc_no))
    } else {
      setError('No account selected. Please select an account from the All Accounts page.')
    }
  }, [isLoaded,email])

  // 📡 Async function to fetch single account details from backend
  const GetSingleAccount = async (acc_no: number) => {
    try {
      // 🌐 Make API call for account details (Changed to POST because GET requests generally drop req.body)
      const response = await axios.post(`http://localhost:8080/api/accounts/${acc_no}`, { email })
      console.log(response);
      
      if (response.data && response.data.account && response.data.account.length > 0) {
        setAccount(response.data.account[0])
      } else {
        setError('Account details not found.')
      }
    } catch (err:any) {
      setError(err.response.data.error);
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Account Details</h1>
      
      {error && (
        <div className="text-red-600 bg-red-100 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {account ? (
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto border border-gray-200">
          <div className="flex items-center space-x-4 mb-6">
            <img className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl" src={account.icon || "/default-icon.png"} />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{account.name}</h2>
              <p className="text-gray-500 font-medium">{account.institution}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mt-8 p-6 bg-gray-50 rounded-lg border border-gray-100">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Account Number</p>
              <p className="text-lg font-medium text-gray-800 mt-1">{account.acc_no}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Account Type</p>
              <p className="text-lg font-medium text-gray-800 mt-1">{account.type}</p>
            </div>
            <div className="col-span-2 pt-4 border-t border-gray-200 mt-2">
              <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Current Balance</p>
              <p className="text-3xl font-bold text-green-600 mt-2">${account.balance}</p>
            </div>
          </div>
        </div>
      ) : !error ? (
        <p className="text-center text-gray-600 mt-10 text-lg">Loading account details...</p>
      ) : null}
    </div>
  )
}

export default page