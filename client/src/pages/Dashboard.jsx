import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosClient';
import { CuteCard } from '../components/CuteCard';
import { Badge } from '../components/Badge';
import { ExportDropdown } from '../components/ExportDropdown';
import {
  Users,
  Mic,
  Award,
  ShieldAlert,
  Calendar,
  AlertTriangle,
  Star,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [nextMeeting, setNextMeeting] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, meetingsRes] = await Promise.all([
        api.get('/members/dashboard/stats'),
        api.get('/meetings')
      ]);
      setStats(statsRes.data.data);

      const meetings = meetingsRes.data.data || [];
      const upcoming = meetings.find(m => m.status === 'scheduled' || m.status === 'published' || m.status === 'draft');
      setNextMeeting(upcoming || meetings[0] || null);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pastel-500"></div>
      </div>
    );
  }

  const unfilledRolesCount = nextMeeting
    ? nextMeeting.roleAssignments?.filter(r => !r.memberId || r.status === 'backup_needed').length || 0
    : 0;

  const chartColors = ['#f87198', '#ee4375', '#db275e', '#b8174a', '#882d4b', '#e5a93b', '#6366f1'];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-mauve-900 dark:text-pastel-100 flex items-center gap-2">
            Welcome, Sahnas! 🌸
          </h1>
          <p className="text-xs text-mauve-500 dark:text-mauve-200 mt-1">
            SLIIT Gavel Club Educational Planning & Tracking Dashboard • Term 2026/2027
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportDropdown meetingId={nextMeeting?._id} />
          <Link
            to="/meeting-planner"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-pastel-500 hover:bg-pastel-600 text-white shadow-cute transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Open Meeting Planner</span>
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <CuteCard className="bg-gradient-to-br from-white to-pastel-50/50 dark:from-darkpink-card dark:to-darkpink-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-mauve-500 dark:text-mauve-200">Active Members</p>
              <p className="text-2xl font-extrabold text-mauve-900 dark:text-pastel-100 mt-1">
                {stats?.totalMembers || 80}
              </p>
              <p className="text-[10px] text-pastel-600 font-bold mt-1">72 Mentees • 8 Mentors</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-pastel-100 dark:bg-pastel-900/50 flex items-center justify-center text-pastel-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </CuteCard>

        <CuteCard className="bg-gradient-to-br from-white to-pastel-50/50 dark:from-darkpink-card dark:to-darkpink-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-mauve-500 dark:text-mauve-200">Total Speeches Given</p>
              <p className="text-2xl font-extrabold text-mauve-900 dark:text-pastel-100 mt-1">
                {stats?.totalSpeeches || 0}
              </p>
              <p className="text-[10px] text-pastel-600 font-bold mt-1">CC1 – CC10 tracked</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center text-rose-600">
              <Mic className="w-6 h-6" />
            </div>
          </div>
        </CuteCard>

        <CuteCard className="bg-gradient-to-br from-white to-pastel-50/50 dark:from-darkpink-card dark:to-darkpink-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-mauve-500 dark:text-mauve-200">Standby Backup Pool</p>
              <p className="text-2xl font-extrabold text-mauve-900 dark:text-pastel-100 mt-1">
                {stats?.standbyCount || 0}
              </p>
              <p className="text-[10px] text-emerald-600 font-bold mt-1">Ready for last-min drops</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
        </CuteCard>

        <CuteCard className="bg-gradient-to-br from-white to-pastel-50/50 dark:from-darkpink-card dark:to-darkpink-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-mauve-500 dark:text-mauve-200">Next Meeting Status</p>
              <p className="text-xl font-extrabold text-mauve-900 dark:text-pastel-100 mt-1">
                #{nextMeeting?.meetingNo || 214}
              </p>
              <p className={`text-[10px] font-bold mt-1 ${unfilledRolesCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {unfilledRolesCount > 0 ? `${unfilledRolesCount} role(s) need fill` : 'All roles confirmed ✨'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </CuteCard>
      </div>

      {/* Next Meeting Highlight Banner */}
      {nextMeeting && (
        <div className="p-5 rounded-super bg-gradient-to-r from-pastel-100 via-blush to-pastel-50 dark:from-darkpink-card dark:to-darkpink-hover border border-pastel-200 dark:border-darkpink-border shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-pastel-500 text-white">
                UPCOMING MEETING
              </span>
              <h2 className="text-lg font-bold text-mauve-900 dark:text-pastel-100">
                {nextMeeting.meetingNo}th Educational Meeting: “{nextMeeting.theme}”
              </h2>
            </div>
            <p className="text-xs text-mauve-600 dark:text-mauve-200 flex items-center gap-3">
              <span>📅 {new Date(nextMeeting.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
              <span>⏰ {nextMeeting.startTime} onwards</span>
              <span>📍 {nextMeeting.venue}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              to={`/meeting-planner?meetingNo=${nextMeeting.meetingNo}`}
              className="flex-1 md:flex-initial text-center px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-darkpink-border text-mauve-900 dark:text-pastel-100 hover:bg-pastel-50 transition-colors shadow-sm"
            >
              Edit Agenda & Roles
            </Link>
            <a
              href={`http://localhost:5000/api/exports/meeting/${nextMeeting._id}/agenda-pdf`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 md:flex-initial text-center px-4 py-2 rounded-xl text-xs font-bold bg-pastel-500 text-white hover:bg-pastel-600 shadow-cute transition-all"
            >
              Export Agenda (PDF)
            </a>
          </div>
        </div>
      )}

      {/* Middle Row: Role Frequency & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role Frequency Bar Chart */}
        <CuteCard
          title="Meeting Roles Distribution"
          subtitle="Frequency of roles performed across club meetings"
          icon={TrendingUp}
          className="lg:col-span-2"
        >
          <div className="h-64 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.roleFreq || []} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <XAxis
                  dataKey="role"
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 10, fill: '#866b8c' }}
                />
                <YAxis tick={{ fontSize: 10, fill: '#866b8c' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF8FA',
                    borderColor: '#f8b4c4',
                    borderRadius: '1rem',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {(stats?.roleFreq || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CuteCard>

        {/* Leaderboard */}
        <CuteCard
          title="Member Leaderboard"
          subtitle="Top active and reliable Gaveliers"
          icon={Award}
        >
          <div className="space-y-3 mt-2">
            {stats?.leaderboard?.slice(0, 5).map((m, idx) => (
              <div
                key={m._id}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-pastel-50/60 dark:bg-darkpink-hover/40 hover:bg-pastel-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx === 0 ? 'bg-amber-400 text-white' : idx === 1 ? 'bg-slate-300 text-slate-800' : 'bg-amber-700/60 text-white'
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-mauve-900 dark:text-pastel-100 flex items-center gap-1">
                      {m.preferredName || m.name}
                      {m.isDependableBadge && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                    </p>
                    <p className="text-[10px] text-mauve-500">
                      CC Level {m.ccLevel} • Score {m.activityScore}
                    </p>
                  </div>
                </div>
                <Badge variant={m.reliabilityScore >= 95 ? 'success' : 'default'}>
                  {m.reliabilityScore}%
                </Badge>
              </div>
            ))}
          </div>
        </CuteCard>
      </div>

      {/* Bottom Row: Near CC Finish & Inactive Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Members Close to Finishing CC Level */}
        <CuteCard
          title="Approaching CC Award (CC8 - CC9)"
          subtitle="Speakers primed for upcoming meeting speech slots"
          icon={Mic}
          ribbon="Priority Speakers"
        >
          {stats?.closeToFinishCC && stats.closeToFinishCC.length > 0 ? (
            <div className="space-y-2 mt-2">
              {stats.closeToFinishCC.map(m => (
                <div key={m._id} className="flex items-center justify-between p-3 rounded-2xl border border-pastel-100 dark:border-darkpink-border">
                  <div>
                    <p className="text-xs font-bold text-mauve-900 dark:text-pastel-100">
                      {m.name} ({m.preferredName})
                    </p>
                    <p className="text-[10px] text-mauve-500">Batch: {m.batch} • Contact: {m.contact}</p>
                  </div>
                  <Badge variant="pink">CC Project {m.ccLevel + 1} Next</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-mauve-500">
              No members currently at CC8/CC9 stage.
            </div>
          )}
        </CuteCard>

        {/* Inactive Members Alert */}
        <CuteCard
          title="Inactive Members (>45 Days)"
          subtitle="Reach out to re-engage with supportive mentor nudges"
          icon={AlertTriangle}
        >
          {stats?.inactiveMembers && stats.inactiveMembers.length > 0 ? (
            <div className="space-y-2 mt-2">
              {stats.inactiveMembers.slice(0, 4).map(m => (
                <div key={m._id} className="flex items-center justify-between p-3 rounded-2xl border border-pastel-100 dark:border-darkpink-border">
                  <div>
                    <p className="text-xs font-bold text-mauve-900 dark:text-pastel-100">
                      {m.name} ({m.preferredName})
                    </p>
                    <p className="text-[10px] text-mauve-500">
                      Last Active: {m.lastActiveDate ? new Date(m.lastActiveDate).toLocaleDateString('en-GB') : 'Never yet'}
                    </p>
                  </div>
                  <Link
                    to={`/reliability?memberId=${m._id}`}
                    className="text-[11px] font-bold text-pastel-600 hover:text-pastel-700 underline"
                  >
                    Send Friendly Nudge 💌
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-emerald-600">
              All active members have participated recently! ✨
            </div>
          )}
        </CuteCard>
      </div>
    </div>
  );
};
