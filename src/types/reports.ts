export type ReportType = 'social' | 'salary' | 'budget' | 'hr';

export interface Report {
  id: string;
  type: ReportType;
  title: string;
  description: string;
  date: string;
  data: any;
  status: 'draft' | 'published' | 'archived';
} 