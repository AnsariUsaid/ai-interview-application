import { Navigate } from 'react-router-dom';

const Index = () => {
  // This page is no longer used - redirect to main app
  return <Navigate to="/" replace />;
};

export default Index;
