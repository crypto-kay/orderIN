import { motion } from 'framer-motion';
import { AlertCircle, Clock, DollarSign, Table } from 'lucide-react';
import React from 'react';
import { DashboardCard } from '../components/dashboard/DashboardCard';
import { dashboardData } from '../mocks/dashboardData';
import { useAuthStore } from '../stores/authStore';

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1] as const
      }
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          {user && (
            <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              {user.role}
            </div>
          )}
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <motion.div variants={itemVariants}>
            <DashboardCard
              title="Total Sales"
              value={`$${dashboardData.totalSales.toFixed(2)}`}
              icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
              subtitle="Today's revenue"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <DashboardCard
              title="Pending Orders"
              value={dashboardData.pendingOrders}
              icon={<Clock className="h-4 w-4 text-muted-foreground" />}
              subtitle="Awaiting preparation"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <DashboardCard
              title="Active Tables"
              value={dashboardData.activeTables}
              icon={<Table className="h-4 w-4 text-muted-foreground" />}
              subtitle="Currently occupied"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <DashboardCard
              title="Complaints"
              value={dashboardData.complaints}
              icon={<AlertCircle className="h-4 w-4 text-muted-foreground" />}
              subtitle="Requires attention"
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;