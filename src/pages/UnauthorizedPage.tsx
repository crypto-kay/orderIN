import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Unauthorized</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-gray-600 mb-6">
            Please contact your administrator if you believe this is an error.
          </p>
          <Button onClick={() => navigate('/')} className="w-full">
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnauthorizedPage;