import React, { useState } from 'react';
import { db, storage, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';

function ReportFound() {
    const [image, setImage] = useState(null);
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!image) {
            alert("Please select an image first.");
            return;
        }
        
        setLoading(true);

        try {
            // 1. Upload Image to Firebase Storage
            const storageRef = ref(storage, `found_items/${Date.now()}_${image.name}`);
            await uploadBytes(storageRef, image);
            const url = await getDownloadURL(storageRef);

            // 2. Save Metadata to Firestore
            await addDoc(collection(db, "found_items"), {
                image_url: url,
                location: location,
                finderId: auth.currentUser.uid, // Track who found it
                status: "unclaimed",
                createdAt: new Date(),
            });

            alert("Evidence logged in secure inventory.");
            navigate('/'); // Return to dashboard
        } catch (error) {
            console.error(error);
            alert("Upload failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="main-content">
            <div className="card" style={{maxWidth: '600px', margin: '0 auto'}}>
                <div style={{textAlign: 'center', marginBottom: '20px'}}>
                    <div className="badge badge-pending">FORENSIC INTAKE</div>
                    <h2>Log Found Item</h2>
                </div>
                
                <form onSubmit={handleUpload}>
                    <div className="form-group" style={{border: '2px dashed #ccc', padding: '30px', textAlign: 'center', borderRadius: '12px'}}>
                        <input 
                            type="file" 
                            id="file-upload" 
                            onChange={(e) => setImage(e.target.files[0])} 
                            style={{display: 'none'}} 
                            required
                        />
                        <label htmlFor="file-upload" style={{cursor: 'pointer'}}>
                            <div style={{fontSize: '40px'}}>📸</div>
                            {image ? <span style={{color: 'green'}}>{image.name}</span> : "Click to Upload Item Image"}
                        </label>
                    </div>
                    
                    <div className="form-group">
                        <label>Discovery Location</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Canteen Basement or Bus Stand" 
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? "PROCESSING IMAGE..." : "SECURE TO DATABASE"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ReportFound;