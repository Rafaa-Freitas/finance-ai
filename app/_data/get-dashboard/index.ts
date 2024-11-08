import { db } from "@/app/_lib/prisma";
import { TransactionType } from "@prisma/client";
import { TransactionPercentagePerType } from "./types";

async function getDashboard(month: string) {
  const where = {
    date: {
      gte: new Date(`2024-${month}-01`),
      lt: new Date(`2024-${month}-31`),
    },
  };

  const totalDeposits = Number(
    (
      await db.transaction.aggregate({
        where: { ...where, type: "DEPOSIT" },
        _sum: { amount: true },
      })
    )?._sum?.amount,
  );

  const totalInvestments = Number(
    (
      await db.transaction.aggregate({
        where: { ...where, type: "INVESTMENT" },
        _sum: { amount: true },
      })
    )?._sum?.amount,
  );

  const totalExpenses = Number(
    (
      await db.transaction.aggregate({
        where: { ...where, type: "EXPENSE" },
        _sum: { amount: true },
      })
    )?._sum?.amount,
  );

  const balance = totalDeposits - totalInvestments - totalExpenses;

  const totalTransactions = Number(
    (
      await db.transaction.aggregate({
        where,
        _sum: { amount: true },
      })
    )._sum.amount,
  );

  const typesPercentage: TransactionPercentagePerType = {
    [TransactionType.DEPOSIT]: Math.round(
      (Number(totalDeposits || 0) / Number(totalTransactions)) * 100 || 0,
    ),
    [TransactionType.EXPENSE]: Math.round(
      (Number(totalExpenses || 0) / Number(totalTransactions)) * 100 || 0,
    ),
    [TransactionType.INVESTMENT]: Math.round(
      (Number(totalInvestments || 0) / Number(totalTransactions)) * 100 || 0,
    ),
  };

  return {
    balance,
    totalDeposits,
    totalExpenses,
    totalInvestments,
    typesPercentage,
  };
}

export default getDashboard;
