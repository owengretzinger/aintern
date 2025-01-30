import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/Home.css";

const Home: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector("input") as HTMLInputElement;
    const url = input.value;

    if (!url) return;

    try {
      setLoading(true);
      setError(null);
      input.classList.add("active");

      const response = await fetch("http://localhost:3001/api/summon/summon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meeting_url: url,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create meeting");
      }

      // Clear input and redirect to dashboard
      input.value = "";
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create meeting");
    } finally {
      setLoading(false);
      input.classList.remove("active");
    }
  };

  return (
    <section className="home">
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="enter meeting url" disabled={loading} />
        <p className="active">
          {loading ? "Sending intern to meeting..." : error ? error : "\u00A0"}
        </p>
      </form>
    </section>
  );
};

export default Home;
