import { useState, useEffect } from 'react';
import { logsAPI } from '../../api';
import './RouterLogs.css';

const RouterLogs = ({ routerId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await logsAPI.getAll(routerId);
      setLogs(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load router logs. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [routerId]);

  const getFilteredLogs = () => {
    return logs.filter(log => {
      if (filter !== 'all' && log.log_type !== filter) return false;
      
      if (searchTerm && !log.message.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (loading && logs.length === 0) {
    return <div className="loading">Loading logs...</div>;
  }

  const filteredLogs = getFilteredLogs();

  return (
    <div className="logs-container">
      <div className="logs-header">
        <h2>Router Activity Logs</h2>
        <div className="logs-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-dropdown">
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="info">Information</option>
              <option value="warning">Warnings</option>
              <option value="error">Errors</option>
              <option value="security">Security Alerts</option>
              <option value="connection">Connection Events</option>
            </select>
          </div>
          <button 
            className="refresh-btn"
            onClick={fetchLogs}
            title="Refresh Logs"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {filteredLogs.length === 0 ? (
        <div className="no-logs">
          <p>No logs found matching your criteria.</p>
        </div>
      ) : (
        <div className="logs-table-container">
          <table className="logs-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Type</th>
                <th>Message</th>
                <th>Source IP</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id} className={`log-type-${log.log_type}`}>
                  <td className="log-time">{formatTimestamp(log.timestamp)}</td>
                  <td className="log-type">
                    <span className={`log-badge ${log.log_type}`}>
                      {log.log_type.charAt(0).toUpperCase() + log.log_type.slice(1)}
                    </span>
                  </td>
                  <td className="log-message">{log.message}</td>
                  <td className="log-source">{log.source_ip || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RouterLogs;