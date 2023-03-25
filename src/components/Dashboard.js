import Button from '@mui/material/Button';
import web3 from '../web3';
import { v4 as uuidv4 } from 'uuid';
import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import Autocomplete from '@mui/material/Autocomplete';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LandscapeIcon from '@mui/icons-material/Landscape';
import BedIcon from '@mui/icons-material/Bed';
import ShowerIcon from '@mui/icons-material/Shower';
import Box from '@mui/material/Box';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Grid from '@mui/material/Grid';
import parse from 'autosuggest-highlight/parse';
import { debounce } from '@mui/material/utils';
import GooglePlacesService from '../services/GooglePlacesService';
import Parser from 'parse-address';
import { secp256k1, decodeFromString, encodeToString, EncryptedDataSecp256k1 } from '@polybase/util';

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

const autocompleteService = { current: null };

export default function Dashboard(params) {
	const [homes, setHomes] = useState([]);
	const [open, setOpen] = useState(false);
	const [region, setRegion] = useState('');
	const [country, setCountry] = useState('');
	const [description, setDescription] = useState('');
	const [line1, setLine1] = useState('');
	const [line2, setLine2] = useState('');
	const [city, setCity] = useState('');
	const [zip, setZip] = useState('');
	const [addressSelection, setAddressSelection] = React.useState(null);
	const [lotSize, setLotSize] = React.useState('');
	const [bedrooms, setBedrooms] = React.useState('');
	const [baths, setBaths] = React.useState('');
	const [yearBuilt, setYearBuilt] = useState();
	const [value, setValue] = React.useState(null);
	const [inputValue, setInputValue] = React.useState('');
	const [options, setOptions] = React.useState([]);
	const loaded = React.useRef(false);

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

	useEffect(() => {
		loadNFT();
	}, []);

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
    
    async function parseAddressDetails () {
        let addressDetails = {};
        try {
            const placeRes = await GooglePlacesService.getPlaceDetails(value.place_id);
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
				'https://testnet.polybase.xyz/v0/collections/pk%2F0x65bb9eddbc7ec3b600d8e7068574966902d1ece4e22ccc0d2724ac0319264bd3832dd1cbac4899fd9be05e474dd26b9dfde43e5c54c9591a4be12c6b3f79bd2b%2FHomeChain%2FHouse/records/' +
					polyBaseId +
					'?format=nft',
			)
			.send({ from: accounts[0] }, function (err, res) {
				if (err) {
					return;
				}
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
	function handleStateChange(e) {
		setRegion(e.target.value);
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
									Built:{yearBuilt}
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
