import { useState } from "react";
import { FileText, Download, Calendar, Filter } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReportsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate?: (config: ReportConfig) => void;
}

interface ReportConfig {
  type: string;
  dateRange: string;
  format: string;
}

const reportTypes = [
  { value: "alerts", label: "Alert Summary", desc: "Overview of all alerts and resolutions" },
  { value: "tourists", label: "Tourist Activity", desc: "Tourist movements and check-ins" },
  { value: "zones", label: "Zone Analytics", desc: "Zone violations and frequency" },
  { value: "police", label: "Police Response", desc: "Response times and dispatches" },
  { value: "system", label: "System Health", desc: "System performance metrics" },
];

const dateRanges = [
  { value: "today", label: "Today" },
  { value: "7days", label: "Last 7 Days" },
  { value: "30days", label: "Last 30 Days" },
  { value: "90days", label: "Last 90 Days" },
];

export function ReportsDialog({ open, onOpenChange, onGenerate }: ReportsDialogProps) {
  const [config, setConfig] = useState<ReportConfig>({
    type: "alerts",
    dateRange: "7days",
    format: "pdf",
  });

  const handleGenerate = () => {
    onGenerate?.(config);
    onOpenChange(false);
  };

  const selectedReport = reportTypes.find((r) => r.value === config.type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Generate Report
          </DialogTitle>
          <DialogDescription>
            Create downloadable reports for analysis and records.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Report Type */}
          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type</Label>
            <Select
              value={config.type}
              onValueChange={(v) => setConfig({ ...config, type: v })}
            >
              <SelectTrigger id="reportType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedReport && (
              <p className="text-xs text-slate-500">{selectedReport.desc}</p>
            )}
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label htmlFor="dateRange" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Date Range
            </Label>
            <Select
              value={config.dateRange}
              onValueChange={(v) => setConfig({ ...config, dateRange: v })}
            >
              <SelectTrigger id="dateRange">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Format */}
          <div className="space-y-2">
            <Label htmlFor="reportFormat">Export Format</Label>
            <Select
              value={config.format}
              onValueChange={(v) => setConfig({ ...config, format: v })}
            >
              <SelectTrigger id="reportFormat">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                <SelectItem value="xlsx">Excel Workbook</SelectItem>
                <SelectItem value="json">JSON Data</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preview Info */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-medium text-slate-700 mb-2">Report Preview</h4>
            <div className="text-sm text-slate-600 space-y-1">
              <p><strong>Type:</strong> {selectedReport?.label}</p>
              <p><strong>Period:</strong> {dateRanges.find(r => r.value === config.dateRange)?.label}</p>
              <p><strong>Format:</strong> {config.format.toUpperCase()}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-1.5" />
            Generate Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
