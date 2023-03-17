import Button from '@mui/material/Button';
import web3 from '../web3';
import { Polybase } from '@polybase/client';
import { secp256k1 } from '@polybase/util';
import { v4 as uuidv4 } from 'uuid';
import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {
  CountryDropdown,
  RegionDropdown,
  CountryRegionData,
} from 'react-country-region-selector';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';

export default function Dashboard(params) {
  const polybaseIds = [];
  const [homes, setHomes] = useState([]);
  const [open, setOpen] = useState(false);
  const [region, setRegion] = useState('');
  const [country, setCountry] = useState('');
  const [description, setDescription] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [yearBuilt, setYearBuilt] = useState();

  const abi = require('../contract/abi.json');
  const contract = new web3.eth.Contract(
    abi,
    '0x99B5A7960aFf7A27f064Bd0d79611BBe5a36C9E0',
  );

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    loadNFT();
  }, []);

  async function loadNFT() {
    setHomes([]);
    const accounts = await web3.eth.getAccounts();

    console.log(accounts);
    // get list of tokenIds using the contract getTokenIds
    const userTokenIds = await contract.methods.getTokenIds(accounts[0]).call();

    console.log(userTokenIds);
    const nfts = [];
    userTokenIds.forEach(async (tokenId) => {
      const polybaseUrl = await contract.methods.tokenURI(tokenId).call();
      loadPolybase(polybaseUrl);
    });
  }
  async function createPolybase(params) {
    let accounts = await web3.eth.getAccounts();
    let sig2 = await web3.eth.personal.sign('Test', accounts[0]);
    const body = {
      args: [
        uuidv4(),
        description,
        parseInt(yearBuilt),
        line1,
        line2,
        city,
        region,
        zip,
        country,
      ],
    };

    const timestamp = Date.now();
    const xSig = `v=0,t=${timestamp},h=eth-personal-sign,sig=${sig2}`;
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Polybase-Signature': xSig,
      },
      body: JSON.stringify(body),
    };

    fetch(
      'https://testnet.polybase.xyz/v0/collections/pk%2F0x65bb9eddbc7ec3b600d8e7068574966902d1ece4e22ccc0d2724ac0319264bd3832dd1cbac4899fd9be05e474dd26b9dfde43e5c54c9591a4be12c6b3f79bd2b%2FHomeChain%2FHouse/records',
      requestOptions,
    )
      .then((response) => response.json())
      .then((data) => {
        mintNft(data.data.id);
      });
  }
  async function mintNft(polyBaseId) {
    let accounts = await web3.eth.getAccounts();
    await contract.methods
      .create(
        accounts[0],
        'https://testnet.polybase.xyz/v0/collections/pk%2F0x65bb9eddbc7ec3b600d8e7068574966902d1ece4e22ccc0d2724ac0319264bd3832dd1cbac4899fd9be05e474dd26b9dfde43e5c54c9591a4be12c6b3f79bd2b%2FHomeChain%2FHouse/records/' +
          polyBaseId +
          '?format=nft',
      )
      .send({ from: accounts[0] }, function (err, res) {
        if (err) {
          console.log('An error occurred', err);
          return;
        }
        console.log('Hash of the transaction: ' + res);
      });
  }
  function loadPolybase(polybaseUrl) {
    fetch(polybaseUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setHomes((homes) => [...homes, data]);
        }
      });
  }
  const handleSubmit = async (event) => {
    event.preventDefault();
    createPolybase();
  };
  function handleDescriptionChange(e) {
    setDescription(e.target.value);
  }
  function handleLine1Change(e) {
    setLine1(e.target.value);
  }
  function handleLine2Change(e) {
    setLine2(e.target.value);
  }
  function handleCityChange(e) {
    setCity(e.target.value);
  }
  function handleZipChange(e) {
    setZip(e.target.value);
  }
  function handleYearBuiltChange(e) {
    setYearBuilt(e.target.value);
  }

  return (
    <div>
      <div>Dashboard</div>
      <div className="mt-8">
        Your Homes
        <div className='flex flex-row'>
          {homes.map((home, index) => (
            <Card key={index} className="w-56 mr-6">
              <CardContent>
                <Typography
                  sx={{ fontSize: 14 }}
                  color="text.secondary"
                  gutterBottom
                >
                  {home.name}
                </Typography>
                <Typography variant="h5" component="div">
                  {home.street1} {home.street2}
                </Typography>
                <Typography variant="body2">
                  {home.city} {home.zip} {home.region} {home.country}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" component={Link} to={'/house/' + home.id}>
                  Details
                </Button>
              </CardActions>
            </Card>
          ))}
        </div>
      </div>
      <Button onClick={handleClickOpen}>Add Home</Button>

      <Dialog open={open} onClose={handleClose}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Add New Home</DialogTitle>
          <DialogContent>
            <DialogContentText>Enter in home information.</DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="description"
              label="Name"
              fullWidth
              onChange={handleDescriptionChange}
            />
            <TextField
              type={'number'}
              autoFocus
              id="built"
              label="Year Built"
              margin="dense"
              onChange={handleYearBuiltChange}
            />
            <TextField
              autoFocus
              id="line1"
              label="Line 1"
              margin="dense"
              fullWidth
              onChange={handleLine1Change}
            />
            <TextField
              autoFocus
              id="line2"
              label="Line 2"
              margin="dense"
              fullWidth
              onChange={handleLine2Change}
            />
            <TextField
              autoFocus
              id="city"
              label="City"
              margin="dense"
              onChange={handleCityChange}
            />

            <TextField
              autoFocus
              id="zip"
              label="Zip"
              margin="dense"
              onChange={handleZipChange}
            />
            <CountryDropdown
              value={country}
              onChange={(val) => setCountry(val)}
            />
            <RegionDropdown
              country={country}
              value={region}
              onChange={(val) => setRegion(val)}
            />
          </DialogContent>
          <DialogActions>
            <Button className='mt-4' onClick={handleClose}>Cancel</Button>
            <Button type="submit" onClick={handleClose}>
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
