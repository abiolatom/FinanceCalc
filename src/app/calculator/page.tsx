'use client';
 

 import {calculateLoanTerm} from '@/ai/flows/calculate-loan-term';
 import {generateComparativeReport} from '@/ai/flows/generate-comparative-report';
 import {useState, useEffect, useCallback} from 'react';
 import {useForm, Controller} from 'react-hook-form';
 import {zodResolver} from '@hookform/resolvers/zod';
 import * as z from 'zod';
 import {Button} from '@/components/ui/button';
 import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
 import {Checkbox} from '@/components/ui/checkbox';
 import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog';
 import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
 import {Input} from '@/components/ui/input';
 import {Label} from '@/components/ui/label';
 import {Separator} from '@/components/ui/separator';
 import {Textarea} from '@/components/ui/textarea';
 import {useToast} from '@/hooks/use-toast';
 import {useRouter} from 'next/navigation';
 import {PlusCircle, Trash2} from 'lucide-react';
 import {IconButton} from '@/components/ui/icon-button';
 import {auth, db} from '@/config/firebase';
 import {useAuthState} from 'react-firebase-hooks/auth';
 import {collection, addDoc, getDocs, doc, deleteDoc} from 'firebase/firestore';
 import {cn} from '@/lib/utils';
 import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
 

 const financeOptionSchema = z.object({
  financeSourceName: z.string().min(1, {
  message: 'Finance source name is required.',
  }),
  loanAmount: z.number({
  invalid_type_error: 'Loan amount must be a number.',
  }),
  annualInterestRate: z.number({
  invalid_type_error: 'Annual interest rate must be a number.',
  }),
  insuranceRatePercentage: z.number({
  invalid_type_error: 'Insurance rate must be a number.',
  }).optional(),
  insuranceAmount: z.number({
  invalid_type_error: 'Insurance amount must be a number.',
  }).optional(),
  securityDeposit: z.number({
  invalid_type_error: 'Security deposit must be a number.',
  }),
  monthlyRepaymentAmount: z.number({
  invalid_type_error: 'Monthly repayment amount must be a number.',
  }).optional(),
  monthlyRepaymentIsPercentage: z.boolean(),
  loanTermMonths: z.number({
  invalid_type_error: 'Loan term must be a number.',
  }),
  loanAmountPaidAtTermEnd: z.boolean(),
  securityDepositRepayable: z.boolean(),
  canRenew: z.boolean(),
  loanRenewalPercentage: z.number().optional(),
  loanRenewalFixedCost: z.number().optional(),
  extraLoanCosts: z.array(z.object({
  name: z.string(),
  amount: z.number(),
  })).optional(),
 });
 

 type FinanceOption = z.infer<typeof financeOptionSchema>;
 

 function FinanceOptionForm({
  onSubmit,
  onCancel,
 }: {
  onSubmit: (values: FinanceOption) => void;
  onCancel: () => void;
 }) {
  const form = useForm<FinanceOption>({
  resolver: zodResolver(financeOptionSchema),
  defaultValues: {
  financeSourceName: '',
  loanAmount: 0,
  annualInterestRate: 0,
  insuranceRatePercentage: 0,
  insuranceAmount: 0,
  securityDeposit: 0,
  monthlyRepaymentAmount: 0,
  monthlyRepaymentIsPercentage: false,
  loanTermMonths: 0,
  loanAmountPaidAtTermEnd: false,
  securityDepositRepayable: false,
  canRenew: false,
  loanRenewalPercentage: 0,
  loanRenewalFixedCost: 0,
  extraLoanCosts: [],
  },
  });
 

  function handleCancel() {
  form.reset();
  onCancel();
  }
 

  return (
  <Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
  <FormField
  control={form.control}
  name="financeSourceName"
  render={({field}) => (
  <FormItem>
  <FormLabel>Finance Source Name</FormLabel>
  <FormControl>
  <Input placeholder="e.g., Bank A" {...field} type="text" />
  </FormControl>
  <FormMessage />
  </FormItem>
  )}
  />
  <FormField
  control={form.control}
  name="loanAmount"
  render={({field}) => (
  <FormItem>
  <FormLabel>Loan Amount</FormLabel>
  <FormControl>
  <Input placeholder="Enter loan amount" {...field} type="number" />
  </FormControl>
  <FormMessage />
  </FormItem>
  )}
  />
  <FormField
  control={form.control}
  name="annualInterestRate"
  render={({field}) => (
  <FormItem>
  <FormLabel>Annual Interest Rate (%)</FormLabel>
  <FormControl>
  <Input
  placeholder="Enter annual interest rate"
  {...field}
  type="number"
  />
  </FormControl>
  <FormMessage />
  </FormItem>
  )}
  />
  <FormField
  control={form.control}
  name="insuranceRatePercentage"
  render={({field}) => (
  <FormItem>
  <FormLabel>Insurance Rate (% of Loan Amount)</FormLabel>
  <FormControl>
  <Input
  placeholder="Optional"
  {...field}
  type="number"
  />
  </FormControl>
  <FormMessage />
  </FormItem>
  )}
  />
  <FormField
  control={form.control}
  name="insuranceAmount"
  render={({field}) => (
  <FormItem>
  <FormLabel>Insurance Amount (Fixed)</FormLabel>
  <FormControl>
  <Input type="number" id="insuranceAmount" placeholder="Optional" {...field} />
  </FormControl>
  <FormMessage />
  </FormItem>
  )}
  />
  <FormField
  control={form.control}
  name="securityDeposit"
  render={({field}) => (
  <FormItem>
  <FormLabel>Security Deposit</FormLabel>
  <FormControl>
  <Input
  placeholder="Enter security deposit amount"
  {...field}
  type="number"
  />
  </FormControl>
  <FormMessage />
  </FormItem>
  )}
  />
  <FormField
  control={form.control}
  name="securityDepositRepayable"
  render={({field}) => (
  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
  <div className="space-y-0.5">
  <FormLabel htmlFor="securityDepositRepayable">
  Security Deposit Repayable
  </FormLabel>
  <FormDescription>
  Is the security deposit repayable at the end of the
  term?
  </FormDescription>
  </div>
  <FormControl>
  <Checkbox
  checked={field.value}
  onCheckedChange={field.onChange}
  />
  </FormControl>
  <FormMessage />
  </FormItem>
  )}
  />
  <FormField
  control={form.control}
  name="monthlyRepaymentAmount"
  render={({field}) => (
  <FormItem>
  <FormLabel>Monthly Repayment Amount</FormLabel>
  <FormControl>
  <Input
  placeholder="Enter monthly repayment amount"
  {...field}
  type="number"
  />
  </FormControl>
  <FormMessage />
  </FormItem>
  )}
  />
  <FormField
  control={form.control}
  name="monthlyRepaymentIsPercentage"
  render={({field}) => (
  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
  <div className="space-y-0.5">
  <FormLabel htmlFor="monthlyRepaymentIsPercentage">
  Monthly Repayment is Percentage
  </FormLabel>
  <FormDescription>
  Is the monthly repayment a percentage of the loan amount?
  </FormDescription>
  </div>
  <FormControl>
  <Checkbox
  checked={field.value}
  onCheckedChange={field.onChange}
  />
  </FormControl>
  <FormMessage />
  </FormItem>
  )}
  />
  <FormField
  control={form.control}
  name="loanTermMonths"
  render={({field}) => (
  <FormItem>
  <FormLabel>Loan Term (Months)</FormLabel>
  <FormControl>
  <Input
  placeholder="Enter loan term in months"
  {...field}
  type="number"
  />
  </FormControl>
  <FormMessage />
  </FormItem>
  )}
  />
  <FormField
  control={form.control}
  name="loanAmountPaidAtTermEnd"
  render={({field}) => (
  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
  <div className="space-y-0.5">
  <FormLabel htmlFor="loanAmountPaidAtTermEnd">
  Loan Amount Paid At Term End
  </FormLabel>
  <FormDescription>
  Is the loan amount paid in full at the end of the term?
  </FormDescription>
  </div>
  <FormControl>
  <Checkbox
  checked={field.value}
  onCheckedChange={field.onChange}
  />
  </FormControl>
  <FormMessage />
  </FormItem>
  )}
  />
  <FormField
  control={form.control}
  name="canRenew"
  render={({field}) => (
  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
  <div className="space-y-0.5">
  <FormLabel htmlFor="canRenew">Can Renew</FormLabel>
  <FormDescription>Can the loan be renewed after the term?</FormDescription>
  </div>
  <FormControl>
  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
  </FormControl>
  <FormMessage />
  </FormItem>
  )}
  />
  {form.getValues('canRenew') && (
  <>
  <FormField
  control={form.control}
  name="loanRenewalPercentage"
  render={({field}) => (
  <FormItem>
  <FormLabel>Loan Renewal Percentage</FormLabel>
  <FormControl>
  <Input
  placeholder="Enter loan renewal percentage"
  {...field}
  type="number"
  />
  </FormControl>
  <FormMessage />
  </FormItem>
  )}
  />
  <FormField
  control={form.control}
  name="loanRenewalFixedCost"
  render={({field}) => (
  <FormItem>
  <FormLabel>Loan Renewal Fixed Cost</FormLabel>
  <FormControl>
  <Input
  placeholder="Enter loan renewal fixed cost"
  {...field}
  type="number"
  />
  </FormControl>
  <FormMessage />
  </FormItem>
  )}
  />
  </>
  )}
  <div>
  <Button type="submit">Submit</Button>
  <Button type="button" variant="secondary" onClick={handleCancel}>
  Cancel
  </Button>
  </div>
  </form>
  </Form>
  );
 }
 

 export default function Home() {
  const [financeOptions, setFinanceOptions] = useState<FinanceOption[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {toast} = useToast();
  const router = useRouter();
  const [user, loading, error] = useAuthState(auth);
 

  const handleAddFinanceOption = (values: FinanceOption) => {
  setFinanceOptions([...financeOptions, values]);
  setIsDialogOpen(false);
  toast({
  title: 'Finance option added successfully!',
  });
  };
 

  const handleEditFinanceOption = (index: number, values: FinanceOption) => {
  const newOptions = [...financeOptions];
  newOptions[index] = values;
  setFinanceOptions(newOptions);
  setIsDialogOpen(false);
  toast({
  title: 'Finance option updated successfully!',
  });
  };
 

  const handleDeleteFinanceOption = (index: number) => {
  setFinanceOptions(financeOptions.filter((_, i) => i !== index));
  toast({
  title: 'Finance option deleted successfully!',
  });
  };
 

  const openDialog = () => {
  setIsDialogOpen(true);
  };
 

  const closeDialog = () => {
  setIsDialogOpen(false);
  };
 

  const handleGenerateReportClick = () => {
  router.push({
  pathname: '/report',
  query: {
  financeOptions: JSON.stringify(financeOptions),
  },
  });
  };
 

  useEffect(() => {
  if (!user && !loading) {
  router.push('/login');
  }
  }, [user, loading, router]);
 

  if (loading) {
  return <div>Loading...</div>;
  }
 

  if (error) {
  return <div>Error: {error.message}</div>;
  }
 

  if (!user) {
  return null; // or a loading indicator
  }
 

  return (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
  <div className="text-center">
  <h1 className="text-4xl font-bold mb-4">Welcome to Finance Clarity</h1>
  <p className="text-lg mb-6">Your personal finance management solution</p>
  <p className="text-md mb-8">
  Take control of your finances with our easy-to-use calculator.
  </p>
  </div>
  <div className="container mx-auto p-4">
  <h2 className="text-2xl font-bold mb-4">Finance Options</h2>
  <div className="mb-4">
  <Button onClick={openDialog}>Add Finance Option</Button>
  </div>
  {financeOptions.length > 0 ? (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {financeOptions.map((option, index) => (
  <Card key={index}>
  <CardHeader>
  <CardTitle>{option.financeSourceName}</CardTitle>
  <CardDescription>
  Loan Amount: {option.loanAmount}, Interest Rate:
  {option.annualInterestRate}%
  </CardDescription>
  </CardHeader>
  <CardContent>
  <p>Loan Term: {option.loanTermMonths} months</p>
  {/* Display other relevant finance option details */}
  </CardContent>
  <CardFooter className="flex justify-between">
  <IconButton
  onClick={() => {
  // Implement edit functionality here
  }}
  aria-label="Edit"
  >
  {/* Implement edit icon here */}
  Edit
  </IconButton>
  <IconButton
  onClick={() => handleDeleteFinanceOption(index)}
  aria-label="Delete"
  >
  <Trash2 className="h-4 w-4" />
  </IconButton>
  </CardFooter>
  </Card>
  ))}
  </div>
  ) : (
  <p>No finance options added yet.</p>
  )}
  <div className="mt-4">
  <Button onClick={handleGenerateReportClick}>
  Generate Comparative Report
  </Button>
  </div>
  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
  <DialogContent className="max-w-2xl">
  <DialogHeader>
  <DialogTitle>Add Finance Option</DialogTitle>
  <DialogDescription>
  Fill in the details for the finance option.
  </DialogDescription>
  </DialogHeader>
  <FinanceOptionForm
  onSubmit={handleAddFinanceOption}
  onCancel={closeDialog}
  />
  </DialogContent>
  </Dialog>
  </div>
  </div>
  );
 }
 

+
+
