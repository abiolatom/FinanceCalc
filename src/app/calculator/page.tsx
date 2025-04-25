'use client';
 

 import {calculateLoanTerm} from '@/ai/flows/calculate-loan-term';
 import {generateComparativeReport} from '@/ai/flows/generate-comparative-report';
 import {Icons} from '@/components/icons';
 import {Button} from '@/components/ui/button';
-import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
+import {Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter} from '@/components/ui/card';
 import {Checkbox} from '@/components/ui/checkbox';
 import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog';
 import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
 import {Input} from '@/components/ui/input';
 import {Label} from '@/components/ui/label';
 import {Separator} from '@/components/ui/separator';
-import {Textarea} from '@/components/ui/textarea';
+import {ScrollArea} from "@/components/ui/scroll-area"
+import {Textarea} from '@/components/ui/textarea';
 import {useEffect, useState} from 'react';
 import {useForm} from 'react-hook-form';
 import {useRouter} from 'next/navigation';
@@ -53,7 +53,7 @@
   const [calculatedResults, setCalculatedResults] = useState<any>(null);
   const [loanAmountPaidAtTermEnd, setLoanAmountPaidAtTermEnd] = useState<boolean>(false);
   const [securityDepositRepayable, setSecurityDepositRepayable] = useState<boolean>(false);
-  const [canRenew, setCanRenew] = useState<boolean>(false);
+  const [canRenew, setCanRenew] = useState<boolean>(false);  
   const [loanRenewalPercentage, setLoanRenewalPercentage] = useState<number | undefined>(undefined);
   const [loanRenewalFixedCost, setLoanRenewalFixedCost] = useState<number | undefined>(undefined);
   const [showResults, setShowResults] = useState<boolean>(false);
@@ -64,6 +64,7 @@
   const router = useRouter();
   const searchParams = useSearchParams();
    const [user, loading, error] = useAuthState(auth);
+
 

   const createQueryString = (name: string, value: string) => {
     const params = new URLSearchParams(searchParams);
@@ -186,7 +187,7 @@
 
   const handleDeleteFinanceOption = async (index: number) => {
     if (!user) {
-      alert("You must be logged in to delete finance options.");
+      alert('You must be logged in to delete finance options.');
       return;
     }
 
@@ -248,12 +249,11 @@
     router.push(url);
   };
 

    useEffect(() => {
     const fetchFinanceOptions = async () => {
-      if (user) {
         try {
           const userRef = doc(db, "users", user.uid);
           const financeOptionsCollection = collection(userRef, "financeOptions");
@@ -265,20 +265,15 @@
           });
           setFinanceOptions(fetchedOptions);
         } catch (error: any) {
-          console.error("Error fetching finance options:", error.message);
+          console.error('Error fetching finance options:', error.message);
           alert("Failed to fetch finance options.");
         }
-      }
     };
 

     if (user) {
       fetchFinanceOptions();
     }
-  }, [user]);
-
-  useEffect(() => {
-    if (!user && !loading) {
-      router.push('/login');
     }
   }, [user, loading, router]);
 
@@ -502,7 +497,7 @@
           <h2 className="text-xl font-bold mb-4">Finance Options Added:</h2>
           <div className="grid gap-4">
             {financeOptions.map((option, index) => (
-              <Card key={index}>
+               <Card key={index}>
                 <CardHeader>
                   <CardTitle>{option.financeSourceName || `Option ${index + 1}`}</CardTitle>
                   <CardDescription>Details of the finance option:</CardDescription>
@@ -523,11 +518,13 @@
                       <p>Cost of Finance: {option.loanTerms.costOfFinance}</p>
                     </>
                   )}
+                 
                   <div className="flex space-x-2">
                     <Button size="sm" onClick={() => handleEditFinanceOption(index, option)}>Edit</Button>
                     <Button size="sm" variant="destructive" onClick={() => handleDeleteFinanceOption(index)}>Delete</Button>
                   </div>
                 </CardContent>
+
               </Card>
             ))}
           </div>
@@ -535,6 +532,7 @@
         </>
       )}
     </div>
+
   );
 }
 

