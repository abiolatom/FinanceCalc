'use client';

import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Textarea} from '@/components/ui/textarea';
import {useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';
import { useAuth } from '@/components/AuthProvider'; // Corrected import path
import { toast } from '@/hooks/use-toast';


export default function ReportPage() {
  const [comparativeReport, setComparativeReport] = useState<string>('');
  const [financeOptions, setFinanceOptions] = useState<any[]>([]);
  const router = useRouter();
  const { user, loading: authLoading, firebaseReady } = useAuth();
  const [isLoadingReport, setIsLoadingReport] = useState(true);


  useEffect(() => {
    if (!authLoading && !user && firebaseReady) {
      router.push('/login');
    }
  }, [user, authLoading, router, firebaseReady]);

  useEffect(() => {
    // Retrieve finance options from sessionStorage
    const storedOptions = sessionStorage.getItem('financeOptionsForReport');
    if (storedOptions) {
      try {
        const parsedOptions = JSON.parse(storedOptions);
        setFinanceOptions(parsedOptions);
      } catch (error) {
        console.error('Error parsing finance options from sessionStorage:', error);
        setComparativeReport(
          'Error: Could not parse finance options from storage. Please try generating the report again.'
        );
        toast({title: "Error", description: "Could not load options for report. Please go back and try again.", variant: "destructive"});
        setIsLoadingReport(false);
      }
    } else if (firebaseReady && !authLoading) { // Only if auth is ready and not loading
        setComparativeReport('No finance options found to generate a report. Please add options in the calculator.');
        toast({title: "No Data", description: "No finance options found for report. Please go back to the calculator.", variant: "destructive"});
        setIsLoadingReport(false);
    }
  }, [firebaseReady, authLoading]); // Rerun if firebaseReady changes

  useEffect(() => {
    const fetchReport = async () => {
      if (financeOptions.length > 0) {
        setIsLoadingReport(true);
        try {
          // Use the Next.js API route which internally calls the Genkit flow
          const response = await fetch('/api/finance', { // Ensure this is the correct endpoint
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'generateComparativeReport', // Specify the action
              financeOptions: financeOptions, // Pass the options
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || 'Failed to generate comparative report from API'
            );
          }

          const reportData = await response.json();
          setComparativeReport(reportData.comparativeReport);
        } catch (error: any) {
          console.error('Error generating comparative report:', error.message);
          setComparativeReport(`Failed to generate comparative report: ${error.message}`);
          toast({title: "Report Generation Failed", description: error.message, variant: "destructive"});
        } finally {
            setIsLoadingReport(false);
        }
      } else if (firebaseReady && !authLoading && !sessionStorage.getItem('financeOptionsForReport')) {
        // This condition ensures we only set "No options" if auth is ready and there really are no options passed.
        setComparativeReport('No finance options provided to generate report.');
        setIsLoadingReport(false);
      }
    };

    if (firebaseReady && !authLoading) { // Only fetch if auth is ready
        fetchReport();
    }
  }, [financeOptions, firebaseReady, authLoading]); // Rerun if financeOptions or firebaseReady/authLoading changes

  const handleBackClick = () => {
    router.push('/calculator');
  };
  
  if (authLoading || !firebaseReady) {
    return <div className="container mx-auto p-4 flex justify-center items-center min-h-screen"><p>Loading report page...</p></div>;
  }

   if (!user && firebaseReady) {
    // This case should ideally be handled by the AuthProvider redirect
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <p>Redirecting to login...</p>
      </div>
    );
  }


  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Comparative Report</h1>
        <Button onClick={handleBackClick}>Back to Calculator</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Analysis</CardTitle>
          <CardDescription>
            A comparative report for all finance options:
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingReport ? (
            <p>Generating report, please wait...</p>
          ) : (
            <Textarea
              value={comparativeReport}
              readOnly
              className="min-h-[300px] bg-muted/20 p-4 rounded-md shadow"
              placeholder="Comparative report will appear here..."
            />
          )}
        </CardContent>
       </Card>
     </div>
  );
}
