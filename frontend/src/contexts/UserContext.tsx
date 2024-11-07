// UserContext.tsx
import { createContext, ReactNode, useState, useContext } from "react";

// Define the shape of the user object
interface User {
  isUser: boolean;
  email: string;
}

// Define the shape of the context value
interface UserContextType {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}

// Create the context
export const UserContext = createContext<UserContextType | undefined>(undefined);

// Custom hook to use the UserContext
export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
}

// Define the props for the UserProvider component
interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User>({
    isUser: false,
    email: "",
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}