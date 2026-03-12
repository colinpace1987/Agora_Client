import React, { useState } from "react";
import "./ProfileForm.css";

const qualitiesList = [
  "Science",
  "Technology",
  "Engineering",
  "Mathematics",
  "Humanities",
  "Arts",
  "Leadership",
  "Creativity",
  "Communication",
];

function ProfileForm({ closeModal, user, onSubmitComplete, authToken }) { 
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    username: "",
    profession: "",
    degree: "",
    bio: "",
    qualities: [],
  });

  const authHeaders = authToken ? { Authorization: `Bearer ${authToken}` } : {};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleQuality = (quality) => {
    setFormData((prev) => {
      const newQualities = prev.qualities.includes(quality)
        ? prev.qualities.filter((q) => q !== quality)
        : prev.qualities.length < 5
        ? [...prev.qualities, quality]
        : prev.qualities; // max 5
      return { ...prev, qualities: newQualities };
    });
  };

  const sendData = (formData) => {
    if (!user) {
      throw new Error("User not logged in");
    }

    return fetch("http://localhost:3000/profileForm", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ formData }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Profile form failed");
        return res.json();
      })
      .then((data) => {
        console.log("Profile form successful:", data);
        return data;
      })
      .catch((err) => {
        console.error(err.message);
        throw err;
      });
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    await sendData(formData);
    closeModal();
    if (onSubmitComplete) onSubmitComplete();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Step {step} of 5</h2>

        {step === 1 && (
          <div className="step">
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
        )}

        {step === 2 && (
          <div className="step">
            <label>Profession:</label>
            <input
              type="text"
              name="profession"
              value={formData.profession}
              onChange={handleChange}
            />
          </div>
        )}

        {step === 3 && (
          <div className="step">
            <label>Degree / Education:</label>
            <input
              type="text"
              name="degree"
              value={formData.degree}
              onChange={handleChange}
            />
          </div>
        )}

        {step === 4 && (
          <div className="step">
            <label>Bio / Additional Info:</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
            />
          </div>
        )}

        {step === 5 && (
          <div className="step">
            <label>Select up to 5 qualities:</label>
            <div className="qualities-container">
              {qualitiesList.map((q) => (
                <button
                  key={q}
                  type="button"
                  className={`quality-btn ${
                    formData.qualities.includes(q) ? "selected" : ""
                  }`}
                  onClick={() => toggleQuality(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="navigation">
          <button onClick={closeModal}>Cancel</button>
          {step > 1 && <button onClick={prevStep}>Back</button>}
          {step < 5 && <button onClick={nextStep}>Next</button>}
          {step === 5 && <button onClick={handleSubmit}>Submit</button>}
        </div>
      </div>
    </div>
  );
}

export default ProfileForm;
