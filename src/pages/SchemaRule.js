import React, { useState, useEffect } from "react";
import {
    Box, Typography, Card, CardContent, Table, TableHead, TableRow, TableCell,
    TableBody, TableContainer, Paper, TextField, Grid, IconButton, Button
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import axios from "axios";

const SchemaRulesPage = () => {
    const [rules, setRules] = useState([]);
    const [profileField, setProfileField] = useState("");
    const [eventName, setEventName] = useState("");
    const [eventType, setEventType] = useState("");
    const [conditions, setConditions] = useState([{ field: "", operator: "", value: "" }]);

    useEffect(() => {
        fetchSchemaRules();
    }, []);

    const fetchSchemaRules = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/v1/profile/schema");
            setRules(res.data || []);
        } catch (err) {
            console.error("Failed to fetch schema rules", err);
        }
    };

    const handleAddCondition = () => {
        setConditions([...conditions, { field: "", operator: "", value: "" }]);
    };

    const handleConditionChange = (index, key, value) => {
        const updated = [...conditions];
        updated[index][key] = value;
        setConditions(updated);
    };

    const handleRemoveCondition = (index) => {
        setConditions(conditions.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        try {
            await axios.post("http://localhost:8080/api/v1/profile/schema", {
                profile_field: profileField,
                event_name: eventName,
                event_type: eventType,
                conditions
            });
            setProfileField("");
            setEventName("");
            setEventType("");
            setConditions([{ field: "", operator: "", value: "" }]);
            fetchSchemaRules();
        } catch (err) {
            console.error("Failed to submit schema rule", err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/api/v1/profile/schema/${id}`);
            fetchSchemaRules();
        } catch (err) {
            console.error("Failed to delete rule", err);
        }
    };

    return (
        <Box sx={{ p: 6 }}>
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Create Profile Enrichment Rule</Typography>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={4}>
                            <TextField label="Profile Field" fullWidth value={profileField} onChange={e => setProfileField(e.target.value)} />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField label="Event Name" fullWidth value={eventName} onChange={e => setEventName(e.target.value)} />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField label="Event Type" fullWidth value={eventType} onChange={e => setEventType(e.target.value)} />
                        </Grid>
                    </Grid>

                    {conditions.map((cond, i) => (
                        <Grid container spacing={2} alignItems="center" key={i} sx={{ mb: 1 }}>
                            <Grid item xs={3}>
                                <TextField label="Field" fullWidth value={cond.field} onChange={e => handleConditionChange(i, "field", e.target.value)} />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField label="Operator" fullWidth value={cond.operator} onChange={e => handleConditionChange(i, "operator", e.target.value)} />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField label="Value" fullWidth value={cond.value} onChange={e => handleConditionChange(i, "value", e.target.value)} />
                            </Grid>
                            <Grid item xs={2}>
                                <IconButton color="error" onClick={() => handleRemoveCondition(i)}><Delete /></IconButton>
                            </Grid>
                        </Grid>
                    ))}

                    <Button startIcon={<Add />} onClick={handleAddCondition} sx={{ mr: 2 }}>Add Condition</Button>
                    <Button variant="contained" onClick={handleSubmit}>Submit</Button>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Existing Enrichment Rules</Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Profile Field</TableCell>
                                    <TableCell>Event Name</TableCell>
                                    <TableCell>Event Type</TableCell>
                                    <TableCell>Conditions</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rules.map(rule => (
                                    <TableRow key={rule.id}>
                                        <TableCell>{rule.profile_field}</TableCell>
                                        <TableCell>{rule.event_name}</TableCell>
                                        <TableCell>{rule.event_type}</TableCell>
                                        <TableCell>
                                            <ul>
                                                {rule.conditions.map((c, i) => (
                                                    <li key={i}>{`${c.field} ${c.operator} ${c.value}`}</li>
                                                ))}
                                            </ul>
                                        </TableCell>
                                        <TableCell>
                                            <IconButton color="error" onClick={() => handleDelete(rule.id)}>
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    );
};

export default SchemaRulesPage;