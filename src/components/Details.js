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
  const [rows, setRows] = useState([]);

  const polybaseURL =
    'https://testnet.polybase.xyz/v0/collections/pk%2F0x65bb9eddbc7ec3b600d8e7068574966902d1ece4e22ccc0d2724ac0319264bd3832dd1cbac4899fd9be05e474dd26b9dfde43e5c54c9591a4be12c6b3f79bd2b%2FHomeChain%2F';
  const columns = [
    { field: 'description', headerName: 'Description', width: 400 },
    {
      field: 'cost',
      headerName: 'Cost',
      width: 130,
      valueFormatter: (params) => (params.value ? '$' + params?.value : ''),
    },
    {
      field: 'date',
      headerName: 'Date',
      width: 200,
      valueFormatter: (params) =>
        params.value
          ? new Date(params?.value).toLocaleString().split(',')[0]
          : '',
    },
  ];

  useEffect(() => {
    loadHouseDetails();
  }, []);

  function loadHouseDetails() {
    fetch(polybaseURL + 'House/records/' + id + '?format=nft')
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setHouse(data);
          if (data.maintenance) {
            data.maintenance.forEach(async (maintId) => {
              loadMaintRecord(maintId);
            });
          }
        }
      });
  }
  function loadMaintRecord(id) {
    fetch(polybaseURL + 'Maintenance/records/' + id + '?format=nft')
      .then((response) => response.json())
      .then((data) => {
        if (data.id) {
          setRows((oldArray) => [...oldArray, data]);
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
    const newId = uuidv4();
    const updateHouseBody = {
      args: [newId],
    };
    const createMaintBody = {
      args: [newId, description, date, parseInt(cost)],
    };
    const timestamp = Date.now();
    const sigString = timestamp + '.' + JSON.stringify(updateHouseBody);

    let accounts = await web3.eth.getAccounts();

    let sig = await web3.eth.personal.sign(sigString, accounts[0]);

    const xSig = `v=0,t=${timestamp},h=eth-personal-sign,sig=${sig}`;

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
      polybaseURL + 'House/records/' + id + '/call/addMaintenance',
      updateRequestOptions,
    )
      .then((response) => response.json())
      .then((data) => {});

    fetch(polybaseURL + 'Maintenance/records', createRequestOptions)
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
              <Button variant="contained" type="submit" onClick={handleClose}>
                Add
              </Button>
            </DialogActions>
          </form>
        </Box>
      </Dialog>
    </div>
  );
}
