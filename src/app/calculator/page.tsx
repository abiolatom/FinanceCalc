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
 import {
  Select,
  SelectContent,
- SelectItem,
+  SelectItem,
  SelectTrigger,
  SelectValue,
 } from '@/components/ui/select';
@@ -18,7 +18,7 @@
 import {Separator} from '@/components/ui/separator';
 import {Textarea} from '@/components/ui/textarea';
 import {useToast} from '@/hooks/use-toast';
-import {useRouter} from 'next/navigation';
+import { useRouter } from 'next/navigation';
 import {PlusCircle, Trash2} from 'lucide-react';
 -import {IconButton} from '@/components/ui/icon-button';
 +import { IconButton } from '@/components/icon-button';
@@ -26,6 +26,7 @@
 import {useAuthState} from 'react-firebase-hooks/auth';
 import {collection, addDoc, getDocs, doc, deleteDoc} from 'firebase/firestore';
  
+
 const FinanceOptionSchema = z.object({
  financeSourceName: z.string().describe('The name or source of the finance option.'),
  loanAmount: z.number().describe('The amount of the loan.'),
@@ -34,6 +35,7 @@
  insuranceAmount: z.number().optional().describe('The insurance amount (fixed amount).'),
  securityDeposit: z.number().describe('The security deposit amount.'),
  monthlyRepaymentAmount: z.number().optional().describe('The monthly repayment amount.'),
+ loanTermMonths: z.number().describe('The loan term in months.'),
  monthlyRepaymentIsPercentage: z.boolean().describe('Whether the monthly repayment amount is a percentage of the loan amount.'),
  loanAmountPaidAtTermEnd: z.boolean().describe('Whether the loan amount is paid in full at the end of the term.'),
  securityDepositRepayable: z.boolean().describe('Whether the security deposit is repayable at the end of the loan term.'),
@@ -49,6 +51,7 @@
  
 

 const FinanceOptionFormSchema = z.object({
+ loanTermMonths: z.number(),
  financeSourceName: z.string().min(2, {
  message: 'Finance source name must be at least 2 characters.',
  }),
@@ -57,6 +60,7 @@
  insuranceRatePercentage: z.number().optional(),
  insuranceAmount: z.number().optional(),
  securityDeposit: z.number(),
+
  monthlyRepaymentAmount: z.number().optional(),
  monthlyRepaymentIsPercentage: z.boolean(),
  loanAmountPaidAtTermEnd: z.boolean(),
@@ -64,6 +68,7 @@
  canRenew: z.boolean(),
  loanRenewalPercentage: z.number().optional(),
  loanRenewalFixedCost: z.number().optional(),
+
  periodMonths: z.number(),
  extraLoanCosts: z.array(
  z.object({
@@ -71,6 +76,7 @@
  amount: z.number(),
  })
  ).optional(),
+
 });
 

 export default function Home() {
@@ -78,7 +84,7 @@
  const [loanAmount, setLoanAmount] = useState<number>(100000);
  const [financeOptions, setFinanceOptions] = useState<FinanceOption[]>([]);
  const {toast} = useToast();
- const [user, loading, error] = useAuthState(auth);
+ const [user, loading, error] = useAuthState(auth)
  const [savedReports, setSavedReports] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
 
@@ -124,6 +130,7 @@
  insuranceAmount: z.number().optional(),
  securityDeposit: z.number(),
  monthlyRepaymentAmount: z.number().optional(),
+ periodMonths: z.number(),
  monthlyRepaymentIsPercentage: z.boolean(),
  loanAmountPaidAtTermEnd: z.boolean(),
  securityDepositRepayable: z.boolean(),
@@ -134,6 +141,7 @@
  extraLoanCosts: z.array(
  z.object({
  name: z.string(),
+
  amount: z.number(),
  })
  ).optional(),
@@ -146,6 +154,7 @@
  resolver: zodResolver(FinanceOptionFormSchema),
  defaultValues: {
  financeSourceName: '',
+ loanTermMonths: 3,
  loanAmount: 10000,
  annualInterestRate: 36,
  insuranceRatePercentage: 2.5,
@@ -153,6 +162,7 @@
  securityDeposit: 500,
  monthlyRepaymentAmount: 33,
  monthlyRepaymentIsPercentage: true,
+ periodMonths: 12,
  loanAmountPaidAtTermEnd: true,
  securityDepositRepayable: true,
  canRenew: false,
@@ -196,6 +206,7 @@
  const onSave = async (values: z.infer<typeof FinanceOptionFormSchema>) => {
  //setIsSaving(true);
  const newFinanceOption: FinanceOption = {
+
  financeSourceName: values.financeSourceName,
  loanAmount: values.loanAmount,
  annualInterestRate: values.annualInterestRate,
@@ -203,6 +214,7 @@
  insuranceAmount: values.insuranceAmount,
  securityDeposit: values.securityDeposit,
  monthlyRepaymentAmount: values.monthlyRepaymentAmount,
+ loanTermMonths: values.loanTermMonths,
  monthlyRepaymentIsPercentage: values.monthlyRepaymentIsPercentage,
  loanAmountPaidAtTermEnd: values.loanAmountPaidAtTermEnd,
  securityDepositRepayable: values.securityDepositRepayable,
@@ -224,6 +236,7 @@
  setFinanceOptions([...financeOptions, newFinanceOption]);
  toast({
  description: 'Finance option added!',
+
  });
  //setIsSaving(false);
  setOpen(false);
@@ -236,6 +249,7 @@
  setFinanceOptions(
  financeOptions.filter((_, index) => index !== financeOptionIndex)
  );
+
  };
 

  useEffect(() => {
@@ -343,6 +357,15 @@
   placeholder="Enter loan amount"
   {...field}
   type="number"
+  />
+  <style jsx>{`
+  input[type=number]::-webkit-inner-spin-button,
+  input[type=number]::-webkit-outer-spin-button {
+  -webkit-appearance: none;
+  margin: 0;
+  }
+  input[type=number] {
+  -moz-appearance: textfield;
   />
   </FormControl>
   <FormMessage />
@@ -357,6 +380,15 @@
   placeholder="Enter annual interest rate"
   {...field}
   type="number"
+  />
+  <style jsx>{`
+  input[type=number]::-webkit-inner-spin-button,
+  input[type=number]::-webkit-outer-spin-button {
+  -webkit-appearance: none;
+  margin: 0;
+  }
+  input[type=number] {
+  -moz-appearance: textfield;
   />
   </FormControl>
   <FormMessage />
@@ -370,6 +402,15 @@
   placeholder="Optional"
   {...field}
   type="number"
+  />
+  <style jsx>{`
+  input[type=number]::-webkit-inner-spin-button,
+  input[type=number]::-webkit-outer-spin-button {
+  -webkit-appearance: none;
+  margin: 0;
+  }
+  input[type=number] {
+  -moz-appearance: textfield;
   />
   </FormControl>
   <FormMessage />
@@ -383,6 +424,15 @@
   <Input type="number" id="insuranceAmount" placeholder="Optional" {...field} />
   </FormControl>
   <FormMessage />
+  />
+  <style jsx>{`
+  input[type=number]::-webkit-inner-spin-button,
+  input[type=number]::-webkit-outer-spin-button {
+  -webkit-appearance: none;
+  margin: 0;
+  }
+  input[type=number] {
+  -moz-appearance: textfield;
   </FormItem>
   )}
   />
@@ -396,6 +446,15 @@
   placeholder="Enter security deposit amount"
   {...field}
   type="number"
+  />
+  <style jsx>{`
+  input[type=number]::-webkit-inner-spin-button,
+  input[type=number]::-webkit-outer-spin-button {
+  -webkit-appearance: none;
+  margin: 0;
+  }
+  input[type=number] {
+  -moz-appearance: textfield;
   />
   </FormControl>
   <FormMessage />
@@ -429,6 +488,15 @@
   placeholder="Enter monthly repayment amount"
   {...field}
   type="number"
+  />
+  <style jsx>{`
+  input[type=number]::-webkit-inner-spin-button,
+  input[type=number]::-webkit-outer-spin-button {
+  -webkit-appearance: none;
+  margin: 0;
+  }
+  input[type=number] {
+  -moz-appearance: textfield;
   />
   </FormControl>
   <FormMessage />
@@ -441,6 +509,15 @@
   placeholder="Enter loan term in months"
   {...field}
   type="number"
+  />
+  <style jsx>{`
+  input[type=number]::-webkit-inner-spin-button,
+  input[type=number]::-webkit-outer-spin-button {
+  -webkit-appearance: none;
+  margin: 0;
+  }
+  input[type=number] {
+  -moz-appearance: textfield;
   />
   </FormControl>
   <FormMessage />
@@ -474,6 +551,15 @@
   placeholder="Enter loan renewal percentage"
   {...field}
   type="number"
+  />
+  <style jsx>{`
+  input[type=number]::-webkit-inner-spin-button,
+  input[type=number]::-webkit-outer-spin-button {
+  -webkit-appearance: none;
+  margin: 0;
+  }
+  input[type=number] {
+  -moz-appearance: textfield;
   />
   </FormControl>
   <FormMessage />
@@ -487,6 +573,15 @@
   placeholder="Enter loan renewal fixed cost"
   {...field}
   type="number"
+  />
+  <style jsx>{`
+  input[type=number]::-webkit-inner-spin-button,
+  input[type=number]::-webkit-outer-spin-button {
+  -webkit-appearance: none;
+  margin: 0;
+  }
+  input[type=number] {
+  -moz-appearance: textfield;
   />
   </FormControl>
   <FormMessage />
@@ -599,4 +694,4
  }
  
 
-+
\ No newline at end of file
+
+