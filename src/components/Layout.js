import { Outlet } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import web3 from '../web3';
import ResponsiveAppBar from './ResponsiveAppBar';

export default function Layout(params) {
  const [user, setUser] = useState(null);

  useEffect(() => {
     async function getAccount() {
       const accounts = await web3.eth.getAccounts();
       setUser(accounts[0])
     }
    getAccount();

    
  },[user]);

  async function login() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const accounts = await web3.eth.getAccounts();
    setUser(accounts[0]);
  }
  
  return (
    <div>
      <ResponsiveAppBar></ResponsiveAppBar>
      <div className='p-8'>
      <Outlet />

      </div>

    </div>
  );
}
