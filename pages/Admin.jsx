import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import abi from '../utils/SupportContract.json';
import Link from "next/link"
import styles from '../styles/Admin.module.css'


function Admin(){
  const address = "0xB4F9B0617EEA9419ab1f6ec58F47829788537711"
  const ABI = abi.abi;
  
  const [newContractOwner, setNewContractOwner] = useState("");
  

   // Change contract owner
   const changeContractOwner = async (address) => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        //toast.loading("Changing contract owner..", { autoClose: false });
  
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const supportContract = new ethers.Contract(
          address,
          ABI,
          signer
        );
  
        const changeContractOwnerTxn = await supportContract.transferOwnership(
          address
        );
  
        await changeContractOwnerTxn.wait();
       // toast.dismiss();
        alert(" Contract owner changed.");
      }
    } catch (error) {
        console.log(error)
    
        if (error.code === "CALL_EXCEPTION" && error.error.message.includes("revert")) {
          alert("Ops! Only contract owner can change the address.");
        } else {
            alert("Ops! Failed to change the address");
            
          }
      }
  };
  
  
  //a function to ensure user input right address
  const onChangeContractOwner = () => {
    if (ethers.utils.isAddress(address)) {
      changeContractOwner(address);
    } else {
      setNewContractOwner("");
      //toast.error("Ops! Please enter a valid address.");
      alert("Ops! Please enter a valid address.")
    }
  };
  
  //withdraw function
  const onWithdrawSupport = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        //toast.loading("Withdrawing supports..", { autoClose: false });
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const supportContract = new ethers.Contract(
          address,
          ABI,
          signer
        );

        const withdrawSupportsTxn = await supportContract.ownerWithdraw() ;

        await withdrawSupportsTxn.wait();
        toast.success("Awesome! your tips are withdrawn.");
      }
    } catch (error) {
      console.log(error);
     alert("Ops! failed to withdraw, check if you are the contract owner")
    }
  };

  //support message delete function
  const supportMessageDelete = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const supportContract = new ethers.Contract(
          address,
          ABI,
          signer
        );

        const deleteMessageTxn = await supportContract.clearSupportMessages() ;

        await deleteMessageTxn.wait();
        alert("support messages deleted")
        toast.success("support messages deleted.");
      }
    } catch (error) {
      console.log(error);
     alert("Ops! failed to delete message")
    }
  };




  return (
    <div className={styles.container}>
      <div className="admin-header">
        <Link href="/" >
             <a className={styles.home}>
             <h2>&rarr; Home</h2>
             </a>
        </Link>
      </div>

      <div className={styles.adminCard}>
          <div className={styles.changeAddressContainer}>
            <div className={styles.inputLabel}>
              <label>
                Enter Address
              </label>
            </div>  
          
            <input
               id="name"
               type="text"
               className={styles.input}
               value={newContractOwner}
               onChange={(e) => setNewContractOwner(e.target.value)}
           />
         

           <button
              className={styles.addressChangeBtn}
              onClick={ onChangeContractOwner}
           >
                 Change Contract Owner
            </button>
          </div>  

        <div className={styles.line}>
          <span>OR</span>
        </div>

        <button className={styles.withdrawBtn} onClick={onWithdrawSupport}>
          Withdraw Supports
        </button>

        <button className={styles.deleteBtn} onClick={supportMessageDelete}>
          Delete All  messages
        </button>

        <p className={styles.cardHelperText}>
          *Note - Above action can only be performed by the owner of the
          contract.
        </p>
      </div>
    </div>
  );
};

export default Admin;
