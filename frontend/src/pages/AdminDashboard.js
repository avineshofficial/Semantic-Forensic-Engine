import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

function AdminDashboard() {
    const [stats, setStats] = useState({ totalLost: 0, totalFound: 0, matches: 0 });
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                // Fetch basic counts
                const lostSnap = await getDocs(collection(db, "lost_items"));
                const foundSnap = await getDocs(collection(db, "found_items"));
                
                // Fetch recent match "logs" (using our matches logic)
                // For a real app, we'd have a 'logs' collection. 
                // Here we simulate it by showing all lost items and their status.
                const q = query(collection(db, "lost_items"), orderBy("createdAt", "desc"), limit(10));
                const logSnap = await getDocs(q);
                
                setStats({
                    totalLost: lostSnap.size,
                    totalFound: foundSnap.size,
                    matches: lostSnap.docs.filter(d => d.data().status === 'matched').size
                });

                setLogs(logSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) {
                console.error("Admin Access Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, []);

    if (loading) return <div className="verifying-text" style={{textAlign:'center', marginTop:'50px'}}>ACCESSING FORENSIC ARCHIVES...</div>;

    return (
        <div className="main-content">
            <header style={{ marginBottom: '40px' }}>
                <div className="badge badge-pending" style={{backgroundColor: '#000', color: '#fff'}}>ADMINISTRATOR PRIVILEGES</div>
                <h1>System Oversight Dashboard</h1>
                <p>Monitoring global semantic matches and AI Guardian sessions.</p>
            </header>

            {/* Stats Overview */}
            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '40px' }}>
                <div className="card" style={{ borderTopColor: 'var(--primary)', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>TOTAL LOST REPORTS</span>
                    <h2 style={{ fontSize: '2.5rem' }}>{stats.totalLost}</h2>
                </div>
                <div className="card" style={{ borderTopColor: 'var(--accent)', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>TOTAL FOUND ENTRIES</span>
                    <h2 style={{ fontSize: '2.5rem' }}>{stats.totalFound}</h2>
                </div>
                <div className="card" style={{ borderTopColor: '#27ae60', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>SUCCESSFUL RECOVERIES</span>
                    <h2 style={{ fontSize: '2.5rem' }}>{stats.matches}</h2>
                </div>
            </div>

            {/* Audit Log Table */}
            <div className="card">
                <h2>Recent System Activity (Audit Log)</h2>
                <div style={{ overflowX: 'auto', marginTop: '20px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #eee' }}>
                                <th style={{ padding: '12px' }}>Timestamp</th>
                                <th style={{ padding: '12px' }}>Event Type</th>
                                <th style={{ padding: '12px' }}>Item Description</th>
                                <th style={{ padding: '12px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                    <td style={{ padding: '12px', fontSize: '0.85rem' }}>
                                        {log.createdAt?.toDate().toLocaleString()}
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#eee' }}>
                                            LOST_REPORT_FILED
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', fontSize: '0.9rem' }}>{log.title}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span className={`badge ${log.status === 'open' ? 'badge-pending' : 'badge-match'}`}>
                                            {log.status.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;