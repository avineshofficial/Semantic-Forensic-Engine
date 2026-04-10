import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function MyActivity() {
    const [lostItems, setLostItems] = useState([]);
    const [foundItems, setFoundItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            if (!auth.currentUser) return;

            try {
                // 1. Fetch Lost Items reported by this user
                const lostQuery = query(
                    collection(db, "lost_items"),
                    where("userId", "==", auth.currentUser.uid),
                    orderBy("createdAt", "desc")
                );
                const lostSnap = await getDocs(lostQuery);
                setLostItems(lostSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // 2. Fetch Found Items reported by this user
                const foundQuery = query(
                    collection(db, "found_items"),
                    where("finderId", "==", auth.currentUser.uid),
                    orderBy("createdAt", "desc")
                );
                const foundSnap = await getDocs(foundQuery);
                setFoundItems(foundSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            } catch (error) {
                console.error("Error fetching activity:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (loading) return <div className="verifying-text" style={{textAlign:'center', marginTop:'50px'}}>LOADING RECORDS...</div>;

    return (
        <div className="main-content">
            <header style={{marginBottom: '30px'}}>
                <h1>Forensic Activity Log</h1>
                <p>Manage your reports and track semantic matching status.</p>
            </header>

            <section style={{marginBottom: '50px'}}>
                <h2 style={{color: 'var(--primary)', borderBottom: '2px solid #ddd', paddingBottom: '10px'}}>My Lost Reports</h2>
                <div className="dashboard-grid">
                    {lostItems.length === 0 ? <p>No lost items reported.</p> : lostItems.map(item => (
                        <div key={item.id} className="card">
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                                <h3>{item.title}</h3>
                                <span className={`badge ${item.status === 'open' ? 'badge-pending' : 'badge-match'}`}>
                                    {item.status.toUpperCase()}
                                </span>
                            </div>
                            <p style={{fontSize:'0.9rem', color:'#666', margin:'10px 0'}}>{item.description.substring(0, 100)}...</p>
                            <button 
                                className="btn-primary" 
                                style={{marginTop:'10px', padding:'8px'}}
                                onClick={() => navigate('/matches', { state: { lostItemId: item.id } })}
                            >
                                View Semantic Matches
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h2 style={{color: 'var(--accent)', borderBottom: '2px solid #ddd', paddingBottom: '10px'}}>Items I Found</h2>
                <div className="dashboard-grid">
                    {foundItems.length === 0 ? <p>No found items reported.</p> : foundItems.map(item => (
                        <div key={item.id} className="card" style={{padding: '10px'}}>
                            <img src={item.image_url} alt="Found Item" style={{width:'100%', height:'150px', objectFit:'cover', borderRadius:'8px'}} />
                            <div style={{padding:'10px'}}>
                                <h3>{item.location}</h3>
                                <p>Status: <strong>{item.status}</strong></p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default MyActivity;