"use client";

import PrivateRoute from "@/components/auth/PrivateRoute";
import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/ui/Header";
import FolderLoader from "@/components/folderDisplay/FolderLoader";
import NewFolderButton from "@/components/folderDisplay/NewFolderButton";
import { Box, HStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export default function FoldersPage() {
    const [reloadKey, setReloadKey] = useState(0);
    const BackendRoute = "http://localhost:8000";

  useEffect(() => {
    const onFolderCreated = () => setReloadKey((key) => key + 1);
    window.addEventListener("folder-created", onFolderCreated);
    return () => window.removeEventListener("folder-created", onFolderCreated);
  }, []);

  return (
    <PrivateRoute roles={["admin", "editor","viewer"]}>
      {(user) => (
        <Sidebar user={user}>
          <Box>
            <Header title="Folders" description="Manage folders and see how many assets each contains." />

            {(user.role?.toLowerCase() === "admin" || user.role?.toLowerCase() === "editor") && (
              <HStack mb={3}>
                <NewFolderButton backendRoute={BackendRoute} />
              </HStack>
            )}
            <FolderLoader key={reloadKey} />
          </Box>
        </Sidebar>
      )}
    </PrivateRoute>
  );
}
