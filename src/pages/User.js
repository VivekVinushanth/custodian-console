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
    Identify: "primary",
    Track: "secondary",
    Page: "info",
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
                if (data?.app_context?.length === 1) {
                    setSelectedAppContextId(data.app_context[0].app_id);
                    setSelectedEventsAppId(data.app_context[0].app_id);
                }
            });

            axios.get(`http://localhost:8080/api/v1/${permaId}/events`)
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
        if (!profile || !profile.perma_id) return null;

        const nodes = [];
        const edges = [];
        const currentId = profile.perma_id;
        const parentId = profile.profile_hierarchy?.parent_profile_id;
        const peers = profile.profile_hierarchy?.peer_profile_ids || [];

        // Children: current + peers
        const children = [
            { id: currentId, type: "Current Profile", color: "info" },
            ...peers.map(peer => ({
                id: peer.peer_profile_id,
                type: "Peer Profile",
                color: "secondary",
                rule: peer.rule_name
            }))
        ];

        // Layout: space children evenly at y=200
        const spacing = 700;
        const startX = (children.length - 1) * -spacing / 2;

        children.forEach((child, index) => {
            const x = startX + index * spacing;

            nodes.push({
                id: child.id,
                data: {
                    label: (
                        <Box textAlign="center">
                            <Typography variant="body2">{child.id}</Typography>
                            <Chip label={child.type} color={child.color} size="small" />
                        </Box>
                    )
                },
                position: { x, y: 200 }
            });

            // Edge from master to child (no label)
            if (parentId) {
                edges.push({
                    id: `e-${parentId}-${child.id}`,
                    source: parentId,
                    target: child.id
                });
            }

            // Edge from current to peer (with rule name)
            if (child.id !== currentId) {
                edges.push({
                    id: `e-${currentId}-${child.id}`,
                    source: currentId,
                    target: child.id,
                    label: child.rule || "peer"
                });
            }
        });

        // Master node: centered above children at y=0
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

        // Special case: top-level master (no parent)
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
                        <Typography variant="h6">Identity Data</Typography>
                        <TableContainer component={Paper}>
                            <Table><TableBody>{renderTableData(selectedProfile.identity)}</TableBody></Table>
                        </TableContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <Typography variant="h6">Personality Data</Typography>
                        <TableContainer component={Paper}>
                            <Table><TableBody>{renderTableData(selectedProfile.personality)}</TableBody></Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Box>

            {/* App Context Section */}
            <Box mt={6}>
                <Typography variant="h6">App Context</Typography>
                <Tabs>
                    {(selectedProfile?.app_context || []).map((app) => (
                        <Tab
                            key={app.app_id}
                            label={app.app_id}
                            onClick={() => setSelectedAppContextId(app.app_id)}
                            selected={selectedAppContextId === app.app_id}
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
                                            selectedProfile.app_context.find(app => app.app_id === selectedAppContextId)
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
