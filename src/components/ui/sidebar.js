import React from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Chip, Box } from "@mui/material";
import { People, Settings, Event, Storage } from "@mui/icons-material";
import { Link } from "react-router-dom";

const Sidebar = () => {
    return (
        <Drawer
            variant="permanent"
            sx={{
                width: 240,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                    width: 240,
                    boxSizing: "border-box",
                    backgroundColor: "#F4F4F4",
                    color: "black",
                },
            }}
        >
            <List>
                {/* Active Items */}
                <ListItem component={Link} to="/users" button>
                    <ListItemIcon><People sx={{ color: "#FF7300" }} /></ListItemIcon>
                    <ListItemText primary="User Data" sx={{ color: "black" }} />
                </ListItem>

                <ListItem component={Link} to="/unification_rules" button>
                    <ListItemIcon><Settings sx={{ color: "#FF7300" }} /></ListItemIcon>
                    <ListItemText primary="Unification Rules" sx={{ color: "black" }} />
                </ListItem>

                {/* Upcoming / Disabled Items */}
                <ListItem disabled sx={{ opacity: 0.5, pointerEvents: "none" }}>
                    <ListItemIcon><Event /></ListItemIcon>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                        <ListItemText primary="Data Model" />
                        <Chip label="Upcoming" size="small" color="info" />
                    </Box>
                </ListItem>

                <ListItem disabled sx={{ opacity: 0.5, pointerEvents: "none" }}>
                    <ListItemIcon><Storage /></ListItemIcon>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                        <ListItemText primary="Data Residency" />
                        <Chip label="Upcoming" size="small" color="info" />
                    </Box>
                </ListItem>
            </List>
        </Drawer>
    );
};

export default Sidebar;
