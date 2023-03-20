import * as React from 'react';import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import useMediaQuery from '@mui/material/useMediaQuery';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Details from './components/Details';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import pink from '@mui/material/colors/pink';
function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
 //const prefersDarkMode = false;
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          primary: pink,
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode],
  );
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="home" element={<Home />} />
            <Route path="dashboard" element={<Dashboard />} />
          <Route path="house/:id" element={<Details/>} />

          <Route path="*" element={<Home />} />
        </Route>
        </Routes>
        </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
