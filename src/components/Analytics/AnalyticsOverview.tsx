import { useState, useEffect } from 'react';
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
  Filler
} from 'chart.js';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, subMonths, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalyticsData {
  appointments: {
    date: string;
    count: number;
  }[];
  clients: {
    date: string;
    count: number;
  }[];
  revenue: {
    date: string;
    amount: number;
  }[];
}

export const AnalyticsOverview = () => {
  const [period, setPeriod] = useState('30days');
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?period=${period}`);
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const getChartData = (dataset: any[], valueKey: string) => {
    const dates = dataset.map(item => format(new Date(item.date), 'dd MMM', { locale: fr }));
    const values = dataset.map(item => item[valueKey]);

    return {
      labels: dates,
      datasets: [
        {
          label: valueKey === 'count' ? 'Nombre' : 'Montant (€)',
          data: values,
          fill: true,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  if (!data) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analyses</h2>
        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList>
            <TabsTrigger value="7days">7 jours</TabsTrigger>
            <TabsTrigger value="30days">30 jours</TabsTrigger>
            <TabsTrigger value="90days">90 jours</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Rendez-vous</h3>
          <Line data={getChartData(data.appointments, 'count')} options={chartOptions} />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Nouveaux clients</h3>
          <Line data={getChartData(data.clients, 'count')} options={chartOptions} />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Chiffre d'affaires</h3>
          <Line data={getChartData(data.revenue, 'amount')} options={chartOptions} />
        </Card>
      </div>
    </div>
  );
};
