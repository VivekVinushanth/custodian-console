import React, { useState, useEffect } from "react";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Chip, Button, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle, Typography, Box
} from "@mui/material";
import { Card, CardContent } from "../components/ui/card";
import { Tabs, Tab } from "../components/ui/tabs";
import { fetchUserDetails, deleteUserProfile } from "../api/users";
import axios from "axios";
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';


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
    const [selectedAppContextId, setSelectedAppContextId] = useState(null);
    const [selectedEventsAppId, setSelectedEventsAppId] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userEvents, setUserEvents] = useState([]);

    useEffect(() => {
        if (permaId) {
            fetchUserDetails(permaId).then((data) => {
                setSelectedProfile(data);

                const firstApp = data?.application_data?.[0];
                if (firstApp) {
                    setSelectedAppContextId(firstApp.application_id);
                    setSelectedEventsAppId(firstApp.application_id); // Use the same as default for both
                }
            });

            axios.get(`http://localhost:8900/api/v1/${permaId}/events`)
                .then((res) => {
                    if (Array.isArray(res.data)) {
                        const sorted = res.data.sort((a, b) =>
                            new Date(b.event_timestamp) - new Date(a.event_timestamp)
                        );
                        setUserEvents(sorted);
                    }
                })
                .catch(console.error);
        }
    }, [permaId]);

    useEffect(() => {
        if (userEvents.length && !selectedEventsAppId) {
            const firstAppId = userEvents[0].app_id;
            setSelectedEventsAppId(firstAppId);
        }
    }, [userEvents, selectedEventsAppId]);


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

    const ProfileHierarchyGraph = ({ profile }) => {
        if (!profile || !profile.profile_id) return null;

        const nodes = [];
        const edges = [];

        const currentId = profile.profile_id;
        const parentId = profile.profile_hierarchy?.parent_profile_id;
        const childProfiles = profile.profile_hierarchy?.child_profile_ids || [];

        const spacing = 300;
        const startX = (childProfiles.length - 1) * -spacing / 2;

        // Add children
        childProfiles.forEach((child, index) => {
            const isCurrent = child.child_profile_id === currentId;
            const x = startX + index * spacing;

            nodes.push({
                id: child.child_profile_id,
                data: {
                    label: (
                        <Box textAlign="center">
                            <Typography variant="body2">{child.child_profile_id}</Typography>
                            <Chip
                                label={isCurrent ? "Current Profile" : "Peer Profile"}
                                color={isCurrent ? "info" : "secondary"}
                                size="small"
                            />
                        </Box>
                    )
                },
                position: { x, y: 200 }
            });

            // 🔁 Edge from master to child with rule_name
            if (parentId) {
                edges.push({
                    id: `e-${parentId}-${child.child_profile_id}`,
                    source: parentId,
                    target: child.child_profile_id,
                    label: child.rule_name || "linked",
                    style: { strokeDasharray: '4 2' }
                });
            }
        });

        // Add master node
        if (parentId) {
            nodes.push({
                id: parentId,
                data: {
                    label: (
                        <Box textAlign="center">
                            <Typography variant="body2">{parentId}</Typography>
                            <Chip label="Master Profile" color="primary" size="small" />
                        </Box>
                    )
                },
                position: { x: 0, y: 0 }
            });
        }

        // Top-level master case
        if (profile.profile_hierarchy?.list_profile && !parentId) {
            nodes.push({
                id: currentId,
                data: {
                    label: (
                        <Box textAlign="center">
                            <Typography variant="body2">{currentId}</Typography>
                            <Chip label="Master Profile" color="primary" size="small" />
                        </Box>
                    )
                },
                position: { x: 0, y: 0 }
            });
        }

        return (
            <Box mt={6}>
                <Typography variant="h6" gutterBottom>Profile Hierarchy</Typography>
                <Box sx={{ height: 500, border: "1px solid #ccc", borderRadius: 2, mt: 2 }}>
                    <ReactFlow nodes={nodes} edges={edges} fitView>
                        <Background />
                        <Controls />
                    </ReactFlow>
                </Box>
            </Box>
        );
    };



    const renderTableData = (data) => {
        return Object.entries(data || {}).map(([key, value]) => {
            if (!value || (typeof value === "object" && Object.keys(value).length === 0)) return null;
            return (
                <TableRow key={key}>
                    <TableCell><strong>{key}</strong></TableCell>
                    <TableCell>
                        {Array.isArray(value) ? (
                            <TableContainer component={Paper}>
                                <Table size="small">
                                    <TableBody>
                                        {value.map((item, index) => (
                                            typeof item === "object" ? (
                                                <TableRow key={index}>
                                                    <TableCell colSpan={2}>
                                                        <TableContainer component={Paper}>
                                                            <Table size="small">
                                                                <TableBody>
                                                                    {Object.entries(item).map(([nestedKey, nestedValue]) => (
                                                                        <TableRow key={nestedKey}>
                                                                            <TableCell>{nestedKey}</TableCell>
                                                                            <TableCell>{JSON.stringify(nestedValue)}</TableCell>
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

    if (!selectedProfile) return <Box sx={{ p: 6 }}>Loading...</Box>;

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
                        <Typography variant="h6">Identity Attributes</Typography>
                        <TableContainer component={Paper}>
                            <Table><TableBody>{renderTableData(selectedProfile.identity_attributes)}</TableBody></Table>
                        </TableContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <Typography variant="h6">Traits</Typography>
                        <TableContainer component={Paper}>
                            <Table><TableBody>{renderTableData(selectedProfile.traits)}</TableBody></Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Box>

            {/* App Context Section */}
            <Box mt={6}>
                <Typography variant="h6">App Context</Typography>
                <Tabs>
                    {(selectedProfile?.application_data || []).map((app) => (
                        <Tab
                            key={app.application_id}
                            label={app.application_id}
                            onClick={() => setSelectedAppContextId(app.application_id)}
                            selected={selectedAppContextId === app.application_id}
                        />
                    ))}
                </Tabs>
                {selectedAppContextId && (
                    <Card sx={{ mt: 2 }}>
                        <CardContent>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableBody>
                                        {renderTableData(
                                            selectedProfile.application_data.find(app => app.application_id === selectedAppContextId)
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                )}
            </Box>

            {/* User Events Section */}
            <Box mt={6}>
                <Typography variant="h6">User Events</Typography>
                <Tabs>
                    {Object.keys(groupedEvents).map(appId => (
                        <Tab
                            key={appId}
                            label={appId}
                            onClick={() => setSelectedEventsAppId(appId)}
                            selected={selectedEventsAppId === appId}
                        />
                    ))}
                </Tabs>
                {selectedEventsAppId && groupedEvents[selectedEventsAppId] && (
                    <Box sx={{ mt: 2, maxHeight: 400, overflowY: "auto", border: "1px solid #ccc", borderRadius: 1 }}>
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
                                    {groupedEvents[selectedEventsAppId].map((event) => (
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

            <ProfileHierarchyGraph profile={selectedProfile} />


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
