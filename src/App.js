import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import wavePortalArtifact from "./utils/WavePortal.json"
import { FingerPrintIcon } from '@heroicons/react/outline'

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const contractAddress = "0xE6927e0B0F25Fb2D839359715Cf4170D9B80D718";
  const contractABI = wavePortalArtifact.abi

  let waveMsg = React.createRef();
  /*
  * This runs our function when the page loads.
  */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      /*
      * Check if we're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an authorized account:", account);
          setCurrentAccount(account)
          getAllWaves()
      } else {
          console.log("No authorized account found")
      }
    }
    catch (error){
      console.log(error);
    }
  }



  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const waveportalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await waveportalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        const waveTxn = await waveportalContract.wave(waveMsg.current.value);
        
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);
        waveMsg.current.value="";
        getAllWaves()
        count = await waveportalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }


  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const waveportalContract = new ethers.Contract(contractAddress, contractABI, signer);

        
        const waves = await waveportalContract.getAllWaves();
        
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }
  
  return (
    <div className="mainContainer bg-gray-300">

      <div className="dataContainer">
        <div className="header">
        🤙🏽 Sup!
        </div>

        <div className="bio font-mono">
        I am Tobel! I am a Software Engineer exploring Web3 technologies. Connect your Ethereum wallet and wave at me!
        I got <span className="text-yellow-800 font-extrabold">{allWaves.length}</span> waves so far!
        </div>

        <div className="mt-1">
        <input
          type="text"
          ref={waveMsg} 
          name="msg"
          className="shadow-md block w-full border-2 border-gray-300 px-5 focus:border-yellow-500 rounded-md"
          placeholder="Sup!"
        />
      </div>
        <button
          className="waveButton group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-300 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" onClick={wave}
        >
          <span className="absolute left-0 inset-y-0 flex items-center pl-3">
            <FingerPrintIcon className="h-5 w-5 text-white-500 group-hover:text-gray-400" aria-hidden="true" />
            
          </span>
          Wave!
        </button>

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        <ul role="list" className="divide-y divide-gray-200">
        {allWaves.map((wave, index) => {
          return (<li
          key={index}
          className="relative bg-yellow-50 py-5 px-4 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600"
        >
          <div className="flex justify-between space-x-3">
            <div className="min-w-0 flex-1">
              <a href="#" className="block focus:outline-none">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900 truncate">{wave.address}</p>
              </a>
            </div>
            <time dateTime={wave.timestamp.toString()} className="flex-shrink-0 whitespace-nowrap text-sm text-gray-500">
              {wave.timestamp.toString()}
            </time>
          </div>
          <div className="mt-1">
            <p className="line-clamp-2 text-sm text-gray-600">{wave.message}</p>
          </div>
        </li>)
        })}
        </ul>
      </div>
    </div>
  );
}
