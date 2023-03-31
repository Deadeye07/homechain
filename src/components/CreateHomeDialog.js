import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LandscapeIcon from '@mui/icons-material/Landscape';
import BedIcon from '@mui/icons-material/Bed';
import ShowerIcon from '@mui/icons-material/Shower';
import Box from '@mui/material/Box';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Grid from '@mui/material/Grid';
import parse from 'autosuggest-highlight/parse';
import GooglePlacesService from '../services/GooglePlacesService';
import Parser from 'parse-address';
import { debounce } from '@mui/material/utils';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { v4 as uuidv4 } from 'uuid';
import web3 from '../web3';

const autocompleteService = { current: null };
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_MAPS;
function loadScript(src, position, id) {
	if (!position) {
		return;
	}

	const script = document.createElement('script');
	script.setAttribute('async', '');
	script.setAttribute('id', id);
	script.src = src;
	position.appendChild(script);
}
export default function CreateHomeDialog(props) {
	const [open, setOpen] = useState(false);
	const [value, setValue] = React.useState(null);
	const [inputValue, setInputValue] = React.useState('');
	const [options, setOptions] = React.useState([]);
	const [description, setDescription] = useState('');
	const [lotSize, setLotSize] = React.useState('');
	const [bedrooms, setBedrooms] = React.useState('');
	const [baths, setBaths] = React.useState('');
	const [yearBuilt, setYearBuilt] = useState();
	const loaded = React.useRef(false);
	const abi = require('../contract/abi.json');
	const contract = new web3.eth.Contract(
		abi,
		'0x99B5A7960aFf7A27f064Bd0d79611BBe5a36C9E0',
	);
	if (typeof window !== 'undefined' && !loaded.current) {
		if (!document.querySelector('#google-maps')) {
			loadScript(
				`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`,
				document.querySelector('head'),
				'google-maps',
			);
		}

		loaded.current = true;
	}

	const handleClose = () => {
		setOpen(false);
	};
	const handleClickOpen = () => {
		setOpen(true);
	};
	const getAddress = React.useMemo(
		() =>
			debounce((request, callback) => {
				autocompleteService.current.getPlacePredictions(
					request,
					callback,
				);
			}, 400),
		[],
	);

	useEffect(() => {
		if (value) {
			fetch(
				'https://api.precisely.com/property/v1/all/attributes/byaddress?address=' +
					value.description,
				{
					headers: new Headers({
						Authorization: 'Bearer ' + global.preciselyToken,
						'Content-Type': 'application/x-www-form-urlencoded',
					}),
				},
			)
				.then((response) => response.json())
				.then((data) => {
					if (data && data.individualValueVariable) {
						const properties = data.individualValueVariable;

						//Bedrooms PROP_BEDRMS
						const bedRooms = properties.find(
							(element) => element.name === 'PROP_BEDRMS',
						);
						setBedrooms(bedRooms.value);

						//Lot PROP_ACRES
						const lotSize = properties.find(
							(element) => element.name === 'PROP_ACRES',
						);
						setLotSize(lotSize.value);
						//Year Built PROP_YRBLD
						const yearBuilt = properties.find(
							(element) => element.name === 'PROP_YRBLD',
						);
						setYearBuilt(yearBuilt.value);
						//Baths PROP_BATHSCALC
						const baths = properties.find(
							(element) => element.name === 'PROP_BATHSCALC',
						);
						setBaths(baths.value);
					}
				});
		}
	}, [value]);
	React.useEffect(() => {
		let active = true;

		if (!autocompleteService.current && window.google) {
			autocompleteService.current =
				new window.google.maps.places.AutocompleteService();
		}
		if (!autocompleteService.current) {
			return undefined;
		}

		if (inputValue === '') {
			setOptions(value ? [value] : []);
			return undefined;
		}

		getAddress({ input: inputValue }, (results) => {
			if (active) {
				let newOptions = [];

				if (value) {
					newOptions = [value];
				}

				if (results) {
					newOptions = [...newOptions, ...results];
				}

				setOptions(newOptions);
			}
		});

		return () => {
			active = false;
		};
	}, [value, inputValue, getAddress]);
	async function parseAddressDetails() {
		let addressDetails = {};
		try {
			const placeRes = await GooglePlacesService.getPlaceDetails(
				value.place_id,
			);
			return placeRes.data;
		} catch (error) {
			let addressSelection = Parser.parseLocation(value.description);
			addressSelection.streetLine = [
				addressSelection.number,
				addressSelection.prefix,
				addressSelection.street,
				addressSelection.type,
			].join(' ');
			return addressSelection;
		}
	}

	const handleSubmit = async (event) => {
		event.preventDefault();
		createPolybase();
	};
	async function createPolybase(params) {
		let accounts = await web3.eth.getAccounts();
		const addressSelection = await parseAddressDetails();
		console.log(addressSelection);
		const body = {
			args: [
				uuidv4(),
				description,
				addressSelection.streetLine,
				'',
				addressSelection.city,
				addressSelection.state,
				addressSelection.zip,
				'USA',
			],
		};
		const timestamp = Date.now();
		const sigString = timestamp + '.' + JSON.stringify(body);

		let sig = await web3.eth.personal.sign(sigString, accounts[0]);

		const xSig = `v=0,t=${timestamp},h=eth-personal-sign,sig=${sig}`;
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
				process.env.REACT_APP_POLYBASE_URL +
					'House/records/' +
					polyBaseId +
					'?format=nft',
			)
			.send({ from: accounts[0] }, function (err, res) {
				if (err) {
					return;
				}
			});
	}
	function handleDescriptionChange(e) {
		setDescription(e.target.value);
	}

	return (
		<div>
			<Button variant="contained" onClick={handleClickOpen}>
				Add Home
			</Button>
			<Dialog open={open} onClose={handleClose}>
				<form onSubmit={handleSubmit}>
					<DialogTitle>Add New Home</DialogTitle>
					<DialogContent>
						<DialogContentText>
							Enter home information.
						</DialogContentText>
						<TextField
							autoFocus
							margin="dense"
							id="description"
							label="Name"
							fullWidth
							onChange={handleDescriptionChange}
						/>
						<Autocomplete
							id="google-map-demo"
							sx={{ width: 300 }}
							getOptionLabel={(option) =>
								typeof option === 'string'
									? option
									: option.description
							}
							filterOptions={(x) => x}
							options={options}
							autoComplete
							includeInputInList
							filterSelectedOptions
							value={value}
							noOptionsText="No locations"
							onChange={(event, newValue) => {
								setOptions(
									newValue ? [newValue, ...options] : options,
								);
								setValue(newValue);
							}}
							onInputChange={(event, newInputValue) => {
								setInputValue(newInputValue);
							}}
							renderInput={(params) => (
								<TextField
									{...params}
									label="Add a location"
									fullWidth
								/>
							)}
							renderOption={(props, option) => {
								const matches =
									option.structured_formatting
										.main_text_matched_substrings || [];

								const parts = parse(
									option.structured_formatting.main_text,
									matches.map((match) => [
										match.offset,
										match.offset + match.length,
									]),
								);

								return (
									<li {...props}>
										<Grid container alignItems="center">
											<Grid
												item
												sx={{
													display: 'flex',
													width: 44,
												}}
											>
												<LocationOnIcon
													sx={{
														color: 'text.secondary',
													}}
												/>
											</Grid>
											<Grid
												item
												sx={{
													width: 'calc(100% - 44px)',
													wordWrap: 'break-word',
												}}
											>
												{parts.map((part, index) => (
													<Box
														key={index}
														component="span"
														sx={{
															fontWeight:
																part.highlight
																	? 'bold'
																	: 'regular',
														}}
													>
														{part.text}
													</Box>
												))}

												<Typography
													variant="body2"
													color="text.secondary"
												>
													{
														option
															.structured_formatting
															.secondary_text
													}
												</Typography>
											</Grid>
										</Grid>
									</li>
								);
							}}
						/>
						<div className="mt-4">Details</div>
						<div className=" mt-2 flex flex-row">
							<div className="flex flex-col w-1/2">
								<span className="mb-2">
									<LandscapeIcon></LandscapeIcon> Lot:
									{lotSize}
								</span>
								<span>
									<CalendarMonthIcon></CalendarMonthIcon>{' '}
									Built:
									{yearBuilt}
								</span>
							</div>
							<div className="flex flex-col w-1/2">
								<span className="mb-2">
									<BedIcon></BedIcon> Bedrooms: {bedrooms}
								</span>
								<span>
									<ShowerIcon></ShowerIcon> Baths: {baths}
								</span>
							</div>
						</div>
					</DialogContent>
					<DialogActions>
						<Button className="mt-4" onClick={handleClose}>
							Cancel
						</Button>
						<Button
							disabled={!value || !description}
							variant="contained"
							type="submit"
							onClick={handleClose}
						>
							Create
						</Button>
					</DialogActions>
				</form>
			</Dialog>
		</div>
	);
}
