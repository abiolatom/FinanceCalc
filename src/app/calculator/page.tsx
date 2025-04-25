'use client';
 

 import {calculateLoanTerm} from '@/ai/flows/calculate-loan-term';
 import {generateComparativeReport} from '@/ai/flows/generate-comparative-report';
 import {useState, useEffect, useCallback} from 'react';
 import {useForm, Controller} from 'react-hook-form';
-+import { zodResolver } from '@hookform/resolvers/zod';
 +import {zodResolver} from '@hookform/resolvers/zod';
 import * as z from 'zod';
 import {Button} from '@/components/ui/button';
@@ -45,7 +45,7
  Select,
  SelectContent,
 - SelectLabel,
+
  SelectItem,
  SelectTrigger,
  SelectValue,
@@ -355,4 +355,4
  }
  
 
-+
 \ No newline at end of file
+

