import { useState, useCallback } from 'react';
import { getIssueTrackerUsers } from '../data/issueTrackerConfig';

const STORAGE_KEY = 'issueTracker_selectedUser';

export const useUserIdentity = () => {
  const availableUsers = getIssueTrackerUsers();

  const [selectedUserEmail, setSelectedUserEmail] = useState(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved && availableUsers.some(u => u.email === saved)) return saved;
    return availableUsers[0]?.email || '';
  });

  const setSelectedUser = useCallback((email) => {
    setSelectedUserEmail(email);
    sessionStorage.setItem(STORAGE_KEY, email);
  }, []);

  const selectedUser = availableUsers.find(u => u.email === selectedUserEmail) || availableUsers[0];

  return {
    selectedUser,
    selectedUserEmail,
    setSelectedUser,
    availableUsers,
  };
};
