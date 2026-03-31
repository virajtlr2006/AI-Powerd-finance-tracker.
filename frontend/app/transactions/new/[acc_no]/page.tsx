'use client'
import { useForm, SubmitHandler } from "react-hook-form"
import { NewTransaction } from "../../../../../backend/db/schema"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"

const page = () => {

    const { acc_no } = useParams()
    const router = useRouter()

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<NewTransaction>()

    const onSubmit = async (data: NewTransaction) => {

        // console.log(data);

        const newData = { ...data, acc_no }

        // console.log(newData);

        const response = await axios.post(`http://localhost:8080/api/transactions/new/${acc_no}`, newData)

        // console.log(response.data.transaction);

        router.push(`/accounts/${acc_no}`)
        return response.data.transaction

    }

    return (
        <div>

            <form onSubmit={handleSubmit(onSubmit)}>


                <input type="number" placeholder="Amount" className="border border-gray-300 rounded p-2 w-full mb-2" {...register("amount", { required: true, valueAsNumber: true })} />
                {errors.amount && <span className="text-red-500 block mb-2">This field is required</span>}

                <input type="text" placeholder="Category" className="border border-gray-300 rounded p-2 w-full mb-2" {...register("category", { required: true })} />
                {errors.category && <span className="text-red-500 block mb-2">This field is required</span>}

                <input type="date" placeholder="Date" className="border border-gray-300 rounded p-2 w-full mb-2" {...register("date", { required: true })} />
                {errors.date && <span className="text-red-500 block mb-2">This field is required</span>}

                <input type="text" placeholder="Description" className="border border-gray-300 rounded p-2 w-full mb-2" {...register("description", { required: true })} />
                {errors.description && <span className="text-red-500 block mb-2">This field is required</span>}

                <input type="submit" />
            </form>


        </div>
    )
}

export default page