import { useEffect } from 'react';
import { useRealm } from '@/utils/RealmContext';
import { usePlannerDaos } from './usePlannerDaos';
import { usePlannerDomainStore } from '@/stores/usePlannerDomainStore';

export const usePlannerRealmSync = () => {
  const realm = useRealm();
  const daos = usePlannerDaos();
  const hydrate = usePlannerDomainStore((state) => state.hydrateFromRealm);

  useEffect(() => {
    if (!realm || realm.isClosed) {
      return;
    }
    const emitSnapshot = () => {
      if (!realm || realm.isClosed) {
        hydrate({
          goals: [],
          habits: [],
          tasks: [],
          focusSessions: [],
        });
        return;
      }
      hydrate({
        goals: daos.goals.list(),
        habits: daos.habits.list(),
        tasks: daos.tasks.list(),
        focusSessions: daos.focusSessions.list(),
      });
    };

    emitSnapshot();

    const collections = realm.isClosed
      ? []
      : [
          realm.objects('Goal'),
          realm.objects('Habit'),
          realm.objects('Task'),
          realm.objects('FocusSession'),
        ];

    collections.forEach((collection) => collection.addListener(emitSnapshot));

    return () => {
      collections.forEach((collection) => collection.removeListener(emitSnapshot));
    };
  }, [realm, daos, hydrate]);
};
