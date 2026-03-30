'use client'
import { useForm, SubmitHandler } from "react-hook-form"
import type { NewAccount } from "../../../../backend/db/schema"
import axios from "axios"
import { useCurrentUser } from "@/hooks/useHook"
import { useRouter } from "next/navigation"

const page = () => {

    // 🧭 Used to redirect user after successful account creation
    const router = useRouter()

    // 📝 React Hook Form setup with NewAccount type safety
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<NewAccount>()

    // 👤 Get signed-in user email from custom auth hook
    const { email, isLoaded } = useCurrentUser()
    //   console.log(email);

    // 🚀 Submit form data to backend API
    const onSubmit: SubmitHandler<NewAccount> = async (data) => {

        // ⏳ Wait until user info is fully loaded
        if (!isLoaded || !email) {
            console.error("User email not ready")
            return
        }

        // 📦 Merge form data with authenticated user email
        const newData = {
            ...data,
            email: email
        }
        // console.log(newData);

        // 🌐 Send create-account request to backend
        const response = await axios.post("http://localhost:8080/api/accounts/new", newData)
        console.log(response.data.account);

        // ✅ Navigate to all accounts page after success
        router.push("/accounts/all")
    }

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>

                {/* 🏷️ Account name field */}
                <input className="border" placeholder="Account name" {...register("name", { required: true })} />
                {errors.name && <span>This field is required</span>}

                {/* 🏦 Institution field */}
                <input className="border" placeholder="Institution" {...register("institution", { required: true })} />
                {errors.institution && <span>This field is required</span>}

                {/* 📂 Account type field */}
                <input className="border" placeholder="Type" {...register("type", { required: true })} />
                {errors.type && <span>This field is required</span>}

                {/* 💰 Initial balance field */}
                <input type="number" className="border" placeholder="Balance" {...register("balance", { required: true, valueAsNumber: true })} />
                {errors.balance && <span>This field is required</span>}

                {/* 🖼️ Optional icon URL field */}
                <input className="border" placeholder="Icon URL" {...register("icon", { required: true })} />
                {errors.icon && <span>This field is required</span>}

                {/* 📤 Submit button */}
                <input type="submit" />
            </form>
        </div>
    )
}

export default page