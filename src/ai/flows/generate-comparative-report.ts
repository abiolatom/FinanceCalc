'use server';
/**
 * @fileOverview Generates a comparative report for multiple finance options using AI.
 *
 * - generateComparativeReport - A function that handles the generation of the comparative report.
 * - FinanceOption - The input type for a single finance option.
 * - GenerateComparativeReportInput - The input type for the generateComparativeReport function.
 * - GenerateComparativeReportOutput - The return type for the GenerateComparativeReport function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const FinanceOptionSchema = z.object({
  financeSourceName: z.string().describe('The name or source of the finance option.'),
  loanAmount: z.number().describe('The amount of the loan.'),
  annualInterestRate: z.number().describe('The annual interest rate (as a percentage).'),
  insuranceRatePercentage: z.number().optional().describe('The insurance rate (as a percentage of the total loan amount).'),
  insuranceAmount: z.number().optional().describe('The insurance amount (fixed amount).'),
  securityDeposit: z.number().describe('The security deposit amount.'),
  monthlyRepaymentAmount: z.number().optional().describe('The monthly repayment amount.'),
  monthlyRepaymentIsPercentage: z.boolean().describe('Whether the monthly repayment amount is a percentage of the loan amount.'),
  loanTermMonths: z.number().describe('The loan term in months.'),
  loanAmountPaidAtTermEnd: z.boolean().describe('Whether the loan amount is paid in full at the end of the term.'),
  securityDepositRepayable: z.boolean().describe('Whether the security deposit is repayable.'),
  canRenew: z.boolean().describe('Whether the loan can be renewed.'),
  extraLoanCosts: z.array(z.object({
    name: z.string().describe('Name of the extra loan cost.'),
    amount: z.number().describe('Amount of the extra loan cost.'),
  })).optional().describe('Extra loan costs associated with the loan.'),
  loanTerms: z.object({
    loanTermMonths: z.number().describe('The loan term in months.'),
    totalInterestPaid: z.number().describe('The total interest paid over the loan term.'),
    totalInsuranceCost: z.number().describe('The total insurance cost over the loan term.'),
    totalCostAboveLoanAmount: z.number().describe('The total cost paid above the loan amount in Naira.'),
    costOfFinance: z.string().describe('The total cost of finance above the loan amount in Naira.'),
    loanRenewalCost: z.string().optional().describe('The estimated cost of renewing the loan after the loan term in Naira.'),
  }).optional().describe('Loan terms for the finance option.'),
});
export type FinanceOption = z.infer<typeof FinanceOptionSchema>;

const GenerateComparativeReportInputSchema = z.object({
  financeOptions: z.array(FinanceOptionSchema).describe('An array of finance options to compare.'),
});
export type GenerateComparativeReportInput = z.infer<typeof GenerateComparativeReportInputSchema>;

const GenerateComparativeReportOutputSchema = z.object({
  comparativeReport: z.string().describe('A comparative report summarizing the finance options.'),
});
export type GenerateComparativeReportOutput = z.infer<typeof GenerateComparativeReportOutputSchema>;

export async function generateComparativeReport(input: GenerateComparativeReportInput): Promise<GenerateComparativeReportOutput> {
  return generateComparativeReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateComparativeReportPrompt',
  input: {
    schema: z.object({
      financeOptions: z.array(FinanceOptionSchema).describe('An array of finance options to compare.'),
    }),
  },
  output: {
    schema: z.object({
      comparativeReport: z.string().describe('A comparative report summarizing the finance options.'),
    }),
  },
  prompt: `You are a financial advisor who specializes in generating comparative reports for different finance options.

  Given the following finance options, generate a concise and easy-to-understand comparative report, highlighting the pros and cons of each option. Provide a ranked recommendation for which option the user should choose, considering factors such as loan term, interest rates, security deposit, and renewal costs.

  For short-term loans (less than 12 months) that are renewable, compare the cost of finance with comparative longer-term loan options and provide an overview of total costs at the end of 12 months, including potential renewal fees and interest rate changes.

  When evaluating monthly repayment amounts and whether the monthly repayment is a percentage of the loan amount, understand that the amount is a percentage on the loan amount. This percentage represents the portion of the loan amount repaid each month. Take into account the internal workings of the calculations and results to make an informed decision.

  **Insurance costs are paid upfront annually, regardless of the loan term.**

  Report repayable security deposits in terms of opportunity cost. For example, a repayable security deposit of 1000 on a 10000 loan means that the actual amount of finance the user has access to is just 9000 (10000 - 1000). Even though interest is paid on the full 10000, consider that only 9000 is available.

  Finance Options:
  {{#each financeOptions}}
  Option {{@index}}:
  - Finance Source: {{this.financeSourceName}}
  - Loan Amount: {{this.loanAmount}}
  - Annual Interest Rate: {{this.annualInterestRate}}%
  - Insurance Rate Percentage: {{#if this.insuranceRatePercentage}}{{this.insuranceRatePercentage}}%{{else}}N/A{{/if}} (paid upfront annually)
  - Insurance Amount: {{#if this.insuranceAmount}}{{this.insuranceAmount}}{{else}}N/A{{/if}} (paid upfront annually)
  - Security Deposit: {{this.securityDeposit}}
  - Security Deposit Repayable: {{this.securityDepositRepayable}}
  - Monthly Repayment Amount: {{#if this.monthlyRepaymentAmount}}{{this.monthlyRepaymentAmount}}{{else}}N/A{{/if}}
  - Monthly Repayment Percentage: {{#if this.monthlyRepaymentIsPercentage}}{{this.monthlyRepaymentIsPercentage}}{{else}}N/A{{/if}}
  - Loan Term (Months): {{this.loanTermMonths}}
  - Loan Amount Paid At Term End: {{this.loanAmountPaidAtTermEnd}}
  - Can Renew: {{this.canRenew}}
   {{#if this.extraLoanCosts}}
  - Extra Loan Costs:
    {{#each this.extraLoanCosts}}
      - {{this.name}}: {{this.amount}}
    {{/each}}
  {{else}}
  - No Extra Loan Costs
  {{/if}}
  {{/each}}

  Provide a clear, ranked recommendation based on a comprehensive analysis of all options, considering all these factors.
  `,
});

const generateComparativeReportFlow = ai.defineFlow<
  typeof GenerateComparativeReportInputSchema,
  typeof GenerateComparativeReportOutputSchema
>({
  name: 'generateComparativeReportFlow',
  inputSchema: GenerateComparativeReportInputSchema,
  outputSchema: GenerateComparativeReportOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
