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
                            <TableCell><strong>Profile Id</strong></TableCell>
                            <TableCell><strong>Attached User</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {profiles.map((profile, index) => {
                            const identity = profile.identity || {};
                            const userId = identity_attributes.user_id;
                            const username = identity_attributes.user_name;

                            return (
                                <TableRow
                                    key={index}
                                    onClick={() => handleRowClick(profile.profile_id)}
                                    sx={{
                                        cursor: "pointer",
                                        "&:hover": { backgroundColor: "#f5f5f5" }
                                    }}
                                >
                                    <TableCell>
                                        <Typography>{profile.profile_id}</Typography>
                                        {username && (
                                            <Typography variant="caption" color="text.secondary">
                                                {username}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {userId? (
                                            <>
                                                <Chip label="Registered User" color="success" size="small" />
                                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                                                     {profile.identity_attributes.user_id}
                                                </Typography>
                                            </>
                                        ) : (
                                            <Chip label="Anonymous Profile" color="primary" size="small" />
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default UsersPage;
