import express from "express"
import e, { Router } from "express"
import { AccountTable } from "../db/schema.ts"
import { db } from "../index.ts"
import type { Request, Response } from 'express';
import z from "zod";
import { eq } from "drizzle-orm";

const router: Router = express.Router()

// 📌 Route to fetch accounts based on email
router.get("/accounts", async (req: Request, res: Response) => {
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
    const allAccounts = await db.select().from(AccountTable)
    // console.log(allAccounts)
    // 🔍 Filter accounts matching the provided email
    const UserAccounts = allAccounts.filter((account) => account.email === email)
    // console.log(UserAccounts)
    // ✅ Return matching accounts with success status
    res.status(200).json(
        { "allAccounts": UserAccounts }
    )
})

// Route to create a new account
router.post("/newaccounts", async (req: Request, res: Response) => {
    // 📧 Define account creation validation schema

    const createAccountSchema = z.object({
        email: z
            .string()
            .describe("The primary email address associated with the bank account"),

        acc_no: z
            .number()
            .int()
            .positive()
            .describe("The unique numerical account identifier provided by the institution"),

        name: z
            .string()
            .min(1, "Name is required")
            .describe("The full legal name of the account holder"),

        institution: z
            .string()
            .min(1, "Institution is required")
            .describe("The name of the bank or financial organization (e.g., SBI, HDFC)"),

        type: z
            .enum(["savings", "current", "investment", "salary"])
            .default("savings")
            .describe("The category of the account. Defaults to 'savings'"),

        balance: z
            .number()
            .int()
            .nonnegative()
            .default(0)
            .describe("The starting balance of the account in the smallest currency unit"),

        icon: z
            .string()
            .optional()
            .describe("A URL pointing to the bank's logo or a representative icon"),
    });

    // Type inference for your TypeScript logic

    // ✔️ Parse and validate account data from request body
    const parseAccount = createAccountSchema.safeParse(req.body)
    if (!parseAccount.success) {
        // ❌ Return error if validation fails
        res.status(400).json({ error: "Invalid account data" })
        return
    }

    // 🔓 Extract account data from validated schema
    const { acc_no, email, name, institution, type, balance, icon } = parseAccount.data


    // 📋 Create new account in database
    const newAccount = await db.insert(AccountTable).values({ acc_no, email, name, institution, type, balance, icon }).returning()

    // ✅ Return created account with success status
    res.status(200).json(
        { "account": newAccount[0] }
    )
})

// GET /api/accounts/:id - Get account details
router.get("/accounts/:id", async (req: Request, res: Response) => {
    // 📧 Define account ID validation schema
    const accountIdSchema = z.object({
        id: z
            .string()
            .transform(val => Number(val))
            .refine(val => !isNaN(val) && val > 0, "Invalid account ID")
            .describe("The unique numerical account identifier"),
    })

    // ✔️ Parse and validate account ID from request params
    const parseId = accountIdSchema.safeParse({ id: req.params.id })
    if (!parseId.success) {
        // ❌ Return error if validation fails
        res.status(400).json({ error: "Invalid account ID" })
        return
    }

    const { id } = parseId.data

    // 📋 Fetch account by ID from database
    const account = await db.select().from(AccountTable).where(eq(AccountTable.id, id))

    if(!account || account.length === 0) {
        // ❌ Return error if account not found
        res.status(404).json({ error: "Account not found" })
        return
    }

    // ✅ Return account details with success status
    res.status(200).json({ "account": account })
})  

// [ ] PUT /api/accounts/:id - Update account
router.put("/accounts/:id", async (req: Request, res: Response) => {
    // 📧 Define account ID validation schema
    const accountIdSchema = z.object({
        id: z
            .string()
            .transform(val => Number(val))
            .refine(val => !isNaN(val) && val > 0, "Invalid account ID")
            .describe("The unique numerical account identifier"),
    })

    // ✔️ Parse and validate account ID from request params
    const parseId = accountIdSchema.safeParse({ id: req.params.id })
    if (!parseId.success) {
        // ❌ Return error if validation fails
        res.status(400).json({ error: "Invalid account ID" })
        return
    }

    const { id } = parseId.data

    // 📋 Fetch account by ID from database
    const account = await db.select().from(AccountTable).where(eq(AccountTable.id, id))

    if(!account || account.length === 0) {
        // ❌ Return error if account not found
        res.status(404).json({ error: "Account not found" })
        return
    }

    // 📧 Define update account validation schema
    const updateAccountSchema = z.object({
        name: z
            .string()
            .min(1, "Name is required")
            .optional()
            .describe("The full legal name of the account holder"),

        institution: z
            .string()
            .min(1, "Institution is required")
            .optional()
            .describe("The name of the bank or financial organization (e.g., SBI, HDFC)"),

        type: z
            .enum(["savings", "current", "investment", "salary"])
            .optional()
            .describe("The category of the account"),

        icon: z
            .string()
            .optional()
            .describe("A URL pointing to the bank's logo or a representative icon"),
    });

    // ✔️ Parse and validate updated data from request body
    const parseUpdate = updateAccountSchema.safeParse(req.body)
    if (!parseUpdate.success) {
        // ❌ Return error if validation fails
        res.status(400).json({ error: "Invalid update data" })
        return
    }

    // 🔓 Extract updated data from validated schema
    const { name, institution, type, icon } = parseUpdate.data

    // 📋 Update account in database
    const updatedAccount = await db.update(AccountTable)
        .set({ name, institution, type, icon })
        .where(eq(AccountTable.id, id))
        .returning()

    // ✅ Return updated account with success status
    res.status(200).json({ "account": updatedAccount[0] })
})

//[ ] DELETE /api/accounts/:id - Soft delete account
router.delete("/accounts/:id", async (req: Request, res: Response) => {
    // 📧 Define account ID validation schema
    const accountIdSchema = z.object({
        id: z
            .string()
            .transform(val => Number(val))
            .refine(val => !isNaN(val) && val > 0, "Invalid account ID")
            .describe("The unique numerical account identifier"),
    })

    // ✔️ Parse and validate account ID from request params
    const parseId = accountIdSchema.safeParse({ id: req.params.id })
    if (!parseId.success) {
        // ❌ Return error if validation fails
        res.status(400).json({ error: "Invalid account ID" })
        return
    }

    const { id } = parseId.data

    // 📋 Fetch account by ID from database
    const account = await db.select().from(AccountTable).where(eq(AccountTable.id, id))

    if(!account || account.length === 0) {
        // ❌ Return error if account not found
        res.status(404).json({ error: "Account not found" })
        return
    }

    // 📋 Soft delete account by id
    await db.delete(AccountTable).where(eq(AccountTable.id, id))

    // ✅ Return success status
    res.status(200).json({ message: "Account deleted successfully" })
})

export default router