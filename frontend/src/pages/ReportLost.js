import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; // 1. MUST IMPORT THIS

function ReportLost() {
    const navigate = useNavigate(); // 2. MUST INITIALIZE THIS
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        location: '',
        lostTime: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Add to Firebase
            const docRef = await addDoc(collection(db, "lost_items"), {
                ...formData,
                status: "open",
                createdAt: new Date()
            });

            console.log("Document written with ID: ", docRef.id);
            
            // 3. NOW THIS WILL WORK
            navigate('/matches', { state: { lostItemId: docRef.id } });
            
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Submission failed. Check console.");
        }
    };

    return (
        <div className="main-content">
            <div className="card">
                <h1>Report Lost Item</h1>
                <p>Provide a detailed semantic description for our AI to analyze.</p>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Item Name</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Blue Denim Jacket" 
                            onChange={(e) => setFormData({...formData, title: e.target.value})} 
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Detailed Description</label>
                        <textarea 
                            rows="5" 
                            placeholder="Include brand names, specific colors, scratches, or stickers..."
                            onChange={(e) => setFormData({...formData, description: e.target.value})} 
                            required
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label>Last Seen Location</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Main Library, 2nd Floor"
                            onChange={(e) => setFormData({...formData, location: e.target.value})} 
                            required 
                        />
                    </div>

                    <button type="submit" className="btn-primary">
                        Submit Forensic Report
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ReportLost;