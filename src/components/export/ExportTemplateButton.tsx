import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet } from 'lucide-react';
import { generateFLPTemplate } from '@/utils/generateFLPTemplate';
import { generatePWRTemplate } from '@/utils/generatePWRTemplate';
import { usePlant } from '@/contexts/PlantContext';
import { toast } from 'sonner';

export function ExportTemplateButton() {
  const { plantType } = usePlant();

  const handleExport = () => {
    try {
      if (plantType === 'pwr') {
        generatePWRTemplate();
        toast.success('PWR Template downloaded successfully', {
          description: 'Check your downloads folder for PWR_Lifecycle_Passport_Template.xlsx',
        });
      } else {
        generateFLPTemplate();
        toast.success('Fusion Template downloaded successfully', {
          description: 'Check your downloads folder for Fusion_Lifecycle_Passport_Template.xlsx',
        });
      }
    } catch (error) {
      toast.error('Failed to generate template', {
        description: 'Please try again or contact support',
      });
    }
  };

  return (
    <Button onClick={handleExport} className="gap-2 bg-primary hover:bg-primary/90">
      <FileSpreadsheet className="h-4 w-4" />
      <span>Download Excel Template</span>
      <Download className="h-4 w-4" />
    </Button>
  );
}
