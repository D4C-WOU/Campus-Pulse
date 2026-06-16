import React from 'react'

async function Home() {

  const response = await fetch('http://localhost:8000/health')

  const data = await response.json()
  return (
    <div>backend status : {data.status}</div>
  )
}

export default Home