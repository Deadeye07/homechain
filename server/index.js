const serverless = require("serverless-http");
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());

const googleApiKey = process.env.GOOGLE_API_KEY;

app.get("/", (req, res, next) => {
    return res.status(200).json({
        message: "Hello from root!",
    });
});

app.get('/placeDetails', (req, res) => {
    console.log(req.query);
    axios
        .get(`https://maps.googleapis.com/maps/api/place/details/json`, {
            params: {
                place_id: req.query.placeId,
                key: googleApiKey
            }
        }).then((details) => {
            console.log(details);
            console.log('data', details.data);
            res.json(parseAddress(details.data));
            return res;
        }).catch((error) => {
            return res.status(400);
        })
});

function parseAddress(placeDetails) {
    let address_components = placeDetails.result.address_components;

    const placeTypes = {
        streetNumber: ["street_number"],
        zip: ["postal_code"],
        street: ["street_address", "route"],
        state: [
            "administrative_area_level_1",
            "administrative_area_level_2",
            "administrative_area_level_3",
            "administrative_area_level_4",
            "administrative_area_level_5"
        ],
        city: [
            "locality",
            "sublocality",
            "sublocality_level_1",
            "sublocality_level_2",
            "sublocality_level_3",
            "sublocality_level_4"
        ],
        country: ["country"]
    };

    const address = {
        streetNumber: "",
        zip: "",
        street: "",
        state: "",
        city: "",
        country: ""
    };

    address_components.forEach(component => {
        for (let shouldBe in placeTypes) {
            if (placeTypes[shouldBe].indexOf(component.types[0]) !== -1) {
                if (shouldBe === "country") {
                    address[shouldBe] = component.short_name;
                } else {
                    address[shouldBe] = component.long_name;
                }
            }
        }
    });
    address.streetLine = `${address.streetNumber} ${address.street}`;
    return address;
}

app.listen(8000, () =>
    console.log('Example app listening on port 8000!'),
);


module.exports.handler = serverless(app);