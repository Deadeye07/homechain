import React, { useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';
import CottageIcon from '@mui/icons-material/Cottage';
import web3 from '../web3';
import Fingerprint from '@mui/icons-material/Fingerprint';
import { Link } from 'react-router-dom';
import MetaMask from '../assets/metamask.png'

const pages = ['Dashboard', 'FAQ'];

function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [user, setUser] = React.useState(null);

  useEffect(() => {
    async function getAccount() {
      const accounts = await web3.eth.getAccounts();
      if (accounts.length === 0) {
        setUser(null);
      } else {
        setUser(accounts[0]);
      }
    }
    let accounts = getAccount();
  }, [user]);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  async function login() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const accounts = await web3.eth.getAccounts();
    setUser(accounts[0]);
  }
  return (
    <AppBar position="static">
      <Container maxWidth="full">
        <Toolbar disableGutters>
          <CottageIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            HomeChain
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page} onClick={handleCloseNavMenu}>
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href=""
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            LOGO
          </Typography>
          <Button
              onClick={handleCloseNavMenu}
              component={Link}
              to="/dashboard"
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              FAQ
          </Button>
          <Button
              onClick={handleCloseNavMenu}
              component={Link}
              to="/dashboard"
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              HOWS IT WORK?
            </Button>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <Button
              onClick={handleCloseNavMenu}
              component={Link}
              to="/dashboard"
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Dashboard
            </Button>
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            {user ? (
              <Tooltip title="Open settings">
                <Button
                  color="secondary"
                  variant="contained"
                  onClick={handleOpenUserMenu}
                >
                  <span className='pt-1'>{user?.slice(0, 4)} ... {user?.slice(-4)}</span>
                  <img className='ml-2' width={24} src={MetaMask} alt="metamask" />
                </Button>
              </Tooltip>
            ) : (
              <Button  variant="contained" onClick={login}>
                Login
              </Button>
            )}

            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {/* <MenuItem
                component={Link}
                to="/dashboard"
                onClick={handleCloseUserMenu}
              > 
                <Typography textAlign="center">Dashboard</Typography>
              </MenuItem>*/}
              <MenuItem onClick={handleCloseUserMenu}>
                <Typography textAlign="center">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;
