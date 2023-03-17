import { Outlet } from 'react-router-dom';
import Button from '@mui/material/Button';
import { Auth } from '@polybase/auth';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const auth = new Auth();

export default function Layout(params) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    auth.onAuthUpdate((authState) => {
      if (authState) {
        if (!user) {
          setUser(authState);
        }
        // User is logged in, show button to dashboard
      } else {
        // User is NOT logged in, show login button
        setUser(null);
      }
    });
  },[user]);

  async function login() {
    setUser(await auth.signIn());
  }

  return (
    <div>
      <div className="w-full flex justify-end">
   
              <div className='w-full flex justify-start'>
                  <Button component={Link} to="/home">Home</Button>
              </div>
              {user?.userId && (
          <div className='flex'>
            <Button component={Link} to="/dashboard">
              Dashboard
            </Button>
            <Button className='w-max' onClick={login}>Acct. ...{user?.userId.slice(-4)}</Button>
          </div>
        )}
        {!user?.userId && (
          <Button onClick={login} variant="contained">
            Login
          </Button>
        )}
      </div>
      <div className='p-8'>
      <Outlet />

      </div>

    </div>
  );
}
