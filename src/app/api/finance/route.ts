import { NextRequest, NextResponse } from 'next/server';
import { calculateLoanTerm } from '@/ai/flows/calculate-loan-term';
import { generateComparativeReport, GenerateComparativeReportParams } from '@/ai/flows/generate-comparative-report';

export async function POST(req: NextRequest) {
  try {
    const { action, ...params } = await req.json();

    if (action === 'calculateLoanTerm') {
      const results = await calculateLoanTerm(params);
      return NextResponse.json(results);
    } else if (action === 'generateComparativeReport') {
      const results = await generateComparativeReport(params as GenerateComparativeReportParams);
      return NextResponse.json(results);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error in API route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}