import abi from '../utils/ShowMeSupport.json';
import { ethers } from "ethers";
import Head from 'next/head'
import { ToastContainer, toast } from "react-toastify";
import React, { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import styles from '../styles/Home.module.css'

export default function Home() {
  // Contract Address & ABI
  const contractAddress = "0x57d9a16618780c0977F2733A41DBa9124796c65b";
  const contractABI = abi.abi;

  // Component state
  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);

  const tipValue = 0.001;
  const [tip, setTip] = useState(1);
  const getTipValueInEth = () => (tip * tipValue).toFixed(3);

  const onTipInputHandler = (e) => {
    const { value } = e.target;
    if (value <= 1000 && value.length < 5) {
      setTip(value);
    }
  };

  const onAction = () => {
    if (currentAccount) {
      showSupport(name, message, getTipValueInEth().toString());
    } else {
      isWalletConnected();
    }
  };


  const onNameChange = (event) => {
    setName(event.target.value);
  }

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  }

  // Wallet connection logic
  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      const accounts = await ethereum.request({ method: 'eth_accounts' })
      console.log("accounts: ", accounts);


      if (accounts.length > 0) {
        const account = accounts[0];
        console.log("wallet is connected! " + account);
        toast.success("🦄 Wallet is Connected!");

      } else {
        console.log("make sure MetaMask is connected");
        toast.warn("Make sure MetaMask is Connected");
      }
    } catch (error) {
      console.log("error: ", error);
      toast.error("error: ", error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("please install MetaMask");
        toast.warn("please install MetaMask");
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
      toast.error("Ops! Failed to connect with wallet.");
    }
  }

  const showSupport = async (name, message, tip) => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const showMeSupport = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("showing support..")
        toast.info("Showing support...");
        const supportTxn = await showMeSupport.showSupport(
          name ? name : "anonymous",
          message ? message : "My support!",
          { value: ethers.utils.parseEther(tip) }
        );

        await supportTxn.wait();

        console.log("mined ", supportTxn.hash);

        console.log("support shown!");
        toast.success("Awesome! Thanks for your support.");

        // Clear the form fields.
        setName("");
        setMessage("");
      }
    } catch (error) {
      console.log(error);
      toast.error("Ops! Support failed.");
    }
  };

  // Function to fetch all memos stored on-chain.
  const getMemos = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const showMeSupport = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("fetching memos from the blockchain..");
        const memos = await showMeSupport.getMemos();
        console.log("fetched!");
        setMemos(memos);
      } else {
        console.log("Metamask is not connected");
      }

    } catch (error) {
      console.log(error);
      toast.error("Ops! Failed to get the memos.");
    }
  };

  useEffect(() => {
    let showMeSupport;
    isWalletConnected();
    getMemos();

    // Create an event handler function for when someone sends
    // us a new memo.
    const onNewMemo = (from, timestamp, name, message) => {
      console.log("Memo received: ", from, timestamp, name, message);
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name
        }
      ]);
    };

    const { ethereum } = window;

    // Listen for new memo events.
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum,
        "any");
      const signer = provider.getSigner();
      showMeSupport = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      showMeSupport.on("NewMemo", onNewMemo);
    }

    return () => {
      if (showMeSupport) {
        showMeSupport.off("NewMemo", onNewMemo);
      }
    }
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Show Me Support </title>
        <meta name="description" content="Tipping site" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <nav className={styles.connectSign}>
        <div>
          <button onClick={connectWallet} className=
            {styles.connectButton2}> Connect your wallet </button>
        </div>
        <div className={styles.connectStatus}>
          {currentAccount !== "" ? "Connected to" : "Not Connected. Please connect to view supports"} {currentAccount !== "" ? (currentAccount.substring(0, 15) + '...') : ""}
        </div>
      </nav>

      <main className={styles.main}>

        <h1 className={styles.title}>
          GoSupport <span className={styles.title2}>Me</span>
        </h1>

        <p className={styles.describe}>Kindly fuel our Blockchain journey with your
          support &#128640;</p>

        {currentAccount ? (
          <div className={styles.form} >
            <form noValidate className={styles.formInline}>
              <div className={styles.nameForm}>
                <label>
                  Name
                </label>


                <input
                  id="name"
                  type="text"
                  placeholder="anonymous"
                  onChange={onNameChange}
                />
              </div>
              <br />
              <div className={styles.sendmsgForm}>
                <label>
                  Send a message
                </label>
                <br />

                <textarea
                  rows={3}
                  placeholder="Support!"
                  id="message"
                  onChange={onMessageChange}
                  required
                >
                </textarea>
              </div>
              <div className={styles.supportTip}>
                <span>Support:</span>

                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={tip}
                  onChange={onTipInputHandler}
                />
              </div>
              <span className={styles.supportValue}>1 support = 0.001ETH, 2 support = 0.002ETH  etc</span>
              <div align="center">
                <button
                  type="button"
                  onClick={onAction}
                >
                  Show Support
                </button>
              </div>
            </form>
          </div>
        ) : (
            <button onClick={connectWallet} className=
              {styles.connectButton}> Connect your wallet </button>
          )}
      </main>

      {currentAccount && (<h1 className={styles.supportH1}>Supports received</h1>)}

      {currentAccount && (memos.map((memo, idx) => {
        return (
          <div key={idx} className={styles.memoList}>
            <p style={{ "fontWeight": "bold"}}>"{memo.message}"</p>
            <p>From: {memo.name} at {memo.timestamp.toString()}</p>
          </div>
        )
      }))}



      <footer className={styles.footer}>
        Created by Binary Brains Group for Grandida Group Project!
      </footer>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover

      />
    </div>
  )
}
