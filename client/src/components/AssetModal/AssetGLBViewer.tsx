"use client";

import React, { useEffect } from "react";
import { Box } from "@chakra-ui/react";

interface AssetGLBViewerProps {
  src: string;
  width?: string;
  height?: string;
}

export const AssetGLBViewer: React.FC<AssetGLBViewerProps> = ({
  src,
  width = "600px",
  height = "600px",
}) => {
  useEffect(() => {
    // Check if model-viewer is already loaded
    if (
      !document.querySelector(
        'script[src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"]'
      )
    ) {
      const script = document.createElement("script");
      script.type = "module"; 
      script.src =
        "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";
      document.body.appendChild(script);
    }
  }, []);

  return (
    <Box
      dangerouslySetInnerHTML={{
        __html: `
          <model-viewer
            src="${src}"
            alt="3D model"
            camera-controls
            auto-rotate
            shadow-intensity="1"
            style="width:${width};height:${height};background:transparent;"
          ></model-viewer>
        `,
      }}
    />
  );
};
