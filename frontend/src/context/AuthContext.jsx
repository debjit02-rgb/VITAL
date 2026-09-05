import React, { createContext, useContext, useState, useEffect } from "react";
import {
  loginApi,
  getMeApi,
  logoutApi,
  getSavedUser,
  getAuthToken,
  setSavedUser,
  setAuthToken,
  clearAuth
} from "../services/api";

const AuthContext = createContext(null);

export const DEMO_PRESETS = [
  {
    name: "Debjit Modak",
    role: "student",
    email: "debjit2.modak@stu.adamasuniversity.ac.in",
    password: "student123",
    description: "CSE AIML · 3rd Sem · Roll 1",
    avatar: "DM"
  },
  {
    name: "Anuska Koner",
    role: "student",
    email: "anuska2.koner@stu.adamasuniversity.ac.in",
    password: "student123",
    description: "CSE AIML · 3rd Sem · Roll 2",
    avatar: "AK"
  },
  {
    name: "Prof. Rajesh Sharma",
    role: "teacher",
    email: "prof.sharma@vital.edu",
    password: "teacher123",
    description: "Faculty Lead · Machine Learning & AI",
    avatar: "RS"
  }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getSavedUser);
  const [loading, setLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      getMeApi()
        .then((res) => {
          if (res && res.user) {
            setUser(res.user);
            setSavedUser(res.user);
          }
        })
        .catch(() => {
          // Token expired or server unreachable
          console.warn("Session check failed, keeping cached or resetting auth");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password, role) => {
    try {
      const data = await loginApi(email, password, role);
      setUser(data.user);
      return data.user;
    } catch (err) {
      // Fallback mock user if backend is temporarily offline
      if (err.message && (err.message.includes("Failed to fetch") || err.message.includes("NetworkError"))) {
        const foundDemo = DEMO_PRESETS.find(p => p.email === email && p.role === role);
        const fallbackUser = foundDemo ? {
          student_id: role === "student" ? (email.includes("anuska") ? 2 : 1) : null,
          teacher_id: role === "teacher" ? 1 : null,
          name: foundDemo.name,
          email: foundDemo.email,
          role: foundDemo.role,
          department: "CSE AIML",
          semester: 3,
          roll_number: role === "student" ? (email.includes("anuska") ? "UG/02/BTCSE/2023/002" : "UG/02/BTCSE/2023/001") : null
        } : {
          student_id: role === "student" ? 1 : null,
          teacher_id: role === "teacher" ? 1 : null,
          name: role === "student" ? "Debjit Modak" : "Prof. Rajesh Sharma",
          email,
          role,
          department: "CSE AIML",
          semester: 3,
          roll_number: role === "student" ? "UG/02/BTCSE/2023/001" : null
        };
        setUser(fallbackUser);
        setSavedUser(fallbackUser);
        setAuthToken("demo-mock-jwt-token");
        return fallbackUser;
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.warn("Logout request failed:", err);
    } finally {
      clearAuth();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isTeacher: user?.role === "teacher",
        isStudent: user?.role === "student"
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
