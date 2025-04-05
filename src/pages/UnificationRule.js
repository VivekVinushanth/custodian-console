import React, { useState, useEffect } from "react";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Chip, Typography, Box, Button, TextField, Grid, IconButton
} from "@mui/material";
import { fetchRules } from "../api/users";
import axios from "axios";
import { Card, CardContent } from "../components/ui/card";
import { Add, Delete } from "@mui/icons-material";

const UnificationRulesPage = () => {
    const [rules, setRules] = useState([]);
    const [ruleName, setRuleName] = useState("");
    const [newRules, setNewRules] = useState([{ attribute: "", priority: 0 }]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadRules();
    }, []);

    const loadRules = () => {
        fetchRules()
            .then((data) => {
                console.log("Fetched rules:", data);
                setRules(Array.isArray(data) ? data : []);
            })
            .catch((error) => {
                console.error("Error fetching unification rules:", error);
                setRules([]);
            });
    };

    const handleRuleChange = (index, field, value) => {
        const updated = [...newRules];
        updated[index][field] = value;
        setNewRules(updated);
    };

    const handleAddRule = () => {
        setNewRules([...newRules, { attribute: "", priority: 0 }]);
    };

    const handleRemoveRule = (index) => {
        setNewRules(newRules.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await axios.post("http://localhost:8080/api/v1/unification_rules/", {
                rule_name: ruleName,
                rules: newRules,
                is_active: true
            });
            loadRules();
            setRuleName("");
            setNewRules([{ attribute: "", priority: 0 }]);
        } catch (err) {
            console.error("Failed to create rule", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteRule = async (ruleNameToDelete) => {
        try {
            await axios.delete(`http://localhost:8080/api/v1/unification_rules/${ruleNameToDelete}`);
            loadRules();
        } catch (err) {
            console.error("Failed to delete rule", err);
        }
    };

    return (
        <Box sx={{ p: 6 }}>
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Create New Unification Rule</Typography>
                    <TextField
                        label="Rule Name"
                        fullWidth
                        value={ruleName}
                        onChange={(e) => setRuleName(e.target.value)}
                        sx={{ mb: 3 }}
                    />
                    {newRules.map((rule, index) => (
                        <Grid container spacing={2} alignItems="center" key={index} sx={{ mb: 2 }}>
                            <Grid item xs={5}>
                                <TextField
                                    label="Attribute"
                                    fullWidth
                                    value={rule.attribute}
                                    onChange={(e) => handleRuleChange(index, "attribute", e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    label="Priority"
                                    type="number"
                                    fullWidth
                                    value={rule.priority}
                                    onChange={(e) => handleRuleChange(index, "priority", parseInt(e.target.value))}
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <IconButton color="error" onClick={() => handleRemoveRule(index)}>
                                    <Delete />
                                </IconButton>
                            </Grid>
                        </Grid>
                    ))}
                    <Button startIcon={<Add />} onClick={handleAddRule} sx={{ mr: 2 }}>Add Attribute</Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting}>Submit</Button>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    {rules.length === 0 ? (
                        <Typography>No unification rules found.</Typography>
                    ) : (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Rule Name</strong></TableCell>
                                        <TableCell><strong>Status</strong></TableCell>
                                        <TableCell><strong>Rules</strong></TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rules.map((rule, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{rule.rule_name || "Unnamed Rule"}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={rule.is_active ? "Active" : "Inactive"}
                                                    color={rule.is_active ? "success" : "default"}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell><strong>Attribute</strong></TableCell>
                                                            <TableCell><strong>Priority</strong></TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {(rule.rules || []).map((subRule, subIndex) => (
                                                            <TableRow key={subIndex}>
                                                                <TableCell>{subRule.attribute}</TableCell>
                                                                <TableCell>{subRule.priority}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableCell>
                                            <TableCell>
                                                <IconButton color="error" onClick={() => handleDeleteRule(rule.rule_name)}>
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
        </Box>
    );
};

export default UnificationRulesPage;
