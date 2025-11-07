import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

// TODO: replace placeholder page with real implementation
const KDSPage: React.FC = () => {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>KDS — Placeholder</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is a placeholder for the Kitchen Display System page.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default KDSPage;