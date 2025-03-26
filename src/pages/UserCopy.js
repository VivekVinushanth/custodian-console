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
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Typography,
    Box,
} from "@mui/material";
import { Card, CardContent } from "../components/ui/card";
import { Tabs, Tab } from "../components/ui/tabs";
import { fetchUserDetails, deleteUserProfile } from "../api/users";
import axios from "axios";

const eventTypeColor = {
    identify: "primary",
    track: "secondary",
    page: "info",
    screen: "warning",
    group: "success",
    alias: "error"
};

const UserProfilePage = ({ router }) => {
    const match = router.pathname?.match(/^\/users\/(.+)$/);
    const permaId = match?.[1];
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [selectedAppId, setSelectedAppId] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userEvents, setUserEvents] = useState([]);

    useEffect(() => {
        if (permaId) {
            fetchUserDetails(permaId).then((data) => {
                setSelectedProfile(data);
                if (data?.app_context?.length === 1) {
                    setSelectedAppId(data.app_context[0].app_id);
                }
            });

            axios.get(`http://localhost:8080/api/v1/${permaId}/events`)
                .then((res) => {
                    if (Array.isArray(res.data)) {
                        const sorted = res.data.sort((a, b) => new Date(b.event_timestamp) - new Date(a.event_timestamp));
                        setUserEvents(sorted);
                    }
                })
                .catch(console.error);
        }
    }, [permaId]);

    const groupedEvents = userEvents.reduce((acc, event) => {
        acc[event.app_id] = acc[event.app_id] || [];
        acc[event.app_id].push(event);
        return acc;
    }, {});

    const handleDelete = async () => {
        try {
            await deleteUserProfile(permaId);
            alert("User profile deleted successfully.");
            router.navigate("/users");
        } catch (error) {
            alert("Failed to delete user profile.");
            console.error(error);
        }
    };

    if (!selectedProfile) {
        return <Box sx={{ p: 6 }}>Loading...</Box>;
    }

    const renderTableData = (data) => {
        return Object.entries(data || {}).map(([key, value]) => {
            if (!value || (typeof value === "object" && Object.keys(value).length === 0)) return null;
            return (
                <TableRow key={key}>
                    <TableCell><strong>{key}</strong></TableCell>
                    <TableCell>
                        {Array.isArray(value) ? (
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableBody>
                                        {value.map((item, index) => (
                                            typeof item === "object" ? (
                                                <TableRow key={index}>
                                                    <TableCell colSpan={2}>
                                                        <TableContainer component={Paper}>
                                                            <Table>
                                                                <TableBody>
                                                                    {Object.entries(item).map(([nestedKey, nestedValue]) => (
                                                                        <TableRow key={nestedKey}>
                                                                            <TableCell>{nestedKey}</TableCell>
                                                                            <TableCell>{nestedValue}</TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </TableContainer>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                <TableRow key={index}>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell>{item}</TableCell>
                                                </TableRow>
                                            )
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            typeof value === "object" ? JSON.stringify(value) : value
                        )}
                    </TableCell>
                </TableRow>
            );
        });
    };

    return (
        <Box sx={{ p: 6 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">User Profile</Typography>
                <Button color="error" variant="contained" onClick={() => setDeleteDialogOpen(true)}>
                    Delete Profile
                </Button>
            </Box>

            <Box display="grid" gridTemplateColumns={{ md: "1fr 1fr" }} gap={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">Identity Data</Typography>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableBody>{renderTableData(selectedProfile.identity)}</TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <Typography variant="h6">Personality Data</Typography>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableBody>{renderTableData(selectedProfile.personality)}</TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Box>

            <Box mt={6}>
                <Typography variant="h6">App Context</Typography>
                <Tabs>
                    {(selectedProfile?.app_context || []).map((app) => (
                        <Tab key={app.app_id} label={app.app_id} onClick={() => setSelectedAppId(app.app_id)} />
                    ))}
                </Tabs>

                {selectedAppId && (
                    <Card sx={{ mt: 2 }}>
                        <CardContent>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableBody>
                                        {renderTableData(
                                            selectedProfile.app_context.find(app => app.app_id === selectedAppId)
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                )}
            </Box>

            {/* User Events */}
            <Box mt={6}>
                <Typography variant="h6">User Events</Typography>
                <Tabs>
                    {Object.keys(groupedEvents).map(appId => (
                        <Tab key={appId} label={appId} onClick={() => setSelectedAppId(appId)} />
                    ))}
                </Tabs>
                {selectedAppId && groupedEvents[selectedAppId] && (
                    <Box sx={{ mt: 2, maxHeight: 400, overflowY: "auto", borderRadius: 1, border: '1px solid #ccc' }}>
                        <TableContainer>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Event Name</strong></TableCell>
                                        <TableCell><strong>Event Type</strong></TableCell>
                                        <TableCell><strong>Timestamp</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {groupedEvents[selectedAppId].map((event) => (
                                        <TableRow key={event.event_id}>
                                            <TableCell>{event.event_name}</TableCell>
                                            <TableCell>
                                                <Chip label={event.event_type} color={eventTypeColor[event.event_type] || "default"} />
                                            </TableCell>
                                            <TableCell>{new Date(event.event_timestamp).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this user profile? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserProfilePage;