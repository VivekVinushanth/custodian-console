import React, { useState, useEffect } from "react";
import {
    Box, Typography, Card, CardContent, Button, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField,
    Table, TableHead, TableBody, TableRow, TableCell, IconButton,
    MenuItem, Grid, Chip
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import axios from "axios";

const allowedPropertyTypes = [
    "string", "int", "boolean", "date", "arrayOfString", "arrayOfInt"
];

const allowedEventTypes = ["identify", "page", "track"];

const EventSchemasPage = () => {
    const [schemas, setSchemas] = useState([]);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        event_name: "",
        event_type: "track",
        properties: []
    });

    useEffect(() => {
        fetchSchemas();
    }, []);

    const fetchSchemas = async () => {
        try {
            const res = await axios.get("http://localhost:8900/api/v1/event-schema/");
            setSchemas(res.data || []);
        } catch (err) {
            console.error("Error fetching event schemas:", err);
        }
    };

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleAddProperty = () => {
        setForm(prev => ({
            ...prev,
            properties: [...prev.properties, { property_name: "", property_type: "string" }]
        }));
    };

    const handleRemoveProperty = (index) => {
        setForm(prev => ({
            ...prev,
            properties: prev.properties.filter((_, i) => i !== index)
        }));
    };

    const handlePropertyChange = (index, field, value) => {
        const updated = [...form.properties];
        updated[index][field] = value;
        setForm(prev => ({ ...prev, properties: updated }));
    };

    const handleSubmit = async () => {
        try {
            await axios.post("http://localhost:8900/api/v1/event-schema", form);
            fetchSchemas();
            setForm({ event_name: "", event_type: "track", properties: [] });
            setOpen(false);
        } catch (err) {
            console.error("Error adding event schema:", err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:8900/api/v1/event-schema/${id}`);
            fetchSchemas();
        } catch (err) {
            console.error("Error deleting schema:", err);
        }
    };

    return (
        <Box sx={{ p: 6 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
                    Add Schema
                </Button>
            </Box>

            <Card>
                <CardContent>
                    {schemas.length === 0 ? (
                        <Typography>No schemas found.</Typography>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Event Name</strong></TableCell>
                                    <TableCell><strong>Event Type</strong></TableCell>
                                    <TableCell><strong>Properties</strong></TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {schemas.map((schema, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{schema.event_name}</TableCell>
                                        <TableCell>{schema.event_type}</TableCell>
                                        <TableCell>
                                            <Grid container spacing={1}>
                                                {(schema.properties || []).map((prop, i) => (
                                                    <Grid item key={i}>
                                                        <Chip
                                                            label={`${prop.property_name} (${prop.property_type})`}
                                                            size="small"
                                                        />
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </TableCell>
                                        <TableCell>
                                            <IconButton color="error" onClick={() => handleDelete(schema.event_schema_id)}>
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Event Schema</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        label="Event Name"
                        fullWidth
                        value={form.event_name}
                        onChange={(e) => handleChange("event_name", e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        select
                        label="Event Type"
                        fullWidth
                        value={form.event_type}
                        onChange={(e) => handleChange("event_type", e.target.value)}
                        sx={{ mb: 3 }}
                    >
                        {allowedEventTypes.map((type) => (
                            <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                    </TextField>

                    <Typography variant="subtitle1" gutterBottom>Properties</Typography>
                    {form.properties.map((prop, index) => (
                        <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 1 }}>
                            <Grid item xs={5}>
                                <TextField
                                    label="Property Name"
                                    fullWidth
                                    value={prop.property_name}
                                    onChange={(e) => handlePropertyChange(index, "property_name", e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={5}>
                                <TextField
                                    select
                                    label="Property Type"
                                    fullWidth
                                    value={prop.property_type}
                                    onChange={(e) => handlePropertyChange(index, "property_type", e.target.value)}
                                >
                                    {allowedPropertyTypes.map((type) => (
                                        <MenuItem key={type} value={type}>{type}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={2}>
                                <IconButton color="error" onClick={() => handleRemoveProperty(index)}>
                                    <Delete />
                                </IconButton>
                            </Grid>
                        </Grid>
                    ))}

                    <Button onClick={handleAddProperty} sx={{ mt: 1 }}>Add Property</Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit}>Submit</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default EventSchemasPage;
