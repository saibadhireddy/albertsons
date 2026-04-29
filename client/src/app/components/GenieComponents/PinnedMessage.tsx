/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/PinnedMessages.tsx
import Box from '@mui/material/Box';
import { useEffect, useState } from 'react';
// import axios from 'axios';
import PopulateTable from './PopulateTable'; // Assume path
import CircularProgress from '@mui/material/CircularProgress';
import type { GridColDef } from '@mui/x-data-grid';

const HOST = ""; // Defined in parent scope or imported

interface PinnedMessageAnswer {
    answer: string;
    table_data: {
        columns: GridColDef[];
        data: any[];
    };
    query: string | undefined;
    row_count: number;
}

interface PinnedMessage {
    id: number;
    question: string;
    answer?: PinnedMessageAnswer;
    // Add other fields if needed, like conversation_id, message_id
}

function PinnedMessages() {
    const [messages, setMessages] = useState<PinnedMessage[]>([]);
    const [apiLoader, setApiLoader]  = useState(true);

    useEffect(() => {
        setApiLoader(true);
        const url = HOST + "/api/get-pinned-messages";
        const body = {
            userName: "test" // Use actual username logic here if available
        };
        console.debug({url});
        console.debug({body});

        // axios.post(url, body)
        // .then(response => {
        //     setMessages(response.data);
        //     setApiLoader(false);
        // })
        // .catch(error => {
        //     console.error(error);
        //     setApiLoader(false);
        // });

         setMessages([{id:123,question:"fghjk",}]);
         setApiLoader(false);
         setApiLoader(false);
    }, []);

    return (
        <Box sx={{
            height: "inherit",
            fontSize : "14px",
            textAlign : "left"
        }}>
            {apiLoader ? <Box sx={{display : "flex", justifyContent : "center", alignItems : "center", height : "inherit"}}><CircularProgress /></Box> :
            messages.length !== 0 ? messages.map((msg:any, index:any) => (
                <Box key={index} padding={2}>
                    <Box sx={{fontWeight : 700, color : "#db5777"}}>Question:</Box>
                    <Box> {msg.question}</Box>
                    <Box sx={{fontWeight : 700, marginTop : "10px", color : "#444795"}}>Answer:</Box>
                    <Box> {msg.answer.answer}</Box>
                    <Box sx={{marginTop: "10px"}}>
                        <PopulateTable interval={1} data={msg.answer.table_data} query={msg.answer.query} rowCount={msg.answer.row_count} />
                    </Box>
                    <Box sx={{border : "1px solid lightgrey", marginTop : "20px"}}></Box>
                </Box>
            )) : <Box sx={{display : "flex", justifyContent : "center", alignItems : "center", height : "inherit"}}>No Pinned Messages</Box>}
        </Box>
    );
}

export default PinnedMessages;