import React, { useState, useEffect, useCallback } from 'react';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/Login';
import HistoryDrawer from './components/HistoryDrawer';
import DetailedAnalysisView from './components/DetailedAnalysisView';

import './index.css';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Audio Analysis State Management
  const [history, setHistory] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Helper to safely resolve user ID
  const getUserId = (userObj) => {
    if (!userObj) return null;
    if (typeof userObj === 'string') return userObj;
    return userObj.user_id || userObj.userId || userObj.id || userObj.username || userObj.email || null;
  };

  const userId = getUserId(currentUser);

  // Stable Fetch function
  const fetchHistory = useCallback(async (targetUserId) => {
    const activeUserId = targetUserId || userId;
    
    if (!activeUserId) {
      setHistory([]);
      return;
    }

    setIsLoadingHistory(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/history?user_id=${encodeURIComponent(activeUserId)}`
      );
      if (!response.ok) throw new Error('Failed to fetch user history');

      const data = await response.json();
      if (data.status === 'success') {
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [userId]);

  // 1. Run ONLY ONCE on mount to restore existing session
  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user_profile');

    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setCurrentUser(parsedUser);
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Failed to parse saved user profile:', e);
      }
    }
    setLoading(false);
  }, []); // <--- Empty array ensures this runs ONLY ONCE

  // 2. Fetch history ONLY when user logs in or userId actually changes
  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchHistory(userId);
    }
  }, [isAuthenticated, userId]); // <--- Runs strictly when login state or user ID changes

  // Delete Record from MongoDB & State
  const handleDeleteHistory = async (recordId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/history/${recordId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete record');

      setHistory((prev) => prev.filter((item) => item.id !== recordId));

      if (selectedRecord?.id === recordId) {
        setSelectedRecord(null);
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      alert('Failed to delete history item. Please try again.');
    }
  };

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
    // Optional: Only fetch if history is currently empty
    if (history.length === 0 && userId) {
      fetchHistory(userId);
    }
  };

  const handleLoginSuccess = (userData) => {
    const user = typeof userData === 'object' ? userData : { username: userData };
    setCurrentUser(user);
    localStorage.setItem('user_profile', JSON.stringify(user));
    localStorage.setItem('authToken', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user_profile');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setHistory([]);
    setSelectedRecord(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-100">
        <p className="animate-pulse text-sm text-slate-400 font-medium">Loading session...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      {isAuthenticated ? (
        <div className="min-h-screen flex flex-col">
          <div className="flex-1 p-6">
            {selectedRecord ? (
              <DetailedAnalysisView
                selectedRecord={selectedRecord}
                onBack={() => setSelectedRecord(null)}
              />
            ) : (
              <Dashboard
                currentUser={currentUser}
                onLogout={handleLogout}
                onOpenHistory={handleOpenDrawer}
                onAnalysisComplete={() => fetchHistory(userId)}
              />
            )}
          </div>

          <HistoryDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            history={history}
            isLoadingHistory={isLoadingHistory}
            onSelectHistory={(record) => setSelectedRecord(record)}
            onDeleteHistory={handleDeleteHistory}
          />
        </div>
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </main>
  );
}