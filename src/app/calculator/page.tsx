'use client';

import type { FinanceOption, CalculatedTerms } from '@/types/finance';
import { calculateLoanTerm } from '@/ai/flows/calculate-loan-term';
import { generateComparativeReport } from '@/ai/flows/generate-comparative-report';
import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { PlusCircle, Trash2 } from 'lucide-react';
import { IconButton } from '@/components/icon-button';
import { useAuth } from '@/components/AuthProvider';
import { db } from '@/config/firebase';
import { collection, addDoc, getDocs, doc, deleteDoc, query, where, updateDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';


const extraLoanCostSchema = z.object({
  name: z.string().min(1, 'Cost name is required'),
  amount: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number({ invalid_type_error: 'Must be a number' }).positive('Must be positive')
  ),
});

const financeOptionSchema = z.object({
  id: z.string().optional(), // For Firestore document ID
  financeSourceName: z.string().min(1, 'Finance source name is required'),
  loanAmount: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number({ invalid_type_error: 'Must be a number' }).positive('Loan amount must be positive')
  ),
  annualInterestRate: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number({ invalid_type_error: 'Must be a number' }).positive('Interest rate must be positive')
  ),
  loanTermMonths: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number({ invalid_type_error: 'Must be a number' }).positive('Loan term must be positive').int()
  ),
  insuranceRatePercentage: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number({ invalid_type_error: 'Must be a number' }).nonnegative('Cannot be negative').optional()
  ),
  insuranceAmount: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number({ invalid_type_error: 'Must be a number' }).nonnegative('Cannot be negative').optional()
  ),
  securityDeposit: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number({ invalid_type_error: 'Must be a number' }).nonnegative('Security deposit cannot be negative')
  ),
  securityDepositRepayable: z.boolean().default(false),
  monthlyRepaymentAmount: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number({ invalid_type_error: 'Must be a number' }).nonnegative('Cannot be negative').optional()
  ),
  monthlyRepaymentIsPercentage: z.boolean().default(false),
  loanAmountPaidAtTermEnd: z.boolean().default(false),
  canRenew: z.boolean().default(false),
  loanRenewalPercentage: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number({ invalid_type_error: 'Must be a number' }).nonnegative('Cannot be negative').optional()
  ),
  loanRenewalFixedCost: z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
    z.number({ invalid_type_error: 'Must be a number' }).nonnegative('Cannot be negative').optional()
  ),
  extraLoanCosts: z.array(extraLoanCostSchema).optional(),
  calculatedTerms: z.any().optional(), // To store results from AI
});

type FinanceFormData = z.infer<typeof financeOptionSchema>;

function CalculatorPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [financeOptions, setFinanceOptions] = useState<FinanceFormData[]>([]);
  const [editingOption, setEditingOption] = useState<FinanceFormData | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  const form = useForm<FinanceFormData>({
    resolver: zodResolver(financeOptionSchema),
    defaultValues: {
      financeSourceName: '',
      loanAmount: undefined,
      annualInterestRate: undefined,
      loanTermMonths: undefined,
      insuranceRatePercentage: undefined,
      insuranceAmount: undefined,
      securityDeposit: undefined,
      securityDepositRepayable: false,
      monthlyRepaymentAmount: undefined,
      monthlyRepaymentIsPercentage: false,
      loanAmountPaidAtTermEnd: false,
      canRenew: false,
      loanRenewalPercentage: undefined,
      loanRenewalFixedCost: undefined,
      extraLoanCosts: [],
    },
  });

  const { fields: extraCostsFields, append: appendExtraCost, remove: removeExtraCost } = useFieldArray({
    control: form.control,
    name: "extraLoanCosts",
  });

  const fetchFinanceOptions = useCallback(async () => {
    if (user && db) {
      try {
        const q = query(collection(db, "financeOptions"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const options: FinanceFormData[] = [];
        querySnapshot.forEach((doc) => {
          options.push({ id: doc.id, ...doc.data() } as FinanceFormData);
        });
        setFinanceOptions(options);
      } catch (error) {
        console.error("Error fetching finance options: ", error);
        toast({ title: "Error", description: "Failed to load saved finance options." });
      } finally {
        setIsLoadingOptions(false);
      }
    } else {
      setIsLoadingOptions(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchFinanceOptions();
    }
  }, [user, authLoading, router, fetchFinanceOptions]);


  const onSubmit = async (data: FinanceFormData) => {
    if (!user || !db) {
      toast({ title: "Error", description: "You must be logged in to add options." });
      return;
    }
    setIsSubmitting(true);
    try {
      let calculatedResults;
      try {
         calculatedResults = await calculateLoanTerm({
          ...data,
          loanAmount: Number(data.loanAmount),
          annualInterestRate: Number(data.annualInterestRate),
          loanTermMonths: Number(data.loanTermMonths),
          insuranceRatePercentage: data.insuranceRatePercentage ? Number(data.insuranceRatePercentage) : undefined,
          insuranceAmount: data.insuranceAmount ? Number(data.insuranceAmount) : undefined,
          securityDeposit: Number(data.securityDeposit),
          monthlyRepaymentAmount: data.monthlyRepaymentAmount ? Number(data.monthlyRepaymentAmount) : undefined,
          loanRenewalPercentage: data.loanRenewalPercentage ? Number(data.loanRenewalPercentage) : undefined,
          loanRenewalFixedCost: data.loanRenewalFixedCost ? Number(data.loanRenewalFixedCost) : undefined,
          extraLoanCosts: data.extraLoanCosts?.map(cost => ({...cost, amount: Number(cost.amount)})) || [],
        });
      } catch (aiError: any) {
        console.error("AI calculation error:", aiError);
        toast({title: "AI Calculation Error", description: aiError.message || "Failed to calculate terms with AI. Please check inputs.", variant: "destructive"});
        setIsSubmitting(false);
        return;
      }

      const optionWithTerms = { ...data, calculatedTerms: calculatedResults, userId: user.uid };

      if (editingOption && editingIndex !== null && editingOption.id) {
        // Update existing option in Firestore
        const optionRef = doc(db, "financeOptions", editingOption.id);
        await updateDoc(optionRef, optionWithTerms);
        const updatedOptions = [...financeOptions];
        updatedOptions[editingIndex] = { ...optionWithTerms, id: editingOption.id };
        setFinanceOptions(updatedOptions);
        toast({ title: "Success", description: "Finance option updated." });
      } else {
        // Add new option to Firestore
        const docRef = await addDoc(collection(db, "financeOptions"), optionWithTerms);
        setFinanceOptions([...financeOptions, { ...optionWithTerms, id: docRef.id }]);
        toast({ title: "Success", description: "Finance option added." });
      }
      form.reset();
      setEditingOption(null);
      setEditingIndex(null);
    } catch (error: any) {
      console.error("Error submitting finance option: ", error);
      toast({ title: "Error", description: error.message || "Failed to save finance option.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (index: number) => {
    const optionToEdit = financeOptions[index];
    setEditingOption(optionToEdit);
    setEditingIndex(index);
    form.reset(optionToEdit); // Populate form with option data
  };

  const handleDelete = async (index: number) => {
    if (!user || !db) return;
    const optionToDelete = financeOptions[index];
    if (!optionToDelete.id) return;

    try {
      await deleteDoc(doc(db, "financeOptions", optionToDelete.id));
      const updatedOptions = financeOptions.filter((_, i) => i !== index);
      setFinanceOptions(updatedOptions);
      toast({ title: "Success", description: "Finance option deleted." });
    } catch (error: any) {
      console.error("Error deleting finance option: ", error);
      toast({ title: "Error", description: error.message || "Failed to delete finance option." });
    }
  };

  const handleGenerateReportClick = () => {
    if (financeOptions.length === 0) {
      toast({ title: "No Options", description: "Please add at least one finance option to generate a report." });
      return;
    }
    router.push(`/report?financeOptions=${encodeURIComponent(JSON.stringify(financeOptions))}`);
  };
  
  if (authLoading || isLoadingOptions) {
    return <div className="container mx-auto p-4 flex justify-center items-center min-h-screen"><p>Loading calculator...</p></div>;
  }

  if (!user && !authLoading) {
    // This should ideally not be reached if AuthProvider handles redirection correctly
    // but as a fallback:
    return <div className="container mx-auto p-4 flex justify-center items-center min-h-screen"><p>Redirecting to login...</p></div>;
  }


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Finance Clarity Calculator</h1>

      <Card className="mb-8 shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle>{editingOption ? 'Edit Finance Option' : 'Add New Finance Option'}</CardTitle>
          <CardDescription>
            {editingOption ? 'Update the details of your finance option.' : 'Fill in the details to add a new finance option for comparison.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="financeSourceName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Finance Source Name</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., First Bank, UBA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="loanAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Amount (Naira)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="E.g., 1000000" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="annualInterestRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Interest Rate (%)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="E.g., 15" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="loanTermMonths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Term (Months)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="E.g., 12" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="insuranceRatePercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Rate (% of loan amount, annual)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Optional, e.g., 0.5" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="insuranceAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Amount (Fixed, annual)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Optional, e.g., 5000" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="securityDeposit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Security Deposit (Naira)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="E.g., 50000" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="securityDepositRepayable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Security Deposit Repayable?</FormLabel>
                        <FormDescription>
                          Is the security deposit returned at the end of the loan?
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="monthlyRepaymentAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Repayment Amount (Naira or %)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="E.g., 50000 or 5 (for %)" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="monthlyRepaymentIsPercentage"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Monthly Repayment is Percentage?</FormLabel>
                        <FormDescription>
                          Is the repayment amount a % of total loan?
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="loanAmountPaidAtTermEnd"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Loan Amount Paid At Term End?</FormLabel>
                        <FormDescription>
                          Is the full loan principal paid back at the end of the term?
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="canRenew"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Can the loan be renewed?</FormLabel>
                         <FormDescription>
                          Does this loan offer a renewal option?
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                 {form.watch('canRenew') && (
                  <>
                    <FormField
                      control={form.control}
                      name="loanRenewalPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loan Renewal Fee (% of loan amount)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Optional, e.g., 1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="loanRenewalFixedCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loan Renewal Fee (Fixed Cost)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Optional, e.g., 2000" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>

              <Separator className="my-6" />

              <div>
                <h3 className="text-lg font-medium mb-2">Extra Loan Costs</h3>
                {extraCostsFields.map((item, index) => (
                  <div key={item.id} className="flex items-center space-x-2 mb-2 p-3 border rounded-md">
                    <FormField
                      control={form.control}
                      name={`extraLoanCosts.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-grow">
                           <FormLabel className="sr-only">Cost Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Cost Name (e.g., Admin Fee)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`extraLoanCosts.${index}.amount`}
                      render={({ field }) => (
                        <FormItem>
                           <FormLabel className="sr-only">Cost Amount</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Amount" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <IconButton type="button" onClick={() => removeExtraCost(index)} aria-label="Remove cost" className="text-destructive">
                      <Trash2 size={18} />
                    </IconButton>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendExtraCost({ name: '', amount: undefined })}
                  className="mt-2"
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Extra Cost
                </Button>
              </div>

              <Button type="submit" className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting}>
                {isSubmitting ? (editingOption ? 'Updating...' : 'Adding...') : (editingOption ? 'Update Option' : 'Add Finance Option')}
              </Button>
              {editingOption && (
                <Button type="button" variant="outline" onClick={() => { setEditingOption(null); setEditingIndex(null); form.reset(); }} className="ml-2">
                  Cancel Edit
                </Button>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <div>
        <h2 className="text-2xl font-semibold mb-4">Added Finance Options</h2>
        {financeOptions.length === 0 && !isLoadingOptions && (
          <p className="text-muted-foreground">No finance options added yet. Fill out the form above to add your first option.</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {financeOptions.map((option, index) => (
            <Card key={option.id || index} className="shadow-md rounded-lg">
              <CardHeader>
                <CardTitle className="truncate">{option.financeSourceName}</CardTitle>
                <CardDescription>Loan Amount: N{Number(option.loanAmount).toLocaleString()}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p>Interest Rate: {option.annualInterestRate}% p.a.</p>
                <p>Term: {option.loanTermMonths} months</p>
                {option.calculatedTerms && (
                  <>
                    <Separator className="my-2" />
                    <p className="font-semibold">Calculated Results:</p>
                    <p>Total Interest: N{Number(option.calculatedTerms.totalInterestPaid).toLocaleString()}</p>
                    <p>Total Insurance: N{Number(option.calculatedTerms.totalInsuranceCost).toLocaleString()}</p>
                    <p>Cost of Finance: {option.calculatedTerms.costOfFinance}</p>
                    {option.canRenew && option.calculatedTerms.loanRenewalCost && <p>Est. Renewal Cost: {option.calculatedTerms.loanRenewalCost}</p>}
                  </>
                )}
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(index)}>Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(index)}>Delete</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {financeOptions.length > 0 && (
        <div className="mt-8 text-center">
          <Button onClick={handleGenerateReportClick} className="bg-primary hover:bg-primary/90" size="lg">
            Generate Comparative Report
          </Button>
        </div>
      )}
    </div>
  );
}

export default CalculatorPage;
