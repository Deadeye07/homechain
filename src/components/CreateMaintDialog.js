import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import web3 from '../web3';
import { v4 as uuidv4 } from 'uuid';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

export default function CreateMaintDialog(props) {
	const { id } = useParams();

	const [open, setOpen] = useState(false);
	const [description, setDescription] = useState('');
	const [contractor, setContractor] = useState('');
	const [cost, setCost] = useState('');
	const [date, setDate] = useState('');
	const polybaseURL = process.env.REACT_APP_POLYBASE_URL;

	async function handleSubmit(event) {
		event.preventDefault();
		const newId = uuidv4();
		const updateHouseBody = {
			args: [newId],
		};
		const createMaintBody = {
			args: [newId, description, contractor, date, parseInt(cost)],
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
			.then((data) => {props.onNewMaintRecord()});
	}
	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	function handleDescriptionChange(e) {
		setDescription(e.target.value);
	}
	function handleCostChange(e) {
		setCost(e.target.value);
	}
	function handleContractorChange(e) {
		setContractor(e.target.value);
	}

	return (
		<div>
			<Button variant="contained" onClick={handleClickOpen}>
				Add New
			</Button>
			<Dialog open={open} onClose={handleClose}>
				<Box sx={{ height: 500, width: 500 }}>
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
								rows={4}
								maxRows={4}
								onChange={handleDescriptionChange}
							/>
							<TextField
								margin="dense"
								id="contractor"
								label="Contractor"
								fullWidth
								onChange={handleContractorChange}
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
											<InputAdornment position="start">
												$
											</InputAdornment>
										),
									}}
									onChange={handleCostChange}
								/>
							</div>
						</DialogContent>
						<DialogActions>
							<Button onClick={handleClose}>Cancel</Button>
							<Button
								variant="contained"
								type="submit"
								onClick={handleClose}
							>
								Add
							</Button>
						</DialogActions>
					</form>
				</Box>
			</Dialog>
		</div>
	);
}
