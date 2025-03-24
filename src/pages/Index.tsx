
import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import ActivityItem from '@/components/ActivityItem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers, CheckCircle, Clock, Plus, ListChecks } from 'lucide-react';

const Index = () => {
  // Normally this data would come from an API
  const [hasActivity] = useState(false);
  
  // Sample activities data
  const activities = [
    {
      id: 1,
      title: "Handmade Ceramic Mug",
      time: "2 hours ago",
      status: "completed" as const,
    },
    {
      id: 2,
      title: "Wooden Cutting Board",
      time: "5 hours ago",
      status: "in-progress" as const,
    },
    {
      id: 3,
      title: "Custom Portrait Drawing",
      time: "1 day ago",
      status: "created" as const,
    },
  ];
  
  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <section className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Welcome back, John</h1>
            <p className="text-muted-foreground">
              Let's boost your Etsy shop with AI-powered listings
            </p>
          </div>
          
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 shadow-sm">
            <Plus size={18} />
            Create New Listing
          </Button>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Listings" 
          value="24" 
          icon={<Layers size={24} />} 
          trend={{ value: 12, label: "from last month", positive: true }}
        />
        
        <StatCard 
          title="Completed Today" 
          value="3" 
          icon={<CheckCircle size={24} />} 
          trend={{ value: 30, label: "from yesterday", positive: true }}
        />
        
        <StatCard 
          title="In Progress" 
          value="5" 
          icon={<Clock size={24} />} 
          trend={{ value: 2, label: "from yesterday", positive: false }}
        />
      </section>
      
      {/* Recent Activity Section */}
      <section>
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">Recent Activity</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Your latest actions and updates
                </CardDescription>
              </div>
              
              <Button variant="outline" size="sm" className="gap-2">
                <ListChecks size={16} />
                View All
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            {hasActivity ? (
              <div className="divide-y divide-border">
                {activities.map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    title={activity.title}
                    time={activity.time}
                    status={activity.status}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="bg-muted/50 p-4 rounded-full mb-4">
                  <ListChecks size={24} className="text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-1">No activity yet</h3>
                <p className="text-muted-foreground max-w-md">
                  When you create or update listings, they'll appear here. Get started by creating your first listing.
                </p>
                <Button className="mt-6 bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-2">
                  <Plus size={16} />
                  Create First Listing
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </DashboardLayout>
  );
};

export default Index;
