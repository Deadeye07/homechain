import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { DataGrid } from '@mui/x-data-grid';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Box from '@mui/material/Box';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LandscapeIcon from '@mui/icons-material/Landscape';
import BedIcon from '@mui/icons-material/Bed';
import ShowerIcon from '@mui/icons-material/Shower';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import CreateMaintDialog from './CreateMaintDialog';

export default function Details(params) {
	const { id } = useParams();
	const [house, setHouse] = useState({});

	const [rows, setRows] = useState([]);
	const [lotSize, setLotSize] = React.useState('');
	const [bedrooms, setBedrooms] = React.useState('');
	const [baths, setBaths] = React.useState('');
	const [yearBuilt, setYearBuilt] = useState();
	const polybaseURL = process.env.REACT_APP_POLYBASE_URL;

	const columns = [
		{ field: 'description', headerName: 'Description', width: 400 },
		{ field: 'contractor', headerName: 'Contractor', width: 300 },
		{
			field: 'cost',
			headerName: 'Cost',
			width: 130,
			valueFormatter: (params) =>
				params.value ? '$' + params?.value : '',
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
		{
			field: 'receipt',
			headerName: '',
			width: 200,
			renderCell: (params) => (
				<Tooltip title="View Receipt">
					<ReceiptLongIcon></ReceiptLongIcon>
				</Tooltip>
			),
		},
	];

	useEffect(() => {
		loadHouseDetails();
	}, []);

	function loadHouseDetails() {
		setRows([]);
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
					const addressString =
						data.street1 +
						' ' +
						data.city +
						' ' +
						data.region +
						' ' +
						data.zip +
						' ' +
						data.country;
					fetch(
						'https://api.precisely.com/property/v1/all/attributes/byaddress?address=' +
							addressString,
						{
							headers: new Headers({
								Authorization:
									'Bearer ' + global.preciselyToken,
								'Content-Type':
									'application/x-www-form-urlencoded',
							}),
						},
					)
						.then((response) => response.json())
						.then((data) => {
							if (data) {
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
									(element) =>
										element.name === 'PROP_BATHSCALC',
								);
								setBaths(baths.value);
							}
						});
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

	return (
		<div>
			<Button
				component={Link}
				to={'/dashboard'}
				startIcon={<ChevronLeftIcon />}
			>
				Dashboard
			</Button>
			<div className="w-3/4 mb-12 mt-4">
				<CardContent>
					<Typography
						sx={{ fontSize: 14 }}
						color="text.secondary"
						gutterBottom
					>
						{house?.name}
					</Typography>
					<Typography variant="h5" component="div">
						{house.street1} {house.street2}
					</Typography>
					<Typography variant="body2">
						{house.city} {house.zip} {house.region} {house.country}
					</Typography>
					<div className=" mt-2 flex flex-row">
						<div className="flex flex-col w-1/2">
							<span className="mb-2">
								<LandscapeIcon></LandscapeIcon> Lot:{lotSize}
							</span>
							<span>
								<CalendarMonthIcon></CalendarMonthIcon> Built:
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
				</CardContent>
			</div>
			Maintenance History
			<Box className="mb-2" sx={{ height: 500, width: '100%' }}>
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
			<CreateMaintDialog onNewMaintRecord={loadHouseDetails}></CreateMaintDialog>
		</div>
	);
}
