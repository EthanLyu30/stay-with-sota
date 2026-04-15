'use client';

interface ExportButtonProps {
  digestId: string;
  date: string;
}

export default function ExportButton({ digestId, date }: ExportButtonProps) {
  const handleExport = () => {
    window.open(`/api/export/${digestId}`, '_blank');
  };

  return (
    <button className="btn btn-secondary btn-sm" onClick={handleExport}>
      📄 导出 Markdown
    </button>
  );
}
