import { ChartCard } from './ChartCard';

interface ChartsData {
  users_chart?: Array<{ date: string; users: number }>;
  videos_chart?: Array<{ date: string; videos: number }>;
  engagement_chart?: Array<{ date: string; likes: number; comments: number }>;
  reports_chart?: Array<{ date: string; reports: number }>;
}

interface ChartsGridProps {
  chartsData?: ChartsData;
}

/**
 * ChartsGrid - Grid layout for charts
 * Displays multiple analytics charts in responsive grid
 */
export function ChartsGrid({ chartsData }: ChartsGridProps) {
  // Transform data to match ChartCard format (name, value)
  const usersData = chartsData?.users_chart?.map(item => ({
    name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: item.users
  })) || [];

  const videosData = chartsData?.videos_chart?.map(item => ({
    name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: item.videos
  })) || [];

  const reportsData = chartsData?.reports_chart?.map(item => ({
    name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: item.reports
  })) || [];

  return (
    <>
      {/* Charts Grid - 3 columns in one row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="User Growth"
          subtitle="New users over the last 7 days"
          data={usersData}
          type="area"
          color="#3b82f6"
        />
        <ChartCard
          title="Video Uploads"
          subtitle="Videos uploaded over the last 7 days"
          data={videosData}
          type="bar"
          color="#a855f7"
        />
        <ChartCard
          title="Reports Activity"
          subtitle="Reports submitted over time"
          data={reportsData}
          type="area"
          color="#ef4444"
        />
      </div>
    </>
  );
}
