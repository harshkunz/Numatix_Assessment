import { useState } from 'react';

export const useAuthStore = () => {
  const [user, setUser] = useState<{ id: number; email: string } | null>(null);
  
  return { user, setUser };
};
