import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ClubDetails = () => {
  const { id } = useParams(); // Club ID from route params
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClubDetails = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get(`/api/clubs/${id}`);
        setClub(response.data.data);
      } catch (err) {
        setError("Failed to load club details.");
      }
      setLoading(false);
    };

    fetchClubDetails();
  }, [id]);

  if (loading) return <p className="text-center mt-8">Loading...</p>;
  if (error)
    return <p className="text-center mt-8 text-red-600">{error}</p>;
  if (!club) return <p className="text-center mt-8">Club not found.</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{club.name}</h1>
      {club.logoUrl && (
        <img
          src={club.logoUrl}
          alt={`${club.name} logo`}
          className="w-48 h-48 object-contain mb-6 rounded-lg shadow"
        />
      )}
      <p className="text-lg mb-4">{club.description}</p>
      <div className="mb-4">
        <strong>Contact:</strong> {club.contact || "N/A"}
      </div>
      <div className="mb-4">
        <strong>Created At:</strong>{" "}
        {new Date(club.createdAt).toLocaleDateString()}
      </div>
      {/* Add more club details as needed */}

      {/* You may include club events or member list here as future enhancement */}
    </div>
  );
};

export default ClubDetails;
