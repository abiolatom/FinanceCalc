/**
 * Represents the details of a loan.
 */
export interface LoanDetails {
  /**
   * The amount of the loan.
   */
  loanAmount: number;
  /**
   * The annual interest rate (as a percentage).
   */
  annualInterestRate: number;
  /**
   * The insurance rate (as a percentage of the total loan amount, annual).
   */
  insuranceRatePercentage?: number;
  /**
   * The insurance amount (fixed amount, annual).
   */
  insuranceAmount?: number;
  /**
   * The security deposit amount.
   */
  securityDeposit: number;
  /**
   * The monthly repayment amount.
   */
  monthlyRepaymentAmount?: number;
  /**
   * Whether the monthly repayment is a percentage of loan amount
   */
  monthlyRepaymentIsPercentage: boolean;
  /**
   * The loan term in months.
   */
  loanTermMonths: number;
    /**
     * Whether the loan amount is paid in full at the end of the term.
     */
    loanAmountPaidAtTermEnd: boolean;

    /**
     *  Whether the security deposit is repayable or not.
     */
    securityDepositRepayable: boolean;
}

/**
 * Represents the calculated terms of a loan.
 */
export interface LoanTerms {
  /**
   * The loan term in months.
   */
  loanTermMonths: number;
  /**
   * The total interest paid over the loan term.
   */
  totalInterestPaid: number;
  /**
   * The total insurance cost over the loan term.
   */
  totalInsuranceCost: number;
  /**
   * The total cost paid above the loan amount.
   */
  totalCostAboveLoanAmount: number;

    /**
     * The cost of finance.
     */
    costOfFinance: string;
    loanRenewalCost?: string;
}

/**
 * Asynchronously calculates the terms of a loan based on the provided details.
 *
 * @param loanDetails The details of the loan.
 * @returns A promise that resolves to a LoanTerms object containing the calculated loan terms.
 */
export async function calculateLoanTerms(loanDetails: LoanDetails): Promise<LoanTerms> {
  const {
    loanAmount,
    annualInterestRate,
    insuranceRatePercentage,
    insuranceAmount,
    securityDeposit,
    monthlyRepaymentAmount,
    monthlyRepaymentIsPercentage,
    loanTermMonths,
    loanAmountPaidAtTermEnd,
    securityDepositRepayable,
  } = loanDetails;

  let calculatedMonthlyRepaymentAmount = monthlyRepaymentIsPercentage ? (loanAmount * (monthlyRepaymentAmount || 0)) / 100 : (monthlyRepaymentAmount || 0);

  const monthlyInterestRate = annualInterestRate / 100 / 12;
  let totalInterestPaid = 0;
  let remainingBalance = loanAmount;
  let totalRepayment = 0;

  // Removed conditional check for loanAmountPaidAtTermEnd
   if (loanAmountPaidAtTermEnd) {
        for (let i = 0; i < loanTermMonths; i++) {
          totalInterestPaid += remainingBalance * monthlyInterestRate;
        }
      totalRepayment = loanAmount + totalInterestPaid;
    }
    else {
        // Recalculate repayment, and make the last one add the balance to it.
        if (!calculatedMonthlyRepaymentAmount){
          totalInterestPaid = loanAmount * monthlyInterestRate * loanTermMonths;
          totalRepayment = loanAmount + totalInterestPaid;
        } else{
            for (let i = 0; i < loanTermMonths; i++) {
                const interestPayment = remainingBalance * monthlyInterestRate;
                let principalPayment = calculatedMonthlyRepaymentAmount ? Math.min(calculatedMonthlyRepaymentAmount - interestPayment, remainingBalance) : remainingBalance;

                totalInterestPaid += interestPayment;
                remainingBalance -= principalPayment;

                if (calculatedMonthlyRepaymentAmount === 0) {
                    remainingBalance = 0;
                    break;
                }

                if (remainingBalance <= 0) {
                    principalPayment += remainingBalance
                    break;
                }
            }

            totalRepayment = loanAmount + totalInterestPaid;

        }
    }


  let totalInsuranceCost = 0;
  if (insuranceRatePercentage) {
    totalInsuranceCost = loanAmount * insuranceRatePercentage / 100;
  } else if (insuranceAmount) {
    totalInsuranceCost = insuranceAmount;
  }

  let costOfFinanceCalculation = loanAmount + securityDeposit + totalInsuranceCost + totalInterestPaid - loanAmount

  if (securityDepositRepayable){
    costOfFinanceCalculation = loanAmount + totalInsuranceCost + totalInterestPaid - loanAmount
  }
  const totalCostAboveLoanAmount = totalInterestPaid + totalInsuranceCost;
  const costOfFinance = `N${costOfFinanceCalculation.toFixed(2)}`;

  return {
    loanTermMonths,
    totalInterestPaid,
    totalInsuranceCost,
    totalCostAboveLoanAmount,
    costOfFinance: costOfFinance,
  };
}
