import Button from '@mui/material/Button';
import web3 from './web3';
import { Polybase } from '@polybase/client';
import { secp256k1 } from '@polybase/util';
import { v4 as uuidv4 } from 'uuid';
import React, { useState, useEffect } from 'react';

export default function Dashboard(params) {
  const polybaseIds = [];
  const [homes, setHomes] = useState([]);

  async function loadNFT() {
    const abi = require('../src/contract/abi.json');
    const contract = new web3.eth.Contract(
      abi,
      '0x99B5A7960aFf7A27f064Bd0d79611BBe5a36C9E0',
    );
    const accounts = await web3.eth.getAccounts();

    console.log(accounts);
    // get list of tokenIds using the contract getTokenIds
    const userTokenIds = await contract.methods.getTokenIds(accounts[0]).call();

    console.log(userTokenIds);
    const nfts = [];
    userTokenIds.forEach(async (tokenId) => {
      const polybaseId = await contract.methods.tokenURI(tokenId).call();
      loadPolybase(polybaseId);
    });
  }

  async function createPolybase(params) {
    let accounts = await web3.eth.getAccounts();

    let sig2 = await web3.eth.personal.sign('Test', accounts[0]);
    //const body = { args: [v5(), 'Test'] };
    //TODO: Fill out fields for Polybase
    const body = { args: [uuidv4(), 'Test'] };

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
        console.log(data);
      });

    //TODO: Mint NFT with UUID as metadata
  }
  function loadPolybase(polybaseId) {
    fetch(
      'https://testnet.polybase.xyz/v0/collections/pk%2F0x65bb9eddbc7ec3b600d8e7068574966902d1ece4e22ccc0d2724ac0319264bd3832dd1cbac4899fd9be05e474dd26b9dfde43e5c54c9591a4be12c6b3f79bd2b%2FHomeChain%2FHouse/records/' +
        polybaseId,
    )
      .then((response) => response.json())
      .then((data) => {
        setHomes((homes) => [...homes, data.data]);
      });
  }

  return (
    <div>
      <div>Dashboard</div>
      <Button onClick={loadNFT}>Get NFT's</Button>
      <Button onClick={createPolybase}>Create Polybase Record</Button>
      <div>
        Homes
        {homes.map((home, index) => (
          <div key={index}>{home.name} </div>
        ))}
      </div>
    </div>
  );
}
