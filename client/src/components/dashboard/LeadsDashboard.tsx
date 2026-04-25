import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Calendar, Mail, Phone, DollarSign, MapPin } from 'lucide-react';

interface Lead {
  id: number;
  name: string;
  email: string;
  phone?: string;
  loanType?: string;
  loanAmount?: number;
  state?: string;
  status: string;
  createdAt: string;
}

interface LeadStats {
  total: number;
  thisWeek: number;
  thisMonth: number;
  conversionRate: number;
}

interface Props {
  siteId: number;
}

function fmt(n?: number): string {
  if (!n) return '—';
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400',
  contacted: 'bg-yellow-500/20 text-yellow-400',
  qualified: 'bg-green-500/20 text-green-400',
  closed: 'bg-purple-500/20 text-purple-400',
};

export default function LeadsDashboard({ siteId }: Props) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  useEffect(() => {
    if (!siteId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/sites/${siteId}/leads`, { headers }).then(r => r.json()),
      fetch(`/api/sites/${siteId}/leads/stats`, { headers }).then(r => r.json()),
    ])
      .then(([leadsData, statsData]) => {
        setLeads(Array.isArray(leadsData) ? leadsData : []);
        setStats(statsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [siteId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mr-2" />
        Loading leads…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: stats?.total ?? 0, icon: <Users className="w-4 h-4" />, color: 'text-blue-400' },
          { label: 'This Week', value: stats?.thisWeek ?? 0, icon: <Calendar className="w-4 h-4" />, color: 'text-green-400' },
          { label: 'This Month', value: stats?.thisMonth ?? 0, icon: <TrendingUp className="w-4 h-4" />, color: 'text-purple-400' },
          { label: 'Conv. Rate', value: `${((stats?.conversionRate ?? 0) * 100).toFixed(1)}%`, icon: <TrendingUp className="w-4 h-4" />, color: 'text-yellow-400' },
        ].map(card => (
          <Card key={card.label} className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">
              <div className={`flex items-center gap-2 mb-2 ${card.color}`}>
                {card.icon}
                <span className="text-xs text-gray-400">{card.label}</span>
              </div>
              <div className="text-2xl font-bold text-white">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gray-900 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base">Recent Leads</CardTitle>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No leads yet — share your site URL to start capturing leads</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-xs">
                    <th className="text-left pb-2 font-medium">Name</th>
                    <th className="text-left pb-2 font-medium">Contact</th>
                    <th className="text-left pb-2 font-medium">Loan</th>
                    <th className="text-left pb-2 font-medium">State</th>
                    <th className="text-left pb-2 font-medium">Status</th>
                    <th className="text-left pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {leads.map(lead => (
                    <tr key={lead.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="py-3 text-white font-medium">{lead.name}</td>
                      <td className="py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1 text-gray-300">
                            <Mail className="w-3 h-3 text-gray-500" />{lead.email}
                          </span>
                          {lead.phone && (
                            <span className="flex items-center gap-1 text-gray-400 text-xs">
                              <Phone className="w-3 h-3 text-gray-500" />{lead.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-col gap-0.5">
                          {lead.loanType && <span className="text-gray-300 text-xs">{lead.loanType}</span>}
                          {lead.loanAmount && (
                            <span className="flex items-center gap-1 text-gray-400 text-xs">
                              <DollarSign className="w-3 h-3" />{fmt(lead.loanAmount)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        {lead.state && (
                          <span className="flex items-center gap-1 text-gray-400 text-xs">
                            <MapPin className="w-3 h-3" />{lead.state}
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        <Badge className={`${STATUS_COLORS[lead.status] ?? 'bg-gray-700 text-gray-300'} text-xs border-0`}>
                          {lead.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-gray-500 text-xs">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
