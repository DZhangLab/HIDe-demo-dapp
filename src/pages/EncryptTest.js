import React, { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CryptoJS from "crypto-js";

function Encrypt() {
  const [inputText, setInputText] = useState("");
  const [encryptedText, setEncryptedText] = useState("");
  const [decryptedText, setDecryptedText] = useState("");

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const handleEncryptClick = () => {
    const encrypted = CryptoJS.AES.encrypt(inputText, "secret key").toString();
    setEncryptedText(encrypted);
  };

  const handleEncryptChange = (event) => {
    setEncryptedText(event.target.value);
  };

  const handleDecryptClick = () => {
    const decrypted = CryptoJS.AES.decrypt(
      encryptedText,
      "secret key"
    ).toString(CryptoJS.enc.Utf8);
    setDecryptedText(decrypted);
  };

  return (
    <div>
      <TextField
        label="Input Text"
        value={inputText}
        onChange={handleInputChange}
        variant="outlined"
      />
      <br />
      <Button variant="contained" color="primary" onClick={handleEncryptClick}>
        Encrypt
      </Button>
      <br />
      <TextField
        label="Encrypted Text"
        value={encryptedText}
        variant="outlined"
        onChange={handleEncryptChange}
      />
      <br />
      <Button variant="contained" color="primary" onClick={handleDecryptClick}>
        Decrypt
      </Button>
      <br />
      <TextField
        label="Decrypted Text"
        value={decryptedText}
        variant="outlined"
        disabled
      />
    </div>
  );
}

export default Encrypt;
