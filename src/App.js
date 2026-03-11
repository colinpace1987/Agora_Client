import { useState } from 'react'
import './App.css';
import Landing from "./Landing.js";
import Home from "./Home.js";

function App() {
  let [isLoggedIn, setIsLoggedIn] = useState(false);

  function buttonToLogout() {
    setIsLoggedIn(false);
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
        console.log("Registration successful:", data);
        return data;
      })
      .catch((err) => {
        console.error(err.message);
        throw err;
      });
  }

  function formToFetchLogin(email, password) {
    return fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Login failed");
        return res.json();
      })
      .then((data) => {
        console.log("Login successful:", data);
        setIsLoggedIn(true);
        return data;
      })
      .catch((err) => {
        console.error(err.message);
        throw err;
      });
  }
  
  
  return (
    <div>
      {
        isLoggedIn === true ? 

          <Home 
          
            buttonToLogout = { buttonToLogout }

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