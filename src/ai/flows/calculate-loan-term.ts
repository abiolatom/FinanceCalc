'use server';

/**
 * @fileOverview AI-powered tool to calculate the loan term.
 *
 * - calculateLoanTerm - A function that handles the loan term calculation process.
 * - CalculateLoanTermInput - The input type for the calculateLoanTerm function.
 * - CalculateLoanTermOutput - The return type for the CalculateLoanTerm function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {LoanDetails, calculateLoanTerms} from '@/services/finance';

const CalculateLoanTermInputSchema = z.object({
  loanAmount: z.number().describe('The amount of the loan.'),
  annualInterestRate: z.number().describe('The annual interest rate (as a percentage).'),
  insuranceRatePercentage: z.number().optional().describe('The insurance rate (as a percentage of the total loan amount).'),
  insuranceAmount: z.number().optional().describe('The insurance amount (fixed amount).'),
  securityDeposit: z.number().describe('The security deposit amount.'),
  monthlyRepaymentAmount: z.number().optional().describe('The monthly repayment amount.'),
  monthlyRepaymentIsPercentage: z.boolean().describe('Whether the monthly repayment amount is a percentage of the loan amount.'),
  loanTermMonths: z.number().describe('The loan term in months.'),
  loanAmountPaidAtTermEnd: z.boolean().describe('Whether the loan amount is paid in full at the end of the term.'),
  securityDepositRepayable: z.boolean().describe('Whether the security deposit is repayable at the end of the loan term.'),
  canRenew: z.boolean().describe('Whether the loan can be renewed after the loan term.'),
  loanRenewalPercentage: z.number().optional().describe('The loan renewal percentage (as a percentage of the total loan amount).'),
  loanRenewalFixedCost: z.number().optional().describe('The loan renewal fixed cost.'),
  extraLoanCosts: z.array(z.object({
    name: z.string().describe('Name of the extra loan cost.'),
    amount: z.number().describe('Amount of the extra loan cost.'),
  })).optional().describe('Extra loan costs associated with the loan.'),
});
export type CalculateLoanTermInput = z.infer<typeof CalculateLoanTermInputSchema>;

const CalculateLoanTermOutputSchema = z.object({
  loanTermMonths: z.number().describe('The loan term in months.'),
  totalInterestPaid: z.number().describe('The total interest paid over the loan term.'),
  totalInsuranceCost: z.number().describe('The total insurance cost over the loan term.'),
  totalCostAboveLoanAmount: z.number().describe('The total cost paid above the loan amount in Naira.'),
  costOfFinance: z.string().describe('The total cost of finance above the loan amount in Naira.'),
  loanRenewalCost: z.string().optional().describe('The estimated cost of renewing the loan after the loan term in Naira.'),
});
export type CalculateLoanTermOutput = z.infer<typeof CalculateLoanTermOutputSchema>;

export async function calculateLoanTerm(input: CalculateLoanTermInput): Promise<CalculateLoanTermOutput> {
  return calculateLoanTermFlow(input);
}

const calculateLoanTermPrompt = ai.definePrompt({
  name: 'calculateLoanTermPrompt',
  input: {
    schema: z.object({
      loanAmount: z.number().describe('The amount of the loan.'),
      annualInterestRate: z.number().describe('The annual interest rate (as a percentage).'),
      insuranceRatePercentage: z.number().optional().describe('The insurance rate (as a percentage of the total loan amount).'),
      insuranceAmount: z.number().optional().describe('The insurance amount (fixed amount).'),
      securityDeposit: z.number().describe('The security deposit amount.'),
      monthlyRepaymentAmount: z.number().optional().describe('The monthly repayment amount.'),
      monthlyRepaymentIsPercentage: z.boolean().describe('Whether the monthly repayment amount is a percentage of the loan amount.'),
      loanTermMonths: z.number().describe('The loan term in months.'),
      loanAmountPaidAtTermEnd: z.boolean().describe('Whether the loan amount is paid in full at the end of the term.'),
      securityDepositRepayable: z.boolean().describe('Whether the security deposit is repayable at the end of the loan term.'),
      canRenew: z.boolean().describe('Whether the loan can be renewed after the loan term.'),
      loanRenewalPercentage: z.number().optional().describe('The loan renewal percentage (as a percentage of the total loan amount).'),
      loanRenewalFixedCost: z.number().optional().describe('The loan renewal fixed cost.'),
       extraLoanCosts: z.array(z.object({
        name: z.string().describe('Name of the extra loan cost.'),
        amount: z.number().describe('Amount of the extra loan cost.'),
      })).optional().describe('Extra loan costs associated with the loan.'),
    }),
  },
  output: {
    schema: z.object({
      loanTermMonths: z.number().describe('The loan term in months.'),
      totalInterestPaid: z.number().describe('The total interest paid over the loan term.'),
      totalInsuranceCost: z.number().describe('The total insurance cost over the loan term.'),
      totalCostAboveLoanAmount: z.number().describe('The total cost paid above the loan amount in Naira.'),
      costOfFinance: z.string().describe('The total cost of finance above the loan amount in Naira.'),
      loanRenewalCost: z.string().optional().describe('The estimated cost of renewing the loan after the loan term in Naira.'),
    }),
  },
  prompt: `Calculate the loan term in months, total interest paid, total insurance cost, and the total cost above the loan amount based on the following loan details:\n\nLoan Amount: {{{loanAmount}}}\nAnnual Interest Rate: {{{annualInterestRate}}}\nInsurance Rate Percentage: {{{insuranceRatePercentage}}} (paid upfront annually)\nInsurance Amount: {{{insuranceAmount}}} (paid upfront annually)\nSecurity Deposit: {{{securityDeposit}}}\nMonthly Repayment Amount: {{{monthlyRepaymentAmount}}}\nMonthly Repayment Is Percentage: {{{monthlyRepaymentIsPercentage}}}\nLoan Term in Months: {{{loanTermMonths}}}\nLoan Amount Paid At Term End: {{{loanAmountPaidAtTermEnd}}}\nLoan Amount Paid At Term End: {{{securityDepositRepayable}}}\nCan Renew: {{{canRenew}}}\nLoan Renewal Percentage: {{{loanRenewalPercentage}}}\nLoan Renewal Fixed Cost: {{{loanRenewalFixedCost}}}\n\nConsider all these factors to provide accurate estimates. If the loan can be renewed, estimate the cost of renewing the loan after the loan term, including potential fees and changes in interest rate. Use the calculateLoanTerms service to assist you with the calculations. Assume insurance is paid upfront for the full year, regardless of the loan term. Also, consider any extra loan costs.\n`,
});

const calculateLoanTermFlow = ai.defineFlow<
  typeof CalculateLoanTermInputSchema,
  typeof CalculateLoanTermOutputSchema
>({
  name: 'calculateLoanTermFlow',
  inputSchema: CalculateLoanTermInputSchema,
  outputSchema: CalculateLoanTermOutputSchema,
}, async input => {
  // Call the service to calculate loan terms
  const loanDetails: LoanDetails = {
    loanAmount: input.loanAmount,
    annualInterestRate: input.annualInterestRate,
    insuranceRatePercentage: input.insuranceRatePercentage,
    insuranceAmount: input.insuranceAmount,
    securityDeposit: input.securityDeposit,
    monthlyRepaymentAmount: input.monthlyRepaymentAmount,
    monthlyRepaymentIsPercentage: input.monthlyRepaymentIsPercentage,
    loanTermMonths: input.loanTermMonths,
    loanAmountPaidAtTermEnd: input.loanAmountPaidAtTermEnd,
    securityDepositRepayable: input.securityDepositRepayable,
  };

  const calculatedTerms = await calculateLoanTerms(loanDetails);

  // Optionally calculate loan renewal cost
  let loanRenewalCost: string | undefined;
  if (input.canRenew) {
    // Assuming renewal cost is a percentage of the loan amount, you may need to fetch the actual renewal fee.
    let renewalFee = (input.loanRenewalPercentage ? (input.loanAmount * input.loanRenewalPercentage / 100) : 0) + (input.loanRenewalFixedCost ? input.loanRenewalFixedCost : 0);
    loanRenewalCost = `N${renewalFee.toFixed(2)}`;
    calculatedTerms.loanRenewalCost = loanRenewalCost;
  }

  return calculatedTerms;
});
