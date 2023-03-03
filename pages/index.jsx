import Head from 'next/head'
import { ethers } from "ethers";
import { ToastContainer, toast } from "react-toastify";
import React, { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import styles from '../styles/Home.module.css'
import abi from '../utils/SupportContract.json';
import moment from "moment";

export default function Home() {
  // Contract Address & ABI
  const address = "0x0B9f832c6180Ff2aa451a41FFA1E38Ab7EB25962"
  const ABI = abi.abi;

  const [account, setAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [supportMessages, setSupportMessages] = useState([]);
  const [show, setShow] = useState();

  const tipValue = 0.001;
  const [tip, setTip] = useState(1);
  const tipValueInEth = () => (tip * tipValue).toFixed(3);

  const tipInputHandler = (e) => {
    const { value } = e.target;
    if (value <= 1000 && value.length < 5) {
      setTip(value);
    }
  };
  const performAction = () => {
    if (account) {
      showSupport(name, message, tipValueInEth().toString());
    } else {
      checkWalletConnection();
    }
  };


  const updateName= (event) => {
    setName(event.target.value);
  }

  const updateMessage = (event) => {
    setMessage(event.target.value);
  }

  const formattedTimestamp = (timestamp) => {
    const time = moment(timestamp.toString() * 1000);

    return `${time.format("MMM Do, YYYY - HH:mm:SS a")} GMT${time.format("Z")}`;
  };

  // Wallet connection logic
  const checkWalletConnection = async () => {
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

      setAccount(accounts[0]);
    } catch (error) {
      console.log(error);
      toast.error("Ops! Failed to connect to wallet.");
    }
  }

  const showSupport = async (name, message, tip) => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
          const  supportContract  = new ethers.Contract(
          address,
          ABI,
          signer
        );

        console.log("showing support..")
        toast.info("Showing support...");
        setShow("Showing support...kindly wait");
        const supportTxn = await supportContract.showSupport(
          name ? name : "anonymous",
          message ? message : "My support!",
          { value: ethers.utils.parseEther(tip) }
        );

        await supportTxn.wait();

        console.log("mined ", supportTxn.hash);

        console.log("support shown!");
        toast.success("Awesome! Thanks for your support.");
        setShow();
       
        // Clear the form fields.
        setName("");
        setMessage("");
      }
    } catch (error) {
      console.log(error);
      toast.error("Ops! Support failed.");
      setShow();
    }
  };

  // Function to get all support messages sent to the owner.
  const getAllSupportMessages = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const supportContract = new ethers.Contract(
          address,
          ABI,
          signer
        );

        console.log("fetching memos from the blockchain..");
        const supportMessages = await  supportContract.getAllSupportMessages();
        console.log("fetched!");
        setSupportMessages(supportMessages);
      } else {
        console.log("Metamask is not connected");
      }

    } catch (error) {
      console.log(error);
      toast.error("Ops! Failed to get the memos.");
    }
  };

  useEffect(() => {
    let supportContract;
    checkWalletConnection();
    getAllSupportMessages();

    // An event handler function for when someone sends
    // a support message.
    const onSupportMessageCreated = (from, timestamp, name, message) => {
      console.log("Support messages received: ", from, timestamp, name, message);
      setSupportMessages((prevState) => [
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

    // Listen for when support message is created
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum,
        "any");
      const signer = provider.getSigner();
      supportContract = new ethers.Contract(
        address,
        ABI,
        signer
      );

      supportContract.on("SupportMessageCreated", onSupportMessageCreated);
    }

    return () => {
      if (supportContract) {
        supportContract.off("SupportMessageCreated", onSupportMessageCreated);
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
          {account !== "" ? "Connected to" : "Not Connected. Please connect to view supports"} {account !== "" ? (account.substring(0, 15) + '...') : ""}
        </div>
      </nav>

      <main className={styles.main}>

        <h1 className={styles.title}>
          GoSupport <span className={styles.title2}>Me</span>
        </h1>

        <p className={styles.describe}>Kindly fuel our Blockchain journey with your
          support &#128640;</p>

        {account ? (
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
                  onChange={updateName}
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
                  onChange={updateMessage}
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
                  onChange={tipInputHandler}
                />
              </div>
              <span className={styles.supportValue}>1 support = 0.001ETH, 2 support = 0.002ETH  etc</span>
              <div align="center">
                <button
                  type="button"
                  onClick={performAction}
                >
                  Show Support
                </button>
                <span className={styles.show}>{show}</span>
              </div>
            </form>
          </div>
        ) : (
            <button onClick={connectWallet} className=
              {styles.connectButton}> Connect your wallet </button>
          )}
      </main>

      {account && (<h1 className={styles.supportH1}>Recent Supporters</h1>)}

      {account && (supportMessages.map((supportMessage, idx) => {
        return (
          <div key={idx} className={styles.memoList}>
            <p style={{ "fontWeight": "bold"}}>"{supportMessage.message}"</p>
            <p>From: {supportMessage.name} at {formattedTimestamp(supportMessage.timestamp)}</p>
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

