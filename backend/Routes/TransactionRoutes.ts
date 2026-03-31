import express from "express";
import type { Request, Response, Router } from "express";
import { db } from "../index.ts";
import { TransactionTable } from "../db/schema.ts";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router: Router = express.Router()

// 📋 List Transactions
router.get("/", async (req: Request, res: Response) => {
  const transactionQuerySchema = z.object({
    acc_no: z.number().describe("Account number is required")
  });

  try {
    // ✔️ Validate request query against schema
    const validation = transactionQuerySchema.safeParse(req.body);
  
    if (!validation.success) {
      // ❌ Return validation error if schema check fails
      res.status(400).json({ error: validation.error.message });
      return;
    }

    // 🔍 Extract account number from validated data
    const { acc_no } = validation.data;
    // 💾 Query database for transactions matching account number
    const transactions = await db.select().from(TransactionTable).where(eq(TransactionTable.acc_no, Number(acc_no)));
    // ✅ Return transactions with success status
    res.status(200).json(
      { "transactions": transactions }
    )
  } catch (error) {
    // 🚨 Log error to console
    console.error("Error fetching transactions:", error);
    // 💥 Return generic error response
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 📋 Create Transaction
router.post("/new/:acc_no", async (req: Request, res: Response) => {
  const transactionSchema = z.object({
    amount: z.number(),
    date: z.string(),
    description: z.string(),
    category: z.string(),
  });
  const accountNumberSchema = z.object({
    acc_no: z.string().describe("Account number is required")
  });
  try {
    // ✔️ Validate request body against schema
    const validation = transactionSchema.safeParse(req.body);
    const accCalidation = accountNumberSchema.safeParse(req.params);

    if (!validation.success) {
      // ❌ Return validation error if schema check fails
      res.status(400).json({ error: validation.error.message });
      return;
    }
    if(!accCalidation.success) {
      res.status(400).json({ error: accCalidation.error.message });
      return;
    }

    // 🔍 Extract validated transaction data
    const { amount, date, description, category } = validation.data;
    // 💾 Insert new transaction into database
    const {acc_no} = accCalidation.data;
    const newTransaction = await db.insert(TransactionTable).values({
      acc_no: Number(acc_no),
      amount,
      date,
      description,
      category
    }).returning();
    // ✅ Return created transaction with success status
    res.status(201).json(
      { "transaction": newTransaction[0] }
    )
  } catch (error) {
    // 🚨 Log error to console
    console.error("Error creating transaction:", error);
    // 💥 Return generic error response
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /api/transactions/:trans_id - Get transaction details
router.get("/:trans_id", async (req: Request, res: Response) => {
  const transactionIdSchema = z.object({
    trans_id: z.number().describe("Transaction ID is required")
  });
  try {
    // ✔️ Validate request params against schema
    const validation = transactionIdSchema.safeParse({ trans_id: Number(req.params.trans_id) });

    if (!validation.success) {
      // ❌ Return validation error if schema check fails
      res.status(400).json({ error: validation.error.message });
      return;
    }

    const { trans_id } = validation.data;
    // 💾 Query database for transaction by ID
    const transaction = await db.select().from(TransactionTable).where(eq(TransactionTable.trans_id, trans_id));

    if (transaction.length === 0) {
      // ❌ Return not found error if transaction doesn't exist
      res.status(404).json({ error: "Transaction not found" });
      return;
    }

    // ✅ Return transaction details with success status
    res.status(200).json(
      { "transaction": transaction[0] }
    )
  } catch (error) {
    // 🚨 Log error to console
    console.error("Error fetching transaction:", error);
    // 💥 Return generic error response
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE /api/transactions/:trans_id - Delete a transaction
router.delete("/:trans_id", async (req: Request, res: Response) => {
  const transactionIdSchema = z.object({
    trans_id: z.number().describe("Transaction ID is required")
  }); 
  try {
    // ✔️ Validate request params against schema
    const validation = transactionIdSchema.safeParse({ trans_id: Number(req.params.trans_id) });

    if (!validation.success) {
      // ❌ Return validation error if schema check fails
      res.status(400).json({ error: validation.error.message });
      return;
    }

    const { trans_id } = validation.data;
    // 💾 Delete transaction from database by ID
    const deleteResult = await db.delete(TransactionTable).where(eq(TransactionTable.trans_id, trans_id)).returning();

    if (deleteResult.length === 0) {
      // ❌ Return not found error if transaction doesn't exist
      res.status(404).json({ error: "Transaction not found" });
      return;
    }

    //  ✅ Return success message with deleted transaction details
    res.status(200).json(
      { "message": "Transaction deleted successfully", "transaction": deleteResult[0] }
    )
  } catch (error) {
    // 🚨 Log error to console
    console.error("Error deleting transaction:", error);
    // 💥 Return generic error response
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT /api/transactions/:trans_id - Update a transaction
router.put("/:trans_id", async (req: Request, res: Response) => {
  const transactionIdSchema = z.object({
    trans_id: z.number().describe("Transaction ID is required")
  });
  const transactionUpdateSchema = z.object({
    description: z.string().optional(),
    category: z.string().optional(),
  });
  try {
    // ✔️ Validate request params against schema
    const idValidation = transactionIdSchema.safeParse({ trans_id: Number(req.params.trans_id) });

    if (!idValidation.success) {
      // ❌ Return validation error if schema check fails
      res.status(400).json({ error: idValidation.error.message });
      return;
    }

    // ✔️ Validate request body against update schema
    const updateValidation = transactionUpdateSchema.safeParse(req.body);

    if (!updateValidation.success) {
      // ❌ Return validation error if schema check fails
      res.status(400).json({ error: updateValidation.error.message });
      return;
    }

    const { trans_id } = idValidation.data;
    const updateData = updateValidation.data;

    // 💾 Update transaction in database by ID
    const updatedTransaction = await db.update(TransactionTable).set(updateData).where(eq(TransactionTable.trans_id, trans_id)).returning();

    if (updatedTransaction.length === 0) {
      // ❌ Return not found error if transaction doesn't exist
      res.status(404).json({ error: "Transaction not found" });
      return;
    }

    // ✅ Return success message with updated transaction details
    res.status(200).json(
      { "message": "Transaction updated successfully", "transaction": updatedTransaction[0] }
    )
  } catch (error) {
    // 🚨 Log error to console
    console.error("Error updating transaction:", error);
    //  💥 Return generic error response
    res.status(500).json({ error: "Internal Server Error" });
  }
}); 
export default router