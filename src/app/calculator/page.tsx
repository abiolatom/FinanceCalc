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
@@ -64,6 +64,11 @@
   const router = useRouter();
   const searchParams = useSearchParams();
    const [user, loading, error] = useAuthState(auth);
+
+    useEffect(() => {
+    if (!user && !loading) {
+      router.push('/login');
+    }
+  }, [user, loading, router]);
 

   const createQueryString = (name: string, value: string) => {
     const params = new URLSearchParams(searchParams);
@@ -534,6 +539,7 @@
         </>
       )}
     </div>
+
   );
 }
 

