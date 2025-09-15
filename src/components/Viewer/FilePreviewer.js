import { Drawer, IconButton, Box, Typography, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useState } from 'react';
import axios from "axios";
import { apiPath } from "@/utils/routes";
import Swal from "sweetalert2";


const FilePreviewDrawer = ({ open, handleClose, file, i, item, previewOpen }) => {
const [previewContent, setPreviewContent] = useState(null);

  console.log(file);
 
  const handleDownload = async () => {
    try {
      const response = await axios.get(
        `${apiPath.prodPath}/api/clients/getFile/${item._id}&&${i._id}&&${file._id}`,
        { responseType: "blob" } 
      );
  
      console.log(response);
      const contentType = response.ContentType|| "application/octet-stream";
      console.log(response.ContentType);
      console.log(response.data);
  
      const blob = new Blob([response.data], { type: contentType });
  
      const fileURL = window.URL.createObjectURL(blob);
  
      window.open(fileURL, "_blank");
  
    } catch (err) {
      console.error("Error retrieving file:", err);
      Swal.fire({
        icon: "error",
        text: "Something went wrong while retrieving the file.",
      });
    }
  };


  const handleSignedUrl = async () => {
    
      try {
        const response = await axios.get(
          `${apiPath.prodPath}/api/clients/getFileUrl/${item._id}&&${i._id}&&${file._id}`
        );
        
       return response.data;
      } catch (err) {
        console.error("Error retrieving file:", err);
        Swal.fire({
          icon: "error",
          text: "Something went wrong while retrieving the file.",
        });
      }
    
  };
  
  // const url = handleSignedUrl();
  // console.log(url);


  useEffect(() => {
    const renderPreview = async (previewOpen) => {
      if(previewOpen) {
        const url = await handleSignedUrl();
        console.log(url);
        if (file.contentType.startsWith('image/')) {
          return (
            <img
              src={url}
              alt="Preview"
              style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
            />
          );
        }
  
        if (file.contentType === 'application/pdf') {
          return (
            <iframe
              src={url}
              width="100%"
              height="600px"
              title="PDF preview"
              style={{ border: 'none' }}
            />
          );
        }
  
        return (
          <Typography variant="body1" color="textSecondary">
            Preview not available for this file type
          </Typography>
        );
      }else {
        return null;
      }
   
    };

    setPreviewContent(renderPreview(previewOpen));
  }, [file]);

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
        }
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">{file.filename}</Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon className='text-white'/>
        </IconButton>
      </Box>

      <Box flex={1} overflow="auto" textAlign="center">
        {previewContent}
      </Box>

      <Box mt={2} textAlign="center">
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleDownload()}
          sx={{ width: 200 }}
        >
          Download File
        </Button>
      </Box>
    </Drawer>
  );
};

export default FilePreviewDrawer;