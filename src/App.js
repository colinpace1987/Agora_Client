import { useState } from 'react'
import './App.css';
import Landing from "./Landing.js";
import Home from "./Home.js";

function App() {
  let [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null); // stores { id, email }
    
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
        setUser(data.user);      // store the user with id
        setIsLoggedIn(true);     // mark as logged in
        return data.user;        // return only the user object
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
        setUser(data.user);      // store the user with id
        setIsLoggedIn(true);     // mark as logged in
        return data.user;        // return only the user object
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
            user = { user }

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