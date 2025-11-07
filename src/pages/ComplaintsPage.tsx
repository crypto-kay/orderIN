import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

// TODO: replace placeholder page with real implementation
const ComplaintsPage: React.FC = () => {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Complaints — Placeholder</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is a placeholder for the Complaints Management page.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplaintsPage;