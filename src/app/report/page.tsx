'use client';

import {generateComparativeReport} from '@/ai/flows/generate-comparative-report';
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

export default function ReportPage() {
  const searchParams = useSearchParams();
  const financeOptionsParam = searchParams.get('financeOptions');
  const [comparativeReport, setComparativeReport] = useState<string>('');
  const [financeOptions, setFinanceOptions] = useState<any[]>([]);
  const router = useRouter();

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
    const generateReport = async () => {
      if (financeOptions.length > 0) {
        try {
          const report = await generateComparativeReport({
            financeOptions,
          });
          setComparativeReport(report.comparativeReport);
        } catch (error: any) {
          console.error('Error generating comparative report:', error.message);
          setComparativeReport('Failed to generate comparative report.');
        }
      } else {
        setComparativeReport('No finance options added to generate report.');
      }
    };

    generateReport();
   }, [financeOptions]);

  const handleBackClick = () => {
    router.push('/');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Comparative Report</h1>

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
