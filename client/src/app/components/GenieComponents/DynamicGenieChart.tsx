/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2';
import { Box, Paper, Typography, MenuItem, Select, FormControl } from '@mui/material';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, ChartTooltip, Legend, ChartDataLabels);

// --- HELPER FUNCTIONS ---

const isIdColumn = (headerName: string) => headerName.toLowerCase().includes("id");

const millionFormatter = (value: string | number) => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numValue)) return value;

  // if (numValue >= 1000000) {
  //   return (numValue / 1000000).toLocaleString(undefined, { maximumFractionDigits: 1 }) + "M";
  // } else if (numValue >= 1000) {
  //   return (numValue / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 }) + "K";
  // }
  return numValue.toLocaleString();
};

interface Props {
  data: any[];
  columns: any[];
  initialType: string;
}

const DynamicGenieChart: React.FC<Props> = ({ data, columns, initialType }) => {
  const [chartType, setChartType] = useState<any>(initialType);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setChartType(initialType);
  }, [initialType]);

  const limitedData = data.slice(0, 20);
  const labelCol = columns.find(col => typeof limitedData[0]?.[col.field] === 'string') || columns[0];
  
  // Filter value columns and keep their metadata for formatting checks
  const valueCols = columns.filter(col => col.field !== labelCol.field && !isNaN(parseFloat(limitedData[0]?.[col.field])));
  const valueHeader = valueCols[0]?.headerName || "Value";

  if (valueCols.length === 0 || limitedData.length === 0) return null;

  // Check if the primary value column is an ID column
  const isPrimaryValueAnId = isIdColumn(valueHeader);

  const colors = ['rgba(68, 71, 149, 0.7)', 'rgba(219, 87, 119, 0.7)', 'rgba(75, 192, 192, 0.7)', 'rgba(255, 159, 64, 0.7)'];

  const chartData = {
    labels: limitedData.map(row => row[labelCol.field]),
    datasets: valueCols.map((col, index) => ({
      label: col.headerName || col.field,
      data: limitedData.map(row => parseFloat(row[col.field])),
      backgroundColor: (chartType === 'pie' || chartType === 'donut') ? colors : colors[index % 4],
      borderColor: colors[index % 4].replace('0.7', '1'),
      borderWidth: 1,
      fill: chartType === 'line' ? false : true,
      tension: 0.4,
    })),
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: chartType === 'horizontalBar' ? 'y' : 'x',
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || '';
            const rawValue = context.parsed.y ?? context.parsed;
            if (label) label += ': ';
            // Always show full comma-separated value in tooltip
            label += rawValue !== null ? rawValue.toLocaleString() : '';
            return label;
          }
        }
      },
      datalabels: {
        display: (chartType !== 'line'),
        anchor: 'end',
        align: 'top',
        formatter: (val: number) => {
            // Skip M/K formatting if it's an ID column
            return isPrimaryValueAnId ? val.toString() : millionFormatter(val);
        },
        font: { size: 9, weight: 'bold' },
        clip: false,
      },
    },
    scales: (chartType === 'pie' || chartType === 'donut') ? {} : {
        y: { 
            beginAtZero: true, 
            grid: { color: '#f0f0f0' },
            ticks: {
                callback: (value: any) => {
                    // Skip M/K formatting on axis if it's an ID column
                    return isPrimaryValueAnId ? value : millionFormatter(value);
                }
            }
        },
        x: { grid: { display: false } }
    }
  };

  return (
    <Paper ref={chartContainerRef} variant="outlined" sx={{ p: 2, mt: 1, bgcolor: '#fcfcfc', borderRadius: '8px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: '#444795', textTransform: 'uppercase' }}>
            {valueHeader} by {labelCol.headerName}
        </Typography>
        
        <FormControl size="small">
            <Select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                sx={{ fontSize: '11px', height: '28px', minWidth: '120px', bgcolor: '#fff' }}
                MenuProps={{ disablePortal: true, PaperProps: { sx: { zIndex: 20002 } } }}
            >
                <MenuItem value="bar" sx={{ fontSize: '11px' }}>Bar Chart</MenuItem>
                <MenuItem value="horizontalBar" sx={{ fontSize: '11px' }}>Horizontal Bar</MenuItem>
                <MenuItem value="line" sx={{ fontSize: '11px' }}>Line Chart</MenuItem>
                <MenuItem value="pie" sx={{ fontSize: '11px' }}>Pie Chart</MenuItem>
                <MenuItem value="donut" sx={{ fontSize: '11px' }}>Donut Chart</MenuItem>
            </Select>
        </FormControl>
      </Box>

      <Box sx={{ height: 280 }}>
        {chartType === 'line' && <Line data={chartData} options={options} />}
        {chartType === 'pie' && <Pie data={chartData} options={options} />}
        {chartType === 'donut' && <Doughnut data={chartData} options={options} />}
        {(chartType === 'bar' || chartType === 'horizontalBar') && <Bar data={chartData} options={options} />}
      </Box>
    </Paper>
  );
};

export default DynamicGenieChart;