'use client';

import {calculateLoanTerm} from '@/ai/flows/calculate-loan-term';
import {generateComparativeReport} from '@/ai/flows/generate-comparative-report';
import {Icons} from '@/components/icons';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Checkbox} from '@/components/ui/checkbox';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog';
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Separator} from '@/components/ui/separator';
import {Textarea} from '@/components/ui/textarea';
import {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {useRouter} from 'next/navigation';
import {useSearchParams} from 'next/navigation';

export default function Home() {
  const [loanAmount, setLoanAmount] = useState<number>(100000);
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(10);
  const [insuranceRatePercentage, setInsuranceRatePercentage] = useState<number | undefined>(2.5);
  const [insuranceAmount, setInsuranceAmount] = useState<number | undefined>(undefined);
  const [securityDeposit, setSecurityDeposit] = useState<number>(10000);
  const [monthlyRepaymentAmount, setMonthlyRepaymentAmount] = useState<number | undefined>(undefined);
  const [monthlyRepaymentIsPercentage, setMonthlyRepaymentIsPercentage] = useState<boolean>(false);
  const [loanTermMonths, setLoanTermMonths] = useState<number>(12);
  const [financeSourceName, setFinanceSourceName] = useState<string>('');
  const [financeOptions, setFinanceOptions] = useState<any[]>([]);
  const [calculatedResults, setCalculatedResults] = useState<any>(null);
  const [loanAmountPaidAtTermEnd, setLoanAmountPaidAtTermEnd] = useState<boolean>(false);
  const [securityDepositRepayable, setSecurityDepositRepayable] = useState<boolean>(false);
  const [canRenew, setCanRenew] = useState<boolean>(false);
  const [loanRenewalPercentage, setLoanRenewalPercentage] = useState<number | undefined>(undefined);
  const [loanRenewalFixedCost, setLoanRenewalFixedCost] = useState<number | undefined>(undefined);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [extraLoanCosts, setExtraLoanCosts] = useState<
    { name: string; amount: number }[]
  >([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(name, value);
    return params.toString();
  };

  const handleAddExtraLoanCost = () => {
    setExtraLoanCosts([...extraLoanCosts, {name: '', amount: 0}]);
  };

  const handleExtraLoanCostChange = (index: number, field: string, value: any) => {
    const updatedExtraLoanCosts = [...extraLoanCosts];
    updatedExtraLoanCosts[index][field] = value;
    setExtraLoanCosts(updatedExtraLoanCosts);
  };

  const handleDeleteExtraLoanCost = (index: number) => {
    const updatedExtraLoanCosts = [...extraLoanCosts];
    updatedExtraLoanCosts.splice(index, 1);
    setExtraLoanCosts(updatedExtraLoanCosts);
  };

  const handleCalculateLoanTerm = async () => {
    try {
      const results = await calculateLoanTerm({
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
        canRenew,
        loanRenewalPercentage,
        loanRenewalFixedCost,
        extraLoanCosts,
      });
      setCalculatedResults(results);
      setShowResults(true);
    } catch (error: any) {
      console.error('Error calculating loan terms:', error.message);
      alert('Failed to calculate loan terms.');
    }
  };

  const handleAddFinanceOption = async () => {
    try {
      // First, calculate the loan terms for the finance option
      const results = await calculateLoanTerm({
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
        canRenew,
        loanRenewalPercentage,
        loanRenewalFixedCost,
        extraLoanCosts,
      });

      // Then, add the finance option along with the calculated loan terms
      setFinanceOptions(prevOptions => [
        ...prevOptions,
        {
          financeSourceName,
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
          canRenew,
          loanRenewalPercentage,
          loanRenewalFixedCost,
          extraLoanCosts,
          loanTerms: results, // Include the calculated loan terms here
        },
      ]);
    } catch (error: any) {
      console.error('Error calculating loan terms:', error.message);
      alert('Failed to calculate loan terms for this finance option.');
      return; // Exit the function if calculation fails
    }

    // Only proceed to clear the input fields if the calculation was successful
    setLoanAmount(0);
    setAnnualInterestRate(0);
    setInsuranceRatePercentage(undefined);
    setInsuranceAmount(undefined);
    setSecurityDeposit(0);
    setMonthlyRepaymentAmount(undefined);
    setMonthlyRepaymentIsPercentage(false);
    setLoanTermMonths(0);
    setFinanceSourceName('');
    setLoanAmountPaidAtTermEnd(false);
    setSecurityDepositRepayable(false);
    setCanRenew(false);
    setLoanRenewalPercentage(undefined);
    setLoanRenewalFixedCost(undefined);
    setExtraLoanCosts([]);
  };

  const handleDeleteFinanceOption = (index: number) => {
    const newFinanceOptions = [...financeOptions];
    newFinanceOptions.splice(index, 1);
    setFinanceOptions(newFinanceOptions);
  };

   const handleEditFinanceOption = (index: number, updatedOption: any) => {
    const newFinanceOptions = [...financeOptions];
    newFinanceOptions[index] = updatedOption;
    setFinanceOptions(newFinanceOptions);
  };

  const handleGenerateReportClick = () => {
    const financeOptionsString = JSON.stringify(financeOptions);
    const url = `/report?${createQueryString('financeOptions', financeOptionsString)}`;
    router.push(url);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Cost of Finance Calculator</h1>
      <Card>
        <CardHeader>
          <CardTitle>Finance Details</CardTitle>
          <CardDescription>Enter the details of your finance options:</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="financeSourceName">Finance Source Name</Label>
            <Input
              type="text"
              id="financeSourceName"
              placeholder="e.g., Bank A, Credit Union B"
              value={financeSourceName}
              onChange={e => setFinanceSourceName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="loanAmount">Loan Amount</Label>
            <Input
              type="number"
              id="loanAmount"
              placeholder="Enter loan amount"
              value={loanAmount}
              onChange={e => setLoanAmount(Number(e.target.value))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="annualInterestRate">Annual Interest Rate (%)</Label>
            <Input
              type="number"
              id="annualInterestRate"
              placeholder="Enter annual interest rate"
              value={annualInterestRate}
              onChange={e => setAnnualInterestRate(Number(e.target.value))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="insuranceRatePercentage">Insurance Rate (% of Loan Amount)</Label>
            <Input
              type="number"
              id="insuranceRatePercentage"
              placeholder="Optional"
              value={insuranceRatePercentage || ''}
              onChange={e => setInsuranceRatePercentage(e.target.value === '' ? undefined : Number(e.target.value))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="insuranceAmount">Insurance Amount (Fixed)</Label>
            <Input
              type="number"
              id="insuranceAmount"
              placeholder="Optional"
              value={insuranceAmount || ''}
              onChange={e => setInsuranceAmount(e.target.value === '' ? undefined : Number(e.target.value))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="securityDeposit">Security Deposit</Label>
            <Input
              type="number"
              id="securityDeposit"
              placeholder="Enter security deposit amount"
              value={securityDeposit}
              onChange={e => setSecurityDeposit(Number(e.target.value))}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="securityDepositRepayable">
              Security Deposit Repayable?
            </Label>
            <Checkbox
              id="securityDepositRepayable"
              checked={securityDepositRepayable}
              onCheckedChange={e => setSecurityDepositRepayable(e)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="monthlyRepaymentAmount">Monthly Repayment Amount</Label>
            <Input
              type="number"
              id="monthlyRepaymentAmount"
              placeholder="Enter monthly repayment amount or percentage"
              value={monthlyRepaymentAmount || ''}
              onChange={e => setMonthlyRepaymentAmount(e.target.value === '' ? undefined : Number(e.target.value))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="monthlyRepaymentIsPercentage">Monthly Repayment is Percentage?</Label>
            <Checkbox
              id="monthlyRepaymentIsPercentage"
              checked={monthlyRepaymentIsPercentage}
              onCheckedChange={checked => setMonthlyRepaymentIsPercentage(!!checked)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="loanTermMonths">Loan Term (Months)</Label>
            <Input
              type="number"
              id="loanTermMonths"
              placeholder="Enter loan term in months"
              value={loanTermMonths}
              onChange={e => setLoanTermMonths(Number(e.target.value))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="loanAmountPaidAtTermEnd">Loan Amount Paid At Term End?</Label>
            <Checkbox
              id="loanAmountPaidAtTermEnd"
              checked={loanAmountPaidAtTermEnd}
              onCheckedChange={checked => setLoanAmountPaidAtTermEnd(!!checked)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="canRenew">Can Renew?</Label>
            <Checkbox
              id="canRenew"
              checked={canRenew}
              onCheckedChange={checked => setCanRenew(!!checked)}
            />
          </div>
          {canRenew && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="loanRenewalPercentage">Loan Renewal Percentage</Label>
                <Input
                  type="number"
                  id="loanRenewalPercentage"
                  placeholder="Optional"
                  value={loanRenewalPercentage || ''}
                  onChange={e => setLoanRenewalPercentage(e.target.value === '' ? undefined : Number(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="loanRenewalFixedCost">Loan Renewal Fixed Cost</Label>
                <Input
                  type="number"
                  id="loanRenewalFixedCost"
                  placeholder="Optional"
                  value={loanRenewalFixedCost || ''}
                  onChange={e => setLoanRenewalFixedCost(e.target.value === '' ? undefined : Number(e.target.value))}
                />
              </div>
            </>
          )}
          <div>
            <Label>Extra Loan Costs</Label>
            {extraLoanCosts.map((cost, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <Input
                  type="text"
                  placeholder="Expense Name"
                  value={cost.name}
                  onChange={(e) => handleExtraLoanCostChange(index, 'name', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Amount"
                  value={cost.amount}
                  onChange={(e) => handleExtraLoanCostChange(index, 'amount', Number(e.target.value))}
                />
                <Button type="button" variant="destructive" size="icon" onClick={() => handleDeleteExtraLoanCost(index)}>
                  <Icons.plusCircle className="h-4 w-4 rotate-45"/>
                </Button>
              </div>
            ))}
            <Button type="button" onClick={handleAddExtraLoanCost}>Add Extra Cost</Button>
          </div>
          <Button onClick={handleAddFinanceOption}>Add Finance Option</Button>
        </CardContent>
      </Card>
      <Separator className="my-4" />
      {financeOptions.length > 0 && (
        <>
          <h2 className="text-xl font-bold mb-4">Finance Options Added:</h2>
          <div className="grid gap-4">
            {financeOptions.map((option, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{option.financeSourceName || `Option ${index + 1}`}</CardTitle>
                  <CardDescription>Details of the finance option:</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Loan Amount: {option.loanAmount}</p>
                  <p>Annual Interest Rate: {option.annualInterestRate}%</p>
                  {option.insuranceRatePercentage && <p>Insurance Rate: {option.insuranceRatePercentage}%</p>}
                  {option.insuranceAmount && <p>Insurance Amount: {option.insuranceAmount}</p>}
                  <p>Security Deposit: {option.securityDeposit}</p>
                  <p>Security Deposit Repayable: {option.securityDepositRepayable ? 'Yes' : 'No'}</p>
                  {option.monthlyRepaymentAmount && <p>Monthly Repayment Amount: {option.monthlyRepaymentAmount}</p>}
                  <p>Loan Term: {option.loanTermMonths} months</p>
                  {option.loanTerms && (
                    <>
                      <h3 className="text-lg font-semibold">Calculated Results:</h3>
                      <p>Total Interest Paid: {option.loanTerms.totalInterestPaid}</p>
                      <p>Total Insurance Cost: {option.loanTerms.totalInsuranceCost}</p>
                      <p>Total Cost Above Loan Amount: {option.loanTerms.totalCostAboveLoanAmount}</p>
                      <p>Cost of Finance: {option.loanTerms.costOfFinance}</p>
                    </>
                  )}
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => handleEditFinanceOption(index, option)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteFinanceOption(index)}>Delete</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button onClick={handleGenerateReportClick}>Generate Comparative Report</Button>
        </>
      )}
    </div>
  );
}
