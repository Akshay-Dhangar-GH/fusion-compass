import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { generateMethodologyPDF } from '@/utils/generateMethodologyPDF';
import { generatePWRMethodologyPDF } from '@/utils/generatePWRMethodologyPDF';
import { usePlant } from '@/contexts/PlantContext';

export function ExportMethodologyButton() {
  const { plantType } = usePlant();

  const handleExport = () => {
    if (plantType === 'pwr') {
      generatePWRMethodologyPDF();
    } else {
      generateMethodologyPDF();
    }
  };

  return (
    <Button onClick={handleExport} variant="outline" size="sm" className="gap-2">
      <FileText className="h-4 w-4" />
      Download Methodology PDF
    </Button>
  );
}
