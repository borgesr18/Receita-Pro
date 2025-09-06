'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingCart,
  Package,
  Calendar,
  Clock,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download
} from 'lucide-react';
import { Card } from '@/components/ui/Card';

// Types
export interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period?: string;
  };
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  loading?: boolean;
  onClick?: () => void;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface ActivityItem {
  id: string;
  type: 'sale' | 'user' | 'order' | 'product' | 'production' | 'warning' | 'recipe';
  title: string;
  description: string;
  time: string;
  user?: string;
  value?: string;
  status?: 'success' | 'warning' | 'error' | 'info';
}

// Stat Card Component
export function StatCard({
  title,
  value,
  change,
  icon,
  color = 'blue',
  loading = false,
  onClick
}: StatCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-500',
      light: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400'
    },
    green: {
      bg: 'bg-green-500',
      light: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-600 dark:text-green-400'
    },
    yellow: {
      bg: 'bg-yellow-500',
      light: 'bg-yellow-50 dark:bg-yellow-900/20',
      text: 'text-yellow-600 dark:text-yellow-400'
    },
    red: {
      bg: 'bg-red-500',
      light: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-600 dark:text-red-400'
    },
    purple: {
      bg: 'bg-purple-500',
      light: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-600 dark:text-purple-400'
    },
    indigo: {
      bg: 'bg-indigo-500',
      light: 'bg-indigo-50 dark:bg-indigo-900/20',
      text: 'text-indigo-600 dark:text-indigo-400'
    }
  };

  if (loading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className={`p-6 transition-all duration-200 hover:shadow-lg ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change && (
            <div className="flex items-center space-x-1">
              {change.type === 'increase' ? (
                <ArrowUpRight className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${
                change.type === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {change.value}%
              </span>
              {change.period && (
                <span className="text-sm text-gray-500">
                  {change.period}
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-lg ${colorClasses[color].light}`}>
          <div className={colorClasses[color].text}>
            {icon}
          </div>
        </div>
      </div>
    </Card>
  );
}

// Simple Chart Component
export function SimpleChart({ 
  data, 
  type = 'bar',
  height = 200,
  className = ''
}: {
  data: ChartData[];
  type?: 'bar' | 'line';
  height?: number;
  className?: string;
}) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <div className="flex items-end justify-between h-full space-x-2 p-4">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div 
              className="w-full bg-primary-500 rounded-t transition-all duration-500 hover:bg-primary-600"
              style={{ 
                height: `${(item.value / maxValue) * 80}%`,
                backgroundColor: item.color || undefined
              }}
              title={`${item.name}: ${item.value}`}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Activity Feed Component
export function ActivityFeed({ 
  activities,
  title = "Atividades Recentes",
  showAll = false,
  onShowAll
}: {
  activities: ActivityItem[];
  title?: string;
  showAll?: boolean;
  onShowAll?: () => void;
}) {
  const displayedActivities = showAll ? activities : activities.slice(0, 5);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'sale':
        return <DollarSign className="w-4 h-4" />;
      case 'user':
        return <Users className="w-4 h-4" />;
      case 'order':
        return <ShoppingCart className="w-4 h-4" />;
      case 'product':
        return <Package className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status?: ActivityItem['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        {onShowAll && (
          <button
            onClick={onShowAll}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Ver todas
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {displayedActivities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
              {getActivityIcon(activity.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {activity.title}
                </p>
                {activity.value && (
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {activity.value}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {activity.description}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {activities.length === 0 && (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Nenhuma atividade recente
          </p>
        </div>
      )}
    </Card>
  );
}



// Performance Metrics Widget
export function PerformanceMetrics({ 
  metrics,
  title = "Métricas de Performance",
  period = "Últimos 30 dias"
}: {
  metrics: Array<{
    label: string;
    value: number;
    target: number;
    unit?: string;
    color?: string;
  }>;
  title?: string;
  period?: string;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {period}
          </p>
        </div>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
      
      <div className="space-y-6">
        {metrics.map((metric, index) => {
          const percentage = (metric.value / metric.target) * 100;
          const isAboveTarget = percentage >= 100;
          
          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {metric.label}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {metric.value}{metric.unit} / {metric.target}{metric.unit}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    isAboveTarget ? 'bg-green-500' : 'bg-primary-500'
                  }`}
                  style={{ 
                    width: `${Math.min(percentage, 100)}%`,
                    backgroundColor: metric.color || undefined
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <span className={`text-xs font-medium ${
                  isAboveTarget ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {percentage.toFixed(1)}% do objetivo
                </span>
                {isAboveTarget && (
                  <span className="text-xs text-green-600 font-medium">
                    ✓ Meta atingida
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// Quick Actions Widget
export function QuickActions({ 
  actions,
  title = "Ações Rápidas"
}: {
  actions: Array<{
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    color: string;
    onClick: () => void;
  }>;
  title?: string;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.onClick}
              className="group flex flex-col items-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 dark:from-gray-800 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-600 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md transition-all"
            >
              <div className={`w-12 h-12 bg-gradient-to-r text-white rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:shadow-lg transition-all ${
                action.color === 'blue' ? 'from-blue-500 to-blue-600' :
                action.color === 'green' ? 'from-green-500 to-green-600' :
                action.color === 'purple' ? 'from-purple-500 to-purple-600' :
                action.color === 'orange' ? 'from-orange-500 to-orange-600' :
                action.color === 'indigo' ? 'from-indigo-500 to-indigo-600' :
                'from-gray-500 to-gray-600'
              }`}>
                <Icon size={20} />
              </div>
              <div className="text-center">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 block">
                  {action.title}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 block">
                  {action.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

// Revenue Chart Widget
export function RevenueChart({ 
  data,
  title = "Receita",
  period = "Últimos 12 meses",
  loading = false
}: {
  data: Array<{ month: string; revenue: number; target?: number }>;
  title?: string;
  period?: string;
  loading?: boolean;
}) {
  const [viewType, setViewType] = useState<'revenue' | 'comparison'>('revenue');
  
  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </Card>
    );
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const avgRevenue = totalRevenue / data.length;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {period}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewType('revenue')}
            className={`px-3 py-1 text-xs rounded-full ${
              viewType === 'revenue'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Receita
          </button>
          <button
            onClick={() => setViewType('comparison')}
            className={`px-3 py-1 text-xs rounded-full ${
              viewType === 'comparison'
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            vs Meta
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center space-x-6">
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              R$ {totalRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total no período
            </p>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              R$ {avgRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Média mensal
            </p>
          </div>
        </div>
      </div>
      
      <div className="h-64">
        <SimpleChart 
          data={data.map(item => ({
            name: item.month,
            value: viewType === 'revenue' ? item.revenue : (item.target || 0),
            color: viewType === 'revenue' ? '#3B82F6' : '#10B981'
          }))}
          height={256}
        />
      </div>
    </Card>
  );
}