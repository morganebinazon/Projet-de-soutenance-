import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  grossSalary: number;
  netSalary: number;
  benefits: {
    transport: number;
    housing: number;
    performance: number;
  };
  familyStatus: 'single' | 'married' | 'divorced';
  children: number;
  email: string;
  phone: string;
  hireDate: string;
  leaves: {
    total: number;
    taken: number;
    pending: number;
    monthly: number;
  };
  documents: Array<{
    id: string;
    name: string;
    type: string;
    date: string;
  }>;
  notifications: Array<{
    id: string;
    type: 'info' | 'warning' | 'success' | 'error';
    message: string;
    date: string;
    read: boolean;
  }>;
}

interface EmployeeState {
  employee: Employee | null;
  setEmployee: (employee: Employee) => void;
  updateEmployee: (updates: Partial<Employee>) => void;
  addDocument: (document: Employee['documents'][0]) => void;
  removeDocument: (documentId: string) => void;
  addNotification: (notification: Omit<Employee['notifications'][0], 'id'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  updateLeaves: (updates: Partial<Employee['leaves']>) => void;
}

export const useEmployeeStore = create<EmployeeState>()(
  persist(
    (set) => ({
      employee: null,
      setEmployee: (employee) => set({ employee }),
      updateEmployee: (updates) =>
        set((state) => ({
          employee: state.employee ? { ...state.employee, ...updates } : null,
        })),
      addDocument: (document) =>
        set((state) => ({
          employee: state.employee
            ? {
                ...state.employee,
                documents: [...state.employee.documents, document],
              }
            : null,
        })),
      removeDocument: (documentId) =>
        set((state) => ({
          employee: state.employee
            ? {
                ...state.employee,
                documents: state.employee.documents.filter(
                  (doc) => doc.id !== documentId
                ),
              }
            : null,
        })),
      addNotification: (notification) =>
        set((state) => ({
          employee: state.employee
            ? {
                ...state.employee,
                notifications: [
                  {
                    ...notification,
                    id: Date.now().toString(),
                  },
                  ...state.employee.notifications,
                ],
              }
            : null,
        })),
      markNotificationAsRead: (notificationId) =>
        set((state) => ({
          employee: state.employee
            ? {
                ...state.employee,
                notifications: state.employee.notifications.map((notification) =>
                  notification.id === notificationId
                    ? { ...notification, read: true }
                    : notification
                ),
              }
            : null,
        })),
      updateLeaves: (updates) =>
        set((state) => ({
          employee: state.employee
            ? {
                ...state.employee,
                leaves: { ...state.employee.leaves, ...updates },
              }
            : null,
        })),
    }),
    {
      name: 'employee-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
); 