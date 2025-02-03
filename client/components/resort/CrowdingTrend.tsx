import { Line } from 'react-chartjs-2'

interface CrowdingTrendProps {
  data: {
    timestamp: string
    level: string
  }[]
}

export default function CrowdingTrend({ data }: CrowdingTrendProps) {
  const chartData = {
    labels: data.map(item => new Date(item.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Crowding Level',
        data: data.map(item => {
          switch (item.level.toLowerCase()) {
            case 'low': return 1
            case 'medium': return 2
            case 'high': return 3
            default: return 0
          }
        }),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  }

  return (
    <div>
      <Line data={chartData} />
    </div>
  )
}

