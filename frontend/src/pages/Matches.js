import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Matches() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    // Get the lostItemId passed from the ReportLost page
    const lostItemId = location.state?.lostItemId;

    useEffect(() => {
        if (!lostItemId) {
            setLoading(false);
            return;
        }

        // Call the FastAPI CLIP Engine
        const fetchMatches = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/run-match/${lostItemId}`);
                setMatches(response.data.matches);
            } catch (error) {
                console.error("Error fetching matches:", error);
                alert("Failed to connect to AI Engine. Make sure Backend is running.");
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, [lostItemId]);

    if (loading) {
        return (
            <div className="main-content" style={{ textAlign: 'center', marginTop: '100px' }}>
                <div className="verifying-text" style={{ fontSize: '1.5rem' }}>
                    🔍 AGENT SCANNING DATABASE...
                </div>
                <p>Running CLIP Semantic Analysis on images...</p>
            </div>
        );
    }

    return (
        <div className="main-content">
            <header style={{ marginBottom: '30px' }}>
                <h1>Semantic Match Results</h1>
                <p>Ranked by visual similarity to your description.</p>
            </header>

            {matches.length === 0 ? (
                <div className="card">
                    <h2>No Strong Matches Found</h2>
                    <p>We couldn't find items that match your description yet. We will notify you when a match is uploaded.</p>
                </div>
            ) : (
                <div className="dashboard-grid">
                    {matches.map((item) => (
                        <div key={item.found_item_id} className="card" style={{ padding: '10px' }}>
                            <div style={{ position: 'relative' }}>
                                <img 
                                    src={item.image_url} 
                                    alt="Evidence" 
                                    style={{ 
                                        width: '100%', 
                                        height: '220px', 
                                        objectFit: 'cover', 
                                        borderRadius: '8px',
                                        filter: 'blur(8px)' // Privacy: Blur until verified
                                    }} 
                                />
                                <div style={{ 
                                    position: 'absolute', top: '10px', right: '10px', 
                                    background: 'var(--primary)', color: 'white', 
                                    padding: '5px 10px', borderRadius: '5px', fontSize: '0.8rem' 
                                }}>
                                    {item.confidence}% Match
                                </div>
                            </div>
                            
                            <div style={{ padding: '15px' }}>
                                <p><strong>Found at:</strong> {item.location}</p>
                                <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '15px' }}>
                                    Item ID: {item.found_item_id.substring(0, 8)}...
                                </p>
                                
                                <button 
                                    className="btn-primary" 
                                    onClick={() => navigate(`/guardian/${item.found_item_id}`, { state: { imageUrl: item.image_url } })}
                                >
                                    Initiate Verification
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Matches;