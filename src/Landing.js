import React, { useState } from "react";
import Login from "./Login.js";
import Registration from "./Registration.js";

export default function Landing( { formToFetchRegister, formToFetchLogin } ) {
  const [mode, setMode] = useState("login");

  return (
    <div>
      

      {mode === "login" ? (
        <button onClick={() => setMode("register")}>
          Create an account
        </button>
      ) : (
        <button onClick={() => setMode("login")}>
          Back to login
        </button> 
      )}

      {mode === "login" ? 
        
        <Login 
        
          formToFetchLogin = {formToFetchLogin}

        /> 
        
        : 
        
        <Registration 
        
          formToFetchRegister = {formToFetchRegister}
        
        />}
    </div>
  );
}