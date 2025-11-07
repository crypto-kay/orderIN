import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

// TODO: replace placeholder page with real implementation
const OrdersPage: React.FC = () => {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Orders — Placeholder</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is a placeholder for the Orders Management page.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersPage;