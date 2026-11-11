import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { PEOPLE, ROLE_KEY } from '../lib/constants';
import { readString, writeString } from '../lib/storage';

const SessionContext = createContext(null);

/**
 * Who is using the app. The prototype fakes two people (manager Morgan, staff Sam);
 * this is where real sign-in and permissions (APP01) will plug in.
 */
export function SessionProvider({ children }) {
  const [role, setRole] = useState(() => (readString(ROLE_KEY) === 'staff' ? 'staff' : 'mgr'));
  useEffect(() => writeString(ROLE_KEY, role), [role]);

  const value = useMemo(() => {
    const person = PEOPLE[role];
    return { role, setRole, isManager: role === 'mgr', who: person.name, title: person.title };
  }, [role]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

/** { role, setRole, isManager, who, title } */
export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
  return ctx;
}
