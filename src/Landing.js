import React, { useState } from "react";
import Login from "./Login.js";
import Registration from "./Registration.js";
import "./Landing.css";
import hero from "./hero.png";

export default function Landing( { formToFetchRegister, formToFetchLogin } ) {
  const [mode, setMode] = useState("login");

  return (
    <div id = "landing">

      <section id = "imgSide">
        <img src = {hero}/>
      </section>

      <section id = "loginAndRegistrationSide">
        {mode === "login" ? (
          <button className = "loginOrRegisterButton" onClick={() => setMode("register")}>
            Create an account
          </button>
        ) : (
          <button className = "loginOrRegisterButton" onClick={() => setMode("login")}>
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
      </section>

    </div>
  );
}