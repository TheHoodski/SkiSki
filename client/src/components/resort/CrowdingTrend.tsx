// client/src/components/resort/CrowdingTrend.tsx

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  TooltipItem,
  Scale,
  CoreScaleOptions
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CrowdingTrendProps {
  data: {
    timestamp: string;
    crowd_level: string;
    confidence: number;
  }[];
}

const crowdLevelToNumber = (level: string): number => {
  switch (level.toLowerCase()) {
    case 'low': return 1;
    case 'medium': return 2;
    case 'high': return 3;
    default: return 0;
  }
};

export default function CrowdingTrend({ data }: CrowdingTrendProps) {
  // Sort data chronologically
  const sortedData = [...data].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const chartData: ChartData<'line'> = {
    labels: sortedData.map(item => {
      const date = new Date(item.timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }),
    datasets: [
      {
        label: 'Crowding Level',
        data: sortedData.map(item => crowdLevelToNumber(item.crowd_level)),
        borderColor: 'rgb(23, 195, 178)',
        backgroundColor: 'rgba(23, 195, 178, 0.5)',
        tension: 0.2,
        pointRadius: 4,
        pointBackgroundColor: 'rgb(23, 195, 178)',
      },
      {
        label: 'Confidence',
        data: sortedData.map(item => item.confidence),
        borderColor: 'rgb(30, 61, 89)',
        backgroundColor: 'rgba(30, 61, 89, 0.5)',
        tension: 0.2,
        borderDash: [5, 5],
        pointRadius: 2,
        yAxisID: 'confidence',
        hidden: true, // Hidden by default, can be toggled
      }
    ]
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        type: 'linear' as const,
        beginAtZero: true,
        max: 4,
        ticks: {
          callback: function(this: Scale<CoreScaleOptions>, tickValue: number | string) {
            const value = Number(tickValue);
            switch (value) {
              case 0: return 'Unknown';
              case 1: return 'Low';
              case 2: return 'Medium';
              case 3: return 'High';
              default: return '';
            }
          }
        }
      },
      confidence: {
        type: 'linear' as const,
        beginAtZero: true,
        max: 1,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Confidence'
        },
        ticks: {
          callback: function(this: Scale<CoreScaleOptions>, value: number | string) {
            return `${(Number(value) * 100).toFixed(0)}%`;
          }
        },
        grid: {
          drawOnChartArea: false
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          title: (tooltipItems: TooltipItem<'line'>[]) => {
            const index = tooltipItems[0].dataIndex;
            const date = new Date(sortedData[index].timestamp);
            return date.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div className="bg-fresh-snow p-4 rounded-lg shadow">
      <Line data={chartData} options={options} />
    </div>
  );
}