import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet } from 'lucide-react';
import { generateFLPTemplate } from '@/utils/generateFLPTemplate';
import { toast } from 'sonner';

export function ExportTemplateButton() {
  const handleExport = () => {
    try {
      generateFLPTemplate();
      toast.success('FLP Template downloaded successfully', {
        description: 'Check your downloads folder for Fusion_Lifecycle_Passport_Template.xlsx'
      });
    } catch (error) {
      toast.error('Failed to generate template', {
        description: 'Please try again or contact support'
      });
    }
  };

  return (
    <Button 
      onClick={handleExport}
      className="gap-2 bg-primary hover:bg-primary/90"
    >
      <FileSpreadsheet className="h-4 w-4" />
      <span>Download Excel Template</span>
      <Download className="h-4 w-4" />
    </Button>
  );
}
