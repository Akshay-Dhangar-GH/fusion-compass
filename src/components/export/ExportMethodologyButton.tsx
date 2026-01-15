import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { generateMethodologyPDF } from '@/utils/generateMethodologyPDF';

export function ExportMethodologyButton() {
  const handleExport = () => {
    generateMethodologyPDF();
  };

  return (
    <Button onClick={handleExport} variant="outline" size="sm" className="gap-2">
      <FileText className="h-4 w-4" />
      Download Methodology PDF
    </Button>
  );
}
