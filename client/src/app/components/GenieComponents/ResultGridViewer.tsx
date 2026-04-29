/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataGrid } from '@mui/x-data-grid';

export default function ResultGridViewer({ rows, columns, sx }: any) {
  return (
    <div style={{ width: '100%', height: '100%' }}> {/* Ensure container takes full height */}
      <DataGrid 
        rows={rows} 
        columns={columns} 
        density="compact" 
        autoHeight={false} // Disable autoHeight to enable internal scrolling
        hideFooter 
        disableRowSelectionOnClick
        sx={{
          ...sx,
          '& .MuiDataGrid-virtualScroller': { overflow: 'auto' }, // Ensure scrollbar is visible
        }} 
      />
    </div>
  );
}