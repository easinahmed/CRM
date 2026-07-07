export function downloadCSV(data, filename = 'export.csv') {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((h) => {
        const val = row[h];
        if (val === null || val === undefined) return '';
        const str = String(val);
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      }).join(',')
    ),
  ].join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadJSON(data, filename = 'export.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printReport(title) {
  window.print();
}

export function openReportWindow(title, content) {
  const win = window.open('', '_blank');
  win.document.write(`
    <html><head><title>${title}</title>
    <style>
      body { font-family: system-ui, sans-serif; padding: 40px; color: #1e293b; }
      h1 { font-size: 24px; margin-bottom: 8px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
      th { background: #f8fafc; font-weight: 600; color: #475569; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
      .summary { display: flex; gap: 24px; margin: 20px 0; flex-wrap: wrap; }
      .stat { background: #f8fafc; padding: 16px 24px; border-radius: 8px; border: 1px solid #e2e8f0; }
      .stat-label { font-size: 12px; color: #64748b; text-transform: uppercase; }
      .stat-value { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 4px; }
      .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
    </style></head><body>
    <h1>${title}</h1>
    <p style="color:#64748b;">Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    ${content}
    <div class="footer">Enterprise CRM — Confidential</div>
    <script>window.print();<\/script>
    </body></html>
  `);
  win.document.close();
}

export function flattenReportData(data, label) {
  if (!data || !data.length) return [];
  return data.map((item, idx) => {
    const row = { '#': idx + 1 };
    Object.keys(item).forEach((key) => {
      const val = item[key];
      if (val === null || val === undefined) {
        row[key] = '';
      } else if (typeof val === 'object' && !Array.isArray(val)) {
        Object.keys(val).forEach((sub) => {
          row[`${key}_${sub}`] = val[sub] ?? '';
        });
      } else if (Array.isArray(val)) {
        row[key] = val.length;
      } else {
        row[key] = val;
      }
    });
    return row;
  });
}
