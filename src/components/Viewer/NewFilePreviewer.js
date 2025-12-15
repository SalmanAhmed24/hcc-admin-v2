
import { Drawer, IconButton, Box, Typography, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useState } from 'react';
import axios from "axios";
import { apiPath } from "@/utils/routes";
import Swal from "sweetalert2";

const NewFilePreviewDrawer = ({ open, handleClose, item }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    try {
      const response = await axios.get(
        `${apiPath.prodPath}/api/files/getFile/${item._id}`,
        { responseType: "blob" }
      );

      // Extract filename from response headers or use item filename
      const contentDisposition = response.headers['content-disposition'];
      let fileName = item.filename;
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1];
        }
      }

      // Get content type
      const contentType = response.headers['content-type'] || item.contentType || "application/octet-stream";
      
      // Create blob and download
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

    } catch (err) {
      console.error("Error downloading file:", err);
      Swal.fire({
        icon: "error",
        title: "Download Failed",
        text: "Something went wrong while downloading the file.",
      });
    }
  };

  const fetchPreviewUrl = async () => {
    if (!item?._id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `${apiPath.prodPath}/api/files/getFileUrl/${item._id}`
      );
      
      if (response.data) {
        setPreviewUrl(response.data);
      } else {
        throw new Error("No URL returned from API");
      }
    } catch (err) {
      console.error("Error fetching preview URL:", err);
      setError("Unable to load file preview");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && item?._id) {
      fetchPreviewUrl();
    } else {
      // Reset when drawer closes
      setPreviewUrl(null);
      setError(null);
    }
  }, [open, item?._id]);

  const renderPreview = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="400px">
          <Typography variant="body1">Loading preview...</Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="400px">
          <Typography variant="body1" color="error">{error}</Typography>
        </Box>
      );
    }

    if (!previewUrl) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="400px">
          <Typography variant="body1">No preview available</Typography>
        </Box>
      );
    }

    // Get content type from item or infer from filename
    const contentType = item?.contentType || getContentTypeFromFilename(item?.filename);

    if (contentType?.startsWith('image/')) {
      return (
        <img
          src={previewUrl}
          alt={`Preview of ${item.filename}`}
          style={{ 
            maxWidth: '100%', 
            maxHeight: '70vh', 
            objectFit: 'contain',
            margin: '0 auto',
            display: 'block'
          }}
          onError={() => setError("Failed to load image preview")}
        />
      );
    }

    if (contentType === 'application/pdf') {
      return (
        <iframe
          src={previewUrl}
          width="100%"
          height="600px"
          title={`PDF Preview - ${item.filename}`}
          style={{ border: 'none' }}
          onError={() => setError("Failed to load PDF preview")}
        />
      );
    }

    // Handle other file types
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="400px">
        <Typography variant="h6" gutterBottom>
          Preview not available for this file type
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          File type: {contentType || 'Unknown'}
        </Typography>
        <Button variant="outlined" onClick={handleDownload}>
          Download to view
        </Button>
      </Box>
    );
  };

  // Helper function to guess content type from filename
  const getContentTypeFromFilename = (filename) => {
    if (!filename) return 'application/octet-stream';
    
    const extension = filename.split('.').pop().toLowerCase();
    
    const mimeTypes = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'txt': 'text/plain',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
  };

  return (
    <Drawer
      className="bg-all-modals"
      anchor="bottom"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          height: '90vh',
          p: 2,
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          backgroundColor: 'background.paper',
        }
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2" fontWeight="bold">
          {item?.filename || 'File Preview'}
        </Typography>
        <IconButton 
          onClick={handleClose}
          sx={{ 
            color: 'text.primary',
            '&:hover': { backgroundColor: 'action.hover' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Box 
        flex={1} 
        overflow="auto" 
        display="flex" 
        flexDirection="column"
        sx={{ 
          backgroundColor: 'background.default',
          borderRadius: 2,
          p: 2,
          mb: 2
        }}
      >
        {renderPreview()}
      </Box>

      <Box display="flex" justifyContent="center" gap={2}>
        <Button
          variant="outlined"
          onClick={handleClose}
          sx={{ 
            width: 150,
            borderColor: 'primary.main',
            color: 'primary.main'
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleDownload}
          disabled={loading || !item?._id}
          sx={{ width: 200 }}
        >
          {loading ? 'Downloading...' : 'Download File'}
        </Button>
      </Box>
    </Drawer>
  );
};

export default NewFilePreviewDrawer;