'use client';
 

 import {calculateLoanTerm} from '@/ai/flows/calculate-loan-term';
 import {generateComparativeReport} from '@/ai/flows/generate-comparative-report';
 import {useState, useEffect, useCallback} from 'react';
 import {useForm, Controller} from 'react-hook-form';
 import {zodResolver} from '@hookform/resolvers/zod';
 import * as z from 'zod';
 import {Button} from '@/components/ui/button';
