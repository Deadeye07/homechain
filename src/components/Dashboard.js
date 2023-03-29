import Button from '@mui/material/Button';
import web3 from '../web3';
import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import { Link } from 'react-router-dom';
import CreateHomeDialog from './CreateHomeDialog';
import Typography from '@mui/material/Typography';

export default function Dashboard(params) {
	const [homes, setHomes] = useState([]);

	const abi = require('../contract/abi.json');
	const contract = new web3.eth.Contract(
		abi,
		'0x99B5A7960aFf7A27f064Bd0d79611BBe5a36C9E0',
	);

	

	useEffect(() => {
		loadNFT();
	}, []);

	async function loadNFT(userId) {
		let accounts = await web3.eth.getAccounts();

		setHomes([]);

		// get list of tokenIds using the contract getTokenIds
		const userTokenIds = await contract.methods
			.getTokenIds(accounts[0])
			.call();

		userTokenIds.forEach(async (tokenId) => {
			const polybaseUrl = await contract.methods.tokenURI(tokenId).call();
			loadPolybase(polybaseUrl);
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

	return (
		<div>
			<div className="mt-8">
				<Typography variant="h5" color="text.secondary" gutterBottom>
					Your Homes
				</Typography>{' '}
				<div className="flex flex-wrap flex-row mb-2">
					{homes.map((home, index) => (
						<Card key={index} className="w-56 mr-6 mb-4">
							<CardContent className="h-[75%]">
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
									{home.city} {home.zip} {home.region}{' '}
									{home.country}
								</Typography>
							</CardContent>
							<CardActions>
								<Button
									size="small"
									component={Link}
									to={'/house/' + home.id}
								>
									Details
								</Button>
							</CardActions>
						</Card>
					))}
				</div>
			</div>
			<CreateHomeDialog></CreateHomeDialog>
		</div>
	);
}
