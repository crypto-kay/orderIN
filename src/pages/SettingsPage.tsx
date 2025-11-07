import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

// TODO: replace placeholder page with real implementation
const SettingsPage: React.FC = () => {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings — Placeholder</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is a placeholder for the Settings page.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;