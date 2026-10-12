"use client";

import { useState, useEffect, useCallback } from "react";

export interface BorrowerLoan {
  id: string;
  account: string;
  facilityLabel: string;
  source: string;
  withdrawnAmount: number;
  initialPrincipal: number;
  remainingPrincipal: number;
  aprPct: number;
  dailyInterestRate: number;
  withdrawnAt: number; // timestamp ms
  dueDate: number; // timestamp ms (e.g. 30 days later)
  status: "active" | "repaid";
  txHash: string;
}

export interface BorrowerAccountState {
  loans: BorrowerLoan[];
  totalWithdrawnAllTime: number;
  totalRepaidAllTime: number;
}

export interface LenderDeposit {
  id: string;
  account: string;
  amount: number;
  shares: number;
  depositedAt: number; // timestamp ms
  txHash: string;
}

export interface LenderWithdrawal {
  id: string;
  account: string;
  amount: number;
  shares: number;
  withdrawnAt: number;
  txHash: string;
}

export interface LenderAccountState {
  deposits: LenderDeposit[];
  withdrawals: LenderWithdrawal[];
  totalDepositedAllTime: number;
  totalWithdrawnAllTime: number;
  currentShares: number;
  basePrincipal: number;
  lastAccrualTimestamp: number;
}

const BORROWER_STORAGE_KEY = "credence_borrower_state_v1";
const LENDER_STORAGE_KEY = "credence_lender_state_v1";
export const CREDENCE_DATA_EVENT = "credence_financial_state_changed";

function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(CREDENCE_DATA_EVENT));
  } catch (err) {
    console.error("Failed to write financial state to localStorage:", err);
  }
}

