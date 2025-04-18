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
import {useRouter, useSearchParams} from 'next/navigation';
import {useEffect, useState} from 'react';
import {auth, db} from '@/config/firebase';
import {useAuthState} from 'react-firebase-hooks/auth';

export default function ReportPage() {
  const searchParams = useSearchParams();
  const financeOptionsParam = searchParams.get('financeOptions');
  const [comparativeReport, setComparativeReport] = useState<string>('');
  const [financeOptions, setFinanceOptions] = useState<any[]>([]);
  const router = useRouter();
   const [user, loading, error] = useAuthState(auth);

  useEffect(() => {
    if (financeOptionsParam) {
      try {
        const parsedOptions = JSON.parse(financeOptionsParam);
        setFinanceOptions(parsedOptions);
      } catch (error) {
        console.error('Error parsing finance options:', error);
        setComparativeReport(
          'Error: Could not parse finance options. Please check the input.'
        );
        return;
      }
    }
  }, [financeOptionsParam]);

  useEffect(() => {
    const fetchReport = async () => {
      if (financeOptions.length > 0) {
        try {
          const response = await fetch('/api/finance', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'generateComparativeReport',
              financeOptions: financeOptions,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || 'Failed to generate comparative report'
            );
          }

          const report = await response.json();
          setComparativeReport(report.comparativeReport);
        } catch (error: any) {
          console.error('Error generating comparative report:', error.message);
          setComparativeReport('Failed to generate comparative report.');
        }
      } else {
        setComparativeReport('No finance options added to generate report.');
      }
    };

    fetchReport();
  }, [financeOptions]);

  const handleBackClick = () => {
    router.push('/calculator');
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Comparative Report</h1>
       <Button onClick={() => router.push('/calculator')}>Go to Calculator Page</Button>
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Analysis</CardTitle>
          <CardDescription>
            A comparative report for all finance options:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={comparativeReport}
            readOnly
            className="min-h-[300px]"
          />
        </CardContent>
       </Card>
       <Button onClick={handleBackClick}>Back to Calculator Page</Button>
     </div>
  );
}
