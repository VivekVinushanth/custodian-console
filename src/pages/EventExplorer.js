import React, { useEffect, useState } from "react";
import {
    Box, Typography, Tabs, Tab, Paper, TextField, MenuItem, Button,
    Grid, IconButton, Table, TableHead, TableRow, TableCell, TableBody,
    TableContainer, Chip
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import axios from "axios";

const fieldOptions = [
    { label: "Event Type", value: "event_type" },
    { label: "Event Name", value: "event_name" },
    { label: "Properties", value: "properties" },
];

const operatorOptions = [
    { label: "equals", value: "equals" }
];

const timeOptions = [
    { label: "Last 15 minutes", value: 900 },
    { label: "Last 30 minutes", value: 1800 },
    { label: "Last 1 hour", value: 3600 },
    { label: "Last 3 hours", value: 10800 },
    { label: "Last 6 hours", value: 21600 },
    { label: "Last 12 hours", value: 43200 },
    { label: "Last 1 day", value: 86400 },
    { label: "Last 3 days", value: 259200 },
    { label: "Last 1 week", value: 604800 },
    { label: "Last 2 weeks", value: 1209600 },
    { label: "Last 1 month", value: 2592000 },
];

const eventTypeStyles = {
    Identify: "primary",
    Track: "secondary",
    Page: "info",
};

const applications = ["custodian_client_app"]; // Your apps

const EventExplorerPage = () => {
    const [activeApp, setActiveApp] = useState(0);
    // Each condition now can include propertyKey/propertyValue if the field is "properties"
    const [conditions, setConditions] = useState([
        { field: "event_type", operator: "equals", value: "" }
    ]);
    const [timeFilter, setTimeFilter] = useState(43200); // Default last 30 days in minutes
    const [events, setEvents] = useState([]);

    // Add a new condition. For properties, start with blank propertyKey and propertyValue.
    const handleAddCondition = () => {
        setConditions([...conditions, { field: "event_type", operator: "equals", value: "" }]);
    };

    // Handle change for condition fields
    const handleConditionChange = (index, key, value) => {
        const updated = [...conditions];
        updated[index][key] = value;
        setConditions(updated);
    };

    const eventTypeColor = {
        identify: "primary",
        track: "secondary",
        page: "info",
    };

    // Remove a condition
    const handleRemoveCondition = (index) => {
        setConditions(conditions.filter((_, i) => i !== index));
    };

    // Build query parameters for the API call
    const buildQueryParams = () => {
        const params = new URLSearchParams();

        conditions.forEach((cond) => {
            if (cond.operator === "equals") {
                if (cond.field === "properties") {
                    // Make sure both propertyKey and propertyValue are provided
                    if (cond.propertyKey && cond.propertyValue) {
                        params.append(`properties.${cond.propertyKey}`, cond.propertyValue);
                    }
                } else if (cond.field && cond.value) {
                    params.append(cond.field, cond.value);
                }
            }
        });
        // Append the time range filter
        params.append("time_range", timeFilter);
        return params.toString();
    };

    const fetchEvents = async () => {
        const app = applications[activeApp];
        if (!app) return;

        const query = buildQueryParams();

        try {
            console.log(`[Fetch] /api/v1/app/${app}/events?${query}`);
            const res = await axios.get(`http://localhost:8900/api/v1/app/${app}/events?${query}`);
            setEvents(res.data || []);
        } catch (err) {
            console.error("Failed to fetch events", err);
        }
    };

    useEffect(() => {
        console.log("🔍 EventExplorerPage mounted");
    }, []);

    // ✅ Call API on app change or when "Fetch Events" button is clicked
    useEffect(() => {
        fetchEvents();
    }, [activeApp]);

    return (
        <Box sx={{ p: 6 }}>
            <Typography variant="h5" gutterBottom>🎯 Event Explorer</Typography>

            <Paper sx={{ mb: 2 }}>
                <Tabs
                    value={activeApp}
                    onChange={(_, newValue) => {
                        setActiveApp(newValue);
                        setEvents([]); // clear old events when switching apps
                    }}
                >
                    {applications.map((app, index) => (
                        <Tab key={app} label={app} />
                    ))}
                </Tabs>
            </Paper>

            <Box>
                {conditions.map((cond, index) => (
                    <Grid container spacing={2} alignItems="center" key={index} sx={{ mb: 1 }}>
                        <Grid item xs={3}>
                            <TextField
                                select
                                fullWidth
                                label="Field"
                                value={cond.field}
                                onChange={(e) => handleConditionChange(index, "field", e.target.value)}
                            >
                                {fieldOptions.map(opt => (
                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={2}>
                            <TextField
                                select
                                fullWidth
                                label="Operator"
                                value={cond.operator}
                                onChange={(e) => handleConditionChange(index, "operator", e.target.value)}
                            >
                                {operatorOptions.map(opt => (
                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {cond.field === "properties" ? (
                            <>
                                <Grid item xs={3}>
                                    <TextField
                                        fullWidth
                                        label="Property Name"
                                        value={cond.propertyKey || ""}
                                        onChange={(e) => handleConditionChange(index, "propertyKey", e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={3}>
                                    <TextField
                                        fullWidth
                                        label="Property Value"
                                        value={cond.propertyValue || ""}
                                        onChange={(e) => handleConditionChange(index, "propertyValue", e.target.value)}
                                    />
                                </Grid>
                            </>
                        ) : (
                            <Grid item xs={5}>
                                <TextField
                                    fullWidth
                                    label="Value"
                                    value={cond.value}
                                    onChange={(e) => handleConditionChange(index, "value", e.target.value)}
                                />
                            </Grid>
                        )}
                        <Grid item xs={2}>
                            <IconButton onClick={() => handleRemoveCondition(index)} color="error">
                                <Delete />
                            </IconButton>
                        </Grid>
                    </Grid>
                ))}

                <Button startIcon={<Add />} onClick={handleAddCondition} sx={{ mt: 1 }}>
                    Add Condition
                </Button>

                <Box sx={{ mt: 2 }}>
                    <TextField
                        select
                        label="Time Filter"
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(e.target.value)}
                        sx={{ width: 250 }}
                    >
                        {timeOptions.map(opt => (
                            <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>

                <Button
                    variant="contained"
                    onClick={fetchEvents}
                    sx={{ mt: 2, ml: 2 }}
                >
                    Fetch Events
                </Button>
            </Box>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h6">📋 Events</Typography>
                {events.length === 0 ? (
                    <Typography>No events found.</Typography>
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Event Type</TableCell>
                                    <TableCell>Event Name</TableCell>
                                    <TableCell>Time</TableCell>
                                    <TableCell>User</TableCell>
                                    <TableCell>Event Properties</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {events.map((e, i) => (
                                    <TableRow key={i}>
                                        <TableCell>
                                            <Chip
                                                label={e.event_type}
                                                size="small"
                                                color={eventTypeColor[event.event_type] || "default"}
                                            />
                                        </TableCell>
                                        <TableCell>{e.event_name}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {new Date(e.event_timestamp * 1000).toLocaleString(undefined, {
                                                    timeZoneName: "short",
                                                    year: "numeric",
                                                    month: "2-digit",
                                                    day: "2-digit",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    second: "2-digit",
                                                })}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{e.perma_id}</TableCell>
                                        <TableCell>
                                            <pre>{JSON.stringify(e.properties, null, 2)}</pre>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        </Box>
    );
};

export default EventExplorerPage;
