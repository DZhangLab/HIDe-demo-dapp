import React from "react";
import RecoveryMain from "../components/recovery/RecoveryMain";
import { Box } from "@mui/material";
import Typography from "@mui/material/Typography";

function Recovery() {
  return (
    <div className="App">
      <br></br>
      <Typography variant="h4">
        Patients can add delegate and Delegates can initate recovery
      </Typography>
      {/* <Typography variant="h4">Delegates can initate recovery</Typography> */}
      <br></br>
      <Box sx={{ "& button": { m: 1 } }}>
        <RecoveryMain />
      </Box>
    </div>
  );
}

export default Recovery;
