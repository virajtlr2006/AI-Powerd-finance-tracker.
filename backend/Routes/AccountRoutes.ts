import express from "express"
import e, { Router } from "express"
import { AccountSchema, AccountTable, NewAccountSchema } from "../db/schema.ts"
import { db } from "../index.ts"
import type { Request, Response } from 'express';
import z from "zod";
import { eq } from "drizzle-orm";

const router: Router = express.Router()

// 📌 Route to fetch accounts based on email
router.get("/", async (req: Request, res: Response) => {
    // 📧 Define email validation schema
    const emailSchema = z.object({
        email: z.string(),
    })

    // ✔️ Parse and validate email from request body
    const parseEmail = emailSchema.safeParse(req.body)
    if (!parseEmail.success) {
        // ❌ Return error if validation fails
        res.status(400).json({ error: "Invalid email format" })
        return
    }

    // 🔓 Extract email from validated data
    const { email } = parseEmail.data

    // 📋 Fetch all accounts from database
    const allAccounts = await db.select().from(AccountTable).where(eq(AccountTable.email, email))
   
    // console.log(UserAccounts)
    // ✅ Return matching accounts with success status
    res.status(200).json(
        { "allAccounts": allAccounts }
    )
})

// Route to create a new account
router.post("/new", async (req: Request, res: Response) => {
    // 📧 Define account creation validation schema

   

    // Type inference for your TypeScript logic

    // ✔️ Parse and validate account data from request body
    const parseAccount = NewAccountSchema.safeParse(req.body)
    if (!parseAccount.success) {
        // ❌ Return error if validation fails
        res.status(400).json({ error: "Invalid account data" })
        return
    }

    // 🔓 Extract account data from validated schema
    const { email, name, institution, type, balance, icon } = parseAccount.data


    // 📋 Create new account in database
    const newAccount = await db.insert(AccountTable).values({ email, name, institution, type, balance, icon }).returning()

    // ✅ Return created account with success status
    res.status(200).json(
        { "account": newAccount[0] }
    )
})

// GET /api/accounts/:acc_no - Get account details
router.get("/:acc_no", async (req: Request, res: Response) => {
    // 📧 Define account ID validation schema
    const accountIdSchema = z.object({
        acc_no: z
            .string()
            .transform(val => Number(val))
            .refine(val => !isNaN(val) && val > 0, "Invalid account ID")
            .describe("The unique numerical account identifier"),
    })

    // ✔️ Parse and validate account ID from request params
    const parseId = accountIdSchema.safeParse({ acc_no: req.params.acc_no })
    if (!parseId.success) {
        // ❌ Return error if validation fails
        res.status(400).json({ error: "Invalid account ID" })
        return
    }

    const { acc_no } = parseId.data

    // 📋 Fetch account by ID from database
    const account = await db.select().from(AccountTable).where(eq(AccountTable.acc_no, acc_no));

    if(!account || account.length === 0) {
        // ❌ Return error if account not found
        res.status(404).json({ error: "Account not found" })
        return
    }

    // ✅ Return account details with success status
    res.status(200).json({ "account": account })
})  

// [ ] PUT /api/accounts/:id - Update account
router.put("/", async (req: Request, res: Response) => {
    // 📧 Define account ID validation schema
   
    const parseUpdate = AccountSchema.safeParse(req.body)
    if (!parseUpdate.success) {
        // ❌ Return error if validation fails
        res.status(400).json({ error: "Invalid update data" })
        return
    }

    // 🔓 Extract updated data from validated schema
    const { acc_no, name, institution, type, icon } = parseUpdate.data
    
    // 📋 Fetch account by ID from database
    const account = await db.select().from(AccountTable).where(eq(AccountTable.acc_no, acc_no))
    
    if(!account || account.length === 0) {
        // ❌ Return error if account not found
        res.status(404).json({ error: "Account not found" })
        return
    }
    
    // 📧 Define update account validation schema
    
    
    // ✔️ Parse and validate updated data from request body

    // 📋 Update account in database
    const updatedAccount = await db.update(AccountTable)
        .set({ name, institution, type, icon })
        .where(eq(AccountTable.acc_no, acc_no))
        .returning()

    // ✅ Return updated account with success status
    res.status(200).json({ "account": updatedAccount[0] })
})

//[ ] DELETE /api/accounts/:acc_no - Soft delete account
router.delete("/:acc_no", async (req: Request, res: Response) => {
    // 📧 Define account ID validation schema
    const accountIdSchema = z.object({
        acc_no: z
            .string()
            .transform(val => Number(val))
            .refine(val => !isNaN(val) && val > 0, "Invalid account ID")
            .describe("The unique numerical account identifier"),
    })

    // ✔️ Parse and validate account ID from request params
    const parseId = accountIdSchema.safeParse({ acc_no: req.params.acc_no })
    if (!parseId.success) {
        // ❌ Return error if validation fails
        res.status(400).json({ error: "Invalid account ID" })
        return
    }

    const { acc_no } = parseId.data

    // 📋 Fetch account by ID from database
    const account = await db.select().from(AccountTable).where(eq(AccountTable.acc_no, Number(acc_no)));

    if(!account || account.length === 0) {
        // ❌ Return error if account not found
        res.status(404).json({ error: "Account not found" })
        return
    };

    // 📋 Soft delete account by id
    await db.delete(AccountTable).where(eq(AccountTable.acc_no, Number(acc_no)))

    // ✅ Return success status
    res.status(200).json({ message: "Account deleted successfully" })
})

export default router