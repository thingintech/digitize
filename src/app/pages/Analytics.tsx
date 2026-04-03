import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Button } from '../components/ui';
import { Star, TrendingUp, Users, Smartphone, MessageSquare, MoreVertical, Filter } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export function Analytics() {
  const scanData = [
    { name: 'Mon', scans: 120, unique: 80 },
    { name: 'Tue', scans: 145, unique: 95 },
    { name: 'Wed', scans: 110, unique: 70 },
    { name: 'Thu', scans: 180, unique: 120 },
    { name: 'Fri', scans: 250, unique: 180 },
    { name: 'Sat', scans: 340, unique: 250 },
    { name: 'Sun', scans: 290, unique: 210 },
  ];

  const popularItems = [
    { name: 'Avocado Toast', orders: 156, revenue: '$1,872' },
    { name: 'Iced Matcha Latte', orders: 134, revenue: '$804' },
    { name: 'Eggs Benedict', orders: 98, revenue: '$1,470' },
    { name: 'Truffle Fries', orders: 85, revenue: '$722' },
  ];

  const reviews = [
    { id: 1, author: 'Sarah Jenkins', rating: 5, date: '2 days ago', text: 'Love the new digital menu! So easy to use and the pictures make everything look delicious. The avocado toast is a must-try.', platform: 'Google Maps' },
    { id: 2, author: 'Mike Ross', rating: 4, date: '1 week ago', text: 'Great coffee, friendly staff. Scanning the code on the table was super convenient.', platform: 'Direct Feedback' },
    { id: 3, author: 'Emily Chen', rating: 5, date: '2 weeks ago', text: 'Best brunch spot in town. I love that I can order directly from my phone while waiting for a table.', platform: 'Google Maps' },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Reviews & Analytics</h1>
          <p className="text-slate-500 mt-1">Track your digital menu performance and customer sentiment.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Last 7 Days
          </Button>
          <Button variant="primary">Export Report</Button>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Scans', value: '1,435', change: '+22%', icon: Smartphone, color: 'text-blue-600' },
          { title: 'Unique Visitors', value: '1,005', change: '+18%', icon: Users, color: 'text-purple-600' },
          { title: 'Avg. Rating', value: '4.8', change: '+0.1', icon: Star, color: 'text-yellow-500' },
          { title: 'Total Reviews', value: '342', change: '+12', icon: MessageSquare, color: 'text-green-600' },
        ].map((metric, i) => (
          <Card key={i}>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{metric.title}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{metric.value}</h3>
                  <span className="text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                    {metric.change}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 ${metric.color}`}>
                <metric.icon className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Scan Activity</CardTitle>
            <CardDescription>Daily menu scans vs unique visitors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scanData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs key="defs">
                    <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1" key="grad1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} key="stop1"/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} key="stop2"/>
                    </linearGradient>
                    <linearGradient id="colorUnique" x1="0" y1="0" x2="0" y2="1" key="grad2">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} key="stop3"/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} key="stop4"/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid key="grid" strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis key="xaxis" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis key="yaxis" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip 
                    key="tooltip"
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend key="legend" iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Area key="area1" type="monotone" dataKey="scans" name="Total Scans" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorScans)" />
                  <Area key="area2" type="monotone" dataKey="unique" name="Unique Visitors" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUnique)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Popular Items List */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Items</CardTitle>
            <CardDescription>Most viewed/ordered from menu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {popularItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 font-bold flex items-center justify-center text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white text-sm">{item.name}</h4>
                      <p className="text-xs text-slate-500">{item.orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">{item.revenue}</span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-6 text-purple-600 dark:text-purple-400">View Full Menu Performance</Button>
          </CardContent>
        </Card>
      </div>

      {/* Customer Reviews */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-6">
          <div>
            <CardTitle>Recent Customer Reviews</CardTitle>
            <CardDescription>Feedback directly from Google Maps and your digital menu</CardDescription>
          </div>
          <Button variant="outline">Manage Reviews</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 divide-y divide-slate-100 dark:divide-slate-800">
            {reviews.map((review, i) => (
              <div key={review.id} className={i !== 0 ? 'pt-6' : ''}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-white font-bold flex items-center justify-center">
                      {review.author.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">{review.author}</h4>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} className={`w-3.5 h-3.5 ${j < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 dark:text-slate-600'}`} />
                          ))}
                        </div>
                        <span className="text-xs text-slate-500">• {review.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={review.platform === 'Google Maps' ? 'default' : 'warning'} className="text-[10px]">
                      {review.platform}
                    </Badge>
                    <button className="text-slate-400 hover:text-slate-600">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-3 ml-13 leading-relaxed">
                  "{review.text}"
                </p>
                <div className="ml-13 mt-3">
                  <Button variant="ghost" size="sm" className="h-8 px-3 text-xs text-purple-600 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40">
                    Reply
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
