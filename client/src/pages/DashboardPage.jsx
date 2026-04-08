import React from 'react';
import { useAuth } from '../hooks/useAuth';
import ClientDashboard from './ClientDashboard';
import FreelancerDashboard from './FreelancerDashboard';

const DashboardPage = () => {
  const { isFreelancer } = useAuth();
  return isFreelancer ? <FreelancerDashboard /> : <ClientDashboard />;
};

export default DashboardPage;
