import { useEffect, useState } from 'react'
import './App.css';
import Landing from "./Landing.js";
import Home from "./Home.js";

const STORAGE_KEY = "agora_auth";

function App() {
  let [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      if (parsed?.token && parsed?.user) {
        setAuthToken(parsed.token);
        setUser(parsed.user);
        setIsLoggedIn(true);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);
    
  function buttonToLogout() {
    setIsLoggedIn(false);
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  function persistAuth(nextUser, token) {
    setUser(nextUser);
    setAuthToken(token);
    setIsLoggedIn(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: nextUser, token }));
  }

  function formToFetchRegister(email, password) {
    return fetch("http://localhost:3000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Registration failed");
        return res.json();
      })
      .then((data) => {
        persistAuth(data.user, data.token);
        return data.user;
      })
      .catch((err) => {
        console.error(err.message);
        throw err;
      });
  }

  async function formToFetchLogin(email, password) {
    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      let detail = "";
      try {
        const body = await res.json();
        detail = body?.error || body?.detail || JSON.stringify(body);
      } catch {
        detail = await res.text();
      }
      throw new Error(detail || "Login failed");
    }

    const data = await res.json();
    persistAuth(data.user, data.token);
    return data.user;
  }
  
  return (
    <div>
      {
        isLoggedIn === true ? 

          <Home 
          
            buttonToLogout = { buttonToLogout }
            user = { user }
            authToken = { authToken }

          /> :

            <Landing 
            
              formToFetchRegister = { formToFetchRegister }
              formToFetchLogin = { formToFetchLogin }
            
            />

      }
    </div>
  )
}

export default App;
