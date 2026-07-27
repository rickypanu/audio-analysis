import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/Login';
import HistoryDrawer from './components/HistoryDrawer';
import DetailedAnalysisView from './components/DetailedAnalysisView';

import './index.css';

const API_BASE_URL = 'http://127.0.0.1:8000';
//  const API_BASE_URL = 'https://audio-analysis-3wya.onrender.com';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Audio Analysis State Management
  const [history, setHistory] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Check existing session on initial load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
      fetchHistory();
    }
    setLoading(false);
  }, []);

  // Fetch History Records from FastAPI Backend
  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/history`);
      if (!response.ok) throw new Error('Failed to fetch history');

      const data = await response.json();
      if (data.status === 'success') {
        setHistory(data.history);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Delete Record from MongoDB & State
  const handleDeleteHistory = async (recordId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/history/${recordId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete record');

      // Optimistically filter item out of local state
      setHistory((prev) => prev.filter((item) => item.id !== recordId));

      // Reset view if active record was deleted
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
    fetchHistory();
  };

  const handleLoginSuccess = (token) => {
    const sessionValue = typeof token === 'string' ? token : 'true';
    localStorage.setItem('authToken', sessionValue);
    setIsAuthenticated(true);
    fetchHistory();
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
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
          {/* Main Dashboard / Analysis Content */}
          <div className="flex-1 p-6">
            {selectedRecord ? (
              <DetailedAnalysisView
                selectedRecord={selectedRecord}
                onBack={() => setSelectedRecord(null)}
              />
            ) : (
              <Dashboard
                onLogout={handleLogout}
                onOpenHistory={handleOpenDrawer}
                onAnalysisComplete={fetchHistory}
              />
            )}
          </div>

          {/* History Drawer Overlay */}
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