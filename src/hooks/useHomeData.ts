import type { Goal, ProgressData, Task } from '@/types/home';
import { useEffect, useState } from 'react';

interface HomeData {
  tasks: Task[];
  goals: Goal[];
  progress: ProgressData;
  loading: boolean;
  error: Error | null;
}

export function useHomeData(): HomeData {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [progress, setProgress] = useState<ProgressData>({
    tasks: 50,
    budget: 62,
    focus: 75,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // TODO: Fetch data from API
    // fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      // const response = await api.get('/home');
      // setTasks(response.data.tasks);
      // setGoals(response.data.goals);
      // setProgress(response.data.progress);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { tasks, goals, progress, loading, error };
}
