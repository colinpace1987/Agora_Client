import React, { useState } from "react";

export default function Registration( { formToFetchRegister } ) {
  let [toLogin, setToLogin] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError("Both fields are required.");
      return;
    }

    setError("");
    //console.log("Login attempt:", form);
    formToFetchRegister(form.email, form.password, "register");
  }

  return (
    <div className="container">

            <form className="form" onSubmit={handleSubmit}>
                <h2>Register</h2>

                <label>Email</label>
                <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="input"
                />

                <label>Password</label>
                <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="input"
                />

                {error && <p className="error">{error}</p>}

                <button type="submit" className="button">
                    Sign In
                </button>
            </form>

    </div>
  );
}