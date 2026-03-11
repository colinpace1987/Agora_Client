function Home( { buttonToLogout } ) {
  function logout() {
    buttonToLogout();
  }
  
  return (
    <div>
      <h1>Home Page</h1>

      <button onClick={logout}>
        Logout
      </button>
    </div>
  )
}

export default Home;