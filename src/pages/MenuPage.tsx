import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

// TODO: replace placeholder page with real implementation
const MenuPage: React.FC = () => {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Menu — Placeholder</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is a placeholder for the Menu Management page.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MenuPage;