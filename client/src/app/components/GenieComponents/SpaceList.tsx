// src/components/genie/SpaceList.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import { Fragment } from "react";

import { ChevronRightIcon } from "@databricks/design-system";

interface Space {
  id: string;
  name: string;
  display_name: string;
  description: string;
}

interface SpaceListProps {
  spaces: Space[];
  spacesMetadata: any;
  syncingSpaces: Set<string>;
  restrictedSpaces: Set<string>;
  isLoadingMetadata: boolean;
  onRetrySync: () => void;
  onSelectSpace: (space: Space) => void;
  sxStyle: any;
}

export function SpaceList({
  spaces,
  spacesMetadata,
  syncingSpaces,
  restrictedSpaces,
  isLoadingMetadata,
  onRetrySync,
  onSelectSpace,
  sxStyle,
}: SpaceListProps) {
  return (
    <Box sx={sxStyle.spaceListContainer}>
      <List sx={{ p: 0 }}>
        {spaces.map((space) => {
          const isSyncing = syncingSpaces.has(space.name);
          const hasMetadata = !!spacesMetadata[space.name];
          const isRestricted = restrictedSpaces.has(space.name);
          const isMultiAgent = space.name === "MULTI_AGENT";

          return (
            <Fragment key={space.id}>
              <ListItem
                key={space.id}
                disablePadding
                sx={{
                  ...sxStyle.spaceItem,
                  ...(isMultiAgent && sxStyle.multiAgentItem),
                }}
              >
                <ListItemButton
                  onClick={() => !isRestricted && onSelectSpace(space)}
                  disabled={isRestricted}
                  sx={{
                    opacity: isRestricted ? 0.7 : 1,
                    borderRadius: isMultiAgent ? "10px" : "0px",
                    py: isMultiAgent ? 1 : 0.5, 
                  }}
                >
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {space.display_name}
                        {isSyncing && (
                          <CircularProgress
                            size={12}
                            thickness={5}
                            sx={{ color: "#6490f0" }}
                          />
                        )}
                        {isRestricted && (
                          <Typography
                            sx={{
                              fontSize: "10px",
                              color: "#d32f2f",
                              fontWeight: 700,
                              bgcolor: "#ffebee",
                              px: 1,
                              borderRadius: "4px",
                            }}
                          >
                            NO ACCESS TO THIS GENIE
                          </Typography>
                        )}
                      </Box>
                    }
                    secondary={
                      isRestricted
                        ? "You do not have permission to access this space in Databricks."
                        : isSyncing && !hasMetadata
                          ? "Syncing..."
                          : space.description
                    }
                  />
                  {!isRestricted && (
                    <ChevronRightIcon
                      style={{
                        color: isMultiAgent
                          ? "#1e293b"
                          : hasMetadata
                            ? "#143d4a"
                            : "#cbd5e1",
                        fontSize: "20px",
                        opacity: 1,
                      }}
                      onPointerEnterCapture={undefined}
                      onPointerLeaveCapture={undefined}
                    />
                  )}
                </ListItemButton>
              </ListItem>
              {isMultiAgent && (
                <Typography
                  sx={{
                    px: 2,
                    pt: 1,
                    pb: 1,
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#89898a",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Individual Genie Spaces
                </Typography>
              )}
            </Fragment>
          );
        })}
      </List>
      {!isLoadingMetadata && Object.keys(spacesMetadata).length === 0 && (
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Button
            size="small"
            variant="text"
            onClick={onRetrySync}
            sx={{ fontSize: "11px" }}
          >
            Retry Sync
          </Button>
        </Box>
      )}
    </Box>
  );
}