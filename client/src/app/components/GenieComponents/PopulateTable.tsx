/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, Suspense, lazy } from "react";
import { v4 as uuidv4 } from 'uuid';
import { Box, Typography, IconButton, Button, Collapse, CircularProgress, Skeleton, Alert, Tooltip } from '@mui/material';
import { getCookie } from '../../services/csrfCookie/csrf';

import {
  TableIcon,
  DownloadIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from "@databricks/design-system";

import ResultGridViewer from "./ResultGridViewer";
import SqlQueryEditor from "./SqlQueryEditor";
import DynamicGenieChart from "./DynamicGenieChart";

const isIdColumn = (headerName: string) => headerName.toLowerCase().includes("id");

const tableCellFormatter = (value: any, headerName: string) => {
    if (value === null || value === undefined) return "null";
    const num = Number(value);
    if (isIdColumn(headerName) || isNaN(num) || typeof value === 'boolean') return value;
    // if (num >= 1000000) return (num / 1000000).toLocaleString(undefined, { maximumFractionDigits: 2 }) + "M";
    return num.toLocaleString();
};

function PopulateTable({ data, query,query_parameter, rowCount, onUpdateData, spaceName, conversationId, initialChartType }: any) {
    const [isMinimized, setIsMinimized] = useState(false);
    const [showCode, setShowCode] = useState(false);
    const [editableQuery, setEditableQuery] = useState(query || '');
    const [isExecuting, setIsExecuting] = useState(false);
    const [errorData, setErrorData] = useState<string | null>(null);

    // Fixed height for the scrollable area
    // const FIXED_TABLE_HEIGHT = 400;

    const rows = useMemo(() => {
        if (!data?.data) return [];
        return data.data.map((row: any) => ({ id: uuidv4(), ...row }));
    }, [data]);

    const formattedColumns = useMemo(() => {
        if (!data?.columns) return [];
        return [
            { 
                field: 'rowNo', 
                headerName: '#', 
                width: 60, 
                renderCell: (params: any) => rows.findIndex((r: any) => r.id === params.id) + 1 
            },
            ...data.columns.map((col: any) => ({ 
                ...col, 
                flex: 1, 
                minWidth: 150,
                renderCell: (params: any) => {
                    const value = params.value;
                    const headerName = col.headerName || "";
                    if (value === null || value === undefined) return <Typography sx={{ fontSize: 'inherit', color: '#999', fontStyle: 'italic' }}>null</Typography>;
                    const formattedValue = tableCellFormatter(value, headerName);
                    if (isIdColumn(headerName)) return <Typography sx={{ fontSize: 'inherit' }}>{formattedValue}</Typography>;
                    return (
                        <Tooltip title={value.toLocaleString()}>
                            <Typography sx={{ fontSize: 'inherit' }}>{formattedValue}</Typography>
                        </Tooltip>
                    );
                }
            }))
        ];
    }, [data.columns, rows]);

    const handleDownload = () => {
        if (!data?.data) return;
        const headers = data.columns.map((c: any) => c.headerName).join(',');
        const csvRows = data.data.map((row: any) => 
            data.columns.map((c: any) => {
                const val = row[c.field];
                return val === null ? "null" : `"${val ?? ''}"`;
            }).join(',')
        );
        const blob = new Blob([[headers, ...csvRows].join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Genie_Export_${new Date().getTime()}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleRunQuery = async () => {
        setIsExecuting(true);
        setErrorData(null);
         let warehouseId = "";
        try {
            const cachedMetadata = localStorage.getItem('genie_spaces_metadata');
            if (cachedMetadata) {
                const parsed = JSON.parse(cachedMetadata);
                warehouseId = parsed.data?.[spaceName]?.warehouse_id || "";
            }
        } catch (e) { console.error("Metadata parse error", e); }
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/genie/run-query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('XSRF-TOKEN') || '' },
                body: JSON.stringify({ message: editableQuery, space_name: spaceName, conversation_id: conversationId,query_parameter:query_parameter,
                    warehouse_id:warehouseId}),
            });
            const res = await response.json();
            if (res.status === "success") {
                onUpdateData(res.data.table_data, res.data.row_count);
            } else {
                setErrorData(res.message);
            }
        } catch (error) { 
            console.error({error});
            setErrorData("Network error: Connection failed.");
        } finally {
            setIsExecuting(false);
        }
    };
    // 1. Define Constants for height calculation
    const ROW_HEIGHT = 36; // Compact density height
    const HEADER_HEIGHT = 40;
    const MAX_ROWS_BEFORE_SCROLL = 10;
    const MAX_HEIGHT = (ROW_HEIGHT * MAX_ROWS_BEFORE_SCROLL) + HEADER_HEIGHT;

    // 2. Calculate dynamic height
    // If rowCount is less than 10, it wraps. If more, it stays at MAX_HEIGHT.
    const dynamicHeight = rowCount > 0 && rowCount < MAX_ROWS_BEFORE_SCROLL 
        ? (rowCount * ROW_HEIGHT) + HEADER_HEIGHT + 2 // +2 for borders
        : MAX_HEIGHT;

    return (
        <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden', bgcolor: '#fff', mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 0.7, borderBottom: '1px solid #f0f0f0', bgcolor: '#fafafa' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Suspense fallback={<CircularProgress size={14} />}>
                        <TableIcon onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
                    </Suspense>
                    <Typography sx={{ fontSize: '11px', fontWeight: 700 }}>RESULT TABLE ({rowCount} rows)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Tooltip title="Download CSV">
                        <IconButton size="small" onClick={handleDownload} sx={{ mr: 1 }}>
                            <Suspense fallback={<CircularProgress size={14} />}>
                                <DownloadIcon onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
                            </Suspense>
                        </IconButton>
                    </Tooltip>
                    <Button size="small" sx={{ fontSize: '10px', fontWeight: 700 }} onClick={() => setShowCode(!showCode)}>
                        {showCode ? 'SHOW TABLE' : 'SHOW CODE'}
                    </Button>
                    <IconButton size="small" onClick={() => setIsMinimized(!isMinimized)}>
                        <Suspense fallback={<CircularProgress size={14} />}>
                            {isMinimized ? <ChevronDownIcon onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} /> : <ChevronUpIcon onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />}
                        </Suspense>
                    </IconButton>
                </Box>
            </Box>

            <Collapse in={!isMinimized}>
                <Suspense fallback={<Box sx={{ p: 2, textAlign: 'center' }}><CircularProgress size={20} /></Box>}>
                    <Collapse in={showCode}>
                        <Box sx={{ bgcolor: '#1e1e1e', borderBottom: '1px solid #333' }}>
                            <SqlQueryEditor value={editableQuery} onChange={setEditableQuery} isExecuting={isExecuting} />
                            <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button variant="contained" size="small" onClick={handleRunQuery} disabled={isExecuting} sx={{ fontSize: '11px', bgcolor: '#444795' }}>RUN QUERY</Button>
                            </Box>
                        </Box>
                    </Collapse>
                    
                    {errorData && <Alert severity="error" sx={{ borderRadius: 0 }}>{errorData}</Alert>}

                    <Box sx={{ position: 'relative' }}>
                        {isExecuting ? (
                             <Box sx={{ p: 2 }}><Skeleton variant="rectangular" width="100%" height="100px" /></Box>
                        ) : (
                            <>
                                {/* This Box provides the scrollable viewport */}
                                <Box sx={{ 
                                    height: `${dynamicHeight}px`, 
                                    width: '100%',
                                    transition: 'height 0.2s ease' // Smooth transition if data updates
                                }}>
                                    <ResultGridViewer 
                                        rows={rows} 
                                        columns={formattedColumns} 
                                        sx={{ border: 'none' }} 
                                    />
                                </Box>
                                
                                {initialChartType && rowCount > 0 && rowCount <= 20 && (
                                    <Box sx={{ p: 2, borderTop: '1px solid #f0f0f0', bgcolor: '#fafafa' }}>
                                        <DynamicGenieChart data={data.data} columns={data.columns} initialType={initialChartType} />
                                    </Box>
                                )}
                            </>
                        )}
                    </Box>
                </Suspense>
            </Collapse>
        </Box>
    );
}

export default PopulateTable;