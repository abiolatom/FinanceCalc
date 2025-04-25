'use client';
 

 import {calculateLoanTerm} from '@/ai/flows/calculate-loan-term';
 import {generateComparativeReport} from '@/ai/flows/generate-comparative-report';
-import {useState, useEffect, useCallback} from 'react';
+import {useState, useEffect, useCallback} from 'react';
 import {useForm, Controller} from 'react-hook-form';
--import {zodResolver} from '@hookform/resolvers/zod';
-+import { zodResolver } from '@hookform/resolvers/zod';
 import * as z from 'zod';
 import {Button} from '@/components/ui/button';
--import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
-+import {Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter} from '@/components/ui/card';
 import {Checkbox} from '@/components/ui/checkbox';
 import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog';
 import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
@@ -28,6 +29,7 @@
 import {useAuthState} from 'react-firebase-hooks/auth';
 import {collection, addDoc, getDocs, doc, deleteDoc} from 'firebase/firestore';
  
+import { zodResolver } from '@hookform/resolvers/zod';
+
 const FinanceOptionSchema = z.object({
  financeSourceName: z.string().describe('The name or source of the finance option.'),
  loanAmount: z.number().describe('The amount of the loan.'),
@@ -36,6 +38,7 @@
  insuranceAmount: z.number().optional().describe('The insurance amount (fixed amount).'),
  securityDeposit: z.number().describe('The security deposit amount.'),
  monthlyRepaymentAmount: z.number().optional().describe('The monthly repayment amount.'),
+ loanTermMonths: z.number().describe('The loan term in months.'),
  monthlyRepaymentIsPercentage: z.boolean().describe('Whether the monthly repayment amount is a percentage of the loan amount.'),
  loanAmountPaidAtTermEnd: z.boolean().describe('Whether the loan amount is paid in full at the end of the term.'),
  securityDepositRepayable: z.boolean().describe('Whether the security deposit is repayable at the end of the loan term.'),
@@ -44,6 +47,7 @@
  extraLoanCosts: z.array(z.object({
  name: z.string().describe('Name of the extra loan cost.'),
  amount: z.number().describe('Amount of the extra loan cost.'),
+
  })).optional().describe('Extra loan costs associated with the loan.'),
  }).optional().describe('Loan terms for the finance option.'),
  
@@ -62,6 +66,7 @@
   canRenew: z.boolean(),
   loanRenewalPercentage: z.number().optional(),
   loanRenewalFixedCost: z.number().optional(),
+
   periodMonths: z.number(),
   extraLoanCosts: z.array(
  z.object({
@@ -69,6 +73,7 @@
  amount: z.number(),
  })
  ).optional(),
+
 });
 

 export default function Home() {
@@ -76,7 +81,7 @@
  const [loanAmount, setLoanAmount] = useState<number>(100000);
  const [financeOptions, setFinanceOptions] = useState<FinanceOption[]>([]);
  const {toast} = useToast();
- const [user, loading, error] = useAuthState(auth);
+ const [user, loading, error] = useAuthState(auth)
  const [savedReports, setSavedReports] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
 
@@ -122,6 +127,7 @@
  insuranceAmount: z.number().optional(),
  securityDeposit: z.number(),
  monthlyRepaymentAmount: z.number().optional(),
+ periodMonths: z.number(),
  monthlyRepaymentIsPercentage: z.boolean(),
  loanAmountPaidAtTermEnd: z.boolean(),
  securityDepositRepayable: z.boolean(),
@@ -132,6 +138,7 @@
  extraLoanCosts: z.array(
  z.object({
  name: z.string(),
+
  amount: z.number(),
  })
  ).optional(),
@@ -144,6 +151,7 @@
  resolver: zodResolver(FinanceOptionFormSchema),
  defaultValues: {
  financeSourceName: '',
+ loanTermMonths: 3,
  loanAmount: 10000,
  annualInterestRate: 36,
  insuranceRatePercentage: 2.5,
@@ -151,6 +159,7 @@
  securityDeposit: 500,
  monthlyRepaymentAmount: 33,
  monthlyRepaymentIsPercentage: true,
+ periodMonths: 12,
  loanAmountPaidAtTermEnd: true,
  securityDepositRepayable: true,
  canRenew: false,
@@ -194,6 +203,7 @@
  const onSave = async (values: z.infer<typeof FinanceOptionFormSchema>) => {
  //setIsSaving(true);
  const newFinanceOption: FinanceOption = {
+
  financeSourceName: values.financeSourceName,
  loanAmount: values.loanAmount,
  annualInterestRate: values.annualInterestRate,
@@ -201,6 +211,7 @@
  insuranceAmount: values.insuranceAmount,
  securityDeposit: values.securityDeposit,
  monthlyRepaymentAmount: values.monthlyRepaymentAmount,
+ loanTermMonths: values.loanTermMonths,
  monthlyRepaymentIsPercentage: values.monthlyRepaymentIsPercentage,
  loanAmountPaidAtTermEnd: values.loanAmountPaidAtTermEnd,
  securityDepositRepayable: values.securityDepositRepayable,
@@ -222,6 +233,7 @@
  setFinanceOptions([...financeOptions, newFinanceOption]);
  toast({
  description: 'Finance option added!',
+
  });
  //setIsSaving(false);
  setOpen(false);
@@ -234,6 +246,7 @@
  setFinanceOptions(
  financeOptions.filter((_, index) => index !== financeOptionIndex)
  );
+
  };
 

  useEffect(() => {
@@ -341,6 +354,7 @@
   placeholder="Enter loan amount"
   {...field}
   type="number"
+  />
   />
   </FormControl>
   <FormMessage />
@@ -354,6 +368,7 @@
   placeholder="Enter annual interest rate"
   {...field}
   type="number"
+  />
   />
   </FormControl>
   <FormMessage />
@@ -367,6 +382,7 @@
   placeholder="Optional"
   {...field}
   type="number"
+  />
   />
   </FormControl>
   <FormMessage />
@@ -380,6 +396,7 @@
   <Input type="number" id="insuranceAmount" placeholder="Optional" {...field} />
   </FormControl>
   <FormMessage />
+  />
   </FormItem>
   )}
   />
@@ -393,6 +410,7 @@
   placeholder="Enter security deposit amount"
   {...field}
   type="number"
+  />
   />
   </FormControl>
   <FormMessage />
@@ -426,6 +444,7 @@
   placeholder="Enter monthly repayment amount"
   {...field}
   type="number"
+  />
   />
   </FormControl>
   <FormMessage />
@@ -438,6 +457,7 @@
   placeholder="Enter loan term in months"
   {...field}
   type="number"
+  />
   />
   </FormControl>
   <FormMessage />
@@ -471,6 +491,7 @@
   placeholder="Enter loan renewal percentage"
   {...field}
   type="number"
+  />
   />
   </FormControl>
   <FormMessage />
@@ -484,6 +505,7 @@
   placeholder="Enter loan renewal fixed cost"
   {...field}
   type="number"
+  />
   />
   </FormControl>
   <FormMessage />
@@ -596,4 +618,4
  }
  
 
-+
\ No newline at end of file
+
+

