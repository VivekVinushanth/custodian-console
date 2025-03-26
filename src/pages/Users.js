import React, { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Typography,
    Box
} from "@mui/material";
import { fetchProfiles } from "../api/users";

const UsersPage = ({ router }) => {
    const [profiles, setProfiles] = useState([]);

    useEffect(() => {
        fetchProfiles().then(setProfiles);
    }, []);

    const handleRowClick = (permaId) => {
        router.navigate(`/users/${permaId}`);
    };

    return (
        <Box sx={{ p: 4 }}>
            <TableContainer component={Paper} elevation={1}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Perma ID</strong></TableCell>
                            <TableCell><strong>Attached Users</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {profiles.map((profile, index) => (
                            <TableRow
                                key={index}
                                onClick={() => handleRowClick(profile.perma_id)}
                                sx={{
                                    cursor: "pointer",
                                    "&:hover": { backgroundColor: "#f5f5f5" }
                                }}
                            >
                                <TableCell>{profile.perma_id}</TableCell>
                                <TableCell>
                                    {profile.user_ids?.length > 0 ? (
                                        profile.user_ids.join(", ")
                                    ) : (
                                        <Chip label="Anonymous Profile" color="primary" size="small" />
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default UsersPage;
