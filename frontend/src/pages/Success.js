import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

function Success() {
    const location = useLocation();
    const navigate = useNavigate();
    const { foundItemId, score } = location.state || {};
    
    const [finderEmail, setFinderEmail] = useState('Loading...');
    const [itemDetails, setItemDetails] = useState(null);

    useEffect(() => {
        if (!foundItemId) {
            navigate('/');
            return;
        }

        const fetchDetails = async () => {
            try {
                // 1. Get the found item details
                const itemRef = doc(db, "found_items", foundItemId);
                const itemSnap = await getDoc(itemRef);
                
                if (itemSnap.exists()) {
                    const data = itemSnap.data();
                    setItemDetails(data);
                    
                    /* 
                       NOTE: In a real-world app, you would fetch the email 
                       from the Backend using the finderId for security. 
                       For this prototype, we'll simulate the reveal.
                    */
                    setFinderEmail("finder_identity_unlocked@forensic.com");
                }
            } catch (error) {
                console.error("Error fetching recovery pass:", error);
            }
        };

        fetchDetails();
    }, [foundItemId, navigate]);

    return (
        <div className="main-content">
            <div className="card" style={{ 
                maxWidth: '600px', 
                margin: '0 auto', 
                border: '2px solid var(--success)', 
                borderTop: '10px solid var(--success)',
                padding: '0'
            }}>
                <div style={{ backgroundColor: '#f0fff4', padding: '30px', textAlign: 'center' }}>
                    <div style={{ fontSize: '50px', marginBottom: '10px' }}>📄</div>
                    <h1 style={{ color: '#27ae60', margin: '0' }}>Recovery Pass Issued</h1>
                    <p style={{ color: '#155724' }}>Verification Score: <strong>{score}%</strong></p>
                </div>

                <div style={{ padding: '30px' }}>
                    <div style={{ borderBottom: '1px dashed #ccc', marginBottom: '20px', paddingBottom: '20px' }}>
                        <h3 style={{ textTransform: 'uppercase', fontSize: '0.8rem', color: '#7f8c8d' }}>Item Details</h3>
                        <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{itemDetails?.location || "Unspecified Item"}</p>
                        <p style={{ fontSize: '0.9rem' }}>Match Reference: {foundItemId}</p>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ textTransform: 'uppercase', fontSize: '0.8rem', color: '#7f8c8d' }}>Finder Contact Information</h3>
                        <div style={{ 
                            background: '#f8f9fa', 
                            padding: '15px', 
                            borderRadius: '8px', 
                            border: '1px solid #ddd',
                            marginTop: '10px'
                        }}>
                            <p><strong>Email:</strong> {finderEmail}</p>
                            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                                Please contact the finder politely to arrange a secure pickup at the location mentioned above.
                            </p>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <button className="btn-primary" onClick={() => window.print()} style={{ backgroundColor: '#2c3e50', marginBottom: '10px' }}>
                            Print Recovery Pass
                        </button>
                        <button className="btn-primary" style={{ background: 'none', color: '#7f8c8d' }} onClick={() => navigate('/')}>
                            Back to Dashboard
                        </button>
                    </div>
                </div>

                <div style={{ 
                    textAlign: 'center', 
                    padding: '15px', 
                    fontSize: '0.7rem', 
                    color: '#999', 
                    background: '#f8f9fa' 
                }}>
                    SECURED BY SEMANTIC FORENSIC ENGINE • AI GUARDIAN VERIFIED
                </div>
            </div>
        </div>
    );
}

export default Success;