// ---------------- Borrower Hook ----------------
export function useBorrowerDashboard(accountAddress?: string) {
  const normalizedAccount = (accountAddress || "0x71C8492A9B82014eF0a45920C81F3849102B9B28").toLowerCase();
  const [allState, setAllState] = useState<Record<string, BorrowerAccountState>>({});
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  const syncState = useCallback(() => {
    const data = getStorageItem<Record<string, BorrowerAccountState>>(BORROWER_STORAGE_KEY, {});
    setAllState(data);
  }, []);

  useEffect(() => {
    syncState();
    const handleUpdate = () => syncState();
    window.addEventListener(CREDENCE_DATA_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      window.removeEventListener(CREDENCE_DATA_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      clearInterval(interval);
    };
  }, [syncState]);

  const accountData = allState[normalizedAccount] || {
    loans: [],
    totalWithdrawnAllTime: 0,
    totalRepaidAllTime: 0,
  };

  // Compute active metrics across all active loans
  const activeLoans = accountData.loans.filter((l) => l.status === "active" && l.remainingPrincipal > 0);
  const totalOutstandingPrincipal = activeLoans.reduce((sum, l) => sum + l.remainingPrincipal, 0);

  // Compute interest to repay
  // Simple accrued interest model based on elapsed time with minimum 7-day floor
  let totalInterestToRepay = 0;
  activeLoans.forEach((loan) => {
    const elapsedDays = Math.max(1, (currentTime - loan.withdrawnAt) / (1000 * 60 * 60 * 24));
    const effectiveDays = Math.max(7, elapsedDays);
    const interest = (loan.remainingPrincipal * (loan.aprPct / 100) * effectiveDays) / 365;
    totalInterestToRepay += interest;
  });

  const totalDue = totalOutstandingPrincipal + totalInterestToRepay;

  // Nearest expected repayment deadline
  const nextDueDate = activeLoans.length > 0
    ? Math.min(...activeLoans.map((l) => l.dueDate))
    : null;

  const recordLoanDraw = useCallback(
    (params: {
      facilityLabel: string;
      source: string;
      amount: number;
      aprPct: number;
      txHash: string;
      termDays?: number;
    }) => {
      const now = Date.now();
      const termDays = params.termDays || 30;
      const newLoan: BorrowerLoan = {
        id: `loan_${now}_${Math.random().toString(36).substring(2, 7)}`,
        account: normalizedAccount,
        facilityLabel: params.facilityLabel,
        source: params.source,
        withdrawnAmount: params.amount,
        initialPrincipal: params.amount,
        remainingPrincipal: params.amount,
        aprPct: params.aprPct,
        dailyInterestRate: (params.aprPct / 100) / 365,
        withdrawnAt: now,
        dueDate: now + termDays * 24 * 60 * 60 * 1000,
        status: "active",
        txHash: params.txHash,
      };

      const currentAccountState = allState[normalizedAccount] || {
        loans: [],
        totalWithdrawnAllTime: 0,
        totalRepaidAllTime: 0,
      };

      const updatedAccountState: BorrowerAccountState = {
        ...currentAccountState,
        loans: [newLoan, ...currentAccountState.loans],
        totalWithdrawnAllTime: currentAccountState.totalWithdrawnAllTime + params.amount,
      };

      const updatedAll = {
        ...allState,
        [normalizedAccount]: updatedAccountState,
      };

      setStorageItem(BORROWER_STORAGE_KEY, updatedAll);
      setAllState(updatedAll);
      return newLoan;
    },
    [allState, normalizedAccount]
  );

  const repayLoan = useCallback(
    (loanId: string, repayAmount?: number) => {
      const currentAccountState = allState[normalizedAccount];
      if (!currentAccountState) return;

      let actualRepaid = 0;
      const updatedLoans = currentAccountState.loans.map((loan) => {
        if (loan.id !== loanId) return loan;
        const amountToPay = repayAmount ?? loan.remainingPrincipal;
        actualRepaid = Math.min(amountToPay, loan.remainingPrincipal);
        const newRemaining = Math.max(0, loan.remainingPrincipal - actualRepaid);
        return {
          ...loan,
          remainingPrincipal: newRemaining,
          status: newRemaining === 0 ? ("repaid" as const) : ("active" as const),
        };
      });

      const updatedAccountState: BorrowerAccountState = {
        ...currentAccountState,
        loans: updatedLoans,
        totalRepaidAllTime: currentAccountState.totalRepaidAllTime + actualRepaid,
      };

      const updatedAll = {
        ...allState,
        [normalizedAccount]: updatedAccountState,
      };

      setStorageItem(BORROWER_STORAGE_KEY, updatedAll);
      setAllState(updatedAll);
    },
    [allState, normalizedAccount]
  );

  return {
    account: normalizedAccount,
    loans: accountData.loans,
    activeLoans,
    totalWithdrawn: accountData.totalWithdrawnAllTime,
    totalOutstandingPrincipal,
    totalInterestToRepay,
    totalDue,
    nextDueDate,
    totalRepaid: accountData.totalRepaidAllTime,
    recordLoanDraw,
    repayLoan,
    currentTime,
  };
}

// ---------------- Lender Hook ----------------
const LENDER_ANNUAL_APY_PCT = 8.4; // 8.4% Senior Vault APY

export function useLenderDashboard(accountAddress?: string) {
  const normalizedAccount = (accountAddress || "0x71C8492A9B82014eF0a45920C81F3849102B9B28").toLowerCase();
  const [allState, setAllState] = useState<Record<string, LenderAccountState>>({});
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  const syncState = useCallback(() => {
    const data = getStorageItem<Record<string, LenderAccountState>>(LENDER_STORAGE_KEY, {});
    setAllState(data);
  }, []);

  useEffect(() => {
    syncState();
    const handleUpdate = () => syncState();
    window.addEventListener(CREDENCE_DATA_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      window.removeEventListener(CREDENCE_DATA_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      clearInterval(interval);
    };
  }, [syncState]);

  const accountData = allState[normalizedAccount] || {
    deposits: [],
    withdrawals: [],
    totalDepositedAllTime: 0,
    totalWithdrawnAllTime: 0,
    currentShares: 0,
    basePrincipal: 0,
    lastAccrualTimestamp: Date.now(),
  };

  // Compute accrued interest dynamically on active deposits based on 8.4% APY
  let estimatedInterestAccrued = 0;
  accountData.deposits.forEach((dep) => {
    const elapsedSeconds = Math.max(0, (currentTime - dep.depositedAt) / 1000);
    const annualRate = LENDER_ANNUAL_APY_PCT / 100;
    const interest = dep.amount * (Math.exp((annualRate * elapsedSeconds) / (365 * 24 * 3600)) - 1);
    estimatedInterestAccrued += interest;
  });

  const currentLentPrincipal = Math.max(0, accountData.basePrincipal);
  const totalValueWithInterest = currentLentPrincipal + estimatedInterestAccrued;

  const recordDeposit = useCallback(
    (amount: number, txHash: string) => {
      const now = Date.now();
      const currentAccountState = allState[normalizedAccount] || {
        deposits: [],
        withdrawals: [],
        totalDepositedAllTime: 0,
        totalWithdrawnAllTime: 0,
        currentShares: 0,
        basePrincipal: 0,
        lastAccrualTimestamp: now,
      };

      const sharesAdded = amount;
      const newDeposit: LenderDeposit = {
        id: `dep_${now}_${Math.random().toString(36).substring(2, 7)}`,
        account: normalizedAccount,
        amount,
        shares: sharesAdded,
        depositedAt: now,
        txHash,
      };

      const updatedAccountState: LenderAccountState = {
        ...currentAccountState,
        deposits: [newDeposit, ...currentAccountState.deposits],
        totalDepositedAllTime: currentAccountState.totalDepositedAllTime + amount,
        currentShares: currentAccountState.currentShares + sharesAdded,
        basePrincipal: currentAccountState.basePrincipal + amount,
        lastAccrualTimestamp: now,
      };

      const updatedAll = {
        ...allState,
        [normalizedAccount]: updatedAccountState,
      };

      setStorageItem(LENDER_STORAGE_KEY, updatedAll);
      setAllState(updatedAll);
    },
    [allState, normalizedAccount]
  );

  const recordWithdrawal = useCallback(
    (amount: number, txHash: string) => {
      const now = Date.now();
      const currentAccountState = allState[normalizedAccount];
      if (!currentAccountState || currentAccountState.basePrincipal <= 0) return;

      const actualWithdrawAmount = Math.min(amount, currentAccountState.basePrincipal);
      const newWithdrawal: LenderWithdrawal = {
        id: `wd_${now}_${Math.random().toString(36).substring(2, 7)}`,
        account: normalizedAccount,
        amount: actualWithdrawAmount,
        shares: actualWithdrawAmount,
        withdrawnAt: now,
        txHash,
      };

      const updatedAccountState: LenderAccountState = {
        ...currentAccountState,
        withdrawals: [newWithdrawal, ...currentAccountState.withdrawals],
        totalWithdrawnAllTime: currentAccountState.totalWithdrawnAllTime + actualWithdrawAmount,
        currentShares: Math.max(0, currentAccountState.currentShares - actualWithdrawAmount),
        basePrincipal: Math.max(0, currentAccountState.basePrincipal - actualWithdrawAmount),
        lastAccrualTimestamp: now,
      };

      const updatedAll = {
        ...allState,
        [normalizedAccount]: updatedAccountState,
      };

      setStorageItem(LENDER_STORAGE_KEY, updatedAll);
      setAllState(updatedAll);
    },
    [allState, normalizedAccount]
  );

  return {
    account: normalizedAccount,
    totalDeposited: accountData.totalDepositedAllTime,
    totalWithdrawn: accountData.totalWithdrawnAllTime,
    currentLentPrincipal,
    currentShares: accountData.currentShares,
    estimatedInterestAccrued,
    totalValueWithInterest,
    apyPct: LENDER_ANNUAL_APY_PCT,
    deposits: accountData.deposits,
    withdrawals: accountData.withdrawals,
    recordDeposit,
    recordWithdrawal,
    currentTime,
  };
}
