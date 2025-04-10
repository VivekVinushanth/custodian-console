import React, { useState, useEffect } from "react";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Chip, Typography, Box, Button, TextField, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Switch, FormControlLabel
} from "@mui/material";
import { fetchRules } from "../api/users";
import axios from "axios";
import { Card, CardContent } from "../components/ui/card";
import { Delete, Add } from "@mui/icons-material";

const scopes = ["identity", "app_context", "personality", "session"];

const UnificationRulesPage = () => {
    const [rules, setRules] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({
        rule_name: "",
        scope: "identity",
        attribute: "",
        priority: 0,
        is_active: true
    });

    useEffect(() => {
        loadRules();
    }, []);

    const loadRules = () => {
        fetchRules()
            .then(data => {
                setRules(Array.isArray(data) ? data : []);
            })
            .catch(err => {
                console.error("Error fetching resolution rules:", err);
                setRules([]);
            });
    };

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        const finalAttribute = `${form.scope}.${form.attribute}`;
        try {
            await axios.post("http://localhost:8900/api/v1/resolution-rules/", {
                rule_name: form.rule_name,
                attribute: finalAttribute,
                priority: form.priority,
                is_active: form.is_active
            });
            setModalOpen(false);
            setForm({
                rule_name: "",
                scope: "identity",
                attribute: "",
                priority: 0,
                is_active: true
            });
            loadRules();
        } catch (err) {
            console.error("Failed to create rule", err);
        }
    };

    const handleDeleteRule = async (ruleId) => {
        try {
            await axios.delete(`http://localhost:8900/api/v1/resolution-rules/${ruleId}`);
            loadRules();
        } catch (err) {
            console.error("Failed to delete rule", err);
        }
    };

    const handleToggleRule = async (ruleId, currentStatus) => {
        try {
            await axios.patch(`http://localhost:8900/api/v1/resolution-rules/${ruleId}`, {
                is_active: !currentStatus
            });
            loadRules();
        } catch (err) {
            console.error("Failed to toggle rule", err);
        }
    };

    return (
        <Box sx={{ p: 6 }}>
            <Button variant="contained" startIcon={<Add />} onClick={() => setModalOpen(true)} sx={{ mb: 3 }}>
                Add Rule
            </Button>

            <Card>
                <CardContent>
                    {rules.length === 0 ? (
                        <Typography>No resolution rules found.</Typography>
                    ) : (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Rule Name</strong></TableCell>
                                        <TableCell><strong>Attribute</strong></TableCell>
                                        <TableCell><strong>Priority</strong></TableCell>
                                        <TableCell><strong>Status</strong></TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rules.map((rule, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{rule.rule_name}</TableCell>
                                            <TableCell>{rule.attribute}</TableCell>
                                            <TableCell>{rule.priority}</TableCell>
                                            <TableCell>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={rule.is_active}
                                                            onChange={() => handleToggleRule(rule.rule_id, rule.is_active)}
                                                        />
                                                    }
                                                    label={rule.is_active ? "Active" : "Inactive"}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <IconButton color="error" onClick={() => handleDeleteRule(rule.rule_id)}>
                                                    <Delete />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>

            {/* Modal */}
            <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
                <DialogTitle>Create New Resolution Rule</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Rule Name"
                        fullWidth
                        value={form.rule_name}
                        onChange={(e) => handleChange("rule_name", e.target.value)}
                        sx={{ mt: 2 }}
                    />
                    <TextField
                        select
                        label="Scope"
                        fullWidth
                        value={form.scope}
                        onChange={(e) => handleChange("scope", e.target.value)}
                        sx={{ mt: 2 }}
                    >
                        {scopes.map(scope => (
                            <MenuItem key={scope} value={scope}>{scope}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Attribute Name"
                        fullWidth
                        value={form.attribute}
                        onChange={(e) => handleChange("attribute", e.target.value)}
                        sx={{ mt: 2 }}
                    />
                    <TextField
                        label="Priority"
                        type="number"
                        fullWidth
                        value={form.priority}
                        onChange={(e) => handleChange("priority", parseInt(e.target.value))}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setModalOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit}>Submit</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UnificationRulesPage;
