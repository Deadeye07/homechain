import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { DataGrid } from '@mui/x-data-grid';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import web3 from '../web3';
import { v4 as uuidv4 } from 'uuid';

export default function Details(params) {
  const { id } = useParams();
  const [house, setHouse] = useState({});
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [date, setDate] = useState('');
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'firstName', headerName: 'First name', width: 130 },
    { field: 'lastName', headerName: 'Last name', width: 130 },
    {
      field: 'age',
      headerName: 'Age',
      type: 'number',
      width: 90,
    },
    {
      field: 'fullName',
      headerName: 'Full name',
      description: 'This column has a value getter and is not sortable.',
      sortable: false,
      width: 160,
      valueGetter: (params) =>
        `${params.row.firstName || ''} ${params.row.lastName || ''}`,
    },
  ];
  const rows = [
    { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
    { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
    { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
    { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
    { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
    { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
    { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
    { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
    { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
  ];

  useEffect(() => {
    loadHouseDetails();
  }, []);

  function loadHouseDetails() {
    fetch(
      'https://testnet.polybase.xyz/v0/collections/pk%2F0x65bb9eddbc7ec3b600d8e7068574966902d1ece4e22ccc0d2724ac0319264bd3832dd1cbac4899fd9be05e474dd26b9dfde43e5c54c9591a4be12c6b3f79bd2b%2FHomeChain%2FHouse/records/' +
        id +
        '?format=nft',
    )
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setHouse(data);
        }
      });
  }
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  async function handleSubmit(event) {
    event.preventDefault();

    let accounts = await web3.eth.getAccounts();
    let sig2 = await web3.eth.personal.sign('Test', accounts[0]);
    const newId = uuidv4();
    const updateHouseBody = {
      args: [newId],
    };
    const createMaintBody = {
      args: [newId, description, date, parseInt(cost)],
    };
    const timestamp = Date.now();
    const xSig = `v=0,t=${timestamp},h=eth-personal-sign,sig=${sig2}`;
    const updateRequestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Polybase-Signature': xSig,
      },
      body: JSON.stringify(updateHouseBody),
    };
    const createRequestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Polybase-Signature': xSig,
      },
      body: JSON.stringify(createMaintBody),
    };
    fetch(
      'https://testnet.polybase.xyz/v0/collections/pk%2F0x65bb9eddbc7ec3b600d8e7068574966902d1ece4e22ccc0d2724ac0319264bd3832dd1cbac4899fd9be05e474dd26b9dfde43e5c54c9591a4be12c6b3f79bd2b%2FHomeChain%2FHouse/records/' +
        id +
        '/call/addMaintenance',
      updateRequestOptions,
    )
      .then((response) => response.json())
      .then((data) => {});

    fetch(
      'https://testnet.polybase.xyz/v0/collections/pk%2F0x65bb9eddbc7ec3b600d8e7068574966902d1ece4e22ccc0d2724ac0319264bd3832dd1cbac4899fd9be05e474dd26b9dfde43e5c54c9591a4be12c6b3f79bd2b%2FHomeChain%2FMaintenance/records',
      createRequestOptions,
    )
      .then((response) => response.json())
      .then((data) => {});
  }

  function handleDescriptionChange(e) {
    setDescription(e.target.value);
  }
  function handleCostChange(e) {
    setCost(e.target.value);
  }
  
  return (
    <div>
      <Button
        component={Link}
        to={'/dashboard'}
        startIcon={<ChevronLeftIcon />}
      >
        Dashboard
      </Button>
      <Card className="w-56 mb-12 mt-4">
        <CardContent>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            {house?.name}
          </Typography>
          <Typography variant="h5" component="div">
            {house.street1} {house.street2}
          </Typography>
          <Typography variant="body2">
            {house.city} {house.zip} {house.region} {house.country}
          </Typography>
        </CardContent>
        <CardActions>
          <Button size="small">Transfer</Button>
        </CardActions>
      </Card>
      Maintenance History
      <Box sx={{ height: 500, width: '75%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[10]}
          disableRowSelectionOnClick
        />
      </Box>
      <Button onClick={handleClickOpen}>Add New</Button>
      <Dialog open={open} onClose={handleClose}>
        <Box sx={{ height: 420, width: 500 }}>
          <form onSubmit={handleSubmit}>
            <DialogTitle>Add New Maintenance</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                id="description"
                label="Description"
                fullWidth
                multiline
                maxRows={4}
                onChange={handleDescriptionChange}
              />
              <div className="mt-2 flex flex-col">
                <DatePicker
                  value={date}
                  label="Date"
                  onChange={(newValue) => setDate(newValue)}
                />
                <TextField
                  className="mt-2"
                  margin="normal"
                  label="Cost"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                  onChange={handleCostChange}
                />
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit" onClick={handleClose}>
                Add
              </Button>
            </DialogActions>
          </form>
        </Box>
      </Dialog>
    </div>
  );
}